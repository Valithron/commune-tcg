import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { rollApprovalProfile } from '../../_shared/approval-rolls.js';
import { buildApprovedTemplateTraits, normalizeBaseStats, normalizeRarity } from '../../_shared/card-mechanics.js';

const allowedActions = new Set(['audit', 'repair_placeholder_stats', 'reroll_all_template_stats', 'clear_owned_copies']);

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
  return cleanText(payload.type || payload.card_type || payload.cardType || payload.role || payload.battle_role || payload.battleRole || 'support', 80).toLowerCase();
}

function readCreator(payload) {
  return cleanText(payload.creatorDisplayName || payload.creator_display_name || payload.creatorName || payload.creator_name || payload.creator || payload.submitterDisplayName || payload.submitter_display_name || 'Unknown', 120);
}

function readRarity(payload) {
  return normalizeRarity(payload.rarity || payload.targetRarity || payload.target_rarity || payload.rarity_suggestion || 'common');
}

function readStatArchetype(payload) {
  return cleanText(payload.statArchetype || payload.stat_archetype || payload.card_type || payload.cardType || payload.type || 'balanced', 80).toLowerCase();
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
  const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM cards WHERE ${ownerWhere()} OR id LIKE 'owned_%' OR COALESCE(json_extract(card_json, '$.source'), '') = 'pull'`).first();
  return Number(row?.count || 0);
}

function buildRepairSource(payload, row) {
  return {
    ...payload,
    id: payload.id || row.id,
    cardName: readName(payload, row),
    characterId: readCharacter(payload, row),
    cardType: readType(payload),
    raritySuggestion: readRarity(payload),
    statArchetype: readStatArchetype(payload),
  };
}

function buildRepairedPayload(payload, row) {
  const now = new Date().toISOString();
  const rarity = readRarity(payload);
  const approvalProfile = rollApprovalProfile({
    targetRarity: rarity,
    finalRarityOverride: rarity,
    source: buildRepairSource(payload, row),
  });
  const templateTraits = buildApprovedTemplateTraits({ approvalProfile, source: buildRepairSource(payload, row) });
  const stats = templateTraits.stats;
  const characterId = readCharacter(payload, row);
  const cardType = readType(payload);
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
    card_type: cardType,
    category: payload.category || titleCase(cardType),
    creator,
    creator_name: creator,
    creatorDisplayName: payload.creatorDisplayName || payload.creator_display_name || creator,
    creator_display_name: payload.creator_display_name || payload.creatorDisplayName || creator,
    mechanicsVersion: templateTraits.mechanicsVersion,
    rarity: templateTraits.rarity,
    rarity_source: 'admin_mechanics_repair',
    raritySource: 'admin_mechanics_repair',
    targetRarity: templateTraits.targetRarity,
    target_rarity: templateTraits.targetRarity,
    statsSource: 'admin_mechanics_repair',
    stats_source: 'admin_mechanics_repair',
    traitSource: 'admin_repair',
    trait_source: 'admin_repair',
    statBudget: templateTraits.statBudget,
    stat_budget: templateTraits.statBudget,
    statArchetype: templateTraits.statArchetype,
    stat_archetype: templateTraits.statArchetype,
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
      previousStats: normalizeBaseStats(payload),
      previousStatBudget: readStatBudget(payload, normalizeBaseStats(payload)),
      approvalProfile,
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

  return {
    ok: true,
    source: 'D1 cards',
    templateCount: templates.length,
    placeholderCount: placeholderTemplates.length,
    healthyCount: templates.length - placeholderTemplates.length,
    ownedCopyCount,
    templates,
    placeholderTemplates,
    byRarity: templates.reduce((summary, card) => {
      summary[card.rarity] = (summary[card.rarity] || 0) + 1;
      return summary;
    }, {}),
    warnings: [
      'Template rows are unowned cards only. Owned Vault copies are not repaired by this tool.',
      'Repair actions reroll template mechanics while preserving art, text, creator, character, and type.',
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
  await env.DB.prepare(`
    DELETE FROM cards
    WHERE id LIKE 'owned_%'
       OR COALESCE(json_extract(card_json, '$.source'), '') = 'pull'
       OR ${ownerWhere()}
  `).run();
  const after = await readOwnedCopyCount(env);

  return {
    ok: true,
    action: 'clear_owned_copies',
    deletedCount: Math.max(0, before - after),
    ownedCopyCountBefore: before,
    ownedCopyCountAfter: after,
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

    return errorResponse('Unsupported card mechanics action.', 400);
  } catch (error) {
    return errorResponse('Failed to run card mechanics action.', 500, error.message);
  }
}
