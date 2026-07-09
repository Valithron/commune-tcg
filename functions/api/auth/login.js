import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { createSession, ensureAuthSchema, knownPlayers, sessionCookie, setUsername, validatePin, verifyPin } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    await ensureAuthSchema(env);
    const body = await request.json();
    const slotId = String(body.slotId || body.userId || '').trim().toLowerCase();
    const pin = String(body.pin || '');
    const username = String(body.username || '');

    if (!knownPlayers.some((player) => player.id === slotId)) return errorResponse('Unknown player slot.', 400);
    if (!validatePin(pin)) return errorResponse('Use exactly 4 digits.', 400);

    const row = await env.DB.prepare('SELECT slot_id, username, display_name, color, pin_hash FROM player_auth_users WHERE slot_id = ?').bind(slotId).first();
    if (!row?.pin_hash) return errorResponse('PIN setup required.', 409);
    if (!(await verifyPin(pin, row.pin_hash))) return errorResponse('Try again.', 401);

    if (!row.username) {
      if (!username.trim()) return errorResponse('Choose a username before entering the vault.', 400);
      await setUsername(env, slotId, username);
    }

    const session = await createSession(env, slotId);
    const updated = await env.DB.prepare('SELECT slot_id, username, display_name, color FROM player_auth_users WHERE slot_id = ?').bind(slotId).first();

    return jsonResponse({ ok: true, user: { id: updated.slot_id, slotId: updated.slot_id, username: updated.username, usernameSet: Boolean(updated.username), displayName: updated.display_name, color: updated.color } }, {
      headers: { 'set-cookie': sessionCookie(session.token) },
    });
  } catch (error) {
    return errorResponse(error.message || 'Login failed.', 500);
  }
}
