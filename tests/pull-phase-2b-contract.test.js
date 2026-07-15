import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Pull catalog exposes one live Standard Summon and dormant previews', async () => {
  const source = await read('src/routes/Pull.js');
  assert.equal((source.match(/standard-banner-ic\.png/g) || []).length, 1);
  assert.match(source, /Standard Summon/);
  assert.match(source, /Coming Soon/);
  assert.doesNotMatch(source, /Pull Options/);
  assert.doesNotMatch(source, /data-pull-open="5"/);
});

test('Pull quantity and rates remain in the bottom sheet', async () => {
  const source = await read('src/components/PullConfirmationBottomSheet.js');
  assert.match(source, /renderSheetOption\(pool, 1/);
  assert.match(source, /renderSheetOption\(pool, 5/);
  assert.match(source, /data-pull-rates-layer/);
  assert.match(source, /data-pull-drag-handle/);
  assert.match(source, /beginPullTransaction\(\{ count: selectedCount, source: 'initial', forceNew: true \}\)/);
});

test('Initial Pull uses the required inline cinematic and one transaction coordinator', async () => {
  const cinematic = await read('src/components/PullCinematic.js');
  const transaction = await read('src/services/pullTransaction.js');
  assert.match(cinematic, /\/assets\/core-summon-transition\.MP4/);
  assert.match(cinematic, /autoplay muted playsinline webkit-playsinline/);
  assert.match(cinematic, /resumePendingPullTransaction/);
  assert.match(transaction, /requestId/);
  assert.match(transaction, /fetch\(routes\.pulls/);
  assert.match(transaction, /savePullRevealPayload/);
});

test('Reveal keeps rarity hidden until interaction and supports five-card pacing', async () => {
  const source = await read('src/components/PullRevealModal.js');
  assert.match(source, /pull-reveal-five-layout/);
  assert.match(source, /Reveal All/);
  assert.match(source, /data-rarity=/);
  assert.match(source, /revealRoot\.dataset\.activeRarity = rarity/);
  assert.doesNotMatch(source, /data-rarity="\$\{escapeHtml\(rarity\)\}"[^>]*data-pull-reveal/);
});

test('Pull Again confirms in place and does not replay the cinematic', async () => {
  const source = await read('src/components/PullRevealModal.js');
  assert.match(source, /data-pull-repull/);
  assert.match(source, /source: 'repull'/);
  assert.match(source, /The cinematic will not replay/);
  assert.doesNotMatch(source, /core-summon-transition/);
});

test('Reveal route is full screen and rates use canonical server configuration', async () => {
  const main = await read('src/main.js');
  const catalogApi = await read('functions/api/pull-catalog.js');
  assert.match(main, /pattern: '\/pull\/reveal'.*shell: 'battle'/);
  assert.match(catalogApi, /getRarityOddsPercentages/);
  assert.match(catalogApi, /readPullPool/);
});
