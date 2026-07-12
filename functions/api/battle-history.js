/* ============================================================================
   API Battle History Endpoint
   Battle auth-current-user responsibility: read battle_history rows for the
   signed-in player by default. Performs no writes.
   ============================================================================ */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

async function tableExists(env, tableName) { const row = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`).bind(tableName).first(); return Boolean(row); }
function parseResultJson(value) { try { return JSON.parse(value || 'null'); } catch { return null; } }

async function readBattleHistoryRows(env, { ownerUserId, ownerDisplayName, limit }) {
  const exists = await tableExists(env, 'battle_history');
  if (!exists) return { tableExists: false, totalReturned: 0, battles: [] };
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const result = await env.DB.prepare(`SELECT id, user_id AS userId, encounter_id AS encounterId, victory, squad_power AS squadPower, enemy_power AS enemyPower, result_json AS resultJson, created_at AS createdAt FROM battle_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).bind(ownerUserId, safeLimit).all();
  const battles = (result.results || []).map((row) => { const parsedResult = parseResultJson(row.resultJson); return { id: row.id, attemptId: parsedResult?.attemptId || null, userId: row.userId, ownerUserId: row.userId, ownerDisplayName: row.userId === ownerUserId ? ownerDisplayName : row.userId, encounterId: row.encounterId, encounterName: parsedResult?.encounter?.name || row.encounterId, victory: Number(row.victory) === 1, squadPower: Number(row.squadPower), enemyPower: Number(row.enemyPower), outcome: parsedResult?.settlement?.outcome || parsedResult?.combat?.outcome, rounds: parsedResult?.combat?.rounds, mvp: parsedResult?.combat?.mvp || null, orderedCardIds: parsedResult?.orderedCardIds || [], rewardApplied: parsedResult?.rewardApplied || parsedResult?.settlement?.reward || null, xpApplied: parsedResult?.xpApplied || parsedResult?.settlement?.xpApplied || [], status: parsedResult?.status || 'finalized', surrender: Boolean(parsedResult?.surrender), rulesVersion: parsedResult?.rulesVersion, encounterVersion: parsedResult?.encounterVersion, createdAt: row.createdAt, resultHydrated: Boolean(parsedResult) }; });
  return { tableExists: true, totalReturned: battles.length, battles };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to read battle history.', 401);
  const ownerUserId = user.id;
  const ownerDisplayName = user.displayName;
  const limit = new URL(request.url).searchParams.get('limit') || 20;

  try {
    const history = await readBattleHistoryRows(env, { ownerUserId, ownerDisplayName, limit });
    return jsonResponse({ ok: true, phase: 'authoritative-battle-history', readOnly: true, source: 'D1 battle_history', ownerUserId, ownerDisplayName, ...history, notes: ['This endpoint performs no writes.', 'Finalization or surrender writes each history row exactly once.'] });
  } catch (error) {
    return errorResponse('Failed to read battle history.', 500, error.message);
  }
}
