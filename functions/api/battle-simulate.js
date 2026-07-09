/* ============================================================================
   API Battle Simulate Endpoint
   Battle auth-current-user responsibility: no-write simulation for the signed-in
   player's owned cards by default.
   ============================================================================ */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, resolveBattleSimulation } from '../_shared/battle-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to simulate a battle.', 401);
  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || user.id;
  const ownerDisplayName = ownerUserId === user.id ? user.displayName : ownerUserId;
  const encounterId = url.searchParams.get('encounterId') || mockBattleEncounters[0].id;
  const squadCardIds = url.searchParams.get('squadCardIds') || '';

  try {
    const result = await resolveBattleSimulation(env, { ownerUserId, ownerDisplayName, encounterId, squadCardIds });

    if (!result.ok) {
      return jsonResponse({ ...result, phase: 'auth-current-user-battle-simulate', readOnly: true, writes: [] }, { status: result.status || 400 });
    }

    return jsonResponse({
      ...result,
      phase: 'auth-current-user-battle-simulate',
      readOnly: true,
      ownerDisplayName,
      writes: [],
      guardrails: ['Simulation performs no writes.', 'POST /api/battles is the reward write path.', 'No gold, XP, level, stamina, energy, Vault, drop, ticket, or auth writes occur from this endpoint.'],
      nextStep: 'POST /api/battles applies rewards only after this validation path passes.',
    });
  } catch (error) {
    return errorResponse('Failed to run battle simulation.', 500, error.message);
  }
}
