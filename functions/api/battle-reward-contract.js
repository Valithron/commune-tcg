/* ============================================================================
   API Battle Reward Contract Endpoint
   Battle Phase 5 responsibility: expose reward and XP contract diagnostics.
   Performs no writes.
   ============================================================================ */

import { jsonResponse } from '../_shared/json.js';
import { ENCOUNTERS } from '../../shared/battle/encounter-registry.js';
import { buildRewardContractSummary } from '../_shared/battle-reward-contract.js';

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    source: 'shared battle reward contract',
    ...buildRewardContractSummary(ENCOUNTERS.map((encounter) => ({ ...encounter, rewardGold: encounter.rewards.victory.gold, rewardXp: encounter.rewards.victory.xpPerCard }))),
    notes: [
      'This endpoint performs no writes.',
      'Attempt creation and reward finalization are separate authoritative operations.',
      'Pull tickets, drops, and Vault grants remain deferred.',
    ],
  });
}
