/* ============================================================================
   API Battle History Endpoint
   Battle Phase 8 responsibility: read battle_history rows with attempt, reward,
   and XP application details for diagnostics. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { temporaryBattleUserDisplayName, temporaryBattleUserId } from '../_shared/battle-engine.js';

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = ?
    LIMIT 1
  `).bind(tableName).first();

  return Boolean(row);
}

function parseResultJson(value) {
  try {
    return JSON.parse(value || 'null');
  } catch {
    return null;
  }
}

async function readBattleHistoryRows(env, { ownerUserId, limit }) {
  const exists = await tableExists(env, 'battle_history');

  if (!exists) {
    return {
      tableExists: false,
      totalReturned: 0,
      battles: [],
    };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const result = await env.DB.prepare(`
    SELECT id, user_id AS userId, encounter_id AS encounterId, victory, squad_power AS squadPower, enemy_power AS enemyPower, result_json AS resultJson, created_at AS createdAt
    FROM battle_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(ownerUserId, safeLimit).all();

  const battles = (result.results || []).map((row) => {
    const parsedResult = parseResultJson(row.resultJson);

    return {
      id: row.id,
      attemptId: parsedResult?.attemptId || null,
      userId: row.userId,
      ownerUserId: row.userId,
      ownerDisplayName: row.userId === temporaryBattleUserId ? temporaryBattleUserDisplayName : row.userId,
      encounterId: row.encounterId,
      encounterName: parsedResult?.encounterName || row.encounterId,
      victory: Number(row.victory) === 1,
      squadPower: Number(row.squadPower),
      enemyPower: Number(row.enemyPower),
      margin: parsedResult?.margin ?? Number(row.squadPower) - Number(row.enemyPower),
      squad: parsedResult?.squad || [],
      rewardPreview: parsedResult?.rewardPreview || null,
      rewardApplied: parsedResult?.rewardApplied || null,
      xpPreview: parsedResult?.xpPreview || [],
      xpApplied: parsedResult?.xpApplied || parsedResult?.xpPreview || [],
      duplicateProtection: parsedResult?.duplicateProtection || null,
      combatLog: parsedResult?.combatLog || [],
      writes: parsedResult?.writes || ['battle_history'],
      deferredWrites: parsedResult?.deferredWrites || [],
      phase: parsedResult?.phase || 'battle-3',
      createdAt: row.createdAt,
      resultHydrated: Boolean(parsedResult),
    };
  });

  return {
    tableExists: true,
    totalReturned: battles.length,
    battles,
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || temporaryBattleUserId;
  const limit = url.searchParams.get('limit') || 20;

  try {
    const history = await readBattleHistoryRows(env, { ownerUserId, limit });

    return jsonResponse({
      ok: true,
      phase: 'battle-8',
      readOnly: true,
      source: 'D1 battle_history',
      ownerUserId,
      ...history,
      notes: [
        'This endpoint performs no writes.',
        'Battle history rows are written only by POST /api/battles.',
        'Battle Phase 8 history rows may include attemptId, duplicateProtection, rewardApplied, and xpApplied details.',
        'Pull tickets, drops, stamina, energy, Vault grants, and auth changes remain deferred.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read battle history.', 500, error.message);
  }
}
