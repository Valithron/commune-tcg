import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { readPullHistory } from '../_shared/pull-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to read pull history.', 401);
    const url = new URL(request.url);
    const history = await readPullHistory(env, { limit: url.searchParams.get('limit') || 20, user });

    return jsonResponse({
      ok: true,
      source: 'D1 pull_history',
      phase: 'auth-current-user',
      readOnly: true,
      userId: user.id,
      ownerDisplayName: user.displayName,
      history,
      warnings: ['This endpoint reads pull history for the signed-in player only.'],
    });
  } catch (error) {
    return errorResponse('Failed to read pull history.', 500, error.message);
  }
}
