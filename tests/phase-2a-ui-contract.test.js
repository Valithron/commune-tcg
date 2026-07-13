import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Home recommends one live-resource action in the approved priority order', async () => {
  const home = await source('src/routes/Home.js');
  const priorities = [
    'resources.dailyTicketAvailable',
    'resources.pullTickets >= 1',
    'resources.gold >= 1000',
    'resources.energy >= 1',
  ];
  const positions = priorities.map((priority) => home.indexOf(priority));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(home, /home\.next_action_selected/);
  assert.doesNotMatch(home, /mockUser\.streakDays|mockUser\.librarySeen/);
});

test('Pull and Ticket Shop communicate and block known insufficient-resource actions', async () => {
  const [pull, shop, offers] = await Promise.all([
    source('src/routes/Pull.js'),
    source('src/routes/TicketShop.js'),
    source('src/data/mockShop.js'),
  ]);

  assert.match(pull, /canPullOne/);
  assert.match(pull, /canPullFive/);
  assert.match(pull, /pull\.option_selected/);
  assert.match(shop, /unavailable \? 'disabled'/);
  assert.match(shop, /Claimed Today/);
  assert.match(offers, /costGold: 1000/);
  assert.match(offers, /costGold: 2000/);
});

test('collection terminology and card inspections distinguish available designs from owned copies', async () => {
  const [library, vault, modal, styles] = await Promise.all([
    source('src/routes/Library.js'),
    source('src/routes/Vault.js'),
    source('src/components/CardInspectionModal.js'),
    source('src/styles/daily-loop.css'),
  ]);

  assert.match(library, /every available card design/i);
  assert.match(library, /not owned copies/i);
  assert.match(vault, /owned copy/i);
  assert.match(modal, /role="dialog" aria-modal="true"/);
  assert.match(modal, /card\.inspected/);
  assert.match(styles, /\.card-inspection-backdrop[\s\S]*place-items: center/);
  assert.match(styles, /\.pull-reveal-preview \{ place-items: center/);
});

test('account identity is tucked into a navigation menu and Phase 2A telemetry is allowlisted', async () => {
  const [topBar, telemetry] = await Promise.all([
    source('src/components/TopBar.js'),
    source('functions/_shared/telemetry.js'),
  ]);

  assert.match(topBar, /<details class="account-menu"/);
  assert.doesNotMatch(topBar, /class="signed-user-pill"/);
  for (const eventName of ['home.next_action_selected', 'pull.option_selected', 'card.inspected']) {
    assert.ok(telemetry.includes(`'${eventName}'`), `${eventName} should be accepted`);
  }
});
