const rarityOrder = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

export const rarityProgressionConfig = Object.freeze({
  common: {
    rarity: 'common',
    levelCap: 30,
    maxLevel: 30,
    growthPerLevel: 2,
    originBonusPercent: 0,
    staticStatBudget: 30,
    ownedStatBudgetRange: { min: 28, max: 32 },
  },
  uncommon: {
    rarity: 'uncommon',
    levelCap: 40,
    maxLevel: 40,
    growthPerLevel: 3,
    originBonusPercent: 3,
    staticStatBudget: 44,
    ownedStatBudgetRange: { min: 41, max: 47 },
  },
  rare: {
    rarity: 'rare',
    levelCap: 50,
    maxLevel: 50,
    growthPerLevel: 4,
    originBonusPercent: 5,
    staticStatBudget: 63,
    ownedStatBudgetRange: { min: 59, max: 67 },
  },
  legendary: {
    rarity: 'legendary',
    levelCap: 60,
    maxLevel: 60,
    growthPerLevel: 5,
    originBonusPercent: 7,
    staticStatBudget: 71,
    ownedStatBudgetRange: { min: 66, max: 76 },
  },
  mythic: {
    rarity: 'mythic',
    levelCap: 70,
    maxLevel: 70,
    growthPerLevel: 6,
    originBonusPercent: 10,
    staticStatBudget: 80,
    ownedStatBudgetRange: { min: 74, max: 86 },
  },
});

const targetConfirmationTables = Object.freeze({
  common: [
    { rarity: 'common', chance: 1 },
  ],
  uncommon: [
    { rarity: 'uncommon', chance: 0.45 },
    { rarity: 'common', chance: 1 },
  ],
  rare: [
    { rarity: 'rare', chance: 0.20 },
    { rarity: 'uncommon', chance: 0.55 },
    { rarity: 'common', chance: 1 },
  ],
  legendary: [
    { rarity: 'legendary', chance: 0.08 },
    { rarity: 'rare', chance: 0.25 },
    { rarity: 'uncommon', chance: 0.55 },
    { rarity: 'common', chance: 1 },
  ],
  mythic: [
    { rarity: 'mythic', chance: 0.03 },
    { rarity: 'legendary', chance: 0.12 },
    { rarity: 'rare', chance: 0.35 },
    { rarity: 'uncommon', chance: 0.65 },
    { rarity: 'common', chance: 1 },
  ],
});

const statArchetypeWeights = Object.freeze({
  aggressor: { pow: 1.4, def: 0.85, spd: 0.95 },
  guardian: { pow: 0.9, def: 1.45, spd: 0.85 },
  swift: { pow: 0.95, def: 0.85, spd: 1.45 },
  mystic: { pow: 1.15, def: 0.95, spd: 1.1 },
  balanced: { pow: 1, def: 1, spd: 1 },
});

function unit() {
  try {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] / 4294967296;
  } catch {
    return Math.random();
  }
}

function integer(min, max) {
  return Math.floor(unit() * (max - min + 1)) + min;
}

function cleanText(value, maxLength = 80) {
  return String(value || '').trim().slice(0, maxLength);
}

export function normalizeApprovalRarity(value, fallback = 'common') {
  const rarity = cleanText(value || fallback).toLowerCase();
  if (rarityOrder.includes(rarity)) return rarity;
  if (rarity === 'random') return 'rare';
  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';
  return fallback;
}

function normalizeRollTarget(value) {
  return normalizeApprovalRarity(value, 'rare');
}

function normalizeFinalOverride(value) {
  const raw = cleanText(value).toLowerCase();
  if (!raw || raw === 'roll' || raw === 'none' || raw === 'random') return '';
  return normalizeApprovalRarity(raw, '');
}

function inferStatArchetype(source = {}) {
  const raw = cleanText(source.statArchetype || source.stat_archetype || source.cardType || source.card_type || source.type).toLowerCase();
  if (['aggressor', 'battle', 'attack', 'attacker', 'striker'].includes(raw)) return 'aggressor';
  if (['guardian', 'defense', 'defender', 'tank'].includes(raw)) return 'guardian';
  if (['swift', 'training', 'speed', 'scout', 'utility'].includes(raw)) return 'swift';
  if (['mystic', 'magic', 'alchemy', 'support'].includes(raw)) return 'mystic';
  return 'balanced';
}

function rollRarityFromTarget(targetRarity) {
  const target = normalizeRollTarget(targetRarity);
  const table = targetConfirmationTables[target] || targetConfirmationTables.rare;
  const attempts = [];

  for (const entry of table) {
    const roll = unit();
    const success = roll <= entry.chance;
    attempts.push({ rarity: entry.rarity, chance: entry.chance, roll: Number(roll.toFixed(6)), success });
    if (success) return { rarity: entry.rarity, targetRarity: target, attempts };
  }

  return { rarity: 'common', targetRarity: target, attempts };
}

export function allocateStatBudget(totalBudget, archetype = 'balanced') {
  const weights = statArchetypeWeights[archetype] || statArchetypeWeights.balanced;
  const jittered = Object.fromEntries(
    Object.entries(weights).map(([stat, weight]) => [stat, weight * (0.9 + unit() * 0.2)])
  );
  const totalWeight = jittered.pow + jittered.def + jittered.spd;
  const stats = {
    pow: Math.max(1, Math.round(totalBudget * jittered.pow / totalWeight)),
    def: Math.max(1, Math.round(totalBudget * jittered.def / totalWeight)),
    spd: Math.max(1, Math.round(totalBudget * jittered.spd / totalWeight)),
  };

  let delta = totalBudget - stats.pow - stats.def - stats.spd;
  const order = ['pow', 'def', 'spd'];
  let index = 0;
  while (delta !== 0 && index < 30) {
    const key = order[index % order.length];
    if (delta > 0) {
      stats[key] += 1;
      delta -= 1;
    } else if (stats[key] > 1) {
      stats[key] -= 1;
      delta += 1;
    }
    index += 1;
  }

  return stats;
}

function buildStatsForBudget(totalBudget, source = {}) {
  const statArchetype = inferStatArchetype(source);

  return {
    statBudget: totalBudget,
    statArchetype,
    stats: allocateStatBudget(totalBudget, statArchetype),
  };
}

export function getRarityProgressionConfig(rarity) {
  return rarityProgressionConfig[normalizeApprovalRarity(rarity)] || rarityProgressionConfig.common;
}

export function rollOwnedCopyStatProfile({ rarity = 'common', source = {} } = {}) {
  const config = getRarityProgressionConfig(rarity);
  const range = config.ownedStatBudgetRange || { min: config.staticStatBudget, max: config.staticStatBudget };
  const statBudget = integer(range.min, range.max);
  const statRoll = buildStatsForBudget(statBudget, source);

  return {
    statsSource: 'pull_copy_budget_variance',
    stats_source: 'pull_copy_budget_variance',
    staticStatBudget: config.staticStatBudget,
    static_stat_budget: config.staticStatBudget,
    ownedStatBudgetRange: range,
    owned_stat_budget_range: range,
    copyStatBudgetVariance: config.growthPerLevel,
    copy_stat_budget_variance: config.growthPerLevel,
    ...statRoll,
  };
}

export function rollApprovalProfile({ targetRarity = 'rare', finalRarityOverride = '', source = {} } = {}) {
  const overrideRarity = normalizeFinalOverride(finalRarityOverride);
  const rarityRoll = overrideRarity
    ? { rarity: overrideRarity, targetRarity: normalizeRollTarget(targetRarity), attempts: [] }
    : rollRarityFromTarget(targetRarity);
  const rarity = rarityRoll.rarity;
  const config = getRarityProgressionConfig(rarity);
  const statRoll = buildStatsForBudget(config.staticStatBudget, source);
  const raritySource = overrideRarity ? 'admin_manual_override' : 'approval_cascading_roll';

  return {
    rarity,
    targetRarity: rarityRoll.targetRarity,
    finalRarityOverride: overrideRarity,
    raritySource,
    rarity_source: raritySource,
    rarityRoll,
    statsSource: 'approval_static_rarity_budget',
    stats_source: 'approval_static_rarity_budget',
    staticStatBudget: config.staticStatBudget,
    static_stat_budget: config.staticStatBudget,
    ownedStatBudgetRange: config.ownedStatBudgetRange,
    owned_stat_budget_range: config.ownedStatBudgetRange,
    copyStatBudgetVariance: config.growthPerLevel,
    copy_stat_budget_variance: config.growthPerLevel,
    statBudget: statRoll.statBudget,
    statArchetype: statRoll.statArchetype,
    stats: statRoll.stats,
    progressionRules: {
      levelCap: config.levelCap,
      maxLevel: config.maxLevel,
      growthPerLevel: config.growthPerLevel,
    },
    levelCap: config.levelCap,
    maxLevel: config.maxLevel,
    growthPerLevel: config.growthPerLevel,
    originRarity: rarity,
    origin_rarity: rarity,
    originBonusPercent: config.originBonusPercent,
    origin_bonus_percent: config.originBonusPercent,
    originBonusMultiplier: 1 + config.originBonusPercent / 100,
    origin_bonus_multiplier: 1 + config.originBonusPercent / 100,
  };
}
