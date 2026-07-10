/* Normalized contracts shared by engine, server adapter, simulator, forecasts,
   and tests. Internal stored `pow` is accepted only as an ATK compatibility key. */

import { BATTLE_RULES, LANES } from './battle-config.js';

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeType(value) {
  const normalized = String(value || 'neutral').trim().toLowerCase();
  return ['flame', 'tide', 'bloom', 'volt', 'shadow', 'radiant', 'neutral'].includes(normalized) ? normalized : 'neutral';
}

export function calculateMaxHp(level, rules = BATTLE_RULES) {
  return Math.max(1, Math.round(rules.hp.base + (Math.max(1, number(level, 1)) - 1) * rules.hp.perLevel));
}

export function getDoubleStrikeProfile(stats, rules = BATTLE_RULES) {
  const atk = Math.max(0, number(stats?.atk ?? stats?.pow));
  const def = Math.max(0, number(stats?.def));
  const spd = Math.max(0, number(stats?.spd));
  const comparison = Math.max(atk, def);
  const ratio = comparison > 0 ? spd / comparison : (spd > 0 ? Infinity : 0);
  const tier = rules.doubleStrike.tiers.find((candidate) => ratio >= candidate.minimumRatio && ratio < candidate.maximumRatio) || null;
  return { eligible: ratio >= rules.doubleStrike.eligibilityRatio, charge: 0, tier: tier?.id || null, ratio, chargePerTurn: tier?.chargePerTurn || 0 };
}

export function normalizeCombatCard(source = {}, { side = 'player', lane = 'center', rules = BATTLE_RULES } = {}) {
  const rawStats = source.stats || source.effectiveStats || source.effective_stats || {};
  const stats = {
    atk: Math.max(0, number(rawStats.atk ?? rawStats.pow ?? source.atk ?? source.pow, 1)),
    def: Math.max(0, number(rawStats.def ?? source.def, 1)),
    spd: Math.max(0, number(rawStats.spd ?? source.spd, 1)),
  };
  const level = Math.max(1, Math.floor(number(source.level, 1)));
  const maxHp = Math.max(1, Math.floor(number(source.maxHp ?? source.max_hp, calculateMaxHp(level, rules))));
  const instanceId = String(source.instanceId || source.instance_id || source.sourceRowId || source.id || `${side}-${lane}`);
  return {
    instanceId,
    templateId: String(source.templateId || source.template_id || source.characterId || source.character_id || instanceId),
    ownerId: String(source.ownerId || source.owner_id || source.ownerUserId || side),
    side,
    lane: LANES.includes(lane) ? lane : 'center',
    name: String(source.name || source.cardTitle || source.card_name || 'Unnamed Card'),
    rarity: String(source.rarity || 'common').toLowerCase(),
    type: normalizeType(source.type || source.cardType || source.card_type),
    level,
    stats,
    power: Math.round(stats.atk + stats.def + stats.spd),
    maxHp,
    currentHp: Math.min(maxHp, Math.max(0, Math.floor(number(source.currentHp ?? source.current_hp, maxHp)))),
    alive: number(source.currentHp ?? source.current_hp, maxHp) > 0,
    imageUrl: String(source.imageUrl || source.image_url || ''),
    imageKey: String(source.imageKey || source.image_key || ''),
    crop: source.crop || source.cropJson || source.imageCrop || {},
    doubleStrike: { ...getDoubleStrikeProfile(stats, rules), ...(source.doubleStrike || {}), charge: Math.max(0, number(source.doubleStrike?.charge, 0)) },
  };
}

export function normalizeBattleInput(input = {}, rules = BATTLE_RULES) {
  const normalizeSide = (cards, side) => (cards || []).map((card, index) => normalizeCombatCard(card, { side, lane: card.lane || LANES[index] || 'center', rules }));
  const player = normalizeSide(input.player || input.playerCards, 'player');
  const enemy = normalizeSide(input.enemy || input.enemies || input.enemyCards, 'enemy');
  const ids = [...player, ...enemy].map((card) => card.instanceId);
  if (new Set(ids).size !== ids.length) throw new Error('Battle card instance IDs must be unique.');
  if (!player.length || !enemy.length) throw new Error('Battle input requires cards on both sides.');
  return { player, enemy };
}

export function publicCardSnapshot(card) {
  return {
    instanceId: card.instanceId, templateId: card.templateId, ownerId: card.ownerId, side: card.side, lane: card.lane,
    name: card.name, rarity: card.rarity, type: card.type, level: card.level, stats: { ...card.stats }, power: card.power,
    maxHp: card.maxHp, currentHp: card.currentHp, alive: card.alive, imageUrl: card.imageUrl, imageKey: card.imageKey,
    crop: card.crop, doubleStrike: { ...card.doubleStrike },
  };
}

