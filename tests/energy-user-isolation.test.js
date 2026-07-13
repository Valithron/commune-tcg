import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { ensureEnergyColumns, reconcileEnergy } from '../functions/_shared/energy.js';

function createD1() {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE user_resources (
      user_id TEXT PRIMARY KEY,
      pull_tickets INTEGER NOT NULL,
      gold INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return {
    database,
    DB: {
      prepare(sql) {
        const statement = database.prepare(sql);
        return {
          values: [],
          bind(...values) { this.values = values; return this; },
          run() { return statement.run(...this.values); },
          first() { return statement.get(...this.values) || null; },
          all() { return { results: statement.all(...this.values) }; },
        };
      },
    },
  };
}

test('Energy reconciliation is isolated to the authenticated user row', async () => {
  const env = createD1();
  const startedAt = '2026-07-10T18:00:00.000Z';

  env.database.prepare(`
    INSERT INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at)
    VALUES (?, 0, 0, ?, ?), (?, 0, 0, ?, ?)
  `).run('sterling', startedAt, startedAt, 'cydney', startedAt, startedAt);

  await ensureEnergyColumns(env);
  env.database.prepare(`
    UPDATE user_resources
    SET energy = 0, energy_updated_at = ?
  `).run(startedAt);

  await reconcileEnergy(env, {
    userId: 'sterling',
    now: '2026-07-10T18:07:00.000Z',
  });

  const sterling = env.database.prepare(`
    SELECT energy, energy_updated_at AS energyUpdatedAt
    FROM user_resources
    WHERE user_id = ?
  `).get('sterling');
  const cydneyBefore = env.database.prepare(`
    SELECT energy, energy_updated_at AS energyUpdatedAt
    FROM user_resources
    WHERE user_id = ?
  `).get('cydney');

  assert.equal(sterling.energy, 1);
  assert.equal(sterling.energyUpdatedAt, '2026-07-10T18:07:00.000Z');
  assert.equal(cydneyBefore.energy, 0);
  assert.equal(cydneyBefore.energyUpdatedAt, startedAt);

  await reconcileEnergy(env, {
    userId: 'cydney',
    now: '2026-07-10T18:14:00.000Z',
  });

  const sterlingAfter = env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling');
  const cydneyAfter = env.database.prepare(`
    SELECT energy, energy_updated_at AS energyUpdatedAt
    FROM user_resources
    WHERE user_id = ?
  `).get('cydney');

  assert.equal(sterlingAfter.energy, 1);
  assert.equal(cydneyAfter.energy, 2);
  assert.equal(cydneyAfter.energyUpdatedAt, '2026-07-10T18:14:00.000Z');
});
