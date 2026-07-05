/* ============================================================================
   Battle Progression Writer
   Battle Phase 5 responsibility: apply validated battle rewards to gold and
   owned-card XP/level, then record battle_history. No drops, tickets, stamina,
   energy, Vault grants, or auth changes.
   ============================================================================ */

import { calculateBattleRewardPreview, previewLevelFromXp } from './battle-reward-contract.js';
import { ensureBattleHistorySchema } from './battle-engine.js';

const userResourcesSql = `
  CREATE TABLE IF NOT EXISTS user_resources (
    user_id TEXT PRIMARY KEY,
    pull_tickets INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

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

async function ensureRewardSchemas(env, ownerUserId, now) {
  await ensureBattleHistorySchema(env);
  await env.DB.prepare(userResourcesSql).run();
  await env.DB.prepare(`
    INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at)
    VALUES (?, 0, 0, ?, ?)
  `).bind(ownerUserId, now, now).run();
}

async function readUserResources(env, ownerUserId) {
  return env.DB.prepare(`
    SELECT user_id AS userId, pull_tickets AS pullTickets, gold, created_at AS createdAt, updated_at AS updatedAt
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(ownerUserId).first();
}

async function readOwnedCardRows(env, ownerUserId, sourceRowIds) {
  const rows = new Map();

  for (const sourceRowId of sourceRowIds) {
    const row = await env.DB.prepare(`
      SELECT id, owner_user_id, card_json
      FROM cards
      WHERE id = ? AND CAST(owner_user_id AS TEXT) = ?
      LIMIT 1
    `).bind(sourceRowId, ownerUserId).first();

    if (row) {
      rows.set(String(sourceRowId), row);
    }
  }

  return rows;
}

function updatePayloadProgression(payload, application, battleId, now) {
  return {
    ...payload,
    xp: application.nextXp,
    experience: application.nextXp,
    level: application.nextLevel,
    card_level: application.nextLevel,
    battle_xp_updated_at: now,
    last_battle_id: battleId,
    last_battle_at: now,
  };
}

function buildUpdatedCardJson(cardJson, application, battleId, now) {
  const parsed = safeParseJson(cardJson);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Cannot update invalid card_json for ${application.sourceRowId}.`);
  }

  if (parsed.card && typeof parsed.card === 'object') {
    return JSON.stringify({
      ...parsed,
      card: updatePayloadProgression(parsed.card, application, battleId, now),
    });
  }

  if (parsed.data?.card && typeof parsed.data.card === 'object') {
    return JSON.stringify({
      ...parsed,
      data: {
        ...parsed.data,
        card: updatePayloadProgression(parsed.data.card, application, battleId, now),
      },
    });
  }

  if (parsed.data && typeof parsed.data === 'object') {
    return JSON.stringify({
      ...parsed,
      data: updatePayloadProgression(parsed.data, application, battleId, now),
    });
  }

  return JSON.stringify(updatePayloadProgression(parsed, application, battleId, now));
}

function buildRewardPlan(simulation) {
  const reward = calculateBattleRewardPreview({
    encounter: simulation.encounter,
    victory: simulation.victory,
    squadSize: simulation.squad.length,
  });

  const xpApplications = simulation.squad.map((card, index) => {
    const gainedXp = reward.baseXpPerCard + (index < reward.remainderXp ? 1 : 0);
    const levelPreview = previewLevelFromXp({
      currentLevel: card.level,
      currentXp: card.xp,
      gainedXp,
    });

    return {
      cardId: card.id,
      sourceRowId: card.sourceRowId,
      cardTitle: card.name,
      rarity: card.rarity,
      previousLevel: card.level,
      previousXp: card.xp,
      gainedXp,
      nextLevel: levelPreview.nextLevelPreview,
      nextXp: levelPreview.nextXpPreview,
      xpIntoCurrentLevel: levelPreview.xpIntoCurrentLevelPreview,
      xpToNextLevel: levelPreview.xpToNextLevelPreview,
      levelsGained: levelPreview.levelsGained,
      maxLevelReached: levelPreview.maxLevelReached,
      writes: ['cards.card_json.xp', 'cards.card_json.level', 'cards.updated_at'],
    };
  });

  return {
    reward,
    xpApplications,
    writes: ['battle_history', 'user_resources.gold', 'cards.card_json.xp_level'],
    deferredWrites: ['pull tickets', 'drops', 'stamina', 'energy', 'Vault changes', 'auth changes'],
  };
}

function buildResultJson({ battleId, simulation, rewardPlan, resourceBefore, resourceAfter, now }) {
  return JSON.stringify({
    battleId,
    phase: 'battle-5',
    ownerUserId: simulation.ownerUserId,
    ownerDisplayName: simulation.ownerDisplayName,
    encounterId: simulation.encounter.id,
    encounterName: simulation.encounter.name,
    victory: simulation.victory,
    squadPower: simulation.squadPower,
    enemyPower: simulation.enemyPower,
    margin: simulation.margin,
    squad: simulation.squad.map((card) => ({
      cardId: card.id,
      sourceRowId: card.sourceRowId,
      cardTitle: card.name,
      rarity: card.rarity,
      level: card.level,
      battlePower: card.battlePower,
      stats: card.stats,
    })),
    rewardPreview: rewardPlan.reward,
    rewardApplied: {
      goldGained: rewardPlan.reward.gold,
      totalXp: rewardPlan.reward.totalXp,
      pullTickets: 0,
      drops: [],
      resourcesBefore: resourceBefore,
      resourcesAfter: resourceAfter,
    },
    xpPreview: rewardPlan.xpApplications,
    xpApplied: rewardPlan.xpApplications,
    combatLog: [
      ...simulation.combatLog,
      `Battle Phase 5 applied ${rewardPlan.reward.gold} gold and ${rewardPlan.reward.totalXp} total XP.`,
    ],
    resultRule: simulation.resultRule,
    rewardRule: rewardPlan.reward.xpAllocationRule,
    writes: rewardPlan.writes,
    deferredWrites: rewardPlan.deferredWrites,
    createdAt: now,
  });
}

export async function writeBattleProgression(env, simulationResult, { now = new Date().toISOString() } = {}) {
  const simulation = simulationResult.simulation;
  const ownerUserId = simulation.ownerUserId;
  const battleId = buildId('battle');
  const rewardPlan = buildRewardPlan(simulation);
  const sourceRowIds = rewardPlan.xpApplications.map((application) => application.sourceRowId);
  const cardRows = await readOwnedCardRows(env, ownerUserId, sourceRowIds);
  const missingRows = sourceRowIds.filter((sourceRowId) => !cardRows.has(String(sourceRowId)));

  if (missingRows.length) {
    const error = new Error('Battle progression preflight failed. One or more owned card rows could not be re-read before reward application.');
    error.status = 409;
    error.missingRows = missingRows;
    throw error;
  }

  const cardUpdates = rewardPlan.xpApplications.map((application) => {
    const row = cardRows.get(String(application.sourceRowId));

    return {
      application,
      updatedCardJson: buildUpdatedCardJson(row.card_json, application, battleId, now),
    };
  });

  await ensureRewardSchemas(env, ownerUserId, now);
  const resourcesBeforeRow = await readUserResources(env, ownerUserId);
  const goldBefore = Number(resourcesBeforeRow?.gold || 0);
  const resourcesBefore = {
    userId: ownerUserId,
    pullTickets: Number(resourcesBeforeRow?.pullTickets || 0),
    gold: goldBefore,
  };
  const resourcesAfter = {
    userId: ownerUserId,
    pullTickets: resourcesBefore.pullTickets,
    gold: goldBefore + rewardPlan.reward.gold,
  };
  const resultJson = buildResultJson({ battleId, simulation, rewardPlan, resourceBefore: resourcesBefore, resourceAfter: resourcesAfter, now });

  const statements = [
    env.DB.prepare(`
      UPDATE user_resources
      SET gold = gold + ?, updated_at = ?
      WHERE user_id = ?
    `).bind(rewardPlan.reward.gold, now, ownerUserId),
    ...cardUpdates.map(({ application, updatedCardJson }) => env.DB.prepare(`
      UPDATE cards
      SET card_json = ?, updated_at = ?
      WHERE id = ? AND CAST(owner_user_id AS TEXT) = ?
    `).bind(updatedCardJson, now, application.sourceRowId, ownerUserId)),
    env.DB.prepare(`
      INSERT INTO battle_history (id, user_id, encounter_id, victory, squad_power, enemy_power, result_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      battleId,
      ownerUserId,
      simulation.encounter.id,
      simulation.victory ? 1 : 0,
      simulation.squadPower,
      simulation.enemyPower,
      resultJson,
      now
    ),
  ];

  await env.DB.batch(statements);
  const updatedResources = await readUserResources(env, ownerUserId);

  return {
    battleId,
    historyRow: {
      id: battleId,
      userId: ownerUserId,
      encounterId: simulation.encounter.id,
      victory: simulation.victory,
      squadPower: simulation.squadPower,
      enemyPower: simulation.enemyPower,
      createdAt: now,
    },
    resultJson,
    simulation: {
      ...simulation,
      battleId,
      createdAt: now,
      rewardPreview: rewardPlan.reward,
      xpPreview: rewardPlan.xpApplications,
      writes: rewardPlan.writes,
    },
    rewardApplied: {
      ...rewardPlan.reward,
      goldBefore: resourcesBefore.gold,
      goldAfter: Number(updatedResources?.gold ?? resourcesAfter.gold),
    },
    xpApplied: rewardPlan.xpApplications,
    writes: rewardPlan.writes,
    deferredWrites: rewardPlan.deferredWrites,
  };
}
