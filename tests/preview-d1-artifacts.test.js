import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

const root = new URL('../docs/release-hardening/preview-d1/', import.meta.url);
const sql = (name) => readFileSync(new URL(name, root), 'utf8');

test('preview D1 schema and minimum fixtures execute from an empty database', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(sql('001_phase1_schema.sql'));

  database.prepare(`
    INSERT INTO player_auth_users (slot_id, display_name, color)
    VALUES
      ('sterling', 'Sterling', '#c4c5db'),
      ('cydney', 'Cydney', '#789461'),
      ('ryan', 'Ryan', '#a98cff'),
      ('gabi', 'Gabi', '#8ccdff'),
      ('cooper', 'Cooper', '#ff8f70'),
      ('kenly', 'Kenly', '#73e1c2'),
      ('ashley', 'Ashley', '#ff9ccf')
  `).run();

  database.exec(sql('002_phase1_fixtures.sql'));
  database.exec(sql('003_phase1_verify.sql'));

  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM user_resources').get().count, 2);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE owner_user_id = ''").get().count, 5);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE owner_user_id IN ('sterling', 'cydney')").get().count, 6);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE json_valid(card_json) = 0").get().count, 0);
  assert.deepEqual(
    database.prepare('SELECT name FROM pragma_table_info(?) ORDER BY cid').all('user_resources').map((row) => row.name),
    ['user_id', 'pull_tickets', 'gold', 'daily_ticket_claimed_on', 'energy', 'energy_updated_at', 'created_at', 'updated_at']
  );
});

test('preview cleanup removes disposable rows and preserves schema and slots', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(sql('001_phase1_schema.sql'));
  database.prepare(`
    INSERT INTO player_auth_users (slot_id, username, display_name, color, pin_hash)
    VALUES
      ('sterling', 'P1Sterling', 'P1Sterling', '#c4c5db', 'fixture-hash'),
      ('cydney', 'P1Cydney', 'P1Cydney', '#789461', 'fixture-hash')
  `).run();
  database.exec(sql('002_phase1_fixtures.sql'));
  database.exec(sql('004_phase1_cleanup.sql'));

  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM user_resources').get().count, 0);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM cards').get().count, 0);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM player_auth_users').get().count, 2);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM player_auth_users WHERE username IS NOT NULL OR pin_hash IS NOT NULL').get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'telemetry_events'").get().count, 1);
});

test('retry reset removes interrupted-run mutations and preserves approved fixtures', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(sql('001_phase1_schema.sql'));
  database.prepare(`
    INSERT INTO player_auth_users (slot_id, username, display_name, color, pin_hash)
    VALUES
      ('sterling', 'P1Sterling', 'P1Sterling', '#c4c5db', 'fixture-hash'),
      ('cydney', 'P1Cydney', 'P1Cydney', '#789461', 'fixture-hash')
  `).run();
  database.exec(sql('002_phase1_fixtures.sql'));
  database.prepare("INSERT INTO player_auth_sessions (token, slot_id, expires_at) VALUES ('partial-session', 'sterling', 9999999999)").run();
  database.prepare("INSERT INTO user_battle_squads (user_id, squad_card_ids, created_at, updated_at) VALUES ('sterling', 'a,b,c', 'now', 'now')").run();
  database.prepare("INSERT INTO pull_requests (id, user_id, pull_count, ticket_cost, result_json, execution_token, created_at) VALUES ('partial-pull', 'sterling', 1, 1, '{}', 'token', 'now')").run();
  database.prepare("INSERT INTO pull_history (id, user_id, pull_count, ticket_cost, result_json, created_at) VALUES ('partial-pull', 'sterling', 1, 1, '[]', 'now')").run();
  database.prepare("INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at) VALUES ('partial-owned', 'sterling', 'partial', '{}', 'now', 'now')").run();
  database.prepare("UPDATE user_resources SET pull_tickets = 11 WHERE user_id = 'sterling'").run();

  database.exec(sql('005_phase1_retry_reset.sql'));

  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM player_auth_sessions").get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM user_battle_squads").get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM pull_requests").get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM pull_history").get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE id = 'partial-owned'").get().count, 0);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE id LIKE 'phase1_library_%'").get().count, 5);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM cards WHERE id LIKE 'phase1_owned_%'").get().count, 6);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM user_resources WHERE pull_tickets = 12 AND gold = 0 AND energy = 10").get().count, 2);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM player_auth_users WHERE username IS NOT NULL OR pin_hash IS NOT NULL").get().count, 0);
});
