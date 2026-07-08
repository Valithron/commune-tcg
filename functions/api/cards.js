/* ============================================================================
   API Cards Endpoint
   Phase 7.5 responsibility: read real Library template rows, parse card_json
   payloads, and normalize them for CardFrame. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const temporaryCurrentUserId = 'sterling';

const candidateTables = [
  'cards',
  'card_templates',
  'library_cards',
  'card_pool',
  'approved_cards',
  'generated_cards',
  'submissions',
];

const idColumns = ['id', 'card_id', 'uuid', 'slug'];
const nameColumns = ['name', 'card_name', 'title'];
const characterColumns = ['character', 'character_id', 'characterId', 'cid', 'person', 'commune_member'];
const typeColumns = ['type', 'card_type', 'cardType', 'role', 'battle_role', 'battleRole', 'faction', 'class'];
const categoryColumns = ['category', 'class', 'faction'];
const creatorColumns = [
  'creator',
  'creator_name',
  'creatorName',
  'creator_display_name',
  'creatorDisplayName',
  'creator_user_id',
  'creatorUserId',
  'created_by',
  'createdBy',
  'submitter_display_name',
  'submitterDisplayName',
  'submitter_user_id',
  'submitterUserId',
  'submitted_by',
  'submittedBy',
  'artist',
  'artist_name',
  'artistName',
  'author',
  'username',
  'userName',
];
const dateColumns = ['created_at', 'createdAt', 'approved_at', 'approvedAt', 'updated_at', 'updatedAt'];
const abilityColumns = ['ability', 'ability_text', 'abilityText', 'effect', 'mechanic'];
const abilityIconColumns = ['ability_icon', 'abilityIcon', 'icon', 'symbol'];
const rarityColumns = ['rarity', 'tier'];
const powColumns = ['pow', 'power', 'attack', 'atk', 'strength'];
const defColumns = ['def', 'defense', 'health', 'hp'];
const spdColumns = ['spd', 'speed', 'agility'];
const flavorColumns = [
  'flavor',
  'flavour',
  'flavor_text',
  'flavour_text',
  'flavorText',
  'flavourText',
  'card_flavor',
  'cardFlavor',
  'card_flavor_text',
  'cardFlavorText',
  'description',
  'desc',
  'summary',
  'lore',
  'story',
  'backstory',
  'flavorCopy',
  'flavourCopy',
  'effect',
  'effect_text',
  'effectText',
  'fx',
];
const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];
const cropColumns = ['crop', 'crop_json', 'cropJson', 'image_crop', 'imageCrop'];
const statusColumns = ['status', 'moderation_status', 'approved', 'is_approved', 'published'];
const nestedFlavorContainers = ['card_json', 'card', 'data', 'payload', 'copy', 'text', 'content', 'details', 'metadata', 'meta'];
const nestedTextKeys = ['text', 'value', 'content', 'copy', 'body', 'html', 'markdown', ...flavorColumns];

function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

function slugify(value) {
  return String(value || 'card')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'card';
}

function findColumn(columns, candidates) {
  const lowerMap = new Map(columns.map((column) => [column.toLowerCase(), column]));
  const match = candidates.find((candidate) => lowerMap.has(candidate.toLowerCase()));
  return match ? lowerMap.get(match.toLowerCase()) : null;
}

function readValue(row, candidates, fallback = '') {
  const keys = Array.isArray(candidates) ? candidates : [candidates];

  for (const key of keys) {
    if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }

  return fallback;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRarity(value) {
  const rarity = String(value || 'common').trim().toLowerCase();

  if (['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(rarity)) {
    return rarity;
  }

  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';

  return 'common';
}

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try { return JSON.parse(value); } catch { return null; }
}

function cleanTextValue(value, depth = 0) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (Array.isArray(value)) return value.map((item) => cleanTextValue(item, depth + 1)).filter(Boolean).join(' ').trim();

  if (typeof value === 'object' && depth < 4) {
    for (const key of nestedTextKeys) {
      const text = cleanTextValue(value[key], depth + 1);
      if (text) return text;
    }
  }

  return '';
}

function sourceObject(value) {
  const parsed = safeParseJson(value);
  if (parsed && typeof parsed === 'object') return parsed;
  if (value && typeof value === 'object') return value;
  return null;
}

function readTextValue(row, candidates) {
  for (const key of candidates) {
    if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') {
      const text = cleanTextValue(row[key]);
      if (text) return text;
    }
  }

  return '';
}

function resolveFlavorTextFromSource(source, depth = 0) {
  if (depth > 4) return '';

  const object = sourceObject(source);
  if (!object) return '';

  const direct = readTextValue(object, flavorColumns);
  if (direct) return direct;

  for (const key of nestedFlavorContainers) {
    const nested = object[key];
    if (nested === undefined || nested === null || nested === '') continue;

    const text = resolveFlavorTextFromSource(nested, depth + 1);
    if (text) return text;
  }

  return '';
}

function resolveFlavorText(...sources) {
  for (const source of sources) {
    const text = resolveFlavorTextFromSource(source);
    if (text) return text;
  }

  return '';
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/');
}

function imageUrlFromValue(value) {
  const imageValue = String(value || '').trim();
  if (!imageValue) return '';
  if (isLikelyUrl(imageValue)) return imageValue;
  return `/api/card-image?key=${encodeURIComponent(imageValue)}`;
}

function normalizeCrop(value) {
  const parsed = safeParseJson(value);
  const crop = parsed?.crop || parsed?.imageCrop || parsed || {};

  return {
    x: toNumber(crop.x ?? crop.left, 50),
    y: toNumber(crop.y ?? crop.top, 50),
    zoom: toNumber(crop.zoom ?? crop.z ?? crop.scale, 1),
  };
}

function flattenCardPayload(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};
  const flavor = resolveFlavorText(payload, parsed, row);

  return {
    ...row,
    ...payload,
    pow: payload.pow ?? payload.power ?? payload.attack ?? payload.atk ?? payload.strength ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength,
    def: payload.def ?? payload.defense ?? payload.health ?? payload.hp ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp,
    spd: payload.spd ?? payload.speed ?? payload.agility ?? stats.spd ?? stats.speed ?? stats.agility,
    image_key: payload.image_key ?? payload.imageKey ?? payload.image_path ?? payload.image ?? payload.image_url ?? payload.art_url ?? payload.art_key ?? payload.object_key ?? payload.r2_key,
    crop: payload.crop ?? payload.crop_json ?? payload.cropJson ?? payload.image_crop ?? payload.imageCrop,
    flavor,
    character: payload.character ?? payload.character_id ?? payload.characterId ?? payload.cid,
    type: payload.type ?? payload.card_type ?? payload.cardType ?? payload.role ?? payload.battle_role ?? payload.battleRole ?? payload.faction ?? payload.class,
    creator: payload.creatorDisplayName ?? payload.creator_display_name ?? payload.creatorName ?? payload.creator_name ?? payload.creator ?? payload.createdBy ?? payload.created_by ?? payload.submitterDisplayName ?? payload.submitter_display_name ?? payload.submittedBy ?? payload.submitted_by ?? payload.artistName ?? payload.artist_name ?? payload.artist ?? payload.author,
    ability: payload.ability ?? payload.ability_text ?? payload.abilityText ?? payload.effect ?? payload.mechanic,
    abilityIcon: payload.abilityIcon ?? payload.ability_icon ?? payload.icon,
    createdAt: payload.createdAt ?? payload.created_at ?? payload.approvedAt ?? payload.approved_at ?? payload.updatedAt ?? payload.updated_at,
    templateId: payload.id ?? row.id,
  };
}

function hasRecognizableCardData(row, columns) {
  if (findColumn(columns, nameColumns)) return true;
  const flattened = flattenCardPayload(row);
  return Boolean(readValue(flattened, nameColumns, ''));
}

function isApprovedRow(row, statusColumn) {
  if (!statusColumn) return true;

  const raw = row[statusColumn];
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw === 1;

  const value = String(raw || '').trim().toLowerCase();
  return ['', 'approved', 'active', 'published', 'live', 'ready', '1', 'true'].includes(value);
}

function normalizeRow(row, columns) {
  const data = flattenCardPayload(row);
  const idColumn = findColumn(columns, idColumns);
  const rawRowId = String(readValue(row, [idColumn, 'id', 'card_id', 'uuid', 'slug'], ''));
  const name = String(readValue(data, nameColumns, 'Unnamed Card'));
  const id = String(readValue(data, [idColumn, 'id', 'card_id', 'uuid', 'slug'], rawRowId || slugify(name)));
  const templateId = String(data.templateId || id);
  const imageValue = String(readValue(data, imageColumns, ''));
  const flavor = resolveFlavorText(data, row) || 'A discovered Library card from the connected database.';
  const creator = String(readValue(data, creatorColumns, ''));
  const createdAt = String(readValue(data, dateColumns, ''));

  return {
    id,
    sourceRowId: rawRowId || id,
    templateId,
    name,
    character: String(readValue(data, characterColumns, '')),
    type: String(readValue(data, typeColumns, 'Type')),
    creator,
    creatorDisplayName: creator,
    createdAt,
    ability: String(readValue(data, abilityColumns, '')),
    abilityIcon: String(readValue(data, abilityIconColumns, '✦')),
    category: String(readValue(data, categoryColumns, 'Library')),
    rarity: normalizeRarity(readValue(data, rarityColumns, 'common')),
    symbol: String(readValue(data, ['symbol', 'icon'], '◆')),
    stats: {
      pow: toNumber(readValue(data, powColumns, 1), 1),
      def: toNumber(readValue(data, defColumns, 1), 1),
      spd: toNumber(readValue(data, spdColumns, 1), 1),
    },
    owned: false,
    userOwnedCopies: 0,
    ownedCopies: 0,
    level: 1,
    copies: 0,
    flavor,
    imageKey: isLikelyUrl(imageValue) ? '' : imageValue,
    imageUrl: imageUrlFromValue(imageValue),
    crop: normalizeCrop(readValue(data, cropColumns, data.crop || {})),
  };
}

function ownerWhere() {
  return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`;
}

function unownedWhere() {
  return `(owner_user_id IS NULL OR TRIM(CAST(owner_user_id AS TEXT)) = '')`;
}

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`).bind(tableName).first();
  return Boolean(row);
}

async function readOwnedRows(env, ownerUserId) {
  const exists = await tableExists(env, 'cards');
  if (!exists) return [];

  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, card_json
    FROM cards
    WHERE ${ownerWhere()}
      AND CAST(owner_user_id AS TEXT) = ?
    ORDER BY updated_at DESC, created_at DESC, id ASC
  `).bind(ownerUserId).all();

  return result.results || [];
}

function ownedSourceIds(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  return new Set([
    payload.source_pool_card_id,
    payload.sourcePoolCardId,
    payload.source_card_id,
    payload.sourceCardId,
  ].map((value) => String(value || '').trim()).filter(Boolean));
}

function enrichOwnership(cards, ownedRows) {
  const ownedSources = ownedRows.map(ownedSourceIds);

  return cards.map((card) => {
    const identifiers = new Set([
      card.id,
      card.sourceRowId,
      card.templateId,
    ].map((value) => String(value || '').trim()).filter(Boolean));

    const userOwnedCopies = ownedSources.filter((sourceIds) => {
      for (const identifier of identifiers) {
        if (sourceIds.has(identifier)) return true;
      }
      return false;
    }).length;

    return {
      ...card,
      userOwnedCopies,
      ownedCopies: userOwnedCopies,
      owned: userOwnedCopies > 0,
      copies: userOwnedCopies,
    };
  });
}

async function tryReadTable(env, tableName) {
  try {
    let result;
    let ownedRowsExcluded = 0;

    if (tableName === 'cards') {
      const ownedCount = await env.DB.prepare(`SELECT COUNT(*) AS count FROM cards WHERE ${ownerWhere()}`).first();
      ownedRowsExcluded = Number(ownedCount?.count || 0);
      result = await env.DB.prepare(`
        SELECT *
        FROM cards
        WHERE ${unownedWhere()}
        ORDER BY created_at ASC, updated_at ASC, id ASC
      `).all();
    } else {
      result = await env.DB.prepare(`SELECT * FROM ${quoteIdentifier(tableName)} LIMIT 500`).all();
    }

    const rows = result.results || [];
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const usable = rows.some((row) => hasRecognizableCardData(row, columns));

    return {
      table: tableName,
      rows,
      columns,
      usable,
      ownedRowsExcluded,
      error: null,
    };
  } catch (error) {
    return {
      table: tableName,
      rows: [],
      columns: [],
      usable: false,
      ownedRowsExcluded: 0,
      error: error.message,
    };
  }
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const attempts = [];

  for (const tableName of candidateTables) {
    const attempt = await tryReadTable(env, tableName);
    attempts.push({ table: attempt.table, rowCount: attempt.rows.length, columns: attempt.columns, ownedRowsExcluded: attempt.ownedRowsExcluded, error: attempt.error });

    if (!attempt.usable) {
      continue;
    }

    const statusColumn = findColumn(attempt.columns, statusColumns);
    const templateCards = attempt.rows
      .filter((row) => isApprovedRow(row, statusColumn))
      .map((row) => normalizeRow(row, attempt.columns));
    const ownedRows = await readOwnedRows(env, temporaryCurrentUserId);
    const cards = enrichOwnership(templateCards, ownedRows);

    return jsonResponse({
      ok: true,
      source: 'D1',
      table: attempt.table,
      cards,
      columns: attempt.columns,
      attempts,
      currentUserId: temporaryCurrentUserId,
      ownedRowsExcluded: attempt.ownedRowsExcluded,
      ownershipMappedCount: cards.filter((card) => card.userOwnedCopies > 0).length,
      warnings: [
        ...(statusColumn ? [] : ['No approval/status column detected; returned rows were treated as Library cards.']),
        ...(attempt.table === 'cards' ? ['Owned Vault copies are excluded from Library results and only counted as ownership metadata.'] : []),
      ],
    });
  }

  return jsonResponse({
    ok: true,
    source: 'D1',
    table: null,
    cards: [],
    columns: [],
    attempts,
    warnings: ['No candidate card table returned rows with recognizable card data.'],
  });
}
