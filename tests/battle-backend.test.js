import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { createPendingBattleAttempt, finalizeBattleAttempt, readAttempt } from '../functions/_shared/battle-attempts.js';
import { ENERGY_MAX, ENERGY_REGEN_INTERVAL_MS, ensureEnergyColumns, reconcileEnergy } from '../functions/_shared/energy.js';

function createD1() {
  const database = new DatabaseSync(':memory:');
  database.exec(`CREATE TABLE cards (id TEXT PRIMARY KEY, owner_user_id TEXT, character_id TEXT, card_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE user_resources (user_id TEXT PRIMARY KEY, pull_tickets INTEGER NOT NULL, gold INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
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
      try { const results = statements.map((statement) => statement._run()); database.exec('COMMIT'); return results; }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  return { DB, database };
}

function seedUser(database, userId = 'sterling') {
  const now = '2026-07-10T18:00:00.000Z';
  database.prepare('INSERT INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at) VALUES (?, 0, 0, ?, ?)').run(userId, now, now);
  for (let index = 0; index < 3; index += 1) {
    const payload = { id: `card-${index}`, name: `Card ${index}`, type: index === 0 ? 'tide' : 'radiant', rarity: 'rare', level: 5, xp: 0, maxLevel: 50, stats: { pow: 36, def: 26, spd: 24 }, imageUrl: '' };
    database.prepare('INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(`card-${index}`, userId, `character-${index}`, JSON.stringify(payload), now, now);
  }
}

test('attempt creation preserves lane order, spends Energy once, and duplicate create is idempotent', async () => {
  const env = createD1(); seedUser(env.database);
  const input = { userId: 'sterling', userDisplayName: 'Sterling', attemptId: 'attempt_backend_001', encounterId: 'crossroads-patrol', orderedCardIds: ['card-2', 'card-0', 'card-1'], now: '2026-07-10T18:00:00.000Z' };
  const first = await createPendingBattleAttempt(env, input);
  assert.equal(first.ok, true);
  assert.equal(first.attempt.status, 'pending');
  assert.deepEqual(first.attempt.orderedCardIds, input.orderedCardIds);
  assert.deepEqual(first.attempt.result.playerSnapshot.map((card) => card.lane), ['left', 'center', 'right']);
  assert.equal(env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling').energy, 9);
  const duplicate = await createPendingBattleAttempt(env, input);
  assert.equal(duplicate.idempotent, true);
  assert.equal(env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling').energy, 9);
  const secondActive = await createPendingBattleAttempt(env, { ...input, attemptId: 'attempt_backend_001b' });
  assert.equal(secondActive.code, 'pending-battle-exists');
  assert.equal(env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling').energy, 9);
});

test('finalization applies stored rewards once and first daily bonus once', async () => {
  const env = createD1(); seedUser(env.database);
  const create = await createPendingBattleAttempt(env, { userId: 'sterling', userDisplayName: 'Sterling', attemptId: 'attempt_backend_002', encounterId: 'crossroads-patrol', orderedCardIds: ['card-0', 'card-1', 'card-2'], now: '2026-07-10T18:00:00.000Z' });
  assert.equal(create.attempt.result.combat.outcome, 'victory');
  const first = await finalizeBattleAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_002', now: '2026-07-10T18:01:00.000Z' });
  assert.equal(first.settlement.reward.gold, 60);
  assert.equal(first.settlement.reward.xpPerCard, 30);
  assert.equal(first.attempt.status, 'finalized');
  const gold = env.database.prepare('SELECT gold FROM user_resources WHERE user_id = ?').get('sterling').gold;
  const duplicate = await finalizeBattleAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_002', now: '2026-07-10T18:02:00.000Z' });
  assert.equal(duplicate.idempotent, true);
  assert.equal(env.database.prepare('SELECT gold FROM user_resources WHERE user_id = ?').get('sterling').gold, gold);
  assert.equal(env.database.prepare('SELECT COUNT(*) AS count FROM battle_history').get().count, 1);
  const secondCreate = await createPendingBattleAttempt(env, { userId: 'sterling', userDisplayName: 'Sterling', attemptId: 'attempt_backend_002b', encounterId: 'crossroads-patrol', orderedCardIds: ['card-0', 'card-1', 'card-2'], now: '2026-07-10T19:00:00.000Z' });
  assert.equal(secondCreate.ok, true);
  const second = await finalizeBattleAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_002b', now: '2026-07-10T19:01:00.000Z' });
  assert.equal(second.settlement.reward.firstDailyVictory, false);
  assert.equal(second.settlement.reward.gold, 20);
  assert.equal(second.settlement.reward.xpPerCard, 18);
});

test('retreat spends committed Energy, grants defeat XP once, and blocks later victory settlement', async () => {
  const env = createD1(); seedUser(env.database);
  await createPendingBattleAttempt(env, { userId: 'sterling', userDisplayName: 'Sterling', attemptId: 'attempt_backend_003', encounterId: 'crossroads-patrol', orderedCardIds: ['card-0', 'card-1', 'card-2'], now: '2026-07-10T18:00:00.000Z' });
  const retreated = await finalizeBattleAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_003', surrender: true, now: '2026-07-10T18:01:00.000Z' });
  assert.equal(retreated.attempt.status, 'surrendered');
  assert.equal(retreated.settlement.reward.gold, 0);
  assert.equal(retreated.settlement.reward.xpPerCard, 5);
  assert.equal(env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling').energy, 9);
  const retry = await finalizeBattleAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_003', surrender: false, now: '2026-07-10T18:02:00.000Z' });
  assert.equal(retry.idempotent, true);
  assert.equal(retry.attempt.status, 'surrendered');
  assert.equal(retry.settlement.reward.gold, 0);
});

test('insufficient Energy rejects creation without an attempt write', async () => {
  const env = createD1(); seedUser(env.database);
  env.database.prepare('ALTER TABLE user_resources ADD COLUMN energy INTEGER NOT NULL DEFAULT 10').run();
  env.database.prepare('UPDATE user_resources SET energy = 0 WHERE user_id = ?').run('sterling');
  const result = await createPendingBattleAttempt(env, { userId: 'sterling', userDisplayName: 'Sterling', attemptId: 'attempt_backend_004', encounterId: 'crossroads-patrol', orderedCardIds: ['card-0', 'card-1', 'card-2'], now: '2026-07-10T18:00:00.000Z' });
  assert.equal(result.code, 'insufficient-energy');
  const attempt = await readAttempt(env, { userId: 'sterling', attemptId: 'attempt_backend_004' });
  assert.equal(attempt, null);
});

test('Energy regenerates only for complete intervals and preserves partial elapsed time', async () => {
  const env = createD1(); seedUser(env.database);
  await ensureEnergyColumns(env);
  env.database.prepare('UPDATE user_resources SET energy = 2, energy_updated_at = ? WHERE user_id = ?').run('2026-07-10T18:00:00.000Z', 'sterling');

  const partial = await reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:06:59.000Z' });
  assert.equal(partial.energy, 2);
  assert.equal(partial.regenerated, 0);
  assert.equal(partial.energyUpdatedAt, '2026-07-10T18:00:00.000Z');

  const oneInterval = await reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:07:00.000Z' });
  assert.equal(oneInterval.energy, 3);
  assert.equal(oneInterval.regenerated, 1);
  assert.equal(oneInterval.energyUpdatedAt, '2026-07-10T18:07:00.000Z');

  const multiple = await reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:28:00.000Z' });
  assert.equal(multiple.energy, 6);
  assert.equal(multiple.regenerated, 3);
  assert.equal(multiple.energyUpdatedAt, '2026-07-10T18:28:00.000Z');
  assert.equal(ENERGY_REGEN_INTERVAL_MS, 7 * 60 * 1000);
});

test('Energy regeneration caps at ten and does not accumulate time above the cap', async () => {
  const env = createD1(); seedUser(env.database);
  await ensureEnergyColumns(env);
  env.database.prepare('UPDATE user_resources SET energy = 9, energy_updated_at = ? WHERE user_id = ?').run('2026-07-10T18:00:00.000Z', 'sterling');

  const result = await reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T20:00:00.000Z' });
  assert.equal(result.energy, ENERGY_MAX);
  assert.equal(result.regenerated, 1);
  assert.equal(result.energyUpdatedAt, '2026-07-10T20:00:00.000Z');

  const repeated = await reconcileEnergy(env, { userId: 'sterling', now: '2026-07-11T20:00:00.000Z' });
  assert.equal(repeated.energy, ENERGY_MAX);
  assert.equal(repeated.regenerated, 0);
  assert.equal(env.database.prepare('SELECT energy FROM user_resources WHERE user_id = ?').get('sterling').energy, ENERGY_MAX);
});

test('missing, malformed, and future Energy timestamps backfill without granting Energy', async () => {
  const env = createD1(); seedUser(env.database);
  await ensureEnergyColumns(env);
  const now = '2026-07-10T20:00:00.000Z';

  for (const [timestamp, expectedStatus] of [
    [null, 'backfilled-missing'],
    ['not-a-date', 'backfilled-malformed'],
    ['2026-07-10T21:00:00.000Z', 'backfilled-future'],
  ]) {
    env.database.prepare('UPDATE user_resources SET energy = 4, energy_updated_at = ? WHERE user_id = ?').run(timestamp, 'sterling');
    const result = await reconcileEnergy(env, { userId: 'sterling', now });
    assert.equal(result.energy, 4);
    assert.equal(result.regenerated, 0);
    assert.equal(result.timestampStatus, expectedStatus);
    assert.equal(result.energyUpdatedAt, now);
    const repeated = await reconcileEnergy(env, { userId: 'sterling', now });
    assert.equal(repeated.energy, 4);
    assert.equal(repeated.regenerated, 0);
  }
});

test('repeated Energy reconciliation cannot duplicate a completed interval', async () => {
  const env = createD1(); seedUser(env.database);
  await ensureEnergyColumns(env);
  env.database.prepare('UPDATE user_resources SET energy = 1, energy_updated_at = ? WHERE user_id = ?').run('2026-07-10T18:00:00.000Z', 'sterling');

  await Promise.all([
    reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:07:00.000Z' }),
    reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:07:00.000Z' }),
    reconcileEnergy(env, { userId: 'sterling', now: '2026-07-10T18:07:00.000Z' }),
  ]);

  const row = env.database.prepare('SELECT energy, energy_updated_at AS energyUpdatedAt FROM user_resources WHERE user_id = ?').get('sterling');
  assert.equal(row.energy, 2);
  assert.equal(row.energyUpdatedAt, '2026-07-10T18:07:00.000Z');
});

test('battle creation reconciles Energy before validation and preserves partial recharge progress', async () => {
  const env = createD1(); seedUser(env.database);
  await ensureEnergyColumns(env);
  env.database.prepare('UPDATE user_resources SET energy = 0, energy_updated_at = ? WHERE user_id = ?').run('2026-07-10T18:00:00.000Z', 'sterling');

  const result = await createPendingBattleAttempt(env, {
    userId: 'sterling',
    userDisplayName: 'Sterling',
    attemptId: 'attempt_backend_regenerated',
    encounterId: 'crossroads-patrol',
    orderedCardIds: ['card-0', 'card-1', 'card-2'],
    now: '2026-07-10T18:10:00.000Z',
  });

  assert.equal(result.ok, true);
  assert.equal(result.energyAfter, 0);
  const row = env.database.prepare('SELECT energy, energy_updated_at AS energyUpdatedAt FROM user_resources WHERE user_id = ?').get('sterling');
  assert.equal(row.energy, 0);
  assert.equal(row.energyUpdatedAt, '2026-07-10T18:07:00.000Z');
});
