/* ============================================================================
   Battle Reward and XP Contract
   Battle Phase 5 responsibility: define and calculate reward, XP, level, drop,
   and write rules. This module performs no writes by itself.
   ============================================================================ */

export const battleRewardContractVersion = 'battle-reward-xp-v1';

export const battleRewardContract = {
  phase: 'battle-5',
  version: battleRewardContractVersion,
  readOnly: false,
  purpose: 'Define reward and XP rules for validated battle reward writes.',
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
    totalXpModel: 'card_json.xp is cumulative lifetime XP',
    levelUpPolicy: 'Advance through as many total lifetime XP thresholds as cumulative XP allows, capped at maxLevel.',
  },
  cardProgressionWriteTarget: {
    table: 'cards',
    rowSelector: 'owned card row id from battle squad',
    jsonColumn: 'card_json',
    fieldsToUpdate: ['xp', 'level', 'updated_at'],
  },
  userResourceWriteTarget: {
    table: 'user_resources',
    rowSelector: 'user_id',
    fieldsToUpdate: ['gold', 'updated_at'],
  },
  battleHistoryWriteTarget: {
    table: 'battle_history',
    status: 'enabled',
    phase5Change: 'Battle history now records reward and XP write results after a validated battle.',
  },
  failureAndRollbackRules: [
    'Reward, XP, and resource writes must be sent as one D1 batch after validation and progression preflight.',
    'Never grant rewards from a failed validation result.',
    'Never mutate unowned Library cards for battle XP.',
    'Do not grant pull tickets, drops, stamina, energy, or Vault changes in this contract version.',
  ],
  guardrails: [
    'Battle Phase 5 writes battle_history, user_resources.gold, and owned card card_json XP/level only.',
    'No pull-ticket rewards in Battle Phase 5.',
    'No battle drops or card grants in Battle Phase 5.',
    'No stamina or energy writes in Battle Phase 5.',
    'No auth changes in Battle Phase 5.',
  ],
};

export function getXpToNextLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return 100 + ((safeLevel - 1) * 25);
}

export function getTotalXpRequiredForLevel(level) {
  const targetLevel = Math.max(1, Math.floor(Number(level) || 1));
  let totalXp = 0;

  for (let currentLevel = 1; currentLevel < targetLevel; currentLevel += 1) {
    totalXp += getXpToNextLevel(currentLevel);
  }

  return totalXp;
}

export function previewLevelFromXp({ currentLevel = 1, currentXp = 0, gainedXp = 0 } = {}) {
  let level = Math.max(1, Math.floor(Number(currentLevel) || 1));
  const previousXp = Math.max(0, Math.floor(Number(currentXp) || 0));
  const safeGainedXp = Math.max(0, Math.floor(Number(gainedXp) || 0));
  const totalXp = previousXp + safeGainedXp;
  const levelsGained = [];

  while (level < battleRewardContract.xpCurve.maxLevel) {
    const nextLevel = level + 1;
    const nextLevelTotalThreshold = getTotalXpRequiredForLevel(nextLevel);

    if (totalXp < nextLevelTotalThreshold) {
      break;
    }

    level = nextLevel;
    levelsGained.push({
      reachedLevel: level,
      totalXpRequired: nextLevelTotalThreshold,
    });
  }

  const currentLevelTotalThreshold = getTotalXpRequiredForLevel(level);
  const nextLevelTotalThreshold = level >= battleRewardContract.xpCurve.maxLevel
    ? totalXp
    : getTotalXpRequiredForLevel(level + 1);

  return {
    previousLevel: Math.max(1, Math.floor(Number(currentLevel) || 1)),
    previousXp,
    gainedXp: safeGainedXp,
    nextLevelPreview: level,
    nextXpPreview: totalXp,
    xpIntoCurrentLevelPreview: Math.max(0, totalXp - currentLevelTotalThreshold),
    xpToNextLevelPreview: level >= battleRewardContract.xpCurve.maxLevel ? 0 : Math.max(0, nextLevelTotalThreshold - totalXp),
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
    xpAllocationRule: 'baseXpPerCard to every card; one extra XP to the first remainderXp cards by squad order',
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
      totalXpRequired: getTotalXpRequiredForLevel(level),
    })),
    encounterRewardSamples: encounters.map((encounter) => ({
      encounterId: encounter.id,
      encounterName: encounter.name,
      victory: calculateBattleRewardPreview({ encounter, victory: true, squadSize: 3 }),
      loss: calculateBattleRewardPreview({ encounter, victory: false, squadSize: 3 }),
    })),
  };
}
