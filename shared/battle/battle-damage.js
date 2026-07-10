/* Pure battle math. Full precision is retained until the final damage integer. */

import { BATTLE_RULES, TYPE_MATCHUPS } from './battle-config.js';

export function getTypeRelationship(attackerType, defenderType) {
  return TYPE_MATCHUPS[attackerType]?.[defenderType] || 'neutral';
}

export function getTypeMultiplier(attackerType, defenderType, rules = BATTLE_RULES) {
  return rules.type[getTypeRelationship(attackerType, defenderType)] ?? rules.type.neutral;
}

export function calculateCritChance(card, rules = BATTLE_RULES) {
  const averageNonSpd = (card.stats.atk + card.stats.def) / 2;
  const specialization = averageNonSpd > 0 ? Math.max(0, card.stats.spd / averageNonSpd - 1) : 1;
  const bonus = Math.min(rules.critical.maxChance - rules.critical.baseChance, specialization * rules.critical.specializationScale);
  return Math.min(rules.critical.maxChance, rules.critical.baseChance + bonus);
}

export function calculateDamage({ attacker, defender, rng, rules = BATTLE_RULES, critical = null, damageMultiplier = 1, canCrit = true }) {
  const variance = rng.between(rules.variance.min, rules.variance.max);
  const critChance = calculateCritChance(attacker, rules);
  const isCritical = canCrit && (critical === null ? rng.chance(critChance) : Boolean(critical));
  const raw = rules.damage.base + attacker.stats.atk * rules.damage.atkScale;
  const defenseMultiplier = rules.damage.armorConstant / (rules.damage.armorConstant + defender.stats.def);
  const typeRelationship = getTypeRelationship(attacker.type, defender.type);
  const typeMultiplier = rules.type[typeRelationship] ?? rules.type.neutral;
  const precise = raw * defenseMultiplier * typeMultiplier * variance * (isCritical ? rules.critical.multiplier : 1) * damageMultiplier;
  const displayedDamage = Math.max(rules.damage.minimum, Math.round(precise));
  const appliedDamage = Math.min(defender.currentHp, displayedDamage);
  return { raw, defenseMultiplier, typeRelationship, typeMultiplier, variance, critChance, critical: isCritical, damageMultiplier, precise, displayedDamage, appliedDamage, overkill: Math.max(0, displayedDamage - appliedDamage) };
}

