/* ============================================================================
   API Cards Endpoint
   Phase 7.5 responsibility: read real rows from the existing cards table,
   parse card_json payloads, and normalize them for CardFrame. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const candidateTables = [
  'cards',
  'card_templates',
  'library_cards',
  'card_pool',
  'approved_cards',
  'player_cards',
  'generated_cards',
  'submissions',
];

const idColumns = ['id', 'card_id', 'uuid', 'slug'];
const nameColumns = ['name', 'card_name', 'title'];
const characterColumns = ['character', 'character_id', 'characterId', 'cid', 'person', 'commune_member'];
const typeColumns = ['type', 'card_type', 'cardType', 'role', 'battle_role', 'battleRole', 'faction', 'class'];
const categoryColumns = ['category', 'class', 'faction'];
const abilityColumns = ['ability', 'ability_text', 'abilityText', 'effect', 'mechanic'];
const abilityIconColumns = ['ability_icon', 'abilityIcon', 'icon', 'symbol'];
const rarityColumns = ['rarity', 'tier'];
const powColumns = ['pow', 'power', 'attack', 'atk', 'strength'];
const defColumns = ['def', 'defense', 'health', 'hp'];
const spdColumns = ['spd', 'speed', 'agility'];
const flavorColumns = ['flavor', 'flavor_text', 'description', 'lore'];
const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];
const statusColumns = ['status', 'moderation_status', 'approved', 'is_approved', 'published'];

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
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
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
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/');
}

function imageUrlFromValue(value) {
  const imageValue = String(value || '').trim();

  if (!imageValue) {
    return '';
  }

  if (isLikelyUrl(imageValue)) {
    return imageValue;
  }

  return `/api/card-image?key=${encodeURIComponent(imageValue)}`;
}

function flattenCardPayload(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};

  return {
    ...row,
    ...payload,
    pow: payload.pow ?? payload.power ?? payload.attack ?? payload.atk ?? payload.strength ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength,
    def: payload.def ?? payload.defense ?? payload.health ?? payload.hp ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp,
    spd: payload.spd ?? payload.speed ?? payload.agility ?? stats.spd ?? stats.speed ?? stats.agility,
    image_key: payload.image_key ?? payload.imageKey ?? payload.image_path ?? payload.image ?? payload.image_url ?? payload.art_url ?? payload.art_key ?? payload.object_key ?? payload.r2_key,
    flavor: payload.flavor ?? payload.flavor_text ?? payload.description ?? payload.lore,
    character: payload.character ?? payload.character_id ?? payload.characterId ?? payload.cid,
    type: payload.type ?? payload.card_type ?? payload.cardType ?? payload.role ?? payload.battle_role ?? payload.battleRole ?? payload.faction ?? payload.class,
    ability: payload.ability ?? payload.ability_text ?? payload.abilityText ?? payload.effect ?? payload.mechanic,
    abilityIcon: payload.abilityIcon ?? payload.ability_icon ?? payload.icon,
  };
}

function hasRecognizableCardData(row, columns) {
  if (findColumn(columns, nameColumns)) {
    return true;
  }

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
  const name = String(readValue(data, nameColumns, 'Unnamed Card'));
  const id = String(readValue(data, [idColumn, 'id', 'card_id', 'uuid', 'slug'], slugify(name)));
  const imageValue = String(readValue(data, imageColumns, ''));

  return {
    id,
    name,
    character: String(readValue(data, characterColumns, '')),
    type: String(readValue(data, typeColumns, 'Type')),
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
    level: 1,
    copies: 0,
    flavor: String(readValue(data, flavorColumns, 'A discovered Library card from the connected database.')),
    imageKey: isLikelyUrl(imageValue) ? '' : imageValue,
    imageUrl: imageUrlFromValue(imageValue),
  };
}

async function tryReadTable(env, tableName) {
  try {
    const result = await env.DB.prepare(`SELECT * FROM ${quoteIdentifier(tableName)} LIMIT 200`).all();
    const rows = result.results || [];
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const usable = rows.some((row) => hasRecognizableCardData(row, columns));

    return {
      table: tableName,
      rows,
      columns,
      usable,
      error: null,
    };
  } catch (error) {
    return {
      table: tableName,
      rows: [],
      columns: [],
      usable: false,
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
    attempts.push({ table: attempt.table, rowCount: attempt.rows.length, columns: attempt.columns, error: attempt.error });

    if (!attempt.usable) {
      continue;
    }

    const statusColumn = findColumn(attempt.columns, statusColumns);
    const cards = attempt.rows
      .filter((row) => isApprovedRow(row, statusColumn))
      .map((row) => normalizeRow(row, attempt.columns));

    return jsonResponse({
      ok: true,
      source: 'D1',
      table: attempt.table,
      cards,
      columns: attempt.columns,
      attempts,
      warnings: statusColumn ? [] : ['No approval/status column detected; returned rows were treated as Library cards.'],
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
