/* Read and save one explicit left/center/right formation per signed-in user. */

import { getSessionUser } from '../_shared/auth.js';
import { loadOwnedFormation } from '../_shared/battle-adapter.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

const schema = `CREATE TABLE IF NOT EXISTS user_battle_squads (user_id TEXT PRIMARY KEY, squad_card_ids TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;
function parseIds(value) { return Array.isArray(value) ? value.map(String).map((id) => id.trim()).filter(Boolean) : String(value || '').split(',').map((id) => id.trim()).filter(Boolean); }
async function ensureSchema(env) { await env.DB.prepare(schema).run(); }

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to read saved formation.', 401);
    await ensureSchema(env);
    const row = await env.DB.prepare(`SELECT squad_card_ids AS squadCardIds, created_at AS createdAt, updated_at AS updatedAt FROM user_battle_squads WHERE user_id = ? LIMIT 1`).bind(user.id).first();
    if (!row) return jsonResponse({ ok: true, saved: false, validForBattle: false, selectedIds: [], selectedCards: [] });
    const ids = parseIds(row.squadCardIds);
    const validation = await loadOwnedFormation(env, { ownerUserId: user.id, orderedCardIds: ids });
    return jsonResponse({ ok: true, saved: true, validForBattle: validation.ok, selectedIds: ids, selectedCards: validation.cards || [], savedSquad: { ownerUserId: user.id, squadCardIds: ids, lanes: { left: ids[0] || null, center: ids[1] || null, right: ids[2] || null }, createdAt: row.createdAt, updatedAt: row.updatedAt }, validation });
  } catch (error) { return errorResponse('Failed to read saved formation.', 500, error.message); }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to save formation.', 401);
    const payload = await request.json().catch(() => ({}));
    const ids = parseIds(payload.orderedCardIds || payload.squadCardIds);
    const validation = await loadOwnedFormation(env, { ownerUserId: user.id, orderedCardIds: ids });
    if (!validation.ok) return jsonResponse({ ...validation, ok: false, code: validation.errors?.[0], error: 'Saved formation requires exactly three distinct owned eligible cards.' }, { status: validation.status || 400 });
    const now = new Date().toISOString();
    await ensureSchema(env);
    await env.DB.prepare(`INSERT INTO user_battle_squads (user_id, squad_card_ids, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET squad_card_ids = excluded.squad_card_ids, updated_at = excluded.updated_at`).bind(user.id, validation.orderedCardIds.join(','), now, now).run();
    return jsonResponse({ ok: true, saved: true, validForBattle: true, selectedIds: validation.orderedCardIds, selectedCards: validation.cards, savedSquad: { ownerUserId: user.id, squadCardIds: validation.orderedCardIds, lanes: { left: validation.orderedCardIds[0], center: validation.orderedCardIds[1], right: validation.orderedCardIds[2] }, updatedAt: now }, writes: ['user_battle_squads.squad_card_ids'] });
  } catch (error) { return errorResponse('Failed to save formation.', 500, error.message); }
}
