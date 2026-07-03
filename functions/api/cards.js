/* ============================================================================
   API Cards Endpoint
   Phase 7 repair responsibility: read candidate card tables directly instead
   of using SQLite internal schema tables, which D1 may reject.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const candidateTables = [
  'card_templates',
  'cards',
  'library_cards',
  'card_pool',
  'approved_cards',
  'player_cards',
  'generated_cards',
  'submissions',
];

const idColumns = ['id', 'card_id', 'uuid', 'slug'];
const nameColumns = ['name', 'card_name', 'title'];
const categoryColumns = ['category', 'type', 'class', 'faction'];
const rarityColumns = ['rarity', 'tier'];
const powColumns = ['pow', 'power', 'attack', 'atk', 'strength'];
const defColumns = ['def', 'defense', 'health', 'hp'];
const spdColumns = ['spd', 'speed', 'agility'];
const flavorColumns = ['flavor', 'flavor_text', 'description', 'lore'];
const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'art_key', 'object_key', 'r2_key'];
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

function readValue(row, column, fallback = '') {
  return column && row[column] !== undefined && row[column] !== null ? row[column] : fallback;
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
  if (rarity.includes('rare')) return 'rare';
  if (rarity.includes('uncommon')) return 'uncommon';

  return 'common';
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
  const idColumn = findColumn(columns, idColumns);
  const nameColumn = findColumn(columns, nameColumns);
  const categoryColumn = findColumn(columns, categoryColumns);
  const rarityColumn = findColumn(columns, rarityColumns);
  const powColumn = findColumn(columns, powColumns);
  const defColumn = findColumn(columns, defColumns);
  const spdColumn = findColumn(columns, spdColumns);
  const flavorColumn = findColumn(columns, flavorColumns);
  const imageColumn = findColumn(columns, imageColumns);

  const name = String(readValue(row, nameColumn, 'Unnamed Card'));
  const id = String(readValue(row, idColumn, slugify(name)));
  const imageKey = imageColumn ? String(readValue(row, imageColumn, '')) : '';

  return {
    id,
    name,
    category: String(readValue(row, categoryColumn, 'Library')),
    rarity: normalizeRarity(readValue(row, rarityColumn, 'common')),
    symbol: '◆',
    stats: {
      pow: toNumber(readValue(row, powColumn, 1), 1),
      def: toNumber(readValue(row, defColumn, 1), 1),
      spd: toNumber(readValue(row, spdColumn, 1), 1),
    },
    owned: false,
    level: 1,
    copies: 0,
    flavor: String(readValue(row, flavorColumn, 'A discovered Library card from the connected database.')),
    imageKey,
    imageUrl: imageKey ? `/api/card-image?key=${encodeURIComponent(imageKey)}` : '',
  };
}

async function tryReadTable(env, tableName) {
  try {
    const result = await env.DB.prepare(`SELECT * FROM ${quoteIdentifier(tableName)} LIMIT 200`).all();
    const rows = result.results || [];
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const nameColumn = findColumn(columns, nameColumns);

    return {
      table: tableName,
      rows,
      columns,
      usable: Boolean(nameColumn && rows.length),
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
    warnings: ['No candidate card table returned rows with a recognizable name column.'],
  });
}
