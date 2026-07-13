import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { createSession, ensureAuthSchema } from '../functions/_shared/auth.js';
import { normalizeTelemetryEvent, recordTelemetryEvent, runTelemetryRetention, TELEMETRY_PLAYER_HOURLY_LIMIT, TELEMETRY_SESSION_HOURLY_LIMIT } from '../functions/_shared/telemetry.js';
import { onRequestGet as readTelemetry, onRequestDelete as deleteTelemetry } from '../functions/api/admin/telemetry.js';
import { onRequestPost as collectTelemetry } from '../functions/api/telemetry.js';

function createD1() {
  const database = new DatabaseSync(':memory:');
  const DB = {
    prepare(sql) {
      const statement = database.prepare(sql);
      const prepared = {
        values: [],
        bind(...values) { this.values = values; return this; },
        run() { return statement.run(...this.values); },
        first() { return statement.get(...this.values) || null; },
        all() { return { results: statement.all(...this.values) }; },
        _run() { return statement.run(...this.values); },
      };
      return prepared;
    },
    async batch(statements) {
      database.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map((statement) => statement._run());
        database.exec('COMMIT');
        return results;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { DB, database, RELEASE_COMMIT: 'test-commit', DEPLOYMENT_ENVIRONMENT: 'test' };
}

async function fixture() {
  const env = createD1();
  await ensureAuthSchema(env);
  const sterling = await createSession(env, 'sterling');
  const cydney = await createSession(env, 'cydney');
  return { env, sterlingCookie: `ctcg_session=${sterling.token}`, cydneyCookie: `ctcg_session=${cydney.token}` };
}

function eventRequest(cookie, overrides = {}) {
  return new Request('https://example.test/api/telemetry', {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: 'evt_telemetry_test_event_0001',
      eventName: 'route.viewed',
      sessionId: 'as_telemetry_test_session_0001',
      route: '/vault?ownerUserId=cydney',
      deviceCategory: 'desktop',
      browserCategory: 'chromium',
      outcome: 'success',
      ...overrides,
    }),
  });
}

test('telemetry derives player identity, strips query text, and deduplicates event IDs', async () => {
  const { env, sterlingCookie } = await fixture();
  const first = await collectTelemetry({ env, request: eventRequest(sterlingCookie) });
  const repeated = await collectTelemetry({ env, request: eventRequest(sterlingCookie) });
  assert.equal(first.status, 202);
  assert.equal(repeated.status, 200);

  const row = env.database.prepare('SELECT player_id AS playerId, route, release_commit AS releaseCommit, environment FROM telemetry_events').get();
  assert.equal(row.playerId, 'sterling');
  assert.equal(row.route, '/vault');
  assert.equal(row.releaseCommit, 'test-commit');
  assert.equal(row.environment, 'test');
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM telemetry_events').get().count, 1);
});

test('telemetry rejects unsupported events and unsigned collection', async () => {
  const { env, sterlingCookie } = await fixture();
  const invalid = await collectTelemetry({ env, request: eventRequest(sterlingCookie, { eventName: 'raw.request_body' }) });
  const extraField = await collectTelemetry({ env, request: eventRequest(sterlingCookie, { playerId: 'cydney' }) });
  const unsigned = await collectTelemetry({ env, request: eventRequest('') });
  assert.equal(invalid.status, 400);
  assert.equal(extraField.status, 400);
  assert.equal(unsigned.status, 401);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'telemetry_events'").get().count, 0);
});

test('telemetry export and deletion require an administrator and record admin access', async () => {
  const { env, sterlingCookie, cydneyCookie } = await fixture();
  await collectTelemetry({ env, request: eventRequest(sterlingCookie) });
  await collectTelemetry({ env, request: eventRequest(cydneyCookie, { eventId: 'evt_telemetry_test_event_0002' }) });

  const denied = await readTelemetry({ env, request: new Request('https://example.test/api/admin/telemetry', { headers: { cookie: cydneyCookie } }) });
  assert.equal(denied.status, 403);

  const exported = await readTelemetry({ env, request: new Request('https://example.test/api/admin/telemetry?limit=10&releaseCommit=test-commit&route=%2Fvault&outcome=success', { headers: { cookie: sterlingCookie } }) });
  const exportPayload = await exported.json();
  assert.equal(exported.status, 200);
  assert.equal(exportPayload.events.length, 2);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM telemetry_admin_audit WHERE action = 'export'").get().count, 1);

  const deleted = await deleteTelemetry({ env, request: new Request('https://example.test/api/admin/telemetry', { method: 'DELETE', headers: { cookie: sterlingCookie, 'content-type': 'application/json' }, body: JSON.stringify({ playerId: 'cydney' }) }) });
  const deletePayload = await deleted.json();
  assert.equal(deleted.status, 200);
  assert.equal(deletePayload.deleted, 1);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM telemetry_events WHERE player_id = 'sterling'").get().count, 1);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM telemetry_events WHERE player_id = 'cydney'").get().count, 0);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM telemetry_admin_audit WHERE action = 'delete'").get().count, 1);
});

test('retention aggregates expired raw events without retaining player identity', async () => {
  const env = createD1();
  const oldNow = '2026-05-01T12:00:00.000Z';
  const event = normalizeTelemetryEvent({ eventId: 'evt_telemetry_old_event_0001', eventName: 'battle.completed', sessionId: 'as_telemetry_old_session_0001', route: '/battle/results', outcome: 'victory', durationMs: 1234 }, { playerId: 'sterling', env, now: oldNow });
  await recordTelemetryEvent(env, event);
  await runTelemetryRetention(env, '2026-07-11T12:00:00.000Z');

  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM telemetry_events').get().count, 0);
  const aggregate = env.database.prepare('SELECT event_count AS eventCount, total_duration_ms AS totalDurationMs FROM telemetry_daily_aggregates').get();
  assert.equal(aggregate.eventCount, 1);
  assert.equal(aggregate.totalDurationMs, 1234);
  const columns = env.database.prepare('PRAGMA table_info(telemetry_daily_aggregates)').all().map((column) => column.name);
  assert.equal(columns.includes('player_id'), false);
});

test('telemetry applies the bounded per-session hourly rate limit', async () => {
  const env = createD1();
  const now = '2026-07-11T12:00:00.000Z';
  for (let index = 0; index < TELEMETRY_SESSION_HOURLY_LIMIT; index += 1) {
    const event = normalizeTelemetryEvent({ eventId: `evt_rate_limit_event_${String(index).padStart(4, '0')}`, eventName: 'route.viewed', sessionId: 'as_rate_limit_session_0001', route: '/home', outcome: 'success' }, { playerId: 'sterling', env, now });
    const result = await recordTelemetryEvent(env, event);
    assert.equal(result.accepted, true);
  }
  const overflow = normalizeTelemetryEvent({ eventId: 'evt_rate_limit_event_overflow', eventName: 'route.viewed', sessionId: 'as_rate_limit_session_0001', route: '/home', outcome: 'success' }, { playerId: 'sterling', env, now });
  const result = await recordTelemetryEvent(env, overflow);
  assert.equal(result.accepted, false);
  assert.equal(result.rateLimited, true);
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM telemetry_events').get().count, TELEMETRY_SESSION_HOURLY_LIMIT);
});

test('telemetry applies the bounded per-player hourly rate limit across sessions', async () => {
  const env = createD1();
  const now = '2026-07-11T12:00:00.000Z';
  for (let index = 0; index < TELEMETRY_PLAYER_HOURLY_LIMIT; index += 1) {
    const session = Math.floor(index / TELEMETRY_SESSION_HOURLY_LIMIT);
    const event = normalizeTelemetryEvent({ eventId: `evt_player_rate_event_${String(index).padStart(4, '0')}`, eventName: 'route.viewed', sessionId: `as_player_rate_session_${String(session).padStart(4, '0')}`, route: '/home', outcome: 'success' }, { playerId: 'sterling', env, now });
    const result = await recordTelemetryEvent(env, event);
    assert.equal(result.accepted, true);
  }
  const overflow = normalizeTelemetryEvent({ eventId: 'evt_player_rate_event_overflow', eventName: 'route.viewed', sessionId: 'as_player_rate_session_overflow', route: '/home', outcome: 'success' }, { playerId: 'sterling', env, now });
  const result = await recordTelemetryEvent(env, overflow);
  assert.equal(result.accepted, false);
  assert.equal(result.rateLimited, true);
});
