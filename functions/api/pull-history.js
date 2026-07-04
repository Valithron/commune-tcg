import { errorResponse, jsonResponse } from '../_shared/json.js';
import { readPullHistory, temporaryPullUserId } from '../_shared/pull-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const url = new URL(request.url);
    const history = await readPullHistory(env, { limit: url.searchParams.get('limit') || 20 });

    return jsonResponse({
      ok: true,
      source: 'D1 pull_history',
      phase: '10.4',
      readOnly: true,
      userId: temporaryPullUserId,
      history,
      warnings: [
        'Temporary Sterling owner is used until real auth exists.',
        'This endpoint does not create or modify history rows.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read pull history.', 500, error.message);
  }
}
