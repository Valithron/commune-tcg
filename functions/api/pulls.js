import { errorResponse, jsonResponse } from '../_shared/json.js';
import { resolvePull, temporaryPullUserId } from '../_shared/pull-engine.js';

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    count: formData.get('count'),
  };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const payload = await readPayload(request);
    const result = await resolvePull(env, { count: payload.count });

    if (!result.ok) {
      return jsonResponse({
        ok: false,
        error: result.error,
        phase: '10.3',
        userId: temporaryPullUserId,
        resources: result.resources || null,
        ticketCost: result.ticketCost || null,
        poolReadiness: result.poolReadiness || null,
      }, { status: result.status });
    }

    return jsonResponse({
      ok: true,
      source: 'D1 cards + user_resources + pull_history',
      phase: '10.3',
      simulationOnly: false,
      writesPerformed: true,
      userId: result.userId,
      pullId: result.pullId,
      count: result.count,
      ticketCost: result.ticketCost,
      ticketsBefore: result.ticketsBefore,
      ticketsAfter: result.ticketsAfter,
      results: result.results,
      poolSummary: result.poolSummary,
      warnings: [
        'Temporary Sterling owner is used until real auth exists.',
        'Pull results write owned cards into cards for Vault visibility.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to resolve pull.', 500, error.message);
  }
}
