const playerSlots = [
  ['sterling', 'Sterling', '#c4c5db'],
  ['cydney', 'Cydney', '#f3c93f'],
  ['ryan', 'Ryan', '#a98cff'],
  ['gabi', 'Gabi', '#8ccdff'],
  ['cooper', 'Cooper', '#ff8f70'],
  ['kenly', 'Kenly', '#73e1c2'],
  ['ashley', 'Ashley', '#ff9ccf'],
];

export const knownPlayers = playerSlots.map(([id, displayName, color]) => ({ id, displayName, color }));

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseCookies(request) {
  const cookie = request.headers.get('cookie') || '';
  return Object.fromEntries(cookie.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index === -1) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function normalizeUsername(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function validUsername(value) {
  const username = normalizeUsername(value);
  return username.length >= 1 && username.length <= 10 && /^[A-Za-z0-9 _.-]+$/.test(username);
}

function initialsFor(value, fallback = '??') {
  const username = normalizeUsername(value);
  const parts = username.split(/[\s._-]+/).filter(Boolean);
  const raw = parts.length > 1 ? parts.map((part) => part[0]).join('') : username.slice(0, 2);
  return raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || fallback;
}

function fallbackPlayer(slotId) {
  return knownPlayers.find((player) => player.id === slotId) || knownPlayers[0];
}

export function validatePin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

export function publicUserFromRow(row) {
  const fallback = fallbackPlayer(row?.slot_id || row?.id);
  const username = normalizeUsername(row?.username || '');
  const displayName = username || normalizeUsername(row?.display_name) || fallback.displayName;

  return {
    id: row?.slot_id || row?.id || fallback.id,
    slotId: row?.slot_id || row?.id || fallback.id,
    username,
    usernameSet: Boolean(username),
    displayName,
    initials: initialsFor(displayName, fallback.displayName.slice(0, 2).toUpperCase()),
    color: row?.color || fallback.color,
  };
}

export async function ensureAuthSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS player_auth_users (
      slot_id TEXT PRIMARY KEY,
      username TEXT,
      display_name TEXT NOT NULL,
      color TEXT NOT NULL,
      pin_hash TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS player_auth_sessions (
      token TEXT PRIMARY KEY,
      slot_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.batch(knownPlayers.map((player) => env.DB.prepare(`
    INSERT INTO player_auth_users (slot_id, display_name, color)
    VALUES (?, ?, ?)
    ON CONFLICT(slot_id) DO UPDATE SET color = excluded.color
  `).bind(player.id, player.displayName, player.color)));
}

export async function hashPin(pin) {
  const salt = crypto.randomUUID();
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `${salt}:${toHex(digest)}`;
}

export async function verifyPin(pin, storedHash) {
  if (!validatePin(pin) || !storedHash || !storedHash.includes(':')) return false;
  const [salt, expected] = storedHash.split(':');
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(digest) === expected;
}

export async function usernameTaken(env, username, slotId) {
  const clean = normalizeUsername(username);
  if (!clean) return false;

  const row = await env.DB.prepare(`
    SELECT slot_id FROM player_auth_users
    WHERE lower(username) = lower(?) AND slot_id <> ?
    LIMIT 1
  `).bind(clean, slotId).first();

  return Boolean(row);
}

export async function setUsername(env, slotId, username) {
  const clean = normalizeUsername(username);
  if (!validUsername(clean)) {
    throw new Error('Username must be 1-10 letters, numbers, spaces, dashes, dots, or underscores.');
  }

  if (await usernameTaken(env, clean, slotId)) {
    throw new Error('That username is already taken.');
  }

  await env.DB.prepare(`
    UPDATE player_auth_users
    SET username = ?, display_name = ?, updated_at = datetime('now')
    WHERE slot_id = ?
  `).bind(clean, clean, slotId).run();
}

export function getSessionToken(request) {
  return parseCookies(request).ctcg_session || '';
}

export function sessionCookie(token, maxAge = 60 * 60 * 24 * 30) {
  return `ctcg_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return 'ctcg_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

export async function createSession(env, slotId) {
  const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

  await env.DB.prepare(`
    INSERT INTO player_auth_sessions (token, slot_id, expires_at)
    VALUES (?, ?, ?)
  `).bind(token, slotId, expiresAt).run();

  return { token, expiresAt };
}

export async function destroySession(request, env) {
  const token = getSessionToken(request);
  if (token) {
    await env.DB.prepare('DELETE FROM player_auth_sessions WHERE token = ?').bind(token).run();
  }
}

export async function getSessionUser(request, env) {
  const token = getSessionToken(request);
  if (!token) return null;

  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(`
    SELECT u.slot_id, u.username, u.display_name, u.color, s.expires_at
    FROM player_auth_sessions s
    JOIN player_auth_users u ON u.slot_id = s.slot_id
    WHERE s.token = ?
    LIMIT 1
  `).bind(token).first();

  if (!row) return null;
  if (Number(row.expires_at) < now) {
    await env.DB.prepare('DELETE FROM player_auth_sessions WHERE token = ?').bind(token).run();
    return null;
  }

  return publicUserFromRow(row);
}

export async function listAuthUsers(env) {
  await ensureAuthSchema(env);
  const result = await env.DB.prepare(`
    SELECT slot_id, username, display_name, color, pin_hash
    FROM player_auth_users
    ORDER BY CASE slot_id
      WHEN 'sterling' THEN 1
      WHEN 'cydney' THEN 2
      WHEN 'ryan' THEN 3
      WHEN 'gabi' THEN 4
      WHEN 'cooper' THEN 5
      WHEN 'kenly' THEN 6
      WHEN 'ashley' THEN 7
      ELSE 99
    END
  `).all();

  return (result.results || []).map((row) => ({
    ...publicUserFromRow(row),
    pinSet: Boolean(row.pin_hash),
  }));
}
