/* ============================================================================
   API Pull Simulate Endpoint
   Phase 10.2 responsibility: simulate pull results from the read-only pull pool.
   Performs no ticket spend, card grant, or pull history write.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getRarityOddsPercentages, pullOptions } from '../_shared/pull-config.js';
import { readPullPool } from '../_shared/pull-pool-store.js';
import { getAdminSessionUser } from '../_shared/auth.js';

function clampPullCount(value) {
  const parsed = Number(value);
  return parsed === 5 ? 5 : 1;
}

function randomFloat() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 4294967295;
}

function chooseWeightedRarity(rarityOdds) {
  const totalWeight = rarityOdds.reduce((total, entry) => total + entry.weight, 0);
  let roll = randomFloat() * totalWeight;

  for (const entry of rarityOdds) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.rarity;
    }
  }

  return rarityOdds[0]?.rarity || 'common';
}

function chooseRandomCard(cards) {
  if (!cards.length) {
    return null;
  }

  return cards[Math.floor(randomFloat() * cards.length)];
}

function chooseCardForRarity(cards, rarity) {
  const matching = cards.filter((card) => card.rarity === rarity);
  const fromRarity = chooseRandomCard(matching);

  if (fromRarity) {
    return {
      card: fromRarity,
      fallbackUsed: false,
    };
  }

  return {
    card: chooseRandomCard(cards),
    fallbackUsed: true,
  };
}

function simulateResults(cards, count, rarityOdds) {
  const results = [];

  for (let index = 0; index < count; index += 1) {
    const selectedRarity = chooseWeightedRarity(rarityOdds);
    const selection = chooseCardForRarity(cards, selectedRarity);

    if (selection.card) {
      results.push({
        index: index + 1,
        selectedRarity,
        actualRarity: selection.card.rarity,
        fallbackUsed: selection.fallbackUsed,
        card: selection.card,
      });
    }
  }

  return results;
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    const url = new URL(request.url);
    const count = clampPullCount(url.searchParams.get('count'));
    const option = pullOptions[count] || pullOptions[1];
    const rarityOdds = getRarityOddsPercentages();
    const pool = await readPullPool(env);

    if (!pool.cards.length) {
      return jsonResponse({
        ok: false,
        source: 'D1 cards no-write pull simulation',
        phase: '10.2',
        readOnly: true,
        error: 'No pull-eligible cards are available.',
        poolReadiness: pool.readiness,
        results: [],
      }, { status: 409 });
    }

    const results = simulateResults(pool.cards, count, rarityOdds);
    const fallbackCount = results.filter((result) => result.fallbackUsed).length;

    return jsonResponse({
      ok: true,
      source: 'D1 cards no-write pull simulation',
      phase: '10.2',
      readOnly: true,
      simulationOnly: true,
      writesPerformed: false,
      count,
      ticketCost: option.ticketCost,
      rarityOdds,
      poolSummary: {
        eligibleCount: pool.eligibleCount,
        approvedSubmissionCount: pool.approvedSubmissionCount,
        byRarity: pool.byRarity,
        readiness: pool.readiness,
      },
      fallbackCount,
      results,
      notes: [
        'This endpoint performs no writes.',
        'No tickets are spent.',
        'No Vault cards are granted.',
        'No pull_history row is written.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to simulate pull.', 500, error.message);
  }
}
