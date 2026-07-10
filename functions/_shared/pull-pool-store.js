/* ============================================================================
   Pull Pool Store
   Shared read-only pull-pool reader used by pull diagnostics and live pulls.
   ============================================================================ */

import { normalizeBaseStats, normalizeProgressionRules } from './card-mechanics.js';
import { getCardTypeSummary, normalizeCardType, normalizeCardTypeOdds, normalizeCardTypePool, typeOddsToPool } from './type-config.js';

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

function readCrop(payload) {
  return payload.crop || payload.crop_json || payload.cropJson || payload.image_crop || payload.imageCrop || {};
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBudgetRange(value, fallback) {
  const range = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const min = toNumber(range.min ?? range.minimum ?? range.low, fallback.min);
  const max = toNumber(range.max ?? range.maximum ?? range.high, fallback.max);
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

export function normalizeCardRow(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const baseStats = normalizeBaseStats(payload);
  const progressionRules = normalizeProgressionRules(payload.progressionRules || payload.progression_rules || payload);
  const imageKey = payload.image_key || payload.imageKey || payload.image_path || payload.image || payload.image_url || payload.art_url || payload.art_key || payload.object_key || payload.r2_key || '';
  const creatorDisplayName = readCreatorDisplayName(payload);
  const creatorUserId = readCreatorUserId(payload);
  const crop = readCrop(payload);
  const raritySource = String(payload.raritySource || payload.rarity_source || 'legacy').trim();
  const statsSource = String(payload.statsSource || payload.stats_source || raritySource || 'legacy').trim();
  const traitSource = String(payload.traitSource || payload.trait_source || (raritySource === 'legacy' ? 'legacy' : 'approval')).trim();
  const originRarity = normalizeRarity(payload.originRarity || payload.origin_rarity || payload.rarity || 'common');
  const originBonusPercent = toNumber(payload.originBonusPercent ?? payload.origin_bonus_percent, 0);
  const statBudget = toNumber(payload.statBudget ?? payload.stat_budget, baseStats.pow + baseStats.def + baseStats.spd);
  const growthPerLevel = progressionRules.growthPerLevel;
  const staticStatBudget = toNumber(payload.staticStatBudget ?? payload.static_stat_budget, statBudget);
  const ownedStatBudgetRange = normalizeBudgetRange(payload.ownedStatBudgetRange || payload.owned_stat_budget_range, { min: staticStatBudget - growthPerLevel, max: staticStatBudget + growthPerLevel });
  const legacyPool = normalizeCardTypePool(payload.approvedTypePool || payload.approved_type_pool || payload.type || payload.card_type || 'neutral', ['neutral'], { max: 7 });
  const approvedTypeOdds = normalizeCardTypeOdds(payload.approvedTypeOdds || payload.approved_type_odds || payload.typeOdds || payload.type_odds, legacyPool, { max: 7 });
  const approvedTypePool = typeOddsToPool(approvedTypeOdds, legacyPool);
  const suggestedTypePool = normalizeCardTypePool(payload.suggestedTypePool || payload.suggested_type_pool || payload.suggestedType || payload.suggested_type || approvedTypePool, approvedTypePool, { max: 3 });
  const cardType = normalizeCardType(payload.type || payload.card_type || approvedTypePool[0] || payload.role || payload.element || 'neutral');
  const typeSummary = getCardTypeSummary(cardType);

  return {
    id: String(payload.id || row.id),
    sourceRowId: row.id,
    name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'),
    character: String(payload.character || payload.character_id || row.character_id || ''),
    characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
    type: cardType,
    cardType,
    card_type: cardType,
    category: String(payload.category || typeSummary.label || 'Library'),
    suggestedTypePool,
    approvedTypePool,
    approvedTypeOdds,
    typeOdds: approvedTypeOdds,
    approvedType: approvedTypePool[0] || cardType,
    typeLabel: typeSummary.label,
    typeColor: typeSummary.color,
    typeIdentity: typeSummary.coreIdentity,
    typeStatBias: typeSummary.statBias,
    rarity: normalizeRarity(payload.rarity || payload.tier),
    targetRarity: normalizeRarity(payload.targetRarity || payload.target_rarity || payload.rarity_suggestion || payload.rarity || 'common'),
    raritySource,
    statsSource,
    traitSource,
    statBudget,
    staticStatBudget,
    ownedStatBudgetRange,
    copyStatBudgetVariance: toNumber(payload.copyStatBudgetVariance ?? payload.copy_stat_budget_variance, growthPerLevel),
    statArchetype: normalizeCardType(payload.statArchetype || payload.stat_archetype || cardType),
    originRarity,
    originBonusPercent,
    originBonusMultiplier: 1 + originBonusPercent / 100,
    progressionRules,
    levelCap: progressionRules.levelCap,
    maxLevel: progressionRules.maxLevel,
    growthPerLevel,
    symbol: String(payload.symbol || payload.icon || '◆'),
    ability: String(payload.ability || payload.ability_text || payload.effect || ''),
    abilityIcon: String(payload.abilityIcon || payload.ability_icon || payload.icon || '✦'),
    baseStats,
    stats: { ...baseStats },
    flavor: String(payload.flavor || payload.flavor_text || payload.flavorText || payload.effect || payload.description || 'A pull-eligible Library card.'),
    imageKey,
    imageUrl: imageUrlFromKey(imageKey),
    crop,
    cropJson: crop,
    imageCrop: crop,
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

function ownerWhere() { return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`; }
function unownedWhere() { return `(owner_user_id IS NULL OR TRIM(CAST(owner_user_id AS TEXT)) = '')`; }

export function summarizeByRarity(cards) { return allowedRarities.reduce((summary, rarity) => { summary[rarity] = cards.filter((card) => card.rarity === rarity).length; return summary; }, {}); }
export function buildReadiness(cards, byRarity) {
  if (!cards.length) return { status: 'no-pull-pool-cards', summary: 'No unowned Library cards are currently eligible for pulls.', nextStep: 'Approve at least one submission or seed unowned Library cards before pull simulation.' };
  const missingRarities = allowedRarities.filter((rarity) => byRarity[rarity] === 0);
  if (missingRarities.length) return { status: 'pool-ready-with-rarity-gaps', summary: 'Pull pool has cards, but one or more rarity buckets are empty.', nextStep: 'Pulls can use fallback behavior, or missing rarity buckets can be seeded first.', missingRarities };
  return { status: 'ready-for-pull-simulation', summary: 'Pull pool has unowned Library cards across all configured rarity buckets.', nextStep: 'Pull pool is ready.' };
}

export async function readPullPool(env) {
  const [eligibleResult, totalRow, ownedRow, sampleOwnedResult] = await Promise.all([
    env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE ${unownedWhere()} ORDER BY created_at ASC, updated_at ASC, id ASC`).all(),
    env.DB.prepare(`SELECT COUNT(*) AS count FROM cards`).first(),
    env.DB.prepare(`SELECT COUNT(*) AS count FROM cards WHERE ${ownerWhere()}`).first(),
    env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE ${ownerWhere()} ORDER BY updated_at DESC, created_at DESC, id ASC LIMIT 10`).all(),
  ]);
  const rows = eligibleResult.results || [];
  const eligibleCards = rows.map(normalizeCardRow);
  const cards = eligibleCards.filter((card) => card.cardJsonValid);
  const byRarity = summarizeByRarity(cards);
  const sampleExcludedOwnedCards = (sampleOwnedResult.results || []).map(normalizeCardRow);
  return { rows, allCards: eligibleCards, cards, byRarity, totalCardsScanned: Number(totalRow?.count || rows.length), eligibleCount: cards.length, ownedRowsExcluded: Number(ownedRow?.count || 0), invalidRowsExcluded: eligibleCards.filter((card) => !card.cardJsonValid).length, approvedSubmissionCount: cards.filter((card) => card.source === 'card_submissions').length, sampleExcludedOwnedCards, readiness: buildReadiness(cards, byRarity) };
}
