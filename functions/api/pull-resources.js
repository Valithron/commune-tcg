import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { readPullResources } from '../_shared/pull-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to read pull resources.', 401);
    const resources = await readPullResources(env, { user });

    return jsonResponse({
      ok: true,
      source: 'D1 user_resources',
      phase: 'auth-current-user',
      readOnly: true,
      userId: user.id,
      ownerDisplayName: user.displayName,
      resources,
      warnings: ['This endpoint reads the signed-in player resource row.'],
    });
  } catch (error) {
    return errorResponse('Failed to read pull resources.', 500, error.message);
  }
}
