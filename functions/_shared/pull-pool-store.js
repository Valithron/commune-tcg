/* ============================================================================
   Pull Pool Store
   Phase 10.2 responsibility: shared read-only pull-pool reader used by pull
   diagnostics and no-write simulation.
   ============================================================================ */

import { normalizeBaseStats, normalizeProgressionRules } from './card-mechanics.js';

export const allowedRarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

function safeParseJson(value) {
  if (!value || typeof value !== 'string') return null;
  try { return JSON.parse(value); } catch { return null; }
}

export function normalizeRarity(value) {
  const rarity = String(value || 'common').trim().toLowerCase();
  if (allowedRarities.includes(rarity)) return rarity;
  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';
  return 'common';
}

function imageUrlFromKey(key) {
  const imageKey = String(key || '').trim();
  if (!imageKey) return '';
  if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith('/')) return imageKey;
  return `/api/card-image?key=${encodeURIComponent(imageKey)}`;
}

function readCreatorDisplayName(payload) {
  return String(payload.creatorDisplayName || payload.creator_display_name || payload.creatorName || payload.creator_name || payload.creator || payload.createdBy || payload.created_by || payload.submitterDisplayName || payload.submitter_display_name || payload.artistName || payload.artist_name || payload.artist || payload.author || '').trim();
}

function readCreatorUserId(payload) {
  return String(payload.creatorUserId || payload.creator_user_id || payload.submitterUserId || payload.submitter_user_id || payload.userId || payload.user_id || '').trim();
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeCardRow(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const baseStats = normalizeBaseStats(payload);
  const progressionRules = normalizeProgressionRules(payload.progressionRules || payload.progression_rules || payload);
  const imageKey = payload.image_key || payload.imageKey || payload.image_path || payload.art_key || payload.object_key || '';
  const creatorDisplayName = readCreatorDisplayName(payload);
  const creatorUserId = readCreatorUserId(payload);
  const raritySource = String(payload.raritySource || payload.rarity_source || 'legacy').trim();
  const statsSource = String(payload.statsSource || payload.stats_source || raritySource || 'legacy').trim();
  const traitSource = String(payload.traitSource || payload.trait_source || (raritySource === 'legacy' ? 'legacy' : 'approval')).trim();
  const originRarity = normalizeRarity(payload.originRarity || payload.origin_rarity || payload.rarity || 'common');
  const originBonusPercent = toNumber(payload.originBonusPercent ?? payload.origin_bonus_percent, 0);

  return {
    id: String(payload.id || row.id),
    sourceRowId: row.id,
    name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'),
    character: String(payload.character || payload.character_id || row.character_id || ''),
    characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
    type: String(payload.type || payload.card_type || payload.role || 'Type'),
    category: String(payload.category || payload.card_type || payload.type || 'Library'),
    rarity: normalizeRarity(payload.rarity || payload.tier),
    targetRarity: normalizeRarity(payload.targetRarity || payload.target_rarity || payload.rarity_suggestion || payload.rarity || 'common'),
    raritySource,
    statsSource,
    traitSource,
    statBudget: toNumber(payload.statBudget ?? payload.stat_budget, baseStats.pow + baseStats.def + baseStats.spd),
    statArchetype: String(payload.statArchetype || payload.stat_archetype || 'balanced'),
    originRarity,
    originBonusPercent,
    originBonusMultiplier: 1 + originBonusPercent / 100,
    progressionRules,
    levelCap: progressionRules.levelCap,
    maxLevel: progressionRules.maxLevel,
    growthPerLevel: progressionRules.growthPerLevel,
    symbol: String(payload.symbol || payload.icon || '◆'),
    ability: String(payload.ability || payload.ability_text || payload.effect || ''),
    abilityIcon: String(payload.abilityIcon || payload.ability_icon || payload.icon || '✦'),
    baseStats,
    stats: { ...baseStats },
    flavor: String(payload.flavor || payload.flavor_text || payload.description || 'A pull-eligible Library card.'),
    imageKey,
    imageUrl: imageUrlFromKey(imageKey),
    creator: creatorDisplayName,
    creatorDisplayName,
    creatorUserId,
    ownerUserId: row.owner_user_id || '',
    cardJsonValid: Boolean(parsed),
    source: payload.source || 'cards',
    sourceSubmissionId: payload.source_submission_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isPullEligibleRow(row) {
  return !String(row.owner_user_id || '').trim();
}

export function summarizeByRarity(cards) {
  return allowedRarities.reduce((summary, rarity) => {
    summary[rarity] = cards.filter((card) => card.rarity === rarity).length;
    return summary;
  }, {});
}

export function buildReadiness(cards, byRarity) {
  if (!cards.length) {
    return { status: 'no-pull-pool-cards', summary: 'No unowned Library cards are currently eligible for pulls.', nextStep: 'Approve at least one submission or seed unowned Library cards before pull simulation.' };
  }

  const missingRarities = allowedRarities.filter((rarity) => byRarity[rarity] === 0);
  if (missingRarities.length) {
    return { status: 'pool-ready-with-rarity-gaps', summary: 'Pull pool has cards, but one or more rarity buckets are empty.', nextStep: 'Phase 10.2 can simulate pulls with fallback behavior, or seed missing rarity buckets first.', missingRarities };
  }

  return { status: 'ready-for-pull-simulation', summary: 'Pull pool has unowned Library cards across all configured rarity buckets.', nextStep: 'Build write-enabled pulls only after simulation verifies cleanly.' };
}

export async function readPullPool(env) {
  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
    FROM cards
    LIMIT 500
  `).all();

  const rows = result.results || [];
  const allCards = rows.map(normalizeCardRow);
  const unownedRows = rows.filter(isPullEligibleRow);
  const unownedCards = unownedRows.map(normalizeCardRow);
  const cards = unownedCards.filter((card) => card.cardJsonValid);
  const byRarity = summarizeByRarity(cards);

  return {
    rows,
    allCards,
    cards,
    byRarity,
    totalCardsScanned: rows.length,
    eligibleCount: cards.length,
    ownedRowsExcluded: rows.length - unownedRows.length,
    invalidRowsExcluded: unownedCards.filter((card) => !card.cardJsonValid).length,
    approvedSubmissionCount: cards.filter((card) => card.source === 'card_submissions').length,
    sampleExcludedOwnedCards: allCards.filter((card) => card.ownerUserId).slice(0, 10),
    readiness: buildReadiness(cards, byRarity),
  };
}
