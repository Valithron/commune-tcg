/* Canonical, versioned rules for every battle consumer. Keep persistence, DOM,
   authentication, and reward writes outside this module. */

export const BATTLE_RULES_VERSION = 'battle-1.0.0';
export const MVP_VERSION = 'mvp-1.0.0';
export const FORECAST_VERSION = 'forecast-1.0.0';
export const LANES = Object.freeze(['left', 'center', 'right']);
export const SIDES = Object.freeze(['player', 'enemy']);

export const BATTLE_RULES = Object.freeze({
  version: BATTLE_RULES_VERSION,
  maxRounds: 100,
  hp: Object.freeze({ base: 240, perLevel: 5 }),
  damage: Object.freeze({ base: 20, atkScale: 2.5, armorConstant: 40, minimum: 1 }),
  type: Object.freeze({ advantage: 1.08, disadvantage: 0.97, neutral: 1 }),
  variance: Object.freeze({ min: 0.95, max: 1.05 }),
  critical: Object.freeze({ baseChance: 0.05, maxChance: 0.10, specializationScale: 0.10, multiplier: 1.5 }),
  doubleStrike: Object.freeze({
    threshold: 100,
    damageMultiplier: 0.30,
    eligibilityRatio: 1.15,
    tiers: Object.freeze([
      Object.freeze({ id: 'swift', minimumRatio: 1.15, maximumRatio: 1.25, chargePerTurn: 17 }),
      Object.freeze({ id: 'surging', minimumRatio: 1.25, maximumRatio: 1.40, chargePerTurn: 20 }),
      Object.freeze({ id: 'rapid', minimumRatio: 1.40, maximumRatio: 1.55, chargePerTurn: 25 }),
      Object.freeze({ id: 'blinding', minimumRatio: 1.55, maximumRatio: Infinity, chargePerTurn: 34 }),
    ]),
  }),
  crossLaneMultiplier: 1,
  supportedCrossLaneMultipliers: Object.freeze([1, 0.85, 0.70]),
  playback: Object.freeze({ openingMs: 2400, normalAttackMs: 800, criticalExtraMs: 180, doubleStrikeExtraMs: 450, knockoutExtraMs: 420, battleEndMs: 1800 }),
});

export const TYPE_MATCHUPS = Object.freeze({
  flame: Object.freeze({ tide: 'disadvantage', bloom: 'advantage', shadow: 'advantage', radiant: 'disadvantage' }),
  tide: Object.freeze({ flame: 'advantage', bloom: 'disadvantage', volt: 'disadvantage', radiant: 'advantage' }),
  bloom: Object.freeze({ flame: 'disadvantage', tide: 'advantage', volt: 'advantage', shadow: 'disadvantage' }),
  volt: Object.freeze({ tide: 'advantage', bloom: 'disadvantage', shadow: 'disadvantage', radiant: 'advantage' }),
  shadow: Object.freeze({ flame: 'disadvantage', bloom: 'advantage', volt: 'advantage', radiant: 'disadvantage' }),
  radiant: Object.freeze({ flame: 'advantage', tide: 'disadvantage', volt: 'disadvantage', shadow: 'advantage' }),
  neutral: Object.freeze({}),
});

export const TYPE_COLORS = Object.freeze({
  flame: '#E85D4F', tide: '#2F80ED', bloom: '#45B36B', volt: '#F2C94C', shadow: '#5B3A8E', radiant: '#F6D77A', neutral: '#A99A86',
});

export const MVP_WEIGHTS = Object.freeze({
  usefulDamage: 1,
  knockout: 38,
  laneWon: 24,
  firstLaneWon: 36,
  reinforcementDamage: 0.55,
  finalKnockout: 28,
  survived: 18,
  criticalSurvival: 16,
  doubleStrike: 8,
});

export function createBattleRules(overrides = {}) {
  return {
    ...BATTLE_RULES,
    ...overrides,
    hp: { ...BATTLE_RULES.hp, ...(overrides.hp || {}) },
    damage: { ...BATTLE_RULES.damage, ...(overrides.damage || {}) },
    type: { ...BATTLE_RULES.type, ...(overrides.type || {}) },
    variance: { ...BATTLE_RULES.variance, ...(overrides.variance || {}) },
    critical: { ...BATTLE_RULES.critical, ...(overrides.critical || {}) },
    doubleStrike: { ...BATTLE_RULES.doubleStrike, ...(overrides.doubleStrike || {}) },
    playback: { ...BATTLE_RULES.playback, ...(overrides.playback || {}) },
  };
}
