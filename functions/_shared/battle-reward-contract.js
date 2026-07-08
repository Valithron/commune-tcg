/* ============================================================================
   Battle Reward and XP Contract
   Phase 5 responsibility: define and calculate reward, XP, level, drop,
   and write rules. This module performs no writes by itself.
   ============================================================================ */

export const battleRewardContractVersion = 'battle-reward-xp-v2';
export const defaultBattleMaxLevel = 30;

export const battleRewardContract = {
  phase: 'card-mechanics-phase-5',
  version: battleRewardContractVersion,
  readOnly: true,
  writeApplicationEndpoint: 'POST /api/battles',
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
      xpPerCard: 'floor after multiplier; every selected squad card receives the full encounter XP amount',
      totalSquadXp: 'xpPerCard multiplied by squad size for reporting only',
    },
  },
  xpCurve: {
    startingLevel: 1,
    maxLevel: 'per-card progressionRules.maxLevel, maxLevel, or levelCap; defaults to 30',
    xpToNextLevelFormula: '40 + (currentLevel * 15)',
    rarityMultiplier: 'none in this version',
    totalXpModel: 'card_json.xp is cumulative lifetime XP',
    levelUpPolicy: 'Advance through as many total lifetime XP thresholds as cumulative XP allows, capped at the card-specific maxLevel.',
  },
  cardProgressionWriteTarget: {
    table: 'cards',
    rowSelector: 'owned card row id from battle squad',
    jsonColumn: 'card_json',
    fieldsToUpdate: ['xp', 'level', 'progression.xp', 'progression.level', 'updated_at'],
  },
  userResourceWriteTarget: {
    table: 'user_resources',
    rowSelector: 'user_id',
    fieldsToUpdate: ['gold', 'updated_at'],
  },
  battleHistoryWriteTarget: {
    table: 'battle_history',
    status: 'enabled',
    phase5Change: 'Battle history records reward and XP write results after a validated battle.',
  },
  failureAndRollbackRules: [
    'Reward, XP, and resource writes must be sent as one D1 batch after validation and progression preflight.',
    'Never grant rewards from a failed validation result.',
    'Never mutate unowned Library cards for battle XP.',
    'Do not grant pull tickets, drops, stamina, energy, or Vault changes in this contract version.',
  ],
  guardrails: [
    'Battle writes battle_history, user_resources.gold, and owned card card_json XP/level only through POST /api/battles.',
    'No pull-ticket rewards in Phase 5.',
    'No battle drops or card grants in Phase 5.',
    'No stamina or energy writes in Phase 5.',
    'No auth changes in Phase 5.',
  ],
};

function safeInteger(value, fallback = 0) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeBattleMaxLevel(value, fallback = defaultBattleMaxLevel) {
  return Math.max(1, safeInteger(value, fallback));
}

export function getXpToNextLevel(level) {
  const safeLevel = Math.max(1, safeInteger(level, 1));
  return 40 + (safeLevel * 15);
}

export function getTotalXpRequiredForLevel(level) {
  const targetLevel = Math.max(1, safeInteger(level, 1));
  let totalXp = 0;

  for (let currentLevel = 1; currentLevel < targetLevel; currentLevel += 1) {
    totalXp += getXpToNextLevel(currentLevel);
  }

  return totalXp;
}

export function previewLevelFromXp({ currentLevel = 1, currentXp = 0, gainedXp = 0, maxLevel = defaultBattleMaxLevel } = {}) {
  const safeMaxLevel = normalizeBattleMaxLevel(maxLevel);
  let level = Math.max(1, Math.min(safeInteger(currentLevel, 1), safeMaxLevel));
  const previousLevel = level;
  const previousXp = Math.max(0, safeInteger(currentXp, 0));
  const safeGainedXp = Math.max(0, safeInteger(gainedXp, 0));
  const totalXp = previousXp + safeGainedXp;
  const levelsGained = [];

  while (level < safeMaxLevel) {
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
  const nextLevelTotalThreshold = level >= safeMaxLevel
    ? totalXp
    : getTotalXpRequiredForLevel(level + 1);

  return {
    previousLevel,
    previousXp,
    gainedXp: safeGainedXp,
    maxLevel: safeMaxLevel,
    nextLevelPreview: level,
    nextXpPreview: totalXp,
    xpIntoCurrentLevelPreview: Math.max(0, totalXp - currentLevelTotalThreshold),
    xpToNextLevelPreview: level >= safeMaxLevel ? 0 : Math.max(0, nextLevelTotalThreshold - totalXp),
    levelsGained,
    maxLevelReached: level >= safeMaxLevel,
  };
}

export function calculateBattleRewardPreview({ encounter, victory, squadSize = 1 } = {}) {
  const safeSquadSize = Math.max(1, safeInteger(squadSize, 1));
  const baseGold = Math.max(0, Number(encounter?.rewardGold || 0));
  const baseXp = Math.max(0, Number(encounter?.rewardXp || 0));
  const goldMultiplier = victory ? battleRewardContract.rewardRules.victoryGoldMultiplier : battleRewardContract.rewardRules.lossGoldMultiplier;
  const xpMultiplier = victory ? battleRewardContract.rewardRules.victoryXpMultiplier : battleRewardContract.rewardRules.lossXpMultiplier;
  const gold = Math.floor(baseGold * goldMultiplier);
  const xpPerCard = Math.floor(baseXp * xpMultiplier);
  const totalSquadXp = xpPerCard * safeSquadSize;

  return {
    contractVersion: battleRewardContractVersion,
    victory: Boolean(victory),
    baseGold,
    baseXp,
    goldMultiplier,
    xpMultiplier,
    gold,
    totalXp: xpPerCard,
    xpPerCard,
    totalSquadXp,
    squadSize: safeSquadSize,
    baseXpPerCard: xpPerCard,
    remainderXp: 0,
    xpAllocationRule: 'Every selected squad card receives the full encounter XP amount; XP is not split.',
    pullTickets: 0,
    drops: [],
    writes: [],
  };
}

export function buildRewardContractSummary(encounters = []) {
  const sampleMaxLevels = [30, 40, 50, 60, 70];

  return {
    ...battleRewardContract,
    xpThresholdSamples: [1, 2, 3, 4, 5, 10, 25, 50].map((level) => ({
      level,
      xpToNextLevel: getXpToNextLevel(level),
      totalXpRequired: getTotalXpRequiredForLevel(level),
    })),
    maxLevelSamples: sampleMaxLevels.map((maxLevel) => ({
      maxLevel,
      totalXpRequired: getTotalXpRequiredForLevel(maxLevel),
    })),
    encounterRewardSamples: encounters.map((encounter) => ({
      encounterId: encounter.id,
      encounterName: encounter.name,
      victory: calculateBattleRewardPreview({ encounter, victory: true, squadSize: 3 }),
      loss: calculateBattleRewardPreview({ encounter, victory: false, squadSize: 3 }),
    })),
  };
}
