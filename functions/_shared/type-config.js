/* ============================================================================
   Commune TCG Type Config

   Phase 2 responsibility: centralize the accepted 7-type model, stat allocation
   bias, display labels, and matchup chart. Type bias affects stat-budget
   distribution only. It does not change total stat budget.
   ============================================================================ */

export const communeCardTypeOrder = Object.freeze([
  'flame',
  'tide',
  'bloom',
  'volt',
  'shadow',
  'radiant',
  'neutral',
]);

export const typeMatchupModifiers = Object.freeze({
  advantage: 0.15,
  disadvantage: -0.05,
  neutral: 0,
});

export const communeCardTypes = Object.freeze({
  flame: {
    type: 'flame',
    label: 'Flame',
    color: 'red',
    coreIdentity: 'Power, aggression, burst damage',
    statWeights: { pow: 1.10, def: 0.95, spd: 1.00 },
    statBias: { pow: 10, def: -5, spd: 0 },
    matchups: {
      flame: 'neutral',
      tide: 'disadvantage',
      bloom: 'advantage',
      volt: 'neutral',
      shadow: 'advantage',
      radiant: 'disadvantage',
      neutral: 'neutral',
    },
  },
  tide: {
    type: 'tide',
    label: 'Tide',
    color: 'blue',
    coreIdentity: 'Flow, healing, control',
    statWeights: { pow: 1.00, def: 1.05, spd: 1.05 },
    statBias: { pow: 0, def: 5, spd: 5 },
    matchups: {
      flame: 'advantage',
      tide: 'neutral',
      bloom: 'disadvantage',
      volt: 'disadvantage',
      shadow: 'neutral',
      radiant: 'advantage',
      neutral: 'neutral',
    },
  },
  bloom: {
    type: 'bloom',
    label: 'Bloom',
    color: 'green',
    coreIdentity: 'Growth, sustain, nature',
    statWeights: { pow: 1.00, def: 1.10, spd: 0.95 },
    statBias: { pow: 0, def: 10, spd: -5 },
    matchups: {
      flame: 'disadvantage',
      tide: 'advantage',
      bloom: 'neutral',
      volt: 'advantage',
      shadow: 'disadvantage',
      radiant: 'neutral',
      neutral: 'neutral',
    },
  },
  volt: {
    type: 'volt',
    label: 'Volt',
    color: 'yellow',
    coreIdentity: 'Speed, energy, disruption',
    statWeights: { pow: 1.05, def: 0.95, spd: 1.10 },
    statBias: { pow: 5, def: -5, spd: 10 },
    matchups: {
      flame: 'neutral',
      tide: 'advantage',
      bloom: 'disadvantage',
      volt: 'neutral',
      shadow: 'disadvantage',
      radiant: 'advantage',
      neutral: 'neutral',
    },
  },
  shadow: {
    type: 'shadow',
    label: 'Shadow',
    color: 'black',
    coreIdentity: 'Evil defense, drain, corruption, sacrifice, tricks',
    statWeights: { pow: 1.00, def: 1.10, spd: 0.95 },
    statBias: { pow: 0, def: 10, spd: -5 },
    matchups: {
      flame: 'disadvantage',
      tide: 'neutral',
      bloom: 'advantage',
      volt: 'advantage',
      shadow: 'neutral',
      radiant: 'disadvantage',
      neutral: 'neutral',
    },
  },
  radiant: {
    type: 'radiant',
    label: 'Radiant',
    color: 'white-gold',
    coreIdentity: 'Healing, protection, holy or heroic power',
    statWeights: { pow: 1.05, def: 1.05, spd: 1.00 },
    statBias: { pow: 5, def: 5, spd: 0 },
    matchups: {
      flame: 'advantage',
      tide: 'disadvantage',
      bloom: 'neutral',
      volt: 'disadvantage',
      shadow: 'advantage',
      radiant: 'neutral',
      neutral: 'neutral',
    },
  },
  neutral: {
    type: 'neutral',
    label: 'Neutral',
    color: 'tan',
    coreIdentity: 'Balanced, mundane, flexible, comedy cards',
    statWeights: { pow: 1.00, def: 1.00, spd: 1.00 },
    statBias: { pow: 0, def: 0, spd: 0 },
    matchups: {
      flame: 'neutral',
      tide: 'neutral',
      bloom: 'neutral',
      volt: 'neutral',
      shadow: 'neutral',
      radiant: 'neutral',
      neutral: 'neutral',
    },
  },
});

const typeAliases = Object.freeze({
  fire: 'flame',
  ember: 'flame',
  burn: 'flame',
  battle: 'flame',
  attack: 'flame',
  attacker: 'flame',
  aggressor: 'flame',
  striker: 'flame',

  water: 'tide',
  aqua: 'tide',
  ocean: 'tide',
  flow: 'tide',

  nature: 'bloom',
  earth: 'bloom',
  plant: 'bloom',
  garden: 'bloom',
  defense: 'bloom',
  defender: 'bloom',
  guardian: 'bloom',
  tank: 'bloom',

  lightning: 'volt',
  electric: 'volt',
  electricity: 'volt',
  energy: 'volt',
  speed: 'volt',
  swift: 'volt',
  training: 'volt',
  scout: 'volt',

  dark: 'shadow',
  darkness: 'shadow',
  corrupt: 'shadow',
  corruption: 'shadow',

  light: 'radiant',
  holy: 'radiant',
  divine: 'radiant',
  support: 'radiant',
  magic: 'radiant',
  mystic: 'radiant',

  mundane: 'neutral',
  comedy: 'neutral',
  utility: 'neutral',
  craft: 'neutral',
  alchemy: 'neutral',
  balanced: 'neutral',
  none: 'neutral',
  random: 'neutral',
});

function cleanText(value, maxLength = 80) {
  return String(value || '').trim().toLowerCase().slice(0, maxLength);
}

export function normalizeCardType(value, fallback = 'neutral') {
  const raw = cleanText(value || fallback);
  if (communeCardTypes[raw]) return raw;
  if (typeAliases[raw]) return typeAliases[raw];
  if (raw.includes('flame') || raw.includes('fire')) return 'flame';
  if (raw.includes('tide') || raw.includes('water')) return 'tide';
  if (raw.includes('bloom') || raw.includes('nature') || raw.includes('plant')) return 'bloom';
  if (raw.includes('volt') || raw.includes('electric') || raw.includes('lightning')) return 'volt';
  if (raw.includes('shadow') || raw.includes('dark')) return 'shadow';
  if (raw.includes('radiant') || raw.includes('holy') || raw.includes('light')) return 'radiant';
  return communeCardTypes[fallback] ? fallback : 'neutral';
}

export function getCardTypeConfig(value) {
  return communeCardTypes[normalizeCardType(value)] || communeCardTypes.neutral;
}

export function getTypeStatWeights(value) {
  return { ...getCardTypeConfig(value).statWeights };
}

export function getTypeStatBias(value) {
  return { ...getCardTypeConfig(value).statBias };
}

export function getTypeMatchup(attackerType, defenderType) {
  const attacker = getCardTypeConfig(attackerType);
  const defender = normalizeCardType(defenderType);
  const result = attacker.matchups[defender] || 'neutral';

  return {
    attackerType: attacker.type,
    defenderType: defender,
    result,
    modifier: typeMatchupModifiers[result] ?? 0,
  };
}

export function getCardTypeSummary(value) {
  const config = getCardTypeConfig(value);
  return {
    type: config.type,
    label: config.label,
    color: config.color,
    coreIdentity: config.coreIdentity,
    statBias: { ...config.statBias },
    statWeights: { ...config.statWeights },
  };
}
