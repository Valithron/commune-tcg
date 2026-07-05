/* ============================================================================
   API Battle Reward Contract Endpoint
   Battle Phase 5 responsibility: expose reward and XP contract diagnostics.
   Performs no writes.
   ============================================================================ */

import { jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters } from '../_shared/battle-engine.js';
import { buildRewardContractSummary } from '../_shared/battle-reward-contract.js';

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    source: 'shared battle reward contract',
    ...buildRewardContractSummary(mockBattleEncounters),
    notes: [
      'This endpoint performs no writes.',
      'Battle Phase 5 applies this contract only through POST /api/battles after validation.',
      'Pull tickets, drops, stamina, energy, Vault grants, and auth changes remain deferred.',
    ],
  });
}
