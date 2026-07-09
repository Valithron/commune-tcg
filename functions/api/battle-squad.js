/* ============================================================================
   API Battle Squad Endpoint
   Battle auth-current-user responsibility: read and save one preferred squad per
   signed-in player.
   ============================================================================ */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { maxBattleSquadSize, mockBattleEncounters, parseSquadCardIds, resolveBattleSimulation } from '../_shared/battle-engine.js';

const battleSquadSql = `
  CREATE TABLE IF NOT EXISTS user_battle_squads (
    user_id TEXT PRIMARY KEY,
    squad_card_ids TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

async function tableExists(env, tableName) { const row = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`).bind(tableName).first(); return Boolean(row); }
async function ensureBattleSquadSchema(env) { await env.DB.prepare(battleSquadSql).run(); }
async function readPayload(request) { const contentType = request.headers.get('content-type') || ''; if (contentType.includes('application/json')) return request.json(); const formData = await request.formData(); return { ownerUserId: formData.get('ownerUserId'), squadCardIds: formData.get('squadCardIds') }; }
function hydrateSavedSquadRow(row) { return row ? { ownerUserId: row.userId, squadCardIds: parseSquadCardIds(row.squadCardIds), createdAt: row.createdAt, updatedAt: row.updatedAt } : null; }
async function readSavedSquadRow(env, ownerUserId) { const exists = await tableExists(env, 'user_battle_squads'); if (!exists) return null; const row = await env.DB.prepare(`SELECT user_id AS userId, squad_card_ids AS squadCardIds, created_at AS createdAt, updated_at AS updatedAt FROM user_battle_squads WHERE user_id = ? LIMIT 1`).bind(ownerUserId).first(); return hydrateSavedSquadRow(row); }
function buildSavedSquadResponse({ ownerUserId, ownerDisplayName, savedSquad, validationResult }) { const simulation = validationResult?.simulation || null; return { ok: true, phase: 'auth-current-user-battle-squad', readOnly: true, source: 'D1 user_battle_squads + current battle inventory validation', ownerUserId, ownerDisplayName, saved: Boolean(savedSquad), savedSquad, validation: validationResult?.validation || null, validForBattle: Boolean(validationResult?.ok), selectedCards: simulation?.squad || [], selectedIds: simulation?.squad?.map((card) => card.sourceRowId || card.id) || savedSquad?.squadCardIds || [], notes: ['GET /api/battle-squad performs no writes.', 'Saved squads store backend card row IDs only.', 'Battle rewards still require a separate one-time battle attempt through POST /api/battles.'] }; }

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to read saved battle squad.', 401);
  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || user.id;
  const ownerDisplayName = ownerUserId === user.id ? user.displayName : ownerUserId;

  try {
    const savedSquad = await readSavedSquadRow(env, ownerUserId);
    if (!savedSquad) return jsonResponse(buildSavedSquadResponse({ ownerUserId, ownerDisplayName, savedSquad: null, validationResult: null }));
    const validationResult = await resolveBattleSimulation(env, { ownerUserId, ownerDisplayName, encounterId: mockBattleEncounters[0].id, squadCardIds: savedSquad.squadCardIds, createdAt: new Date().toISOString() });
    return jsonResponse(buildSavedSquadResponse({ ownerUserId, ownerDisplayName, savedSquad, validationResult }));
  } catch (error) {
    return errorResponse('Failed to read saved battle squad.', 500, error.message);
  }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to save a battle squad.', 401);
    const payload = await readPayload(request);
    const now = new Date().toISOString();
    const ownerUserId = payload.ownerUserId || user.id;
    const ownerDisplayName = ownerUserId === user.id ? user.displayName : ownerUserId;
    const requestedIds = parseSquadCardIds(payload.squadCardIds);

    if (!requestedIds.length) return jsonResponse({ ok: false, phase: 'auth-current-user-battle-squad', readOnly: false, writesPerformed: false, error: 'At least one battle-eligible card ID is required to save a squad.', code: 'saved-squad-empty', writes: [] }, { status: 400 });
    if (requestedIds.length > maxBattleSquadSize) return jsonResponse({ ok: false, phase: 'auth-current-user-battle-squad', readOnly: false, writesPerformed: false, error: `Saved squads can contain at most ${maxBattleSquadSize} cards.`, code: 'saved-squad-too-large', writes: [] }, { status: 400 });

    const validationResult = await resolveBattleSimulation(env, { ownerUserId, ownerDisplayName, encounterId: mockBattleEncounters[0].id, squadCardIds: requestedIds, createdAt: now });
    if (!validationResult.ok) return jsonResponse({ ...validationResult, phase: 'auth-current-user-battle-squad', readOnly: false, writesPerformed: false, error: 'Saved squad validation failed.', writes: [], notes: ['Validation failed before the saved squad row was written.', 'No battle, reward, XP, level, resource, Vault, or card ownership writes occurred.'] }, { status: validationResult.status || 400 });

    const normalizedIds = validationResult.simulation.squad.map((card) => card.sourceRowId || card.id).filter(Boolean);
    await ensureBattleSquadSchema(env);
    await env.DB.prepare(`INSERT INTO user_battle_squads (user_id, squad_card_ids, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET squad_card_ids = excluded.squad_card_ids, updated_at = excluded.updated_at`).bind(ownerUserId, normalizedIds.join(','), now, now).run();

    return jsonResponse({ ok: true, phase: 'auth-current-user-battle-squad', readOnly: false, writesPerformed: true, source: 'D1 user_battle_squads', ownerUserId, ownerDisplayName, savedSquad: { ownerUserId, squadCardIds: normalizedIds, updatedAt: now }, selectedCards: validationResult.simulation.squad, validation: validationResult.validation, writes: ['user_battle_squads.squad_card_ids'], deferredWrites: ['battle rewards', 'XP', 'levels', 'gold', 'stamina', 'energy', 'drops', 'Vault changes', 'auth changes'], guardrails: ['Saved squad card IDs were validated before writing.', 'Saved squad stores owned backend card row IDs only.', 'No battle was resolved by this endpoint.', 'No gold, XP, level, stamina, energy, drop, Vault, or auth writes occurred.'] });
  } catch (error) {
    return errorResponse('Failed to save battle squad.', 500, error.message);
  }
}
