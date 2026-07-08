/* ============================================================================
   Frontend Type Matchups
   Mirrors functions/_shared/type-config.js for player-facing battle previews.
   Backend settlement remains authoritative.
   ============================================================================ */

const typeOrder = ['flame', 'tide', 'bloom', 'volt', 'shadow', 'radiant', 'neutral'];

const aliases = {
  fire: 'flame', battle: 'flame', attack: 'flame', aggressor: 'flame',
  water: 'tide', aqua: 'tide', ocean: 'tide',
  nature: 'bloom', plant: 'bloom', defense: 'bloom', guardian: 'bloom',
  lightning: 'volt', electric: 'volt', speed: 'volt', training: 'volt',
  dark: 'shadow', darkness: 'shadow',
  light: 'radiant', holy: 'radiant', support: 'radiant', magic: 'radiant', mystic: 'radiant',
  utility: 'neutral', comedy: 'neutral', mundane: 'neutral', none: 'neutral', starter: 'neutral', pressure: 'shadow', boss: 'flame',
};

const matchupChart = {
  flame: { flame: 'neutral', tide: 'disadvantage', bloom: 'advantage', volt: 'neutral', shadow: 'advantage', radiant: 'disadvantage', neutral: 'neutral' },
  tide: { flame: 'advantage', tide: 'neutral', bloom: 'disadvantage', volt: 'disadvantage', shadow: 'neutral', radiant: 'advantage', neutral: 'neutral' },
  bloom: { flame: 'disadvantage', tide: 'advantage', bloom: 'neutral', volt: 'advantage', shadow: 'disadvantage', radiant: 'neutral', neutral: 'neutral' },
  volt: { flame: 'neutral', tide: 'advantage', bloom: 'disadvantage', volt: 'neutral', shadow: 'disadvantage', radiant: 'advantage', neutral: 'neutral' },
  shadow: { flame: 'disadvantage', tide: 'neutral', bloom: 'advantage', volt: 'advantage', shadow: 'neutral', radiant: 'disadvantage', neutral: 'neutral' },
  radiant: { flame: 'advantage', tide: 'disadvantage', bloom: 'neutral', volt: 'disadvantage', shadow: 'advantage', radiant: 'neutral', neutral: 'neutral' },
  neutral: { flame: 'neutral', tide: 'neutral', bloom: 'neutral', volt: 'neutral', shadow: 'neutral', radiant: 'neutral', neutral: 'neutral' },
};

const modifiers = {
  advantage: 0.15,
  disadvantage: -0.05,
  neutral: 0,
};

function titleCase(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeCardType(value, fallback = 'neutral') {
  const raw = String(value || fallback).trim().toLowerCase();
  if (typeOrder.includes(raw)) return raw;
  if (aliases[raw]) return aliases[raw];
  if (raw.includes('flame') || raw.includes('fire')) return 'flame';
  if (raw.includes('tide') || raw.includes('water')) return 'tide';
  if (raw.includes('bloom') || raw.includes('nature') || raw.includes('plant')) return 'bloom';
  if (raw.includes('volt') || raw.includes('electric')) return 'volt';
  if (raw.includes('shadow') || raw.includes('dark')) return 'shadow';
  if (raw.includes('radiant') || raw.includes('holy') || raw.includes('light')) return 'radiant';
  return typeOrder.includes(fallback) ? fallback : 'neutral';
}

export function getTypeMatchup(attackerType, defenderType) {
  const attacker = normalizeCardType(attackerType);
  const defender = normalizeCardType(defenderType);
  const result = matchupChart[attacker]?.[defender] || 'neutral';

  return {
    attackerType: attacker,
    attackerLabel: titleCase(attacker),
    defenderType: defender,
    defenderLabel: titleCase(defender),
    result,
    modifier: modifiers[result] ?? 0,
    multiplier: 1 + (modifiers[result] ?? 0),
  };
}

export function applyTypeMatchup(card, encounter) {
  const enemyType = normalizeCardType(encounter?.enemyType || encounter?.enemy_type || encounter?.type || encounter?.element || 'neutral');
  const matchup = getTypeMatchup(card?.type || card?.cardType || card?.card_type, enemyType);
  const baseBattlePower = Math.max(0, Math.round(Number(card?.baseBattlePower ?? card?.battlePower ?? 0)));
  const battlePower = Math.max(0, Math.round(baseBattlePower * matchup.multiplier));

  return {
    ...card,
    enemyType,
    matchup,
    matchupResult: matchup.result,
    matchupModifier: matchup.modifier,
    baseBattlePower,
    battlePower,
    adjustedBattlePower: battlePower,
  };
}

export function applyTypeMatchups(cards = [], encounter = {}) {
  return cards.map((card) => applyTypeMatchup(card, encounter));
}
