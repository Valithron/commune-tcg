import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { createSession, ensureAuthSchema } from '../functions/_shared/auth.js';
import { onRequestGet as readBattleHistory } from '../functions/api/battle-history.js';
import { onRequestGet as readVault } from '../functions/api/vault.js';

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

async function authenticatedFixture() {
  const env = createD1();
  await ensureAuthSchema(env);
  const session = await createSession(env, 'sterling');
  const now = '2026-07-11T20:00:00.000Z';
  env.database.exec(`
    CREATE TABLE cards (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT,
      character_id TEXT,
      card_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE battle_history (
      id TEXT PRIMARY KEY,
      attempt_id TEXT,
      user_id TEXT NOT NULL,
      encounter_id TEXT NOT NULL,
      victory INTEGER NOT NULL,
      squad_power INTEGER NOT NULL,
      enemy_power INTEGER NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  for (const ownerUserId of ['sterling', 'cydney']) {
    const card = { id: `${ownerUserId}-card`, name: `${ownerUserId} card`, rarity: 'rare', stats: { pow: 10, def: 10, spd: 10 } };
    env.database.prepare('INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(card.id, ownerUserId, ownerUserId, JSON.stringify(card), now, now);
    env.database.prepare('INSERT INTO battle_history (id, attempt_id, user_id, encounter_id, victory, squad_power, enemy_power, result_json, created_at) VALUES (?, ?, ?, ?, 1, 30, 30, ?, ?)').run(`${ownerUserId}-battle`, `${ownerUserId}-attempt`, ownerUserId, 'crossroads-patrol', JSON.stringify({ attemptId: `${ownerUserId}-attempt` }), now);
  }
  return { ...env, cookie: `ctcg_session=${session.token}` };
}

test('Vault ignores caller-supplied owner identity and returns only the signed-in player cards', async () => {
  const env = await authenticatedFixture();
  const request = new Request('https://example.test/api/vault?ownerUserId=cydney', { headers: { cookie: env.cookie } });
  const response = await readVault({ env, request });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.selectedOwnerUserId, 'sterling');
  assert.deepEqual(payload.ownerUserIds, ['sterling']);
  assert.deepEqual(payload.cards.map((card) => card.ownerUserId), ['sterling']);
  assert.equal(payload.cardsByOwner.cydney, undefined);
});

test('battle history ignores caller-supplied owner identity and returns only the signed-in player rows', async () => {
  const env = await authenticatedFixture();
  const request = new Request('https://example.test/api/battle-history?ownerUserId=cydney', { headers: { cookie: env.cookie } });
  const response = await readBattleHistory({ env, request });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ownerUserId, 'sterling');
  assert.deepEqual(payload.battles.map((battle) => battle.userId), ['sterling']);
});
