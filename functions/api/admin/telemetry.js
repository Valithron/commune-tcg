import { getAdminSessionUser } from '../../_shared/auth.js';
import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { deletePlayerTelemetry, listTelemetry, listTelemetryAggregates, recordTelemetryAdminAccess, runTelemetryRetention } from '../../_shared/telemetry.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const admin = await getAdminSessionUser(request, env);
  if (!admin) return errorResponse('Admin authorization required.', 403);
  try {
    const url = new URL(request.url);
    const retention = await runTelemetryRetention(env);
    const filters = Object.fromEntries(url.searchParams);
    const events = await listTelemetry(env, filters);
    const aggregates = await listTelemetryAggregates(env, filters.limit);
    await recordTelemetryAdminAccess(env, { adminId: admin.id, action: 'export', filters });
    return jsonResponse({ ok: true, source: 'D1 telemetry', requestedBy: admin.id, retention, events, aggregates, totalReturned: events.length });
  } catch {
    return errorResponse('Failed to read telemetry.', 500);
  }
}

export async function onRequestDelete({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const admin = await getAdminSessionUser(request, env);
  if (!admin) return errorResponse('Admin authorization required.', 403);
  try {
    const payload = await request.json().catch(() => ({}));
    const result = await deletePlayerTelemetry(env, payload);
    if (!result.ok) return errorResponse(result.error, 400);
    await recordTelemetryAdminAccess(env, { adminId: admin.id, action: 'delete', filters: payload });
    return jsonResponse({ ok: true, requestedBy: admin.id, ...result });
  } catch {
    return errorResponse('Failed to delete telemetry.', 500);
  }
}
