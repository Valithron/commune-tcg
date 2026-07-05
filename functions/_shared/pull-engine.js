import { getRarityOddsPercentages, pullOptions } from './pull-config.js';
import { readPullPool } from './pull-pool-store.js';

export const temporaryPullUserId = 'sterling';
export const temporaryPullUserDisplayName = 'Sterling';
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

function safeParseJson(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = ?
    LIMIT 1
  `).bind(tableName).first();

  return Boolean(row);
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

export async function readPullResources(env) {
  const exists = await tableExists(env, 'user_resources');

  if (!exists) {
    return {
      userId: temporaryPullUserId,
      pullTickets: temporaryStartingTickets,
      gold: 0,
      bootstrapped: false,
      tableExists: false,
      note: 'Live pull resources have not been created yet.',
    };
  }

  const resources = await readUserResources(env);

  if (!resources) {
    return {
      userId: temporaryPullUserId,
      pullTickets: temporaryStartingTickets,
      gold: 0,
      bootstrapped: false,
      tableExists: true,
      note: 'Sterling resources row has not been created yet.',
    };
  }

  return {
    userId: resources.userId,
    pullTickets: Number(resources.pullTickets),
    gold: Number(resources.gold || 0),
    createdAt: resources.createdAt,
    updatedAt: resources.updatedAt,
    bootstrapped: true,
    tableExists: true,
    note: '',
  };
}

async function readOwnedCardSummary(env, ownedCardId) {
  if (!ownedCardId) {
    return null;
  }

  const row = await env.DB.prepare(`
    SELECT id, owner_user_id, card_json
    FROM cards
    WHERE id = ?
    LIMIT 1
  `).bind(ownedCardId).first();

  if (!row) {
    return null;
  }

  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};

  return {
    ownedCardId: row.id,
    ownerUserId: row.owner_user_id || '',
    ownerDisplayName: row.owner_user_id === temporaryPullUserId ? temporaryPullUserDisplayName : row.owner_user_id || 'Unknown owner',
    cardTitle: payload.name || payload.card_name || payload.title || 'Unknown card',
    actualRarity: payload.rarity || 'common',
    characterId: payload.character_id || payload.characterId || payload.character || '',
  };
}

async function hydrateHistoryResult(env, result, userId) {
  const ownerUserId = result.ownerUserId || userId || temporaryPullUserId;
  const alreadySemantic = result.cardTitle && result.ownerDisplayName;

  if (alreadySemantic) {
    return {
      ...result,
      ownerUserId,
      ownerDisplayName: result.ownerDisplayName,
    };
  }

  const ownedSummary = await readOwnedCardSummary(env, result.ownedCardId);

  return {
    ...result,
    ownerUserId: result.ownerUserId || ownedSummary?.ownerUserId || ownerUserId,
    ownerDisplayName: result.ownerDisplayName || ownedSummary?.ownerDisplayName || temporaryPullUserDisplayName,
    cardTitle: result.cardTitle || ownedSummary?.cardTitle || result.sourceCardTitle || 'Unknown card',
    actualRarity: result.actualRarity || ownedSummary?.actualRarity || result.selectedRarity || 'common',
    characterId: result.characterId || ownedSummary?.characterId || '',
    historyHydrated: Boolean(ownedSummary),
  };
}

export async function readPullHistory(env, { limit = 20 } = {}) {
  const exists = await tableExists(env, 'pull_history');

  if (!exists) {
    return {
      tableExists: false,
      totalReturned: 0,
      pulls: [],
    };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const result = await env.DB.prepare(`
    SELECT id, user_id AS userId, pull_count AS pullCount, ticket_cost AS ticketCost, result_json AS resultJson, created_at AS createdAt
    FROM pull_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(temporaryPullUserId, safeLimit).all();

  const pulls = [];

  for (const row of result.results || []) {
    let rawResults = [];

    try {
      rawResults = JSON.parse(row.resultJson || '[]');
    } catch {
      rawResults = [];
    }

    const results = [];

    for (const rawResult of rawResults) {
      results.push(await hydrateHistoryResult(env, rawResult, row.userId));
    }

    pulls.push({
      id: row.id,
      userId: row.userId,
      ownerUserId: row.userId,
      ownerDisplayName: row.userId === temporaryPullUserId ? temporaryPullUserDisplayName : row.userId,
      pullCount: Number(row.pullCount),
      ticketCost: Number(row.ticketCost),
      results,
      createdAt: row.createdAt,
    });
  }

  return {
    tableExists: true,
    totalReturned: pulls.length,
    pulls,
  };
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
    owner_user_id: temporaryPullUserId,
    ownerDisplayName: temporaryPullUserDisplayName,
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

function buildHistoryResult(result) {
  return {
    index: result.index,
    ownerUserId: temporaryPullUserId,
    ownerDisplayName: temporaryPullUserDisplayName,
    cardTitle: result.baseCard.name,
    actualRarity: result.actualRarity,
    selectedRarity: result.selectedRarity,
    fallbackUsed: result.fallbackUsed,
    characterId: result.baseCard.characterId,
    sourceCardId: result.baseCard.id,
    sourceRowId: result.baseCard.sourceRowId,
    ownedCardId: result.ownedCardId,
  };
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
      ownerDisplayName: temporaryPullUserDisplayName,
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

  const historyResults = grantedResults.map(buildHistoryResult);

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
      JSON.stringify(historyResults),
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
    ownerDisplayName: temporaryPullUserDisplayName,
    count: pullCount,
    ticketCost,
    ticketsBefore: Number(resources.pullTickets),
    ticketsAfter: Number(updatedResources.pullTickets),
    results: grantedResults.map((result) => ({
      index: result.index,
      ownerUserId: temporaryPullUserId,
      ownerDisplayName: temporaryPullUserDisplayName,
      cardTitle: result.baseCard.name,
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
