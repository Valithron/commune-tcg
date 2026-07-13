import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { createSession, ensureAuthSchema } from '../functions/_shared/auth.js';
import { getMountainDateKey, onRequestPost as applyTicketOffer } from '../functions/api/pull-top-up.js';

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
  return { DB, database };
}

async function economyFixture() {
  const env = createD1();
  await ensureAuthSchema(env);
  env.database.exec(`
    CREATE TABLE user_resources (
      user_id TEXT PRIMARY KEY,
      pull_tickets INTEGER NOT NULL,
      gold INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  const now = '2026-07-11T20:00:00.000Z';
  env.database.prepare('INSERT INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at) VALUES (?, 0, 1000, ?, ?)').run('sterling', now, now);
  env.database.prepare('INSERT INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at) VALUES (?, 0, 1000, ?, ?)').run('cydney', now, now);
  const session = await createSession(env, 'sterling');
  return { ...env, cookie: `ctcg_session=${session.token}` };
}

function offerRequest(cookie, offerId) {
  return new Request('https://example.test/api/pull-top-up', {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });
}

test('daily ticket dates roll over at midnight in America/Denver', () => {
  assert.equal(getMountainDateKey(new Date('2026-07-12T05:59:59.999Z')), '2026-07-11');
  assert.equal(getMountainDateKey(new Date('2026-07-12T06:00:00.000Z')), '2026-07-12');
});

test('repeated daily claims grant exactly one ticket for the Mountain Time day', async () => {
  const env = await economyFixture();
  const responses = await Promise.all([
    applyTicketOffer({ env, request: offerRequest(env.cookie, 'daily-free-ticket') }),
    applyTicketOffer({ env, request: offerRequest(env.cookie, 'daily-free-ticket') }),
  ]);

  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
  const row = env.database.prepare('SELECT pull_tickets AS tickets FROM user_resources WHERE user_id = ?').get('sterling');
  assert.equal(row.tickets, 1);
});

test('Gold exchange debits and credits only the authenticated player row', async () => {
  const env = await economyFixture();
  const response = await applyTicketOffer({ env, request: offerRequest(env.cookie, 'gold-ticket-bundle') });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.userId, 'sterling');
  const sterlingAfter = env.database.prepare('SELECT pull_tickets AS tickets, gold FROM user_resources WHERE user_id = ?').get('sterling');
  const cydneyAfter = env.database.prepare('SELECT pull_tickets AS tickets, gold FROM user_resources WHERE user_id = ?').get('cydney');
  assert.equal(sterlingAfter.tickets, 5);
  assert.equal(sterlingAfter.gold, 0);
  assert.equal(cydneyAfter.tickets, 0);
  assert.equal(cydneyAfter.gold, 1000);

  const insufficient = await applyTicketOffer({ env, request: offerRequest(env.cookie, 'gold-ticket-bundle') });
  assert.equal(insufficient.status, 409);
  const sterlingFinal = env.database.prepare('SELECT pull_tickets AS tickets, gold FROM user_resources WHERE user_id = ?').get('sterling');
  assert.equal(sterlingFinal.tickets, 5);
  assert.equal(sterlingFinal.gold, 0);
});
