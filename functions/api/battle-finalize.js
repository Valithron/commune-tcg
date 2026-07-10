/* Finalize stored outcome once, or surrender it into approved defeat rewards. */

import { getSessionUser } from '../_shared/auth.js';
import { attemptForClient, finalizeBattleAttempt } from '../_shared/battle-attempts.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to finalize a battle.', 401);
    const payload = await request.json().catch(() => ({}));
    const attemptId = String(payload.attemptId || '').trim();
    if (!attemptId) return jsonResponse({ ok: false, code: 'battle-attempt-required', error: 'attemptId is required.' }, { status: 400 });
    const surrender = payload.action === 'surrender' || payload.surrender === true;
    const result = await finalizeBattleAttempt(env, { userId: user.id, attemptId, surrender });
    if (!result.ok) return jsonResponse(result, { status: result.status || 400 });
    return jsonResponse({ ok: true, phase: surrender ? 'battle-surrender' : 'battle-finalize', idempotent: result.idempotent, attempt: attemptForClient(result.attempt), settlement: result.settlement, rewardApplied: result.settlement?.reward, xpApplied: result.settlement?.xpApplied || [] });
  } catch (error) {
    return errorResponse('Failed to finalize battle.', error.status || 500, error.message);
  }
}

