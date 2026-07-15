/* Player-safe read-only catalog for the live Standard Summon pool. */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getRarityOddsPercentages, pullOptions } from '../_shared/pull-config.js';
import { readPullPool } from '../_shared/pull-pool-store.js';

function publicPoolCard(card) {
  return {
    id: card.id,
    name: card.name,
    character: card.character,
    rarity: card.rarity,
    type: card.type,
    typeLabel: card.typeLabel,
    imageUrl: card.imageUrl,
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to view summon details.', 401);

  try {
    const pool = await readPullPool(env);
    return jsonResponse({
      ok: true,
      source: 'canonical pull config and D1 pool',
      readOnly: true,
      pools: [{
        id: 'standard',
        title: 'Standard Summon',
        subtitle: 'The permanent Imago Core collection.',
        active: true,
        permanent: true,
        pullOptions,
        rarityOdds: getRarityOddsPercentages(),
        eligibleCount: pool.eligibleCount,
        byRarity: pool.byRarity,
        cards: pool.cards.map(publicPoolCard),
        restrictions: [],
        duplicateBehavior: 'Each result grants a distinct owned card copy in the player Vault.',
        timeLimit: null,
      }],
    });
  } catch (error) {
    return errorResponse('Failed to load summon catalog.', 500, error.message);
  }
}
