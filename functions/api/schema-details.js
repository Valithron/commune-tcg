/* ============================================================================
   API Schema Details Endpoint
   Phase 6 responsibility: read-only D1 table inventory for real schema mapping.
   Lists table columns and indexes. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getAdminSessionUser } from '../_shared/auth.js';

function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    const tablesResult = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();

    const tables = [];

    for (const row of tablesResult.results || []) {
      const tableName = row.name;
      const quotedTable = quoteIdentifier(tableName);
      const columnsResult = await env.DB.prepare(`PRAGMA table_info(${quotedTable})`).all();
      const indexesResult = await env.DB.prepare(`PRAGMA index_list(${quotedTable})`).all();

      tables.push({
        name: tableName,
        columns: columnsResult.results || [],
        indexes: indexesResult.results || [],
      });
    }

    return jsonResponse({
      ok: true,
      source: 'D1 pragma inventory',
      tableCount: tables.length,
      tables,
    });
  } catch (error) {
    return errorResponse('Failed to inspect D1 schema details.', 500, error.message);
  }
}
