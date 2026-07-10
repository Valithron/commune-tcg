/* Recover a specific authoritative attempt or the latest pending attempt. */

import { getSessionUser } from '../_shared/auth.js';
import { attemptForClient, ensureBattleAttemptSchemas, readAttempt, readLatestPendingAttempt } from '../_shared/battle-attempts.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to recover a battle.', 401);
    await ensureBattleAttemptSchemas(env, { ownerUserId: user.id });
    const url = new URL(request.url);
    const attemptId = String(url.searchParams.get('attemptId') || '').trim();
    const attempt = attemptId ? await readAttempt(env, { userId: user.id, attemptId }) : await readLatestPendingAttempt(env, { userId: user.id });
    return jsonResponse({ ok: true, resolved: Boolean(attempt && attempt.status !== 'pending'), pending: attempt?.status === 'pending', attempt: attemptForClient(attempt), battle: attemptForClient(attempt), recoveryActions: attempt?.status === 'pending' ? ['resume', 'skip-to-results'] : [] });
  } catch (error) {
    return errorResponse('Failed to recover battle attempt.', 500, error.message);
  }
}
