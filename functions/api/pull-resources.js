import { errorResponse, jsonResponse } from '../_shared/json.js';
import { readPullResources, temporaryPullUserId } from '../_shared/pull-engine.js';

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const resources = await readPullResources(env);

    return jsonResponse({
      ok: true,
      source: 'D1 user_resources',
      phase: '10.4',
      readOnly: true,
      userId: temporaryPullUserId,
      resources,
      warnings: [
        'Temporary Sterling owner is used until real auth exists.',
        'This endpoint does not create or modify resources.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read pull resources.', 500, error.message);
  }
}
