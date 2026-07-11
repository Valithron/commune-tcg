/* ============================================================================
   API Schema Endpoint
   Phase 5 responsibility: read-only D1 table introspection for backend mapping.
   This endpoint does not assume table names and performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getAdminSessionUser } from '../_shared/auth.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    const result = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ).all();

    return jsonResponse({
      ok: true,
      source: 'D1 sqlite_master',
      tables: result.results || [],
    });
  } catch (error) {
    return errorResponse('Failed to inspect D1 schema.', 500, error.message);
  }
}
