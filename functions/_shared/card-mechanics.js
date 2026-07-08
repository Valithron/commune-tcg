/* ============================================================================
   Card Mechanics Contract

   Approval creates canonical card-template traits for the global Library card.
   Pulling creates owned-copy traits for a player's Vault copy.

   Keep this file small and backward-compatible. Existing renderers still read
   rarity, stats, pow, def, and spd directly while newer paths can read
   baseStats, copyTraits, progression, and effective stats.
   ============================================================================ */

export const cardMechanicsVersion = 'card-mechanics-v1';

export const defaultBaseStats = Object.freeze({ pow: 1, def: 1, spd: 1 });
export const emptyStatBonus = Object.freeze({ pow: 0, def: 0, spd: 0 });

const allowedRarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

function sourceObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'foil', 'holo'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'none', 'standard'].includes(normalized)) return false;
  }
  return fallback;
}

function cleanText(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

export function normalizeRarity(value) {
  const rarity = cleanText(value || 'common').toLowerCase();
  if (allowedRarities.includes(rarity)) return rarity;
  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';
  return 'common';
}

export function normalizeBaseStats(source = {}, fallback = defaultBaseStats) {
  const card = sourceObject(source);
  const baseStats = sourceObject(card.baseStats || card.base_stats);
  const stats = sourceObject(card.stats || card.statBlock || card.stat_block);
  const safeFallback = { ...defaultBaseStats, ...sourceObject(fallback) };

  return {
    pow: toNumber(
      baseStats.pow ?? baseStats.power ?? baseStats.attack
        ?? card.basePow ?? card.base_pow
        ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength
        ?? card.pow ?? card.power ?? card.attack ?? card.atk ?? card.strength,
      safeFallback.pow
    ),
    def: toNumber(
      baseStats.def ?? baseStats.defense ?? baseStats.health
        ?? card.baseDef ?? card.base_def
        ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp
        ?? card.def ?? card.defense ?? card.health ?? card.hp,
      safeFallback.def
    ),
    spd: toNumber(
      baseStats.spd ?? baseStats.speed ?? baseStats.agility
        ?? card.baseSpd ?? card.base_spd
        ?? stats.spd ?? stats.speed ?? stats.agility
        ?? card.spd ?? card.speed ?? card.agility,
      safeFallback.spd
    ),
  };
}

export function normalizeCopyTraits(copyTraits = {}, options = {}) {
  const traits = sourceObject(copyTraits);
  const rawStatBonus = sourceObject(traits.statBonus || traits.stat_bonus);

  return {
    foil: toBoolean(traits.foil, false),
    holo: toBoolean(traits.holo, false),
    variant: cleanText(traits.variant || 'standard', 60) || 'standard',
    mintNumber: traits.mintNumber ?? traits.mint_number ?? options.mintNumber ?? null,
    statBonus: normalizeBaseStats(rawStatBonus, emptyStatBonus),
  };
}

export function normalizeProgression(progression = {}) {
  const source = sourceObject(progression);

  return {
    level: toNumber(source.level ?? source.card_level ?? source.cardLevel, 1),
    xp: toNumber(source.xp ?? source.experience ?? source.experience_points ?? source.experiencePoints, 0),
    copies: toNumber(source.copies ?? source.copy_count ?? source.copyCount ?? source.quantity, 1),
  };
}

export function buildApprovedTemplateTraits({ approvalProfile = {}, source = {} } = {}) {
  const profile = sourceObject(approvalProfile);
  const sourceCard = sourceObject(source);
  const baseStats = normalizeBaseStats(profile.stats || profile.baseStats || profile.base_stats || sourceCard);
  const raritySource = cleanText(profile.raritySource || profile.rarity_source || 'approval_random_roll');
  const statsSource = cleanText(profile.statsSource || profile.stats_source || 'approval_random_roll');

  return {
    mechanicsVersion: cardMechanicsVersion,
    rarity: normalizeRarity(profile.rarity || sourceCard.rarity || 'common'),
    raritySource,
    statsSource,
    traitSource: 'approval',
    baseStats,
    stats: { ...baseStats },
    pow: baseStats.pow,
    def: baseStats.def,
    spd: baseStats.spd,
  };
}

export function buildOwnedCopyTraits({ copyTraits = {}, progression = {}, mintNumber = null } = {}) {
  return {
    mechanicsVersion: cardMechanicsVersion,
    copyTraits: normalizeCopyTraits(copyTraits, { mintNumber }),
    progression: normalizeProgression(progression),
  };
}

export function calculateEffectiveStats({ baseStats = {}, copyTraits = {} } = {}) {
  const normalizedBaseStats = normalizeBaseStats(baseStats);
  const normalizedCopyTraits = normalizeCopyTraits(copyTraits);
  const bonus = normalizedCopyTraits.statBonus;

  // Level scaling is intentionally not applied yet. Progression is stored now
  // so Battle can opt into a clear formula later without changing saved cards.
  return {
    pow: normalizedBaseStats.pow + bonus.pow,
    def: normalizedBaseStats.def + bonus.def,
    spd: normalizedBaseStats.spd + bonus.spd,
  };
}
