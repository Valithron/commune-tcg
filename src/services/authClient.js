import { fetchJson } from './apiClient.js';
import { resetTelemetrySession, trackTelemetry } from './telemetry.js';

let cachedUser = undefined;

export function getCachedAuthUser() {
  return cachedUser || null;
}

export async function loadAuthUser({ force = false } = {}) {
  if (cachedUser !== undefined && !force) return cachedUser;

  try {
    const payload = await fetchJson('/api/auth/me', { cache: 'no-store' });
    cachedUser = payload.user || null;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

export async function loadAuthUsers() {
  const payload = await fetchJson('/api/auth/users', { cache: 'no-store' });
  return payload.users || [];
}

export async function signIn({ slotId, pin, username = '', setup = false, confirm = '' }) {
  const payload = await fetchJson(setup ? '/api/auth/setup-pin' : '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slotId, pin, username, confirm }),
  });

  cachedUser = payload.user || null;
  resetTelemetrySession();
  trackTelemetry('auth.login_completed', { outcome: 'success' });
  return cachedUser;
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' }).catch(() => {});
  cachedUser = null;
  resetTelemetrySession();
}
