import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { rollApprovalProfile } from '../../_shared/approval-rolls.js';
import { buildApprovedTemplateTraits, normalizeBaseStats, normalizeRarity } from '../../_shared/card-mechanics.js';

const allowedActions = new Set([
  'audit',
  'repair_placeholder_stats',
  'reroll_all_template_stats',
  'clear_owned_copies',
  'apply_founder_pool_rarities',
]);
const rarityOrder = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
const allowedRarities = new Set(rarityOrder);
const founderRarityRatios = Object.freeze({ common: 0.50, uncommon: 0.27, rare: 0.13, legendary: 0.07, mythic: 0.03 });

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try { return JSON.parse(value); } catch { return null; }
}

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function titleCase(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ownerWhere() {
  return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`;
}

function unownedWhere() {
  return `(owner_user_id IS NULL OR TRIM(CAST(owner_user_id AS TEXT)) = '')`;
}

function jsonPullSourceWhere() {
  return `(json_valid(card_json) AND COALESCE(json_extract(card_json, '$.source'), '') = 'pull')`;
}

function jsonOwnedSourceLinkWhere() {
  return `(json_valid(card_json) AND (
    COALESCE(json_extract(card_json, '$.source_pool_card_id'), '') != ''
    OR COALESCE(json_extract(card_json, '$.sourcePoolCardId'), '') != ''
    OR COALESCE(json_extract(card_json, '$.source_card_id'), '') != ''
    OR COALESCE(json_extract(card_json, '$.sourceCardId'), '') != ''
  ))`;
}

function ownedCopyWhere() {
  return `(id LIKE 'owned_%' OR ${jsonPullSourceWhere()} OR (${ownerWhere()} AND ${jsonOwnedSourceLinkWhere()}))`;
}

async function ensureCardsTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL DEFAULT '',
      character_id TEXT NOT NULL DEFAULT '',
      card_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

function readPayload(row) {
  const parsed = safeParseJson(row.card_json);
  return parsed?.card || parsed?.data || parsed || {};
}

function readName(payload, row) {
  return cleanText(payload.name || payload.card_name || payload.title || row.id || 'Unnamed Card', 120);
}

function readCharacter(payload, row) {
  return cleanText(payload.character_id || payload.characterId || payload.character || payload.cid || row.character_id || '', 120);
}

function readType(payload) {
  return cleanText(payload.type || payload.card_type || payload.cardType || payload.approvedType || payload.approved_type || payload.role || payload.battle_role || payload.battleRole || 'neutral', 80).toLowerCase();
}

function readCreator(payload) {
  return cleanText(payload.creatorDisplayName || payload.creator_display_name || payload.creatorName || payload.creator_name || payload.creator || payload.submitterDisplayName || payload.submitter_display_name || 'Unknown', 120);
}

function readRarity(payload) {
  return normalizeRarity(payload.rarity || payload.targetRarity || payload.target_rarity || payload.rarity_suggestion || 'common');
}

function readStatArchetype(payload) {
  return cleanText(payload.statArchetype || payload.stat_archetype || payload.card_type || payload.cardType || payload.type || 'neutral', 80).toLowerCase();
}

function readStatBudget(payload, stats) {
  const parsed = Number(payload.statBudget ?? payload.stat_budget);
  if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  return stats.pow + stats.def + stats.spd;
}

function isPlaceholderStats(payload) {
  const stats = normalizeBaseStats(payload);
  const budget = readStatBudget(payload, stats);
  const missingExplicitStats = !payload.stats && !payload.baseStats && !payload.base_stats
    && payload.pow === undefined && payload.def === undefined && payload.spd === undefined;
  const allOnes = stats.pow <= 1 && stats.def <= 1 && stats.spd <= 1;
  const invalidBudget = budget <= 3;

  return missingExplicitStats || allOnes || invalidBudget;
}

function summarizeRow(row) {
  const payload = readPayload(row);
  const stats = normalizeBaseStats(payload);
  const rarity = readRarity(payload);
  const placeholder = isPlaceholderStats(payload);

  return {
    id: String(row.id || payload.id || ''),
    name: readName(payload, row),
    ownerUserId: row.owner_user_id || '',
    characterId: readCharacter(payload, row),
    type: readType(payload),
    rarity,
    targetRarity: normalizeRarity(payload.targetRarity || payload.target_rarity || rarity),
    raritySource: payload.raritySource || payload.rarity_source || '',
    statArchetype: readStatArchetype(payload),
    statBudget: readStatBudget(payload, stats),
    stats,
    placeholder,
    needsRepair: placeholder,
    mechanicsVersion: payload.mechanicsVersion || payload.mechanics_version || '',
    creatorDisplayName: readCreator(payload),
    source: payload.source || '',
    sourceSubmissionId: payload.source_submission_id || payload.sourceSubmissionId || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

async function readTemplateRows(env) {
  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
    FROM cards
    WHERE ${unownedWhere()}
    ORDER BY updated_at DESC, created_at DESC, id ASC
  `).all();

  return result.results || [];
}

async function readOwnedCopyCount(env) {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM cards WHERE ${ownedCopyWhere()}`).first();
  return Number(row?.count || 0);
}

function buildRaritySummary(cards) {
  return rarityOrder.reduce((summary, rarity) => {
    summary[rarity] = cards.filter((card) => card.rarity === rarity).length;
    return summary;
  }, {});
}

function buildFounderTargetDistribution(total) {
  const safeTotal = Math.max(0, Math.round(Number(total) || 0));
  if (!safeTotal) return rarityOrder.reduce((summary, rarity) => ({ ...summary, [rarity]: 0 }), {});

  const raw = rarityOrder.map((rarity) => {
    const value = safeTotal * founderRarityRatios[rarity];
    return { rarity, floor: Math.floor(value), remainder: value - Math.floor(value) };
  });
  let remaining = safeTotal - raw.reduce((totalCount, entry) => totalCount + entry.floor, 0);
  const counts = Object.fromEntries(raw.map((entry) => [entry.rarity, entry.floor]));

  raw.sort((a, b) => b.remainder - a.remainder || rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
  for (const entry of raw) {
    if (remaining <= 0) break;
    counts[entry.rarity] += 1;
    remaining -= 1;
  }

  return rarityOrder.reduce((summary, rarity) => ({ ...summary, [rarity]: counts[rarity] || 0 }), {});
}

function buildRepairSource(payload, row, rarityOverride = '') {
  const rarity = normalizeRarity(rarityOverride || readRarity(payload));

  return {
    ...payload,
    id: payload.id || row.id,
    cardName: readName(payload, row),
    characterId: readCharacter(payload, row),
    cardType: readType(payload),
    raritySuggestion: rarity,
    statArchetype: readStatArchetype(payload),
  };
}

function buildRepairedPayload(payload, row, { rarityOverride = '', sourceLabel = 'admin_mechanics_repair' } = {}) {
  const now = new Date().toISOString();
  const rarity = normalizeRarity(rarityOverride || readRarity(payload));
  const repairSource = buildRepairSource(payload, row, rarity);
  const approvalProfile = rollApprovalProfile({
    targetRarity: rarity,
    finalRarityOverride: rarity,
    source: repairSource,
  });
  const templateTraits = buildApprovedTemplateTraits({ approvalProfile, source: repairSource });
  const stats = templateTraits.stats;
  const characterId = readCharacter(payload, row);
  const cardType = templateTraits.type;
  const creator = readCreator(payload);

  return {
    ...payload,
    id: payload.id || row.id,
    name: readName(payload, row),
    title: payload.title || readName(payload, row),
    character: characterId,
    character_id: characterId,
    cid: characterId,
    type: cardType,
    cardType,
    card_type: cardType,
    approvedType: payload.approvedType || payload.approved_type || cardType,
    approved_type: payload.approved_type || payload.approvedType || cardType,
    category: titleCase(templateTraits.typeLabel || cardType),
    creator,
    creator_name: creator,
    creatorDisplayName: payload.creatorDisplayName || payload.creator_display_name || creator,
    creator_display_name: payload.creator_display_name || payload.creatorDisplayName || creator,
    mechanicsVersion: templateTraits.mechanicsVersion,
    rarity: templateTraits.rarity,
    rarity_source: sourceLabel,
    raritySource: sourceLabel,
    targetRarity: templateTraits.targetRarity,
    target_rarity: templateTraits.targetRarity,
    finalRarityOverride: templateTraits.rarity,
    final_rarity_override: templateTraits.rarity,
    statsSource: sourceLabel,
    stats_source: sourceLabel,
    traitSource: sourceLabel,
    trait_source: sourceLabel,
    staticStatBudget: templateTraits.staticStatBudget,
    static_stat_budget: templateTraits.staticStatBudget,
    ownedStatBudgetRange: templateTraits.ownedStatBudgetRange,
    owned_stat_budget_range: templateTraits.ownedStatBudgetRange,
    copyStatBudgetVariance: templateTraits.copyStatBudgetVariance,
    copy_stat_budget_variance: templateTraits.copyStatBudgetVariance,
    statBudget: templateTraits.statBudget,
    stat_budget: templateTraits.statBudget,
    statArchetype: templateTraits.statArchetype,
    stat_archetype: templateTraits.statArchetype,
    typeLabel: templateTraits.typeLabel,
    type_label: templateTraits.typeLabel,
    typeColor: templateTraits.typeColor,
    type_color: templateTraits.typeColor,
    typeIdentity: templateTraits.typeIdentity,
    type_identity: templateTraits.typeIdentity,
    typeStatBias: templateTraits.typeStatBias,
    type_stat_bias: templateTraits.typeStatBias,
    baseStats: templateTraits.baseStats,
    base_stats: templateTraits.baseStats,
    progressionRules: templateTraits.progressionRules,
    progression_rules: templateTraits.progressionRules,
    levelCap: templateTraits.levelCap,
    level_cap: templateTraits.levelCap,
    maxLevel: templateTraits.maxLevel,
    max_level: templateTraits.maxLevel,
    growthPerLevel: templateTraits.growthPerLevel,
    growth_per_level: templateTraits.growthPerLevel,
    originRarity: templateTraits.originRarity,
    origin_rarity: templateTraits.originRarity,
    originBonusPercent: templateTraits.originBonusPercent,
    origin_bonus_percent: templateTraits.originBonusPercent,
    originBonusMultiplier: templateTraits.originBonusMultiplier,
    origin_bonus_multiplier: templateTraits.originBonusMultiplier,
    stats,
    pow: stats.pow,
    def: stats.def,
    spd: stats.spd,
    adminMechanicsRepair: {
      repairedAt: now,
      previousRarity: readRarity(payload),
      newRarity: templateTraits.rarity,
      previousStats: normalizeBaseStats(payload),
      previousStatBudget: readStatBudget(payload, normalizeBaseStats(payload)),
      approvalProfile,
      source: sourceLabel,
    },
    updatedAt: now,
    updated_at: now,
  };
}

async function auditMechanics(env) {
  await ensureCardsTable(env);
  const [rows, ownedCopyCount] = await Promise.all([readTemplateRows(env), readOwnedCopyCount(env)]);
  const templates = rows.map(summarizeRow);
  const placeholderTemplates = templates.filter((card) => card.placeholder);
  const byRarity = buildRaritySummary(templates);

  return {
    ok: true,
    source: 'D1 cards',
    templateCount: templates.length,
    placeholderCount: placeholderTemplates.length,
    healthyCount: templates.length - placeholderTemplates.length,
    ownedCopyCount,
    templates,
    placeholderTemplates,
    byRarity,
    founderPoolTarget: buildFounderTargetDistribution(templates.length),
    founderPoolRatios: founderRarityRatios,
    rarityGaps: rarityOrder.filter((rarity) => byRarity[rarity] === 0),
    warnings: [
      'Template rows are unowned cards only. Owned Vault copies are not repaired by this tool.',
      'Repair actions reroll template mechanics while preserving art, text, creator, character, and type.',
      'Founder Pool re-rarity is a manual admin curation action. It does not randomly assign rarity tiers.',
    ],
  };
}

async function repairTemplates(env, { mode }) {
  await ensureCardsTable(env);
  const rows = await readTemplateRows(env);
  const targets = rows.filter((row) => mode === 'all' || isPlaceholderStats(readPayload(row)));
  const now = new Date().toISOString();
  const repaired = [];

  for (const row of targets) {
    const payload = readPayload(row);
    const repairedPayload = buildRepairedPayload(payload, row);
    await env.DB.prepare(`
      UPDATE cards
      SET card_json = ?,
          character_id = ?,
          updated_at = ?
      WHERE id = ?
        AND ${unownedWhere()}
    `).bind(
      JSON.stringify(repairedPayload),
      readCharacter(repairedPayload, row),
      now,
      row.id
    ).run();

    repaired.push({
      id: row.id,
      name: readName(repairedPayload, row),
      rarity: readRarity(repairedPayload),
      statBudget: readStatBudget(repairedPayload, normalizeBaseStats(repairedPayload)),
      stats: normalizeBaseStats(repairedPayload),
    });
  }

  return {
    ok: true,
    action: mode === 'all' ? 'reroll_all_template_stats' : 'repair_placeholder_stats',
    repairedCount: repaired.length,
    repaired,
  };
}

async function clearOwnedCopies(env) {
  await ensureCardsTable(env);
  const before = await readOwnedCopyCount(env);
  await env.DB.prepare(`DELETE FROM cards WHERE ${ownedCopyWhere()}`).run();
  const after = await readOwnedCopyCount(env);

  return {
    ok: true,
    action: 'clear_owned_copies',
    deletedCount: Math.max(0, before - after),
    ownedCopyCountBefore: before,
    ownedCopyCountAfter: after,
  };
}

function normalizeAssignmentRarity(value) {
  const raw = cleanText(value, 40).toLowerCase();
  if (!raw) return '';
  if (allowedRarities.has(raw)) return raw;
  if (raw.includes('myth') || raw.includes('legend') || raw.includes('uncommon') || raw.includes('rare') || raw.includes('common')) return normalizeRarity(raw);
  return '';
}

function normalizeAssignments(assignments) {
  const normalized = Array.isArray(assignments) ? assignments : [];
  return normalized.map((entry) => ({
    id: cleanText(entry?.id, 180),
    rarity: normalizeAssignmentRarity(entry?.rarity || ''),
  })).filter((entry) => entry.id && allowedRarities.has(entry.rarity));
}

async function applyFounderPoolRarities(env, { assignments = [], resetOwnedCopies = false } = {}) {
  await ensureCardsTable(env);
  const rows = await readTemplateRows(env);
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  const normalizedAssignments = normalizeAssignments(assignments);
  const assignmentById = new Map(normalizedAssignments.map((entry) => [entry.id, entry.rarity]));
  const missingAssignments = rows.filter((row) => !assignmentById.has(String(row.id))).map((row) => row.id);
  const unknownAssignments = normalizedAssignments.filter((entry) => !byId.has(entry.id)).map((entry) => entry.id);

  if (!rows.length) {
    return { ok: false, status: 409, error: 'No unowned Library templates were found for Founder Pool re-rarity.' };
  }

  if (missingAssignments.length || unknownAssignments.length) {
    return {
      ok: false,
      status: 400,
      error: 'Founder Pool assignments must cover every current unowned Library template exactly once.',
      templateCount: rows.length,
      assignmentCount: normalizedAssignments.length,
      missingAssignments,
      unknownAssignments,
    };
  }

  const now = new Date().toISOString();
  const updated = [];

  for (const row of rows) {
    const payload = readPayload(row);
    const rarity = assignmentById.get(String(row.id));
    const repairedPayload = buildRepairedPayload(payload, row, { rarityOverride: rarity, sourceLabel: 'founder_pool_re_rarity' });

    await env.DB.prepare(`
      UPDATE cards
      SET card_json = ?,
          character_id = ?,
          updated_at = ?
      WHERE id = ?
        AND ${unownedWhere()}
    `).bind(
      JSON.stringify(repairedPayload),
      readCharacter(repairedPayload, row),
      now,
      row.id
    ).run();

    updated.push({
      id: row.id,
      name: readName(repairedPayload, row),
      previousRarity: readRarity(payload),
      rarity: readRarity(repairedPayload),
      statBudget: readStatBudget(repairedPayload, normalizeBaseStats(repairedPayload)),
      stats: normalizeBaseStats(repairedPayload),
    });
  }

  const resetResult = resetOwnedCopies ? await clearOwnedCopies(env) : null;
  const byRarity = rarityOrder.reduce((summary, rarity) => {
    summary[rarity] = updated.filter((card) => card.rarity === rarity).length;
    return summary;
  }, {});

  return {
    ok: true,
    action: 'apply_founder_pool_rarities',
    updatedCount: updated.length,
    byRarity,
    targetDistribution: buildFounderTargetDistribution(updated.length),
    resetOwnedCopies: Boolean(resetOwnedCopies),
    deletedOwnedCopies: resetResult?.deletedCount || 0,
    updated,
  };
}

export async function onRequestGet({ env }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    return jsonResponse(await auditMechanics(env));
  } catch (error) {
    return errorResponse('Failed to audit card mechanics.', 500, error.message);
  }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const payload = await request.json().catch(() => ({}));
    const action = cleanText(payload.action || 'audit', 80).toLowerCase();

    if (!allowedActions.has(action)) {
      return errorResponse('Unsupported card mechanics action.', 400);
    }

    if (action === 'audit') return jsonResponse(await auditMechanics(env));
    if (action === 'repair_placeholder_stats') return jsonResponse(await repairTemplates(env, { mode: 'placeholder' }));
    if (action === 'reroll_all_template_stats') return jsonResponse(await repairTemplates(env, { mode: 'all' }));
    if (action === 'clear_owned_copies') return jsonResponse(await clearOwnedCopies(env));
    if (action === 'apply_founder_pool_rarities') {
      const result = await applyFounderPoolRarities(env, {
        assignments: payload.assignments || [],
        resetOwnedCopies: payload.resetOwnedCopies === true,
      });
      if (!result.ok) return errorResponse(result.error || 'Failed to apply Founder Pool rarity assignments.', result.status || 400, result);
      return jsonResponse(result);
    }

    return errorResponse('Unsupported card mechanics action.', 400);
  } catch (error) {
    return errorResponse('Failed to run card mechanics action.', 500, error.message);
  }
}
