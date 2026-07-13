/* ============================================================================
   API Vault Inventory Endpoint
   Phase 8.1 responsibility: read-only ownership inventory for mapping the real
   Vault read model. Performs no writes and does not assume auth or gameplay.
   ============================================================================ */

import { getAdminSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

const ownershipTableCandidates = [
  'user_vault_cards',
  'vault_cards',
  'user_cards',
  'player_cards',
  'owned_cards',
  'card_ownership',
  'inventory_cards',
  'user_inventory',
  'collections',
];

function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
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

function firstValue(object, keys, fallback = '') {
  for (const key of keys) {
    if (object?.[key] !== undefined && object[key] !== null && object[key] !== '') {
      return object[key];
    }
  }

  return fallback;
}

function flattenCardJson(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};

  return {
    ...payload,
    pow: payload.pow ?? payload.power ?? payload.attack ?? payload.atk ?? payload.strength ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength,
    def: payload.def ?? payload.defense ?? payload.health ?? payload.hp ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp,
    spd: payload.spd ?? payload.speed ?? payload.agility ?? stats.spd ?? stats.speed ?? stats.agility,
  };
}

function summarizeCardRow(row) {
  const payload = flattenCardJson(row);

  return {
    id: row.id ?? null,
    ownerUserId: row.owner_user_id ?? null,
    characterId: row.character_id ?? null,
    name: String(firstValue(payload, ['name', 'card_name', 'title'], 'Unnamed Card')),
    rarity: String(firstValue(payload, ['rarity', 'tier'], 'unknown')),
    statsPresent: ['pow', 'def', 'spd'].some((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== ''),
    imagePresent: Boolean(firstValue(payload, ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'], '')),
    cardJsonValid: Boolean(safeParseJson(row.card_json)),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function isNonEmptyOwnerExpression(columnName = 'owner_user_id') {
  return `${quoteIdentifier(columnName)} IS NOT NULL AND TRIM(CAST(${quoteIdentifier(columnName)} AS TEXT)) != ''`;
}

async function runCount(env, sql) {
  const result = await env.DB.prepare(sql).first();
  return Number(result?.count || 0);
}

async function inspectCardsTable(env) {
  const table = 'cards';
  const quotedTable = quoteIdentifier(table);
  const ownerWhere = isNonEmptyOwnerExpression('owner_user_id');

  try {
    const sampleResult = await env.DB.prepare(`SELECT * FROM ${quotedTable} LIMIT 25`).all();
    const sampleRows = sampleResult.results || [];
    const sampleColumns = sampleRows[0] ? Object.keys(sampleRows[0]) : [];
    const hasOwnerUserId = sampleColumns.includes('owner_user_id');

    const totalRows = await runCount(env, `SELECT COUNT(*) AS count FROM ${quotedTable}`);
    const ownedRows = hasOwnerUserId
      ? await runCount(env, `SELECT COUNT(*) AS count FROM ${quotedTable} WHERE ${ownerWhere}`)
      : 0;
    const unownedRows = hasOwnerUserId
      ? await runCount(env, `SELECT COUNT(*) AS count FROM ${quotedTable} WHERE NOT (${ownerWhere})`)
      : totalRows;
    const uniqueOwners = hasOwnerUserId
      ? await runCount(env, `SELECT COUNT(DISTINCT owner_user_id) AS count FROM ${quotedTable} WHERE ${ownerWhere}`)
      : 0;

    const ownerResult = hasOwnerUserId
      ? await env.DB.prepare(`
          SELECT owner_user_id AS ownerUserId, COUNT(*) AS cardCount
          FROM ${quotedTable}
          WHERE ${ownerWhere}
          GROUP BY owner_user_id
          ORDER BY cardCount DESC
          LIMIT 20
        `).all()
      : { results: [] };

    const ownedSampleResult = hasOwnerUserId
      ? await env.DB.prepare(`
          SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
          FROM ${quotedTable}
          WHERE ${ownerWhere}
          LIMIT 20
        `).all()
      : { results: [] };

    const ownedSamples = (ownedSampleResult.results || []).map(summarizeCardRow);
    const usableOwnedSamples = ownedSamples.filter((sample) => sample.cardJsonValid && sample.name !== 'Unnamed Card').length;

    return {
      table,
      exists: true,
      error: null,
      sampleColumns,
      hasOwnerUserId,
      totalRows,
      ownedRows,
      unownedRows,
      uniqueOwners,
      ownerCounts: ownerResult.results || [],
      ownedSamples,
      canMapVaultFromCards: hasOwnerUserId && ownedRows > 0 && usableOwnedSamples > 0,
      warnings: [
        ...(hasOwnerUserId ? [] : ['cards.owner_user_id was not visible in sampled rows.']),
        ...(ownedRows > 0 ? [] : ['No owned rows were detected in cards.owner_user_id.']),
        ...(usableOwnedSamples > 0 ? [] : ['No owned sample row produced a named, valid card_json payload.']),
      ],
    };
  } catch (error) {
    return {
      table,
      exists: false,
      error: error.message,
      sampleColumns: [],
      hasOwnerUserId: false,
      totalRows: 0,
      ownedRows: 0,
      unownedRows: 0,
      uniqueOwners: 0,
      ownerCounts: [],
      ownedSamples: [],
      canMapVaultFromCards: false,
      warnings: ['Could not inspect the cards table.'],
    };
  }
}

async function inspectCandidateTable(env, table) {
  const quotedTable = quoteIdentifier(table);

  try {
    const count = await runCount(env, `SELECT COUNT(*) AS count FROM ${quotedTable}`);
    const sampleResult = await env.DB.prepare(`SELECT * FROM ${quotedTable} LIMIT 10`).all();
    const sampleRows = sampleResult.results || [];
    const sampleColumns = sampleRows[0] ? Object.keys(sampleRows[0]) : [];
    const ownershipColumns = sampleColumns.filter((column) => /owner|user|card|copy|level|xp|equipped|inventory|vault/i.test(column));

    return {
      table,
      exists: true,
      error: null,
      rowCount: count,
      sampleColumns,
      ownershipColumns,
      sampleRows: sampleRows.map((row) => Object.fromEntries(Object.entries(row).slice(0, 12))),
    };
  } catch (error) {
    return {
      table,
      exists: false,
      error: error.message,
      rowCount: 0,
      sampleColumns: [],
      ownershipColumns: [],
      sampleRows: [],
    };
  }
}

function buildReadiness(cardsInspection, candidateInspections) {
  const populatedOwnershipTables = candidateInspections.filter((table) => table.exists && table.rowCount > 0);

  if (cardsInspection.canMapVaultFromCards) {
    return {
      status: 'likely-ready-from-cards-owner-user-id',
      summary: 'Vault can likely be mapped from cards.owner_user_id and card_json without a separate ownership table.',
      nextStep: 'Build a read-only /api/vault endpoint using owned cards rows, then wire the Vault route to it.',
    };
  }

  if (populatedOwnershipTables.length > 0) {
    return {
      status: 'needs-ownership-table-mapping',
      summary: 'One or more candidate ownership tables have rows. Inspect their columns before choosing the Vault source.',
      nextStep: 'Map the most likely ownership table to Library card rows before wiring the Vault route.',
    };
  }

  return {
    status: 'not-ready',
    summary: 'No owned rows or populated ownership tables were detected by safe targeted probes.',
    nextStep: 'Manually confirm whether Vault ownership data exists, then create or document the ownership source before building the real Vault read model.',
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  const cardsInspection = await inspectCardsTable(env);
  const candidateOwnershipTables = [];

  for (const table of ownershipTableCandidates) {
    candidateOwnershipTables.push(await inspectCandidateTable(env, table));
  }

  return jsonResponse({
    ok: true,
    source: 'D1',
    phase: '8.1',
    readOnly: true,
    cardsTable: cardsInspection,
    candidateOwnershipTables,
    readiness: buildReadiness(cardsInspection, candidateOwnershipTables),
    notes: [
      'This endpoint intentionally uses targeted SELECT queries instead of sqlite_master or PRAGMA introspection.',
      'It performs no writes and does not mutate ownership, cards, tickets, pulls, battles, or submissions.',
    ],
  });
}
