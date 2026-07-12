import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { resolvePull } from '../_shared/pull-engine.js';

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    count: formData.get('count'),
    requestId: formData.get('requestId'),
  };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in before pulling cards.', 401);
    const payload = await readPayload(request);
    const result = await resolvePull(env, { count: payload.count, requestId: payload.requestId, user });

    if (!result.ok) {
      return jsonResponse({
        ok: false,
        error: result.error,
        phase: 'auth-current-user',
        userId: user.id,
        ownerDisplayName: user.displayName,
        resources: result.resources || null,
        ticketCost: result.ticketCost || null,
        poolReadiness: result.poolReadiness || null,
      }, { status: result.status });
    }

    return jsonResponse({
      ok: true,
      source: 'D1 cards + user_resources + pull_history',
      phase: 'auth-current-user',
      simulationOnly: false,
      userId: result.userId,
      ownerDisplayName: result.ownerDisplayName,
      pullId: result.pullId,
      idempotent: result.idempotent,
      writesPerformed: !result.idempotent,
      count: result.count,
      ticketCost: result.ticketCost,
      ticketsBefore: result.ticketsBefore,
      ticketsAfter: result.ticketsAfter,
      results: result.results,
      poolSummary: result.poolSummary,
      warnings: ['Pull results write owned cards into the signed-in player Vault.'],
    });
  } catch (error) {
    return errorResponse('Failed to resolve pull.', 500, error.message);
  }
}
