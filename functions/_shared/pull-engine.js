/* ============================================================================
   Pull Engine
   Phase 10.3 responsibility: server-owned ticket spend, Vault grant, and pull
   history writes for the temporary Sterling owner.
   ============================================================================ */

import { getRarityOddsPercentages, pullOptions } from './pull-config.js';
import { readPullPool } from './pull-pool-store.js';

export const temporaryPullUserId = 'sterling';
export const temporaryStartingTickets = 12;

const userResourcesSql = `
  CREATE TABLE IF NOT EXISTS user_resources (
    user_id TEXT PRIMARY KEY,
    pull_tickets INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

const pullHistorySql = `
  CREATE TABLE IF NOT EXISTS pull_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pull_count INTEGER NOT NULL,
    ticket_cost INTEGER NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

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

function buildId(prefix) {
  return prefix + '_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8);
}

async function ensurePullSchema(env, now) {
  await env.DB.prepare(userResourcesSql).run();
  await env.DB.prepare(pullHistorySql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_pull_history_user_created ON pull_history (user_id, created_at)').run();
  await env.DB.prepare(`
    INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(temporaryPullUserId, temporaryStartingTickets, 0, now, now).run();
}

async function readUserResources(env) {
  return env.DB.prepare(`
    SELECT user_id AS userId, pull_tickets AS pullTickets, gold, created_at AS createdAt, updated_at AS updatedAt
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(temporaryPullUserId).first();
}

function buildOwnedCardJson({ baseCard, ownedCardId, pullId, now }) {
  return JSON.stringify({
    id: ownedCardId,
    name: baseCard.name,
    character: baseCard.character,
    character_id: baseCard.characterId,
    type: baseCard.type,
    card_type: baseCard.type,
    category: baseCard.category,
    rarity: baseCard.rarity,
    symbol: baseCard.symbol,
    ability: baseCard.ability,
    ability_text: baseCard.ability,
    abilityIcon: baseCard.abilityIcon,
    stats: baseCard.stats,
    pow: baseCard.stats.pow,
    def: baseCard.stats.def,
    spd: baseCard.stats.spd,
    flavor: baseCard.flavor,
    flavor_text: baseCard.flavor,
    image_key: baseCard.imageKey,
    imageKey: baseCard.imageKey,
    owned: true,
    level: 1,
    xp: 0,
    copies: 1,
    source: 'pull',
    source_pool_card_id: baseCard.sourceRowId || baseCard.id,
    source_card_id: baseCard.id,
    source_submission_id: baseCard.sourceSubmissionId || '',
    pull_id: pullId,
    pulled_at: now,
  });
}

function simulateSelections(cards, count, rarityOdds) {
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
        baseCard: selection.card,
      });
    }
  }

  return results;
}

export async function resolvePull(env, { count }) {
  const now = new Date().toISOString();
  const pullCount = clampPullCount(count);
  const option = pullOptions[pullCount] || pullOptions[1];
  const ticketCost = option.ticketCost;
  const rarityOdds = getRarityOddsPercentages();

  await ensurePullSchema(env, now);

  const resources = await readUserResources(env);

  if (!resources || Number(resources.pullTickets) < ticketCost) {
    return {
      ok: false,
      status: 409,
      error: 'Not enough pull tickets.',
      resources,
      ticketCost,
    };
  }

  const pool = await readPullPool(env);

  if (!pool.cards.length) {
    return {
      ok: false,
      status: 409,
      error: 'No pull-eligible cards are available.',
      poolReadiness: pool.readiness,
    };
  }

  const pullId = buildId('pull');
  const selections = simulateSelections(pool.cards, pullCount, rarityOdds);
  const grantedResults = selections.map((selection) => {
    const ownedCardId = buildId('owned');
    const ownedCard = {
      ...selection.baseCard,
      id: ownedCardId,
      ownerUserId: temporaryPullUserId,
      owned: true,
      level: 1,
      xp: 0,
      copies: 1,
    };

    return {
      ...selection,
      ownedCardId,
      ownedCard,
    };
  });

  const statements = [
    env.DB.prepare(`
      UPDATE user_resources
      SET pull_tickets = pull_tickets - ?, updated_at = ?
      WHERE user_id = ? AND pull_tickets >= ?
    `).bind(ticketCost, now, temporaryPullUserId, ticketCost),
    ...grantedResults.map((result) => env.DB.prepare(`
      INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      result.ownedCardId,
      temporaryPullUserId,
      result.baseCard.characterId,
      buildOwnedCardJson({ baseCard: result.baseCard, ownedCardId: result.ownedCardId, pullId, now }),
      now,
      now
    )),
    env.DB.prepare(`
      INSERT INTO pull_history (id, user_id, pull_count, ticket_cost, result_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      pullId,
      temporaryPullUserId,
      pullCount,
      ticketCost,
      JSON.stringify(grantedResults.map((result) => ({
        index: result.index,
        selectedRarity: result.selectedRarity,
        actualRarity: result.actualRarity,
        fallbackUsed: result.fallbackUsed,
        sourceCardId: result.baseCard.id,
        sourceRowId: result.baseCard.sourceRowId,
        ownedCardId: result.ownedCardId,
      }))),
      now
    ),
  ];

  await env.DB.batch(statements);

  const updatedResources = await readUserResources(env);

  return {
    ok: true,
    status: 200,
    pullId,
    userId: temporaryPullUserId,
    count: pullCount,
    ticketCost,
    ticketsBefore: Number(resources.pullTickets),
    ticketsAfter: Number(updatedResources.pullTickets),
    results: grantedResults.map((result) => ({
      index: result.index,
      selectedRarity: result.selectedRarity,
      actualRarity: result.actualRarity,
      fallbackUsed: result.fallbackUsed,
      sourceCard: result.baseCard,
      ownedCard: result.ownedCard,
      ownedCardId: result.ownedCardId,
    })),
    poolSummary: {
      eligibleCount: pool.eligibleCount,
      approvedSubmissionCount: pool.approvedSubmissionCount,
      byRarity: pool.byRarity,
      readiness: pool.readiness,
    },
  };
}
