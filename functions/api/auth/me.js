import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { clearSessionCookie, destroySession, ensureAuthSchema, getSessionUser, isAdminUser } from '../../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    await ensureAuthSchema(env);
    const user = await getSessionUser(request, env);

    if (user && !user.usernameSet) {
      await destroySession(request, env);
      return jsonResponse({ ok: false, user: null, error: 'Username setup required.' }, {
        status: 401,
        headers: { 'set-cookie': clearSessionCookie() },
      });
    }

    return jsonResponse({ ok: true, user: user ? { ...user, isAdmin: isAdminUser(user, env) } : null }, { status: user ? 200 : 401 });
  } catch (error) {
    return errorResponse('Failed to read auth session.', 500, error.message);
  }
}
