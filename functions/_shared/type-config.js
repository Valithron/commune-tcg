/* ============================================================================
   Imago Core Type Config

   Centralizes the accepted 7-type model, stat allocation bias, display labels,
   matchup chart, type pools, and weighted pull-time type odds.
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
  flame: { type: 'flame', label: 'Flame', color: '#E85D4F', coreIdentity: 'Power, aggression, burst damage', statWeights: { pow: 1.10, def: 0.95, spd: 1.00 }, statBias: { pow: 10, def: -5, spd: 0 }, matchups: { flame: 'neutral', tide: 'disadvantage', bloom: 'advantage', volt: 'neutral', shadow: 'advantage', radiant: 'disadvantage', neutral: 'neutral' } },
  tide: { type: 'tide', label: 'Tide', color: '#2F80ED', coreIdentity: 'Flow, healing, control', statWeights: { pow: 1.00, def: 1.05, spd: 1.05 }, statBias: { pow: 0, def: 5, spd: 5 }, matchups: { flame: 'advantage', tide: 'neutral', bloom: 'disadvantage', volt: 'disadvantage', shadow: 'neutral', radiant: 'advantage', neutral: 'neutral' } },
  bloom: { type: 'bloom', label: 'Bloom', color: '#45B36B', coreIdentity: 'Growth, sustain, nature', statWeights: { pow: 1.00, def: 1.10, spd: 0.95 }, statBias: { pow: 0, def: 10, spd: -5 }, matchups: { flame: 'disadvantage', tide: 'advantage', bloom: 'neutral', volt: 'advantage', shadow: 'disadvantage', radiant: 'neutral', neutral: 'neutral' } },
  volt: { type: 'volt', label: 'Volt', color: '#F2C94C', coreIdentity: 'Speed, energy, disruption', statWeights: { pow: 1.05, def: 0.95, spd: 1.10 }, statBias: { pow: 5, def: -5, spd: 10 }, matchups: { flame: 'neutral', tide: 'advantage', bloom: 'disadvantage', volt: 'neutral', shadow: 'disadvantage', radiant: 'advantage', neutral: 'neutral' } },
  shadow: { type: 'shadow', label: 'Shadow', color: '#5B3A8E', coreIdentity: 'Defense, drain, corruption, sacrifice, and tricks', statWeights: { pow: 1.00, def: 1.10, spd: 0.95 }, statBias: { pow: 0, def: 10, spd: -5 }, matchups: { flame: 'disadvantage', tide: 'neutral', bloom: 'advantage', volt: 'advantage', shadow: 'neutral', radiant: 'disadvantage', neutral: 'neutral' } },
  radiant: { type: 'radiant', label: 'Radiant', color: '#F6D77A', coreIdentity: 'Healing, protection, holy or heroic power', statWeights: { pow: 1.05, def: 1.05, spd: 1.00 }, statBias: { pow: 5, def: 5, spd: 0 }, matchups: { flame: 'advantage', tide: 'disadvantage', bloom: 'neutral', volt: 'disadvantage', shadow: 'advantage', radiant: 'neutral', neutral: 'neutral' } },
  neutral: { type: 'neutral', label: 'Neutral', color: '#A99A86', coreIdentity: 'Balanced, mundane, flexible, comedy cards', statWeights: { pow: 1.00, def: 1.00, spd: 1.00 }, statBias: { pow: 0, def: 0, spd: 0 }, matchups: { flame: 'neutral', tide: 'neutral', bloom: 'neutral', volt: 'neutral', shadow: 'neutral', radiant: 'neutral', neutral: 'neutral' } },
});

const typeAliases = Object.freeze({
  fire: 'flame', ember: 'flame', burn: 'flame', battle: 'flame', attack: 'flame', attacker: 'flame', aggressor: 'flame', striker: 'flame',
  water: 'tide', aqua: 'tide', ocean: 'tide', flow: 'tide',
  nature: 'bloom', earth: 'bloom', plant: 'bloom', garden: 'bloom', defense: 'bloom', defender: 'bloom', guardian: 'bloom', tank: 'bloom',
  lightning: 'volt', electric: 'volt', electricity: 'volt', energy: 'volt', speed: 'volt', swift: 'volt', training: 'volt', scout: 'volt',
  dark: 'shadow', darkness: 'shadow', corrupt: 'shadow', corruption: 'shadow',
  light: 'radiant', holy: 'radiant', divine: 'radiant', support: 'radiant', magic: 'radiant', mystic: 'radiant',
  mundane: 'neutral', comedy: 'neutral', utility: 'neutral', craft: 'neutral', alchemy: 'neutral', balanced: 'neutral', none: 'neutral', random: 'neutral',
});

function cleanText(value, maxLength = 80) { return String(value || '').trim().toLowerCase().slice(0, maxLength); }
function safeParseJson(value) { if (!value || typeof value !== 'string') return null; try { return JSON.parse(value); } catch { return null; } }
function toWeight(value) { const parsed = Number(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; }

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

export function normalizeCardTypePool(value, fallback = ['neutral'], { max = 7 } = {}) {
  const parsed = typeof value === 'string' && value.trim().startsWith('[') ? safeParseJson(value) : null;
  const rawList = Array.isArray(value) ? value : Array.isArray(parsed) ? parsed : typeof value === 'string' && value.includes(',') ? value.split(',') : value ? [value] : fallback;
  const normalized = [];

  for (const item of rawList) {
    const rawType = typeof item === 'object' && item ? item.type : item;
    const type = normalizeCardType(rawType, '');
    if (type && communeCardTypes[type] && !normalized.includes(type)) normalized.push(type);
    if (normalized.length >= max) break;
  }

  if (normalized.length) return normalized;
  return normalizeCardTypePool(fallback, ['neutral'], { max });
}

export function normalizeCardTypeOdds(value, fallback = ['neutral'], { max = 7 } = {}) {
  const parsed = typeof value === 'string' ? safeParseJson(value) : value;
  const source = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' ? Object.entries(parsed).map(([type, weight]) => ({ type, weight })) : [];
  const byType = new Map();

  for (const item of source) {
    const type = normalizeCardType(typeof item === 'string' ? item : item?.type, '');
    const weight = toWeight(typeof item === 'string' ? 1 : item?.weight ?? item?.odds ?? item?.probability ?? item?.percent);
    if (!type || !communeCardTypes[type] || weight <= 0) continue;
    byType.set(type, (byType.get(type) || 0) + weight);
    if (byType.size >= max) break;
  }

  if (!byType.size) {
    const pool = normalizeCardTypePool(fallback, ['neutral'], { max });
    const evenWeight = 100 / pool.length;
    return pool.map((type) => ({ type, weight: evenWeight }));
  }

  const total = [...byType.values()].reduce((sum, weight) => sum + weight, 0);
  return [...byType.entries()].map(([type, weight]) => ({
    type,
    weight: Number(((weight / total) * 100).toFixed(4)),
  }));
}

export function typeOddsToPool(value, fallback = ['neutral']) {
  return normalizeCardTypeOdds(value, fallback).map((entry) => entry.type);
}

export function chooseWeightedCardType(value, randomValue = Math.random(), fallback = ['neutral']) {
  const odds = normalizeCardTypeOdds(value, fallback);
  let roll = Math.min(Math.max(Number(randomValue) || 0, 0), 0.999999999) * 100;
  for (const entry of odds) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return odds[odds.length - 1]?.type || 'neutral';
}

export function getCardTypeConfig(value) { return communeCardTypes[normalizeCardType(value)] || communeCardTypes.neutral; }
export function getTypeStatWeights(value) { return { ...getCardTypeConfig(value).statWeights }; }
export function getTypeStatBias(value) { return { ...getCardTypeConfig(value).statBias }; }
export function getTypeMatchup(attackerType, defenderType) { const attacker = getCardTypeConfig(attackerType); const defender = normalizeCardType(defenderType); const result = attacker.matchups[defender] || 'neutral'; return { attackerType: attacker.type, defenderType: defender, result, modifier: typeMatchupModifiers[result] ?? 0 }; }
export function getCardTypeSummary(value) { const config = getCardTypeConfig(value); return { type: config.type, label: config.label, color: config.color, coreIdentity: config.coreIdentity, statBias: { ...config.statBias }, statWeights: { ...config.statWeights } }; }
export function summarizeCardTypePool(value) { return normalizeCardTypePool(value).map(getCardTypeSummary); }
