import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Home is an asset-led Core Commons stage with the approved landmarks', async () => {
  const [home, shell, styles, background] = await Promise.all([
    source('src/routes/Home.js'),
    source('src/components/AppShell.js'),
    source('src/styles/home-commons.css'),
    readFile(new URL('../public/assets/home-background.png', import.meta.url)),
  ]);

  assert.ok(background.byteLength > 0);
  assert.match(home, /home-commons-stage/);
  assert.match(home, /Claim Daily Ticket/);
  assert.match(home, /Use Tickets/);
  assert.match(home, /Enter Battle/);
  assert.match(home, /home-commons-core-summon/);
  assert.match(home, /#\/vault\/card\//);
  assert.match(home, /home\.next_action_selected/);
  assert.doesNotMatch(home, /renderCardFrame/);
  assert.doesNotMatch(home, /home-daily-hero|home-resource-summary|home-collection-layout/);
  assert.doesNotMatch(home, /mockUser\.streakDays|mockUser\.librarySeen/);

  assert.match(shell, /app-shell--home/);
  assert.match(styles, /background-image: url\('\/assets\/home-background\.png'\)/);
  assert.match(styles, /\.home-commons-nameplate \{[\s\S]*left: 31\.6%;[\s\S]*top: 9\.4%;[\s\S]*width: 36\.8%;[\s\S]*height: 3%/);
  assert.match(styles, /\.home-commons-portal \{[\s\S]*left: 36\.9%;[\s\S]*top: 18\.6%;[\s\S]*width: 26\.2%;[\s\S]*height: 19\.8%/);
  assert.match(styles, /\.home-commons-core-summon \{[\s\S]*left: 41\.6%;[\s\S]*top: 46\.4%;[\s\S]*width: 17%;[\s\S]*height: 9\.2%/);
  assert.match(styles, /\.home-commons-daily \{[\s\S]*left: 79\.5%;[\s\S]*top: 19\.4%;[\s\S]*width: 13\.5%;[\s\S]*height: 9\.3%/);
  assert.match(styles, /\.home-commons-library \{[\s\S]*left: 79\.9%;[\s\S]*top: 36\.8%;[\s\S]*width: 13\.7%;[\s\S]*height: 8\.6%/);
  assert.match(styles, /\.home-commons-vault \{[\s\S]*left: 78%;[\s\S]*top: 52%;[\s\S]*width: 17%;[\s\S]*height: 8\.2%/);
  assert.match(styles, /\.home-commons-battle-gate \{[\s\S]*left: 15\.7%;[\s\S]*top: 87\.1%;[\s\S]*width: 68\.6%;[\s\S]*height: 11\.3%/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
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
