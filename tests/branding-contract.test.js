import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const activeBrandFiles = [
  'index.html',
  'src/components/TopBar.js',
  'src/components/AdminShell.js',
  'src/routes/SignIn.js',
  'src/routes/Home.js',
];

test('primary product surfaces identify the game as Imago Core', async () => {
  const contents = await Promise.all(activeBrandFiles.map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.ok(contents.every((content) => content.includes('Imago Core') || content.includes('<span class="brand-kicker">Imago</span>')));
  assert.ok(contents.every((content) => !/Commune TCG|Gacha Prototype|Gacha Admin/.test(content)));
});

test('the install manifest uses the Imago Core identity and master palette', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'Imago Core');
  assert.equal(manifest.short_name, 'Imago Core');
  assert.equal(manifest.theme_color, '#070A18');
});
