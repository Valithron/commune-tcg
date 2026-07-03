/* ============================================================================
   API Cards Endpoint
   Phase 7 responsibility: read approved/global card rows from D1 and normalize
   them for the front-end CardFrame contract. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const preferredTables = ['card_templates', 'cards', 'library_cards', 'card_pool', 'approved_cards'];
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
  return candidates.find((candidate) => lowerMap.has(candidate.toLowerCase()))
    ? lowerMap.get(candidates.find((candidate) => lowerMap.has(candidate.toLowerCase())).toLowerCase())
    : null;
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

function chooseTable(inventories) {
  const withName = inventories.filter((table) => findColumn(table.columns, nameColumns));

  for (const preferredName of preferredTables) {
    const exact = withName.find((table) => table.name.toLowerCase() === preferredName);
    if (exact) return exact;
  }

  return withName.find((table) => findColumn(table.columns, rarityColumns) || findColumn(table.columns, imageColumns)) || null;
}

function normalizeRow(row, table) {
  const idColumn = findColumn(table.columns, idColumns);
  const nameColumn = findColumn(table.columns, nameColumns);
  const categoryColumn = findColumn(table.columns, categoryColumns);
  const rarityColumn = findColumn(table.columns, rarityColumns);
  const powColumn = findColumn(table.columns, powColumns);
  const defColumn = findColumn(table.columns, defColumns);
  const spdColumn = findColumn(table.columns, spdColumns);
  const flavorColumn = findColumn(table.columns, flavorColumns);
  const imageColumn = findColumn(table.columns, imageColumns);

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

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const tablesResult = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();

    const inventories = [];

    for (const row of tablesResult.results || []) {
      const columnsResult = await env.DB.prepare(`PRAGMA table_info(${quoteIdentifier(row.name)})`).all();
      inventories.push({
        name: row.name,
        columns: (columnsResult.results || []).map((column) => column.name),
      });
    }

    const selectedTable = chooseTable(inventories);

    if (!selectedTable) {
      return jsonResponse({
        ok: true,
        source: 'D1',
        table: null,
        cards: [],
        warnings: ['No table with a recognizable card name column was found.'],
      });
    }

    const rowsResult = await env.DB.prepare(`SELECT * FROM ${quoteIdentifier(selectedTable.name)} LIMIT 200`).all();
    const statusColumn = findColumn(selectedTable.columns, statusColumns);
    const cards = (rowsResult.results || [])
      .filter((row) => isApprovedRow(row, statusColumn))
      .map((row) => normalizeRow(row, selectedTable));

    return jsonResponse({
      ok: true,
      source: 'D1',
      table: selectedTable.name,
      cards,
      columns: selectedTable.columns,
      warnings: statusColumn ? [] : ['No approval/status column detected; returned rows were treated as Library cards.'],
    });
  } catch (error) {
    return errorResponse('Failed to read Library cards.', 500, error.message);
  }
}
