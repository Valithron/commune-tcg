/* ============================================================================
   API Battles Endpoint
   Phase 6 responsibility: validate battle, use effective stats and type matchup
   simulation, require a unique attempt ID, apply gold and owned-card XP/level
   progression once, then write battle_history.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, resolveBattleSimulation, temporaryBattleUserId } from '../_shared/battle-engine.js';
import { writeBattleProgression } from '../_shared/battle-progression.js';

function normalizeAttemptId(value) { return String(value || '').trim().slice(0, 120); }
function validateAttemptId(attemptId) { if (!attemptId) return 'battle-attempt-required'; if (!/^[a-zA-Z0-9_-]{8,120}$/.test(attemptId)) return 'battle-attempt-invalid-format'; return null; }

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  const formData = await request.formData();
  return { ownerUserId: formData.get('ownerUserId'), encounterId: formData.get('encounterId'), squadCardIds: formData.get('squadCardIds'), attemptId: formData.get('attemptId') };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const payload = await readPayload(request);
    const now = new Date().toISOString();
    const ownerUserId = payload.ownerUserId || temporaryBattleUserId;
    const encounterId = payload.encounterId || mockBattleEncounters[0].id;
    const squadCardIds = payload.squadCardIds || [];
    const attemptId = normalizeAttemptId(payload.attemptId);
    const attemptError = validateAttemptId(attemptId);

    if (attemptError) {
      return jsonResponse({ ok: false, phase: 'battle-6', readOnly: false, writesPerformed: false, writes: [], error: 'Battle attempt validation failed.', code: attemptError, guardrails: ['Phase 6 requires a valid attemptId before any reward write.', 'No battle_history, gold, XP, levels, stamina, energy, Vault, or card ownership writes occurred.'] }, { status: 400 });
    }

    const simulationResult = await resolveBattleSimulation(env, { ownerUserId, encounterId, squadCardIds, createdAt: now });

    if (!simulationResult.ok) {
      return jsonResponse({ ...simulationResult, phase: 'battle-6', readOnly: false, writesPerformed: false, writes: [], error: simulationResult.error || 'Battle validation failed.', notes: ['Validation failed before any reward or history write was attempted.', 'No battle_history, gold, XP, levels, stamina, energy, Vault, or card ownership writes occurred.'] }, { status: simulationResult.status || 400 });
    }

    const written = await writeBattleProgression(env, simulationResult, { now, attemptId });

    return jsonResponse({
      ok: true,
      phase: 'battle-6',
      source: 'D1 owned Vault cards + effective stats + type matchups + user_resources + battle_history',
      readOnly: false,
      writesPerformed: true,
      writes: written.writes,
      deferredWrites: written.deferredWrites,
      battleId: written.battleId,
      attemptId: written.attemptId,
      historyRow: written.historyRow,
      simulation: written.simulation,
      rewardApplied: written.rewardApplied,
      xpApplied: written.xpApplied,
      duplicateProtection: written.duplicateProtection,
      validation: simulationResult.validation,
      requested: { ...simulationResult.requested, attemptId },
      guardrails: ['Validated Phase 6 battle result was required before writes.', 'A unique attemptId was required before writes.', 'Effective stats and type matchup power were used for the battle result.', 'Gold was applied to user_resources only.', 'XP and levels were applied to owned card rows only.', 'Battle history was written with attemptId, reward, and XP application details.', 'No pull tickets were granted.', 'No drops or card grants were written.', 'No stamina or energy was written.', 'Temporary Sterling owner remains in use until auth exists.'],
      nextStep: 'Verify preview and settlement use the same matchup-adjusted squad power before adding saved abilities, drops, or stamina.',
    });
  } catch (error) {
    if (error.code === 'duplicate-battle-attempt') {
      return jsonResponse({ ok: false, phase: 'battle-6', readOnly: false, writesPerformed: false, writes: [], error: error.message, code: error.code, attemptId: error.attemptId, existingBattleId: error.existingBattleId, guardrails: ['Duplicate battle attempt detected before rewards were applied again.', 'No gold, XP, level, stamina, energy, Vault, or card ownership writes occurred on the duplicate request.'] }, { status: 409 });
    }
    return errorResponse('Failed to resolve battle.', error.status || 500, error.message);
  }
}
