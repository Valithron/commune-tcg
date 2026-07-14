export const TELEMETRY_RAW_RETENTION_DAYS = 30;
export const TELEMETRY_AGGREGATE_RETENTION_DAYS = 180;
export const TELEMETRY_SESSION_HOURLY_LIMIT = 200;
export const TELEMETRY_PLAYER_HOURLY_LIMIT = 1000;

export const telemetryEventNames = new Set([
  'session.started',
  'auth.login_completed',
  'route.viewed',
  'home.next_action_selected',
  'ticket.daily_claim_completed',
  'ticket.exchange_completed',
  'pull.started',
  'pull.option_selected',
  'pull.completed',
  'pull.interrupted',
  'vault.viewed_after_pull',
  'card.inspected',
  'squad.saved',
  'battle.created',
  'battle.playback_started',
  'battle.interrupted',
  'battle.surrendered',
  'battle.completed',
  'reward.finalized',
  'error.displayed',
  'retry.attempted',
]);

const telemetryEventsSql = `
  CREATE TABLE IF NOT EXISTS telemetry_events (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    release_commit TEXT NOT NULL,
    environment TEXT NOT NULL,
    player_id TEXT NOT NULL,
    analytics_session_id TEXT NOT NULL,
    route TEXT NOT NULL,
    device_category TEXT NOT NULL,
    browser_category TEXT NOT NULL,
    outcome TEXT NOT NULL,
    duration_ms INTEGER,
    error_category TEXT NOT NULL,
    related_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

const telemetryAggregatesSql = `
  CREATE TABLE IF NOT EXISTS telemetry_daily_aggregates (
    event_day TEXT NOT NULL,
    event_name TEXT NOT NULL,
    environment TEXT NOT NULL,
    route TEXT NOT NULL,
    outcome TEXT NOT NULL,
    event_count INTEGER NOT NULL,
    total_duration_ms INTEGER NOT NULL,
    aggregated_at TEXT NOT NULL,
    PRIMARY KEY (event_day, event_name, environment, route, outcome)
  )
`;

const telemetryAdminAuditSql = `
  CREATE TABLE IF NOT EXISTS telemetry_admin_audit (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    filters_json TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  )
`;

const allowedDevices = new Set(['unknown', 'desktop', 'phone', 'tablet']);
const allowedBrowsers = new Set(['unknown', 'chromium', 'safari', 'firefox', 'other']);
const allowedOutcomes = new Set(['unknown', 'success', 'failure', 'interrupted', 'surrendered', 'victory', 'defeat']);
const allowedErrors = new Set(['', 'offline', 'unauthorized', 'forbidden', 'validation', 'missing', 'conflict', 'insufficient-resources', 'server', 'timeout', 'playback', 'unknown']);
const allowedPayloadFields = new Set(['eventId', 'eventName', 'sessionId', 'route', 'deviceCategory', 'browserCategory', 'outcome', 'durationMs', 'errorCategory', 'relatedId']);

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function safeEnum(value, allowed, fallback) {
  const normalized = cleanText(value, 40).toLowerCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function validIdentifier(value, prefix) {
  const text = cleanText(value, 160);
  return new RegExp(`^${prefix}_[A-Za-z0-9_-]{12,150}$`).test(text) ? text : '';
}

function safeRoute(value) {
  const route = cleanText(value, 120).split('?')[0];
  return /^\/[A-Za-z0-9/_:.-]*$/.test(route) ? route : '';
}

function safeRelatedId(value) {
  const id = cleanText(value, 160);
  return /^[A-Za-z0-9:_-]*$/.test(id) ? id : '';
}

function boundedDuration(value) {
  if (value === '' || value === undefined || value === null) return null;
  const duration = Math.round(Number(value));
  return Number.isFinite(duration) && duration >= 0 && duration <= 24 * 60 * 60 * 1000 ? duration : null;
}

function changedRows(result) {
  return Number(result?.meta?.changes ?? result?.changes ?? 0);
}

export async function ensureTelemetrySchema(env) {
  await env.DB.prepare(telemetryEventsSql).run();
  await env.DB.prepare(telemetryAggregatesSql).run();
  await env.DB.prepare(telemetryAdminAuditSql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_telemetry_events_session_time ON telemetry_events (analytics_session_id, occurred_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_telemetry_events_player_time ON telemetry_events (player_id, occurred_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_telemetry_events_name_time ON telemetry_events (event_name, occurred_at)').run();
}

export async function recordTelemetryAdminAccess(env, { adminId, action, filters = {}, now = new Date().toISOString() }) {
  await ensureTelemetrySchema(env);
  const safeFilters = {
    playerId: cleanText(filters.playerId, 80),
    eventName: cleanText(filters.eventName, 80),
    environment: cleanText(filters.environment, 40),
    releaseCommit: cleanText(filters.releaseCommit, 80),
    sessionId: cleanText(filters.sessionId, 160),
    route: cleanText(filters.route, 120),
    outcome: cleanText(filters.outcome, 40),
    errorCategory: cleanText(filters.errorCategory, 40),
    relatedId: cleanText(filters.relatedId, 160),
    after: cleanText(filters.after, 40),
    before: cleanText(filters.before, 40),
    limit: Math.min(Math.max(Number(filters.limit) || 0, 0), 1000),
  };
  await env.DB.prepare('INSERT INTO telemetry_admin_audit (id, admin_id, action, filters_json, occurred_at) VALUES (?, ?, ?, ?, ?)').bind(`telemetry_admin_${crypto.randomUUID()}`, cleanText(adminId, 80), cleanText(action, 40), JSON.stringify(safeFilters), now).run();
}

export function normalizeTelemetryEvent(payload, { playerId, env, now = new Date().toISOString() }) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { error: 'Telemetry payload must be an object.' };
  if (Object.keys(payload).some((field) => !allowedPayloadFields.has(field))) return { error: 'Telemetry payload contains unsupported fields.' };
  const eventName = cleanText(payload?.eventName, 80).toLowerCase();
  const eventId = validIdentifier(payload?.eventId, 'evt');
  const analyticsSessionId = validIdentifier(payload?.sessionId, 'as');
  if (!telemetryEventNames.has(eventName)) return { error: 'Unsupported telemetry event.' };
  if (!eventId || !analyticsSessionId) return { error: 'Valid telemetry event and session IDs are required.' };

  return {
    eventId,
    eventName,
    occurredAt: now,
    releaseCommit: cleanText(env.RELEASE_COMMIT || 'unknown', 80),
    environment: cleanText(env.DEPLOYMENT_ENVIRONMENT || 'unknown', 40).toLowerCase(),
    playerId: cleanText(playerId, 80),
    analyticsSessionId,
    route: safeRoute(payload?.route),
    deviceCategory: safeEnum(payload?.deviceCategory, allowedDevices, 'unknown'),
    browserCategory: safeEnum(payload?.browserCategory, allowedBrowsers, 'unknown'),
    outcome: safeEnum(payload?.outcome, allowedOutcomes, 'unknown'),
    durationMs: boundedDuration(payload?.durationMs),
    errorCategory: safeEnum(payload?.errorCategory, allowedErrors, ''),
    relatedId: safeRelatedId(payload?.relatedId),
  };
}

export async function recordTelemetryEvent(env, event) {
  await ensureTelemetrySchema(env);
  const existing = await env.DB.prepare('SELECT event_id AS eventId FROM telemetry_events WHERE event_id = ? LIMIT 1').bind(event.eventId).first();
  if (existing) return { accepted: true, idempotent: true, rateLimited: false };

  const oneHourAgo = new Date(new Date(event.occurredAt).getTime() - 60 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare('SELECT COUNT(*) AS count FROM telemetry_events WHERE analytics_session_id = ? AND occurred_at >= ?').bind(event.analyticsSessionId, oneHourAgo).first();
  if (Number(recent?.count || 0) >= TELEMETRY_SESSION_HOURLY_LIMIT) return { accepted: false, idempotent: false, rateLimited: true };
  const playerRecent = await env.DB.prepare('SELECT COUNT(*) AS count FROM telemetry_events WHERE player_id = ? AND occurred_at >= ?').bind(event.playerId, oneHourAgo).first();
  if (Number(playerRecent?.count || 0) >= TELEMETRY_PLAYER_HOURLY_LIMIT) return { accepted: false, idempotent: false, rateLimited: true };

  const result = await env.DB.prepare(`
    INSERT OR IGNORE INTO telemetry_events (
      event_id, event_name, occurred_at, release_commit, environment, player_id,
      analytics_session_id, route, device_category, browser_category, outcome,
      duration_ms, error_category, related_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.eventId, event.eventName, event.occurredAt, event.releaseCommit, event.environment,
    event.playerId, event.analyticsSessionId, event.route, event.deviceCategory,
    event.browserCategory, event.outcome, event.durationMs, event.errorCategory,
    event.relatedId, event.occurredAt,
  ).run();
  return { accepted: changedRows(result) === 1, idempotent: changedRows(result) === 0, rateLimited: false };
}

export async function runTelemetryRetention(env, now = new Date().toISOString()) {
  await ensureTelemetrySchema(env);
  const nowMs = new Date(now).getTime();
  const rawCutoff = new Date(nowMs - TELEMETRY_RAW_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const aggregateCutoffDay = new Date(nowMs - TELEMETRY_AGGREGATE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const statements = [
    env.DB.prepare(`
      INSERT INTO telemetry_daily_aggregates (
        event_day, event_name, environment, route, outcome, event_count, total_duration_ms, aggregated_at
      )
      SELECT substr(occurred_at, 1, 10), event_name, environment, route, outcome,
             COUNT(*), COALESCE(SUM(duration_ms), 0), ?
      FROM telemetry_events
      WHERE occurred_at < ?
      GROUP BY substr(occurred_at, 1, 10), event_name, environment, route, outcome
      ON CONFLICT(event_day, event_name, environment, route, outcome) DO UPDATE SET
        event_count = excluded.event_count,
        total_duration_ms = excluded.total_duration_ms,
        aggregated_at = excluded.aggregated_at
    `).bind(now, rawCutoff),
    env.DB.prepare('DELETE FROM telemetry_events WHERE occurred_at < ?').bind(rawCutoff),
    env.DB.prepare('DELETE FROM telemetry_daily_aggregates WHERE event_day < ?').bind(aggregateCutoffDay),
  ];
  await env.DB.batch(statements);
  return { rawCutoff, aggregateCutoffDay };
}

export async function listTelemetry(env, filters = {}) {
  await ensureTelemetrySchema(env);
  const limit = Math.min(Math.max(Number(filters.limit) || 200, 1), 1000);
  const clauses = [];
  const values = [];
  const add = (sql, value) => { if (value) { clauses.push(sql); values.push(value); } };
  add('player_id = ?', cleanText(filters.playerId, 80));
  add('event_name = ?', telemetryEventNames.has(cleanText(filters.eventName, 80).toLowerCase()) ? cleanText(filters.eventName, 80).toLowerCase() : '');
  add('environment = ?', cleanText(filters.environment, 40).toLowerCase());
  add('release_commit = ?', cleanText(filters.releaseCommit, 80));
  add('analytics_session_id = ?', validIdentifier(filters.sessionId, 'as'));
  add('route = ?', safeRoute(filters.route));
  add('outcome = ?', safeEnum(filters.outcome, allowedOutcomes, ''));
  add('error_category = ?', safeEnum(filters.errorCategory, allowedErrors, ''));
  add('related_id = ?', safeRelatedId(filters.relatedId));
  add('occurred_at >= ?', cleanText(filters.after, 40));
  add('occurred_at <= ?', cleanText(filters.before, 40));
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await env.DB.prepare(`SELECT event_id AS eventId, event_name AS eventName, occurred_at AS occurredAt, release_commit AS releaseCommit, environment, player_id AS playerId, analytics_session_id AS sessionId, route, device_category AS deviceCategory, browser_category AS browserCategory, outcome, duration_ms AS durationMs, error_category AS errorCategory, related_id AS relatedId FROM telemetry_events ${where} ORDER BY occurred_at DESC LIMIT ?`).bind(...values, limit).all();
  return result.results || [];
}

export async function listTelemetryAggregates(env, limit = 200) {
  await ensureTelemetrySchema(env);
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  const result = await env.DB.prepare('SELECT event_day AS eventDay, event_name AS eventName, environment, route, outcome, event_count AS eventCount, total_duration_ms AS totalDurationMs, aggregated_at AS aggregatedAt FROM telemetry_daily_aggregates ORDER BY event_day DESC LIMIT ?').bind(safeLimit).all();
  return result.results || [];
}

export async function deletePlayerTelemetry(env, { playerId, after = '', before = '' }) {
  await ensureTelemetrySchema(env);
  const safePlayerId = cleanText(playerId, 80);
  if (!safePlayerId) return { ok: false, error: 'Player ID is required.' };
  const clauses = ['player_id = ?'];
  const values = [safePlayerId];
  if (after) { clauses.push('occurred_at >= ?'); values.push(cleanText(after, 40)); }
  if (before) { clauses.push('occurred_at <= ?'); values.push(cleanText(before, 40)); }
  const result = await env.DB.prepare(`DELETE FROM telemetry_events WHERE ${clauses.join(' AND ')}`).bind(...values).run();
  return { ok: true, deleted: changedRows(result) };
}
