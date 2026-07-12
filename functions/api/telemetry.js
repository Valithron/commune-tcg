import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { normalizeTelemetryEvent, recordTelemetryEvent } from '../_shared/telemetry.js';

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in before recording telemetry.', 401);
  try {
    const payload = await request.json().catch(() => ({}));
    const event = normalizeTelemetryEvent(payload, { playerId: user.id, env });
    if (event.error) return errorResponse(event.error, 400);
    const result = await recordTelemetryEvent(env, event);
    if (result.rateLimited) return errorResponse('Telemetry rate limit reached.', 429);
    return jsonResponse({ ok: true, accepted: result.accepted, idempotent: result.idempotent }, { status: result.idempotent ? 200 : 202 });
  } catch {
    return errorResponse('Telemetry was not recorded.', 500);
  }
}
