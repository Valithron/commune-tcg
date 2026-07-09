import { jsonResponse } from '../../_shared/json.js';
import { clearSessionCookie, destroySession, ensureAuthSchema } from '../../_shared/auth.js';

function redirectHome() {
  return new Response(null, {
    status: 302,
    headers: {
      location: '/#/home',
      'cache-control': 'no-store',
      'set-cookie': clearSessionCookie(),
    },
  });
}

export async function onRequestGet({ request, env }) {
  try {
    if (env.DB) {
      await ensureAuthSchema(env);
      await destroySession(request, env);
    }
  } catch {}

  return redirectHome();
}

export async function onRequestPost({ request, env }) {
  try {
    if (env.DB) {
      await ensureAuthSchema(env);
      await destroySession(request, env);
    }
  } catch {}

  return jsonResponse({ ok: true }, {
    headers: { 'set-cookie': clearSessionCookie() },
  });
}
