/* ============================================================================
   Battle Reward and XP Contract
   Battle Phase 4 responsibility: define reward, XP, level, drop, and write rules.
   This module performs no writes.
   ============================================================================ */

export const battleRewardContractVersion = 'battle-reward-xp-v1';

export const battleRewardContract = {
  phase: 'battle-4',
  version: battleRewardContractVersion,
  readOnly: true,
  purpose: 'Define reward and XP rules before any reward, XP, currency, or card progression writes are enabled.',
  rewardRules: {
    currency: 'gold',
    victoryGoldMultiplier: 1,
    lossGoldMultiplier: 0.25,
    victoryXpMultiplier: 1,
    lossXpMultiplier: 0.35,
    pullTicketRewards: {
      enabled: false,
      rule: 'No pull-ticket battle rewards until the economy is explicitly designed.',
    },
    drops: {
      enabled: false,
      rule: 'No battle drops until loot tables and ownership grants are explicitly designed.',
    },
    rounding: {
      gold: 'floor after multiplier',
      totalXp: 'floor after multiplier',
      xpPerCard: 'floor even split, then assign remainder by squad order when writes are enabled',
    },
  },
  xpCurve: {
    startingLevel: 1,
    maxLevel: 50,
    xpToNextLevelFormula: '100 + ((level - 1) * 25)',
    totalXpModel: 'card_json.xp remains cumulative lifetime XP unless changed in a later contract revision',
    levelUpPolicy: 'Advance through as many thresholds as cumulative XP allows, capped at maxLevel.',
  },
  cardProgressionWriteTarget: {
    table: 'cards',
    rowSelector: 'owned card row id from battle squad',
    jsonColumn: 'card_json',
    fieldsToUpdateLater: ['xp', 'level', 'updated_at'],
    deferredUntil: 'Battle Phase 5',
  },
  userResourceWriteTarget: {
    table: 'user_resources',
    rowSelector: 'user_id',
    fieldsToUpdateLater: ['gold', 'updated_at'],
    deferredUntil: 'Battle Phase 5',
  },
  battleHistoryWriteTarget: {
    table: 'battle_history',
    status: 'already enabled in Battle Phase 3',
    phase4Change: 'Only preview semantics are defined here. No history write behavior changes are required.',
  },
  failureAndRollbackRules: [
    'Reward, XP, and resource writes must be atomic in Phase 5.',
    'If any card progression write fails, no gold/resource reward should be committed.',
    'If battle_history has already been written in Phase 3, Phase 5 should either append reward write status to result_json atomically or write a separate reward status field only after a contract update.',
    'Never grant rewards from a failed validation result.',
    'Never mutate unowned Library cards for battle XP.',
  ],
  guardrails: [
    'No writes in Battle Phase 4.',
    'No rewards are granted in Battle Phase 4.',
    'No XP or levels are written in Battle Phase 4.',
    'No currency is written in Battle Phase 4.',
    'No drops or card grants are written in Battle Phase 4.',
    'No stamina or energy is written in Battle Phase 4.',
    'No auth changes in Battle Phase 4.',
  ],
};

export function getXpToNextLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return 100 + ((safeLevel - 1) * 25);
}

export function previewLevelFromXp({ currentLevel = 1, currentXp = 0, gainedXp = 0 } = {}) {
  let level = Math.max(1, Math.floor(Number(currentLevel) || 1));
  let totalXp = Math.max(0, Math.floor(Number(currentXp) || 0)) + Math.max(0, Math.floor(Number(gainedXp) || 0));
  const levelsGained = [];

  while (level < battleRewardContract.xpCurve.maxLevel) {
    const threshold = getXpToNextLevel(level);

    if (totalXp < threshold) {
      break;
    }

    level += 1;
    levelsGained.push({ reachedLevel: level, thresholdSpent: threshold });
  }

  return {
    previousLevel: Math.max(1, Math.floor(Number(currentLevel) || 1)),
    previousXp: Math.max(0, Math.floor(Number(currentXp) || 0)),
    gainedXp: Math.max(0, Math.floor(Number(gainedXp) || 0)),
    nextLevelPreview: level,
    nextXpPreview: totalXp,
    xpToNextLevelPreview: level >= battleRewardContract.xpCurve.maxLevel ? 0 : getXpToNextLevel(level),
    levelsGained,
    maxLevelReached: level >= battleRewardContract.xpCurve.maxLevel,
  };
}

export function calculateBattleRewardPreview({ encounter, victory, squadSize = 1 } = {}) {
  const safeSquadSize = Math.max(1, Math.floor(Number(squadSize) || 1));
  const baseGold = Math.max(0, Number(encounter?.rewardGold || 0));
  const baseXp = Math.max(0, Number(encounter?.rewardXp || 0));
  const goldMultiplier = victory ? battleRewardContract.rewardRules.victoryGoldMultiplier : battleRewardContract.rewardRules.lossGoldMultiplier;
  const xpMultiplier = victory ? battleRewardContract.rewardRules.victoryXpMultiplier : battleRewardContract.rewardRules.lossXpMultiplier;
  const gold = Math.floor(baseGold * goldMultiplier);
  const totalXp = Math.floor(baseXp * xpMultiplier);
  const baseXpPerCard = Math.floor(totalXp / safeSquadSize);
  const remainderXp = totalXp - (baseXpPerCard * safeSquadSize);

  return {
    contractVersion: battleRewardContractVersion,
    victory: Boolean(victory),
    baseGold,
    baseXp,
    goldMultiplier,
    xpMultiplier,
    gold,
    totalXp,
    squadSize: safeSquadSize,
    baseXpPerCard,
    remainderXp,
    xpAllocationRule: 'baseXpPerCard to every card; one extra XP to the first remainderXp cards by squad order when writes are enabled',
    pullTickets: 0,
    drops: [],
    writes: [],
  };
}

export function buildRewardContractSummary(encounters = []) {
  return {
    ...battleRewardContract,
    xpThresholdSamples: [1, 2, 3, 4, 5, 10, 25, 50].map((level) => ({
      level,
      xpToNextLevel: level >= battleRewardContract.xpCurve.maxLevel ? 0 : getXpToNextLevel(level),
    })),
    encounterRewardSamples: encounters.map((encounter) => ({
      encounterId: encounter.id,
      encounterName: encounter.name,
      victory: calculateBattleRewardPreview({ encounter, victory: true, squadSize: 3 }),
      loss: calculateBattleRewardPreview({ encounter, victory: false, squadSize: 3 }),
    })),
  };
}
