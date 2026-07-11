/* ============================================================================
   API Pull Pool Endpoint
   Phase 10.2 responsibility: report pull-eligible Library cards using the
   shared pull-pool reader. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getRarityOddsPercentages, pullOptions } from '../_shared/pull-config.js';
import { readPullPool } from '../_shared/pull-pool-store.js';
import { getAdminSessionUser } from '../_shared/auth.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    const pool = await readPullPool(env);

    return jsonResponse({
      ok: true,
      source: 'D1 cards read-only pull pool',
      phase: '10.2',
      readOnly: true,
      pullOptions,
      rarityOdds: getRarityOddsPercentages(),
      totalCardsScanned: pool.totalCardsScanned,
      eligibleCount: pool.eligibleCount,
      ownedRowsExcluded: pool.ownedRowsExcluded,
      invalidRowsExcluded: pool.invalidRowsExcluded,
      approvedSubmissionCount: pool.approvedSubmissionCount,
      byRarity: pool.byRarity,
      cards: pool.cards,
      sampleExcludedOwnedCards: pool.sampleExcludedOwnedCards,
      readiness: pool.readiness,
      pullResultContract: {
        mode: 'future-write-enabled',
        inputs: ['count', 'activeUserId'],
        validates: ['ticket balance', 'pull count', 'eligible pool', 'rarity odds'],
        writes: ['ticket debit', 'owned card grant', 'pull_history row'],
        deferredUntil: 'Phase 10.3',
      },
      notes: [
        'This endpoint performs no writes.',
        'Pull eligibility currently means cards.owner_user_id is empty and card_json parses cleanly.',
        'Approved submissions are included after approval inserts an unowned cards row.',
        'Owned Vault cards are excluded from the pull pool.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read pull pool.', 500, error.message);
  }
}
