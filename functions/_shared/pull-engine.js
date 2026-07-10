import { rollOwnedCopyStatProfile } from './approval-rolls.js';
import { buildOwnedCopyTraits, calculateEffectiveStats, normalizeBaseStats, normalizeProgressionRules } from './card-mechanics.js';
import { getRarityOddsPercentages, pullOptions } from './pull-config.js';
import { readPullPool } from './pull-pool-store.js';
import { chooseWeightedCardType, normalizeCardTypeOdds, normalizeCardTypePool } from './type-config.js';

export const temporaryPullUserId = 'sterling';
export const temporaryPullUserDisplayName = 'Sterling';
export const temporaryStartingTickets = 12;

const userResourcesSql = `
  CREATE TABLE IF NOT EXISTS user_resources (
    user_id TEXT PRIMARY KEY,
    pull_tickets INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

const pullHistorySql = `
  CREATE TABLE IF NOT EXISTS pull_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pull_count INTEGER NOT NULL,
    ticket_cost INTEGER NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

function clampPullCount(value) { return Number(value) === 5 ? 5 : 1; }
function randomFloat() { const values = new Uint32Array(1); crypto.getRandomValues(values); return values[0] / 4294967295; }
function buildId(prefix) { return prefix + '_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8); }
function safeParseJson(value) { if (!value || typeof value !== 'string') return null; try { return JSON.parse(value); } catch { return null; } }
function cleanText(value, maxLength = 120) { return String(value || '').trim().slice(0, maxLength); }
function toNumber(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function imageUrlFromKey(key) { const imageKey = String(key || '').trim(); if (!imageKey) return ''; if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith('/')) return imageKey; return `/api/card-image?key=${encodeURIComponent(imageKey)}`; }
function readImageKey(card) { return card.imageKey || card.image_key || card.image_path || card.image || card.image_url || card.art_url || card.art_key || card.object_key || card.r2_key || ''; }
function readImageUrl(card, imageKey = readImageKey(card)) { return card.imageUrl || card.image_url || card.artUrl || card.art_url || imageUrlFromKey(imageKey); }
function readCrop(card) { return card.crop || card.crop_json || card.cropJson || card.image_crop || card.imageCrop || {}; }
function resolvePullUser(user = null) { return { id: String(user?.id || user?.slotId || temporaryPullUserId), displayName: String(user?.displayName || user?.username || temporaryPullUserDisplayName) }; }

async function tableExists(env, tableName) { const row = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`).bind(tableName).first(); return Boolean(row); }
async function ensurePullSchema(env, now, user = null) {
  const activeUser = resolvePullUser(user);
  await env.DB.prepare(userResourcesSql).run();
  await env.DB.prepare(pullHistorySql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_pull_history_user_created ON pull_history (user_id, created_at)').run();
  await env.DB.prepare(`INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`).bind(activeUser.id, temporaryStartingTickets, 0, now, now).run();
}
async function readUserResources(env, user = null) {
  const activeUser = resolvePullUser(user);
  return env.DB.prepare(`SELECT user_id AS userId, pull_tickets AS pullTickets, gold, created_at AS createdAt, updated_at AS updatedAt FROM user_resources WHERE user_id = ? LIMIT 1`).bind(activeUser.id).first();
}
export async function readPullResources(env, { user = null } = {}) {
  const activeUser = resolvePullUser(user);
  const exists = await tableExists(env, 'user_resources');
  if (!exists) return { userId: activeUser.id, ownerDisplayName: activeUser.displayName, pullTickets: temporaryStartingTickets, gold: 0, bootstrapped: false, tableExists: false, note: 'Live pull resources have not been created yet.' };
  const resources = await readUserResources(env, activeUser);
  if (!resources) return { userId: activeUser.id, ownerDisplayName: activeUser.displayName, pullTickets: temporaryStartingTickets, gold: 0, bootstrapped: false, tableExists: true, note: `${activeUser.displayName} resources row has not been created yet.` };
  return { userId: resources.userId, ownerDisplayName: activeUser.displayName, pullTickets: Number(resources.pullTickets), gold: Number(resources.gold || 0), createdAt: resources.createdAt, updatedAt: resources.updatedAt, bootstrapped: true, tableExists: true, note: '' };
}
async function readOwnedCardSummary(env, ownedCardId, owner = null) {
  const activeUser = resolvePullUser(owner);
  if (!ownedCardId) return null;
  const row = await env.DB.prepare(`SELECT id, owner_user_id, card_json FROM cards WHERE id = ? LIMIT 1`).bind(ownedCardId).first();
  if (!row) return null;
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const imageKey = readImageKey(payload);
  return { ownedCardId: row.id, ownerUserId: row.owner_user_id || '', ownerDisplayName: row.owner_user_id === activeUser.id ? activeUser.displayName : row.owner_user_id || 'Unknown owner', cardTitle: payload.name || payload.card_name || payload.title || 'Unknown card', actualRarity: payload.rarity || 'common', characterId: payload.character_id || payload.characterId || payload.character || '', creatorDisplayName: payload.creatorDisplayName || payload.creator_display_name || payload.creator || '', creatorUserId: payload.creatorUserId || payload.creator_user_id || '', imageKey, imageUrl: readImageUrl(payload, imageKey) };
}
async function hydrateHistoryResult(env, result, userId, owner = null) {
  const activeUser = resolvePullUser(owner);
  const ownerUserId = result.ownerUserId || userId || activeUser.id;
  const alreadySemantic = result.cardTitle && result.ownerDisplayName;
  if (alreadySemantic) return { ...result, ownerUserId, ownerDisplayName: result.ownerDisplayName };
  const ownedSummary = await readOwnedCardSummary(env, result.ownedCardId, activeUser);
  return { ...result, ownerUserId: result.ownerUserId || ownedSummary?.ownerUserId || ownerUserId, ownerDisplayName: result.ownerDisplayName || ownedSummary?.ownerDisplayName || activeUser.displayName, cardTitle: result.cardTitle || ownedSummary?.cardTitle || result.sourceCardTitle || 'Unknown card', actualRarity: result.actualRarity || ownedSummary?.actualRarity || result.selectedRarity || 'common', characterId: result.characterId || ownedSummary?.characterId || '', creatorDisplayName: result.creatorDisplayName || ownedSummary?.creatorDisplayName || '', creatorUserId: result.creatorUserId || ownedSummary?.creatorUserId || '', imageKey: result.imageKey || ownedSummary?.imageKey || '', imageUrl: result.imageUrl || ownedSummary?.imageUrl || '', historyHydrated: Boolean(ownedSummary) };
}
export async function readPullHistory(env, { limit = 20, user = null } = {}) {
  const activeUser = resolvePullUser(user);
  const exists = await tableExists(env, 'pull_history');
  if (!exists) return { tableExists: false, totalReturned: 0, pulls: [] };
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const result = await env.DB.prepare(`SELECT id, user_id AS userId, pull_count AS pullCount, ticket_cost AS ticketCost, result_json AS resultJson, created_at AS createdAt FROM pull_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).bind(activeUser.id, safeLimit).all();
  const pulls = [];
  for (const row of result.results || []) { let rawResults = []; try { rawResults = JSON.parse(row.resultJson || '[]'); } catch { rawResults = []; } const results = []; for (const rawResult of rawResults) results.push(await hydrateHistoryResult(env, rawResult, row.userId, activeUser)); pulls.push({ id: row.id, userId: row.userId, ownerUserId: row.userId, ownerDisplayName: row.userId === activeUser.id ? activeUser.displayName : row.userId, pullCount: Number(row.pullCount), ticketCost: Number(row.ticketCost), results, createdAt: row.createdAt }); }
  return { tableExists: true, totalReturned: pulls.length, pulls };
}
function chooseWeightedRarity(rarityOdds) { const totalWeight = rarityOdds.reduce((total, entry) => total + entry.weight, 0); let roll = randomFloat() * totalWeight; for (const entry of rarityOdds) { roll -= entry.weight; if (roll <= 0) return entry.rarity; } return rarityOdds[0]?.rarity || 'common'; }
function chooseRandomCard(cards) { return cards.length ? cards[Math.floor(randomFloat() * cards.length)] : null; }
function chooseCardForRarity(cards, rarity) { const fromRarity = chooseRandomCard(cards.filter((card) => card.rarity === rarity)); return fromRarity ? { card: fromRarity, fallbackUsed: false } : { card: chooseRandomCard(cards), fallbackUsed: true }; }
function creatorFields(baseCard) { const creatorDisplayName = cleanText(baseCard.creatorDisplayName || baseCard.creator || ''); const creatorUserId = cleanText(baseCard.creatorUserId || ''); return { creatorDisplayName, creatorUserId }; }

function buildOwnedCardPayload({ baseCard, ownedCardId, pullId, now, owner = null }) {
  const activeUser = resolvePullUser(owner);
  const creator = creatorFields(baseCard);
  const approvedTypePool = normalizeCardTypePool(baseCard.approvedTypePool || baseCard.approved_type_pool || baseCard.type || baseCard.cardType || 'neutral', ['neutral'], { max: 7 });
  const approvedTypeOdds = normalizeCardTypeOdds(baseCard.approvedTypeOdds || baseCard.approved_type_odds || baseCard.typeOdds || baseCard.type_odds, approvedTypePool, { max: 7 });
  const selectedType = chooseWeightedCardType(approvedTypeOdds, randomFloat(), approvedTypePool);
  const templateBaseStats = normalizeBaseStats(baseCard);
  const ownedStatProfile = rollOwnedCopyStatProfile({ rarity: baseCard.rarity, source: { ...baseCard, cardType: selectedType, type: selectedType, statArchetype: selectedType } });
  const baseStats = ownedStatProfile.stats;
  const ownedTraits = buildOwnedCopyTraits();
  const progressionRules = normalizeProgressionRules(baseCard.progressionRules || baseCard.progression_rules || baseCard);
  const originBonusPercent = toNumber(baseCard.originBonusPercent ?? baseCard.origin_bonus_percent, 0);
  const originBonusMultiplier = 1 + originBonusPercent / 100;
  const effectiveStats = calculateEffectiveStats({ baseStats, copyTraits: ownedTraits.copyTraits, progression: ownedTraits.progression, progressionRules, originBonusPercent });
  const raritySource = baseCard.raritySource || baseCard.rarity_source || 'legacy';
  const templateStatsSource = baseCard.statsSource || baseCard.stats_source || raritySource;
  const statsSource = ownedStatProfile.statsSource;
  const traitSource = baseCard.traitSource || baseCard.trait_source || (raritySource === 'legacy' ? 'legacy' : 'approval');
  const originRarity = baseCard.originRarity || baseCard.origin_rarity || baseCard.rarity;
  const imageKey = readImageKey(baseCard);
  const imageUrl = readImageUrl(baseCard, imageKey);
  const crop = readCrop(baseCard);
  return {
    id: ownedCardId,
    name: baseCard.name,
    character: baseCard.character,
    character_id: baseCard.characterId,
    cid: baseCard.characterId,
    type: selectedType,
    cardType: selectedType,
    card_type: selectedType,
    approvedTypePool,
    approved_type_pool: approvedTypePool,
    approvedTypeOdds,
    approved_type_odds: approvedTypeOdds,
    selectedType,
    selected_type: selectedType,
    selectedTypeSource: approvedTypeOdds.length > 1 ? 'weighted_pull_type_roll' : 'single_approved_type',
    selected_type_source: approvedTypeOdds.length > 1 ? 'weighted_pull_type_roll' : 'single_approved_type',
    category: ownedStatProfile.typeLabel || baseCard.category,
    typeLabel: ownedStatProfile.typeLabel,
    type_label: ownedStatProfile.typeLabel,
    typeColor: ownedStatProfile.typeColor,
    type_color: ownedStatProfile.typeColor,
    typeIdentity: ownedStatProfile.typeIdentity,
    type_identity: ownedStatProfile.typeIdentity,
    typeStatBias: ownedStatProfile.typeStatBias,
    type_stat_bias: ownedStatProfile.typeStatBias,
    rarity: baseCard.rarity,
    targetRarity: baseCard.targetRarity || baseCard.target_rarity || baseCard.rarity,
    target_rarity: baseCard.targetRarity || baseCard.target_rarity || baseCard.rarity,
    rarity_source: raritySource,
    raritySource,
    symbol: baseCard.symbol,
    ability: baseCard.ability,
    ability_text: baseCard.ability,
    abilityIcon: baseCard.abilityIcon,
    mechanicsVersion: ownedTraits.mechanicsVersion,
    traitSource,
    trait_source: traitSource,
    templateStatsSource,
    template_stats_source: templateStatsSource,
    statsSource,
    stats_source: statsSource,
    templateBaseStats,
    template_base_stats: templateBaseStats,
    templateStatBudget: baseCard.statBudget || baseCard.stat_budget || templateBaseStats.pow + templateBaseStats.def + templateBaseStats.spd,
    template_stat_budget: baseCard.statBudget || baseCard.stat_budget || templateBaseStats.pow + templateBaseStats.def + templateBaseStats.spd,
    statBudget: ownedStatProfile.statBudget,
    stat_budget: ownedStatProfile.statBudget,
    staticStatBudget: ownedStatProfile.staticStatBudget,
    static_stat_budget: ownedStatProfile.staticStatBudget,
    ownedStatBudgetRange: ownedStatProfile.ownedStatBudgetRange,
    owned_stat_budget_range: ownedStatProfile.ownedStatBudgetRange,
    copyStatBudgetVariance: ownedStatProfile.copyStatBudgetVariance,
    copy_stat_budget_variance: ownedStatProfile.copyStatBudgetVariance,
    statArchetype: ownedStatProfile.statArchetype,
    stat_archetype: ownedStatProfile.statArchetype,
    baseStats,
    base_stats: baseStats,
    copyTraits: ownedTraits.copyTraits,
    copy_traits: ownedTraits.copyTraits,
    progression: ownedTraits.progression,
    progressionRules,
    progression_rules: progressionRules,
    levelCap: progressionRules.levelCap,
    level_cap: progressionRules.levelCap,
    maxLevel: progressionRules.maxLevel,
    max_level: progressionRules.maxLevel,
    growthPerLevel: progressionRules.growthPerLevel,
    growth_per_level: progressionRules.growthPerLevel,
    originRarity,
    origin_rarity: originRarity,
    originBonusPercent,
    origin_bonus_percent: originBonusPercent,
    originBonusMultiplier,
    origin_bonus_multiplier: originBonusMultiplier,
    stats: effectiveStats,
    effectiveStats,
    effective_stats: effectiveStats,
    pow: effectiveStats.pow,
    def: effectiveStats.def,
    spd: effectiveStats.spd,
    flavor: baseCard.flavor,
    flavor_text: baseCard.flavor,
    image_key: imageKey,
    imageKey,
    image_url: imageUrl,
    imageUrl,
    crop,
    crop_json: crop,
    cropJson: crop,
    image_crop: crop,
    imageCrop: crop,
    creator: creator.creatorDisplayName,
    creator_display_name: creator.creatorDisplayName,
    creatorDisplayName: creator.creatorDisplayName,
    creator_user_id: creator.creatorUserId,
    creatorUserId: creator.creatorUserId,
    owned: true,
    owner_user_id: activeUser.id,
    ownerDisplayName: activeUser.displayName,
    level: ownedTraits.progression.level,
    xp: ownedTraits.progression.xp,
    copies: ownedTraits.progression.copies,
    source: 'pull',
    source_pool_card_id: baseCard.sourceRowId || baseCard.id,
    source_card_id: baseCard.id,
    source_submission_id: baseCard.sourceSubmissionId || '',
    pull_id: pullId,
    pulled_at: now,
  };
}

function simulateSelections(cards, count, rarityOdds) { const results = []; for (let index = 0; index < count; index += 1) { const selectedRarity = chooseWeightedRarity(rarityOdds); const selection = chooseCardForRarity(cards, selectedRarity); if (selection.card) results.push({ index: index + 1, selectedRarity, actualRarity: selection.card.rarity, fallbackUsed: selection.fallbackUsed, baseCard: selection.card }); } return results; }
function buildHistoryResult(result, owner = null) { const activeUser = resolvePullUser(owner); const creator = creatorFields(result.baseCard); const imageKey = readImageKey(result.baseCard); return { index: result.index, ownerUserId: activeUser.id, ownerDisplayName: activeUser.displayName, cardTitle: result.baseCard.name, actualRarity: result.actualRarity, selectedRarity: result.selectedRarity, fallbackUsed: result.fallbackUsed, characterId: result.baseCard.characterId, creatorDisplayName: creator.creatorDisplayName, creatorUserId: creator.creatorUserId, imageKey, imageUrl: readImageUrl(result.baseCard, imageKey), sourceCardId: result.baseCard.id, sourceRowId: result.baseCard.sourceRowId, ownedCardId: result.ownedCardId }; }

export async function resolvePull(env, { count, user = null }) {
  const activeUser = resolvePullUser(user);
  const now = new Date().toISOString();
  const pullCount = clampPullCount(count);
  const option = pullOptions[pullCount] || pullOptions[1];
  const ticketCost = option.ticketCost;
  const rarityOdds = getRarityOddsPercentages();
  await ensurePullSchema(env, now, activeUser);
  const resources = await readUserResources(env, activeUser);
  if (!resources || Number(resources.pullTickets) < ticketCost) return { ok: false, status: 409, error: 'Not enough pull tickets.', resources, ticketCost };
  const pool = await readPullPool(env);
  if (!pool.cards.length) return { ok: false, status: 409, error: 'No pull-eligible cards are available.', poolReadiness: pool.readiness };
  const pullId = buildId('pull');
  const selections = simulateSelections(pool.cards, pullCount, rarityOdds);
  const grantedResults = selections.map((selection) => { const ownedCardId = buildId('owned'); const ownedCard = buildOwnedCardPayload({ baseCard: selection.baseCard, ownedCardId, pullId, now, owner: activeUser }); return { ...selection, ownedCardId, ownedCard }; });
  const historyResults = grantedResults.map((result) => buildHistoryResult(result, activeUser));
  const statements = [env.DB.prepare(`UPDATE user_resources SET pull_tickets = pull_tickets - ?, updated_at = ? WHERE user_id = ? AND pull_tickets >= ?`).bind(ticketCost, now, activeUser.id, ticketCost), ...grantedResults.map((result) => env.DB.prepare(`INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(result.ownedCardId, activeUser.id, result.baseCard.characterId, JSON.stringify(result.ownedCard), now, now)), env.DB.prepare(`INSERT INTO pull_history (id, user_id, pull_count, ticket_cost, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(pullId, activeUser.id, pullCount, ticketCost, JSON.stringify(historyResults), now)];
  await env.DB.batch(statements);
  const updatedResources = await readUserResources(env, activeUser);
  return { ok: true, status: 200, pullId, userId: activeUser.id, ownerDisplayName: activeUser.displayName, count: pullCount, ticketCost, ticketsBefore: Number(resources.pullTickets), ticketsAfter: Number(updatedResources.pullTickets), results: grantedResults.map((result) => ({ index: result.index, ownerUserId: activeUser.id, ownerDisplayName: activeUser.displayName, cardTitle: result.baseCard.name, selectedRarity: result.selectedRarity, actualRarity: result.actualRarity, fallbackUsed: result.fallbackUsed, sourceCard: result.baseCard, ownedCard: result.ownedCard, ownedCardId: result.ownedCardId })), poolSummary: { eligibleCount: pool.eligibleCount, approvedSubmissionCount: pool.approvedSubmissionCount, byRarity: pool.byRarity, readiness: pool.readiness } };
}
