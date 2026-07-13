import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { resolvePull } from '../functions/_shared/pull-engine.js';

function createD1() {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE cards (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT,
      character_id TEXT,
      card_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE user_resources (
      user_id TEXT PRIMARY KEY,
      pull_tickets INTEGER NOT NULL,
      gold INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
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

function seedPullPool(database) {
  const now = '2026-07-11T20:00:00.000Z';
  const rarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
  rarities.forEach((rarity, index) => {
    const card = {
      id: `template-${rarity}`,
      name: `${rarity} template`,
      character_id: 'sterling',
      type: 'neutral',
      rarity,
      stats: { pow: 10 + index, def: 10, spd: 10 },
    };
    database.prepare('INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(card.id, '', 'sterling', JSON.stringify(card), now, now);
  });
}

function seedResources(database, userId, tickets) {
  const now = '2026-07-11T20:00:00.000Z';
  database.prepare('INSERT INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at) VALUES (?, ?, 0, ?, ?)').run(userId, tickets, now, now);
}

test('repeating a pull request ID returns the committed result without a second charge or grant', async () => {
  const env = createD1();
  seedPullPool(env.database);
  seedResources(env.database, 'sterling', 10);
  const input = { count: 5, user: { id: 'sterling', displayName: 'Sterling' }, requestId: 'pull_repeat_request_0001' };

  const first = await resolvePull(env, input);
  const repeated = await resolvePull(env, input);

  assert.equal(first.ok, true);
  assert.equal(first.idempotent, false);
  assert.equal(repeated.ok, true);
  assert.equal(repeated.idempotent, true);
  assert.equal(env.database.prepare('SELECT pull_tickets AS tickets FROM user_resources WHERE user_id = ?').get('sterling').tickets, 5);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM cards WHERE owner_user_id = 'sterling'").get().count, 5);
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM pull_history WHERE user_id = ?').get('sterling').count, 1);
  assert.deepEqual(repeated.results.map((result) => result.ownedCardId).sort(), first.results.map((result) => result.ownedCardId).sort());
});

test('concurrent pull requests cannot grant more cards than the available ticket balance', async () => {
  const env = createD1();
  seedPullPool(env.database);
  seedResources(env.database, 'sterling', 1);
  const user = { id: 'sterling', displayName: 'Sterling' };

  const results = await Promise.all([
    resolvePull(env, { count: 1, user, requestId: 'pull_concurrent_request_a' }),
    resolvePull(env, { count: 1, user, requestId: 'pull_concurrent_request_b' }),
  ]);

  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal(results.filter((result) => !result.ok && result.status === 409).length, 1);
  assert.equal(env.database.prepare('SELECT pull_tickets AS tickets FROM user_resources WHERE user_id = ?').get('sterling').tickets, 0);
  assert.equal(env.database.prepare("SELECT COUNT(*) AS count FROM cards WHERE owner_user_id = 'sterling'").get().count, 1);
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM pull_history WHERE user_id = ?').get('sterling').count, 1);
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM pull_requests WHERE user_id = ?').get('sterling').count, 1);
});
