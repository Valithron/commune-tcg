/* ============================================================================
   API Battle Simulate Endpoint
   Battle Phase 5 responsibility: no-write deterministic battle simulation using
   the same validation path as POST /api/battles. Performs no writes.
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
      return jsonResponse({
        ...result,
        phase: 'battle-5-simulate',
        readOnly: true,
        writes: [],
      }, { status: result.status || 400 });
    }

    return jsonResponse({
      ...result,
      phase: 'battle-5-simulate',
      readOnly: true,
      writes: [],
      guardrails: [
        'Simulation performs no writes.',
        'POST /api/battles is the only Phase 5 reward write path.',
        'No gold, XP, level, stamina, energy, Vault, drop, ticket, or auth writes occur from this endpoint.',
      ],
      nextStep: 'POST /api/battles applies gold and owned-card XP/level only after this validation path passes.',
    });
  } catch (error) {
    return errorResponse('Failed to run battle simulation.', 500, error.message);
  }
}
