import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { createSession, ensureAuthSchema, hashPin, knownPlayers, sessionCookie, setUsername, validatePin } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    await ensureAuthSchema(env);
    const body = await request.json();
    const slotId = String(body.slotId || body.userId || '').trim().toLowerCase();
    const username = String(body.username || '');
    const pin = String(body.pin || '');
    const confirm = String(body.confirm || '');

    if (!knownPlayers.some((player) => player.id === slotId)) return errorResponse('Unknown player slot.', 400);
    if (!username.trim()) return errorResponse('Choose a username first.', 400);
    if (!validatePin(pin)) return errorResponse('PIN must be exactly 4 digits.', 400);
    if (pin !== confirm) return errorResponse('PINs do not match.', 400);

    const existing = await env.DB.prepare('SELECT pin_hash FROM player_auth_users WHERE slot_id = ?').bind(slotId).first();
    if (existing?.pin_hash) return errorResponse('PIN is already set for this player.', 409);

    await setUsername(env, slotId, username);
    const pinHash = await hashPin(pin);
    await env.DB.prepare(`
      UPDATE player_auth_users
      SET pin_hash = ?, updated_at = datetime('now')
      WHERE slot_id = ?
    `).bind(pinHash, slotId).run();

    const session = await createSession(env, slotId);
    const userRow = await env.DB.prepare('SELECT slot_id, username, display_name, color FROM player_auth_users WHERE slot_id = ?').bind(slotId).first();

    return jsonResponse({ ok: true, user: { id: userRow.slot_id, slotId: userRow.slot_id, username: userRow.username, usernameSet: true, displayName: userRow.display_name, color: userRow.color } }, {
      headers: { 'set-cookie': sessionCookie(session.token) },
    });
  } catch (error) {
    return errorResponse(error.message || 'Failed to set PIN.', 500);
  }
}
