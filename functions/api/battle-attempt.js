/* ============================================================================
   API Battle Attempt Endpoint
   Battle Phase 8.1 responsibility: read whether a battle attempt has already
   been resolved so result pages can render Already Resolved before another POST.
   Performs no reward, XP, level, resource, or card writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { temporaryBattleUserId } from '../_shared/battle-engine.js';

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = ?
    LIMIT 1
  `).bind(tableName).first();

  return Boolean(row);
}

async function columnExists(env, tableName, columnName) {
  const result = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all();
  return (result.results || []).some((column) => column.name === columnName);
}

function parseResultJson(value) {
  try {
    return JSON.parse(value || 'null');
  } catch {
    return null;
  }
}

function hydrateResolvedBattle(row) {
  const parsed = parseResultJson(row.resultJson);
  const rewardApplied = parsed?.rewardApplied || {};
  const resourcesAfter = rewardApplied.resourcesAfter || {};

  return {
    ok: true,
    phase: parsed?.phase || 'battle-8',
    readOnly: true,
    writesPerformed: false,
    alreadyResolved: true,
    battleId: row.id,
    attemptId: parsed?.attemptId || row.attemptId,
    historyRow: {
      id: row.id,
      attemptId: parsed?.attemptId || row.attemptId,
      userId: row.userId,
      encounterId: row.encounterId,
      victory: Number(row.victory) === 1,
      squadPower: Number(row.squadPower),
      enemyPower: Number(row.enemyPower),
      createdAt: row.createdAt,
    },
    simulation: {
      battleId: row.id,
      attemptId: parsed?.attemptId || row.attemptId,
      ownerUserId: row.userId,
      encounter: {
        id: row.encounterId,
        name: parsed?.encounterName || row.encounterId,
      },
      victory: Number(row.victory) === 1,
      squadPower: Number(row.squadPower),
      enemyPower: Number(row.enemyPower),
      margin: parsed?.margin ?? Number(row.squadPower) - Number(row.enemyPower),
      squad: parsed?.squad || [],
    },
    rewardApplied: {
      ...(parsed?.rewardPreview || {}),
      gold: rewardApplied.goldGained ?? parsed?.rewardPreview?.gold ?? 0,
      totalXp: rewardApplied.totalXp ?? parsed?.rewardPreview?.totalXp ?? 0,
      goldAfter: resourcesAfter.gold,
      resourcesAfter,
    },
    xpApplied: parsed?.xpApplied || parsed?.xpPreview || [],
    duplicateProtection: parsed?.duplicateProtection || {
      attemptId: parsed?.attemptId || row.attemptId,
      rule: 'This attempt has already been resolved.',
    },
    writes: parsed?.writes || ['battle_history'],
    deferredWrites: parsed?.deferredWrites || [],
    createdAt: row.createdAt,
    resultHydrated: Boolean(parsed),
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || temporaryBattleUserId;
  const attemptId = String(url.searchParams.get('attemptId') || '').trim().slice(0, 120);

  if (!attemptId) {
    return jsonResponse({
      ok: false,
      phase: 'battle-8.1',
      readOnly: true,
      resolved: false,
      error: 'attemptId is required.',
      code: 'battle-attempt-required',
    }, { status: 400 });
  }

  try {
    const exists = await tableExists(env, 'battle_history');

    if (!exists || !(await columnExists(env, 'battle_history', 'attempt_id'))) {
      return jsonResponse({
        ok: true,
        phase: 'battle-8.1',
        readOnly: true,
        ownerUserId,
        attemptId,
        resolved: false,
        battle: null,
        notes: ['battle_history or attempt_id is not available yet.'],
      });
    }

    const row = await env.DB.prepare(`
      SELECT id, attempt_id AS attemptId, user_id AS userId, encounter_id AS encounterId, victory, squad_power AS squadPower, enemy_power AS enemyPower, result_json AS resultJson, created_at AS createdAt
      FROM battle_history
      WHERE user_id = ? AND attempt_id = ?
      LIMIT 1
    `).bind(ownerUserId, attemptId).first();

    return jsonResponse({
      ok: true,
      phase: 'battle-8.1',
      readOnly: true,
      ownerUserId,
      attemptId,
      resolved: Boolean(row),
      battle: row ? hydrateResolvedBattle(row) : null,
      notes: [
        'This endpoint performs no reward, XP, level, resource, or card writes.',
        'Use it to render an already-resolved battle attempt before another POST is attempted.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read battle attempt status.', 500, error.message);
  }
}
