/* ============================================================================
   API Battles Endpoint
   Phase auth-current-user responsibility: validate and resolve battles for the
   signed-in player's owned cards by default.
   ============================================================================ */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, resolveBattleSimulation } from '../_shared/battle-engine.js';
import { writeBattleProgression } from '../_shared/battle-progression.js';

function normalizeAttemptId(value) { return String(value || '').trim().slice(0, 120); }
function validateAttemptId(attemptId) { if (!attemptId) return 'battle-attempt-required'; if (!/^[a-zA-Z0-9_-]{8,120}$/.test(attemptId)) return 'battle-attempt-invalid-format'; return null; }
async function readPayload(request) { const contentType = request.headers.get('content-type') || ''; if (contentType.includes('application/json')) return request.json(); const formData = await request.formData(); return { ownerUserId: formData.get('ownerUserId'), encounterId: formData.get('encounterId'), squadCardIds: formData.get('squadCardIds'), attemptId: formData.get('attemptId') }; }

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in before resolving a battle.', 401);
    const payload = await readPayload(request);
    const now = new Date().toISOString();
    const ownerUserId = payload.ownerUserId || user.id;
    const ownerDisplayName = ownerUserId === user.id ? user.displayName : ownerUserId;
    const encounterId = payload.encounterId || mockBattleEncounters[0].id;
    const squadCardIds = payload.squadCardIds || [];
    const attemptId = normalizeAttemptId(payload.attemptId);
    const attemptError = validateAttemptId(attemptId);

    if (attemptError) return jsonResponse({ ok: false, phase: 'auth-current-user-battle', readOnly: false, writesPerformed: false, writes: [], error: 'Battle attempt validation failed.', code: attemptError, guardrails: ['A valid attemptId is required before any reward write.', 'No battle_history, gold, XP, levels, stamina, energy, Vault, or card ownership writes occurred.'] }, { status: 400 });

    const simulationResult = await resolveBattleSimulation(env, { ownerUserId, ownerDisplayName, encounterId, squadCardIds, createdAt: now });
    if (!simulationResult.ok) return jsonResponse({ ...simulationResult, phase: 'auth-current-user-battle', readOnly: false, writesPerformed: false, writes: [], error: simulationResult.error || 'Battle validation failed.', notes: ['Validation failed before any reward or history write was attempted.', 'No battle_history, gold, XP, levels, stamina, energy, Vault, or card ownership writes occurred.'] }, { status: simulationResult.status || 400 });

    const written = await writeBattleProgression(env, simulationResult, { now, attemptId });

    return jsonResponse({
      ok: true,
      phase: 'auth-current-user-battle',
      source: 'D1 owned Vault cards + effective stats + type matchups + user_resources + battle_history',
      readOnly: false,
      writesPerformed: true,
      ownerDisplayName,
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
      guardrails: ['Validated battle result was required before writes.', 'A unique attemptId was required before writes.', 'Effective stats and type matchup power were used for the battle result.', 'Gold was applied to the signed-in user_resources row.', 'XP and levels were applied to owned card rows only.', 'Battle history was written with attemptId, reward, and XP application details.', 'No pull tickets were granted.', 'No drops or card grants were written.', 'No stamina or energy was written.'],
      nextStep: 'Verify preview and settlement use the same Effective Squad Power before adding saved abilities, drops, or stamina.',
    });
  } catch (error) {
    if (error.code === 'duplicate-battle-attempt') return jsonResponse({ ok: false, phase: 'auth-current-user-battle', readOnly: false, writesPerformed: false, writes: [], error: error.message, code: error.code, attemptId: error.attemptId, existingBattleId: error.existingBattleId, guardrails: ['Duplicate battle attempt detected before rewards were applied again.', 'No gold, XP, level, stamina, energy, Vault, or card ownership writes occurred on the duplicate request.'] }, { status: 409 });
    return errorResponse('Failed to resolve battle.', error.status || 500, error.message);
  }
}
