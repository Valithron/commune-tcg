/* ============================================================================
   API Battle Simulate Endpoint
   Battle Phase 2 responsibility: no-write deterministic battle simulation.
   Battle Phase 3 update: delegates to shared battle engine used by POST /api/battles.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, resolveBattleSimulation, temporaryBattleUserId } from '../_shared/battle-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || temporaryBattleUserId;
  const encounterId = url.searchParams.get('encounterId') || mockBattleEncounters[0].id;
  const squadCardIds = url.searchParams.get('squadCardIds') || '';

  try {
    const result = await resolveBattleSimulation(env, {
      ownerUserId,
      encounterId,
      squadCardIds,
    });

    if (!result.ok) {
      return jsonResponse(result, { status: result.status || 400 });
    }

    return jsonResponse({
      ...result,
      phase: 'battle-2',
      readOnly: true,
      nextStep: 'POST /api/battles writes battle_history only after this simulation contract validates.',
    });
  } catch (error) {
    return errorResponse('Failed to run battle simulation.', 500, error.message);
  }
}
