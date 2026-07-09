import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { listAuthUsers } from '../../_shared/auth.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const users = await listAuthUsers(env);
    return jsonResponse({ ok: true, users });
  } catch (error) {
    return errorResponse('Failed to load auth users.', 500, error.message);
  }
}
