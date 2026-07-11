/* Authenticated no-write execution of the same canonical lane engine. */

import { getAdminSessionUser } from '../_shared/auth.js';
import { createAuthoritativeBattleResult } from '../_shared/battle-adapter.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getAdminSessionUser(request, env);
    if (!user) return errorResponse('Admin authorization required.', 403);
    const url = new URL(request.url);
    const encounterId = url.searchParams.get('encounterId') || 'crossroads-patrol';
    const orderedCardIds = String(url.searchParams.get('squadCardIds') || '').split(',').filter(Boolean);
    const seed = url.searchParams.get('seed') || 'admin-read-only-simulation';
    const result = await createAuthoritativeBattleResult(env, { ownerUserId: user.id, ownerDisplayName: user.displayName, encounterId, orderedCardIds, seed });
    if (!result.ok) return jsonResponse({ ...result, readOnly: true, writes: [] }, { status: result.status || 400 });
    return jsonResponse({ ok: true, phase: 'canonical-battle-simulate', readOnly: true, writes: [], simulation: result, guardrails: ['Uses the canonical seeded lane engine.', 'Performs no Energy, reward, XP, history, or card writes.'] });
  } catch (error) { return errorResponse('Failed to run battle simulation.', 500, error.message); }
}
