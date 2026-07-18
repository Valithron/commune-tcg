import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('every player route uses the standard or immersive 30rem shell', async () => {
  const main = await read('src/main.js');
  const routeLines = main.split('\n').filter((line) => line.includes("{ pattern: '/"));
  const playerRoutes = routeLines.filter((line) => !line.includes("pattern: '/admin"));

  assert.ok(playerRoutes.length >= 17, 'expected the complete player route table');
  playerRoutes.forEach((line) => {
    assert.match(line, /shell: '(player|immersive-player)'/, `uncontained player route: ${line.trim()}`);
  });

  assert.doesNotMatch(main, /shell: 'battle'/);
  assert.doesNotMatch(main, /route\.shell === 'battle'/);
  assert.match(main, /pattern: '\/battle\/arena'.*shell: 'immersive-player'/);
  assert.match(main, /pattern: '\/pull\/reveal'.*shell: 'immersive-player'/);
});

test('standard and immersive player shells share the 30rem chassis contract', async () => {
  const components = await read('src/styles/components.css');
  const containment = await read('src/styles/shell-containment.css');
  const tokens = await read('src/styles/tokens.css');

  assert.match(tokens, /--app-max-width:\s*30rem/);
  assert.match(components, /\.app-shell\s*\{[\s\S]*width:\s*min\(100%,\s*var\(--app-max-width\)\)/);
  assert.match(containment, /\.app-shell--immersive\s*\{[\s\S]*max-width:\s*30rem/);
  assert.match(containment, /\.screen-stack--immersive\s*>\s*\*[\s\S]*max-width:\s*100%/);
});

test('battle arena is shell-native rather than desktop-viewport fixed', async () => {
  const battle = await read('src/styles/battle-arena.css');

  assert.match(battle, /\.battle-arena\s*\{[\s\S]*position:\s*relative/);
  assert.match(battle, /\.battle-arena\s*\{[\s\S]*max-width:\s*30rem/);
  assert.doesNotMatch(battle, /\.battle-arena\s*\{[^}]*position:\s*fixed/);
  assert.doesNotMatch(battle, /width:\s*min\(100%,\s*1050px\)/);
  assert.match(battle, /\.battle-field\s*\{[\s\S]*width:\s*100%/);
  assert.match(battle, /\.battle-inspection\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test('all player-level fixed overlays are bounded to the mobile chassis', async () => {
  const containment = await read('src/styles/shell-containment.css');
  const expectedOverlays = [
    'pull-sheet-overlay',
    'pull-rates-overlay',
    'pull-reveal-preview',
    'pull-repull-overlay',
    'card-inspection-backdrop',
    'energy-modal-backdrop',
  ];

  expectedOverlays.forEach((className) => {
    assert.match(containment, new RegExp(`\\.${className}`), `missing shell bound for ${className}`);
  });

  assert.match(containment, /width:\s*min\(100%,\s*var\(--app-max-width\)\)/);
  assert.match(containment, /max-width:\s*30rem/);
});

test('sign-in is a player-width surface', async () => {
  const auth = await read('src/styles/auth.css');

  assert.match(auth, /\.auth-screen\s*\{[\s\S]*width:\s*min\(100%,\s*var\(--app-max-width\)\)/);
  assert.match(auth, /\.auth-screen\s*\{[\s\S]*max-width:\s*30rem/);
  assert.match(auth, /\.auth-panel\s*\{[\s\S]*width:\s*100%/);
  assert.doesNotMatch(auth, /width:\s*min\(760px,\s*100%\)/);
});