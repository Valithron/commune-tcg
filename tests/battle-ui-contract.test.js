import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('active arena has a dedicated battle-only shell and required controls', async () => {
  const [main, arena] = await Promise.all([read('src/main.js'), read('src/routes/BattleArena.js')]);
  assert.match(main, /pattern: '\/battle\/arena'.*shell: 'battle'/);
  assert.match(main, /if \(route\.shell === 'battle'\) return content/);
  for (const hook of ['data-resume-battle','data-pause-speed','data-sound-toggle','data-log-toggle','data-motion-toggle','data-retreat']) assert.match(arena, new RegExp(hook));
  assert.match(arena, /Resume Battle/);
  assert.match(arena, /Skip to Results/);
});

test('formation requires explicit lanes, forecasts, filters, and canonical CardFrame', async () => {
  const source = await read('src/routes/SquadBuilder.js');
  assert.match(source, /\['left', 'center', 'right'\]/);
  assert.match(source, /fetchFormationForecast/);
  assert.match(source, /forecasts exclude reinforcement/i);
  assert.match(source, /data-formation-search/);
  assert.match(source, /data-formation-type/);
  assert.match(source, /data-formation-rarity/);
  assert.match(source, /renderCardFrame/);
});

test('results use persisted MVP and automatic tappable reward queue', async () => {
  const source = await read('src/routes/BattleResults.js');
  assert.match(source, /result\.combat\.mvp/);
  assert.match(source, /rewardQueue\(settlement\)/);
  assert.match(source, /data-reward-skip/);
  assert.doesNotMatch(source, /Reveal Rewards/);
});

test('obsolete aggregate battle resolver and duplicate mock encounter registry are absent', async () => {
  const files = await Promise.all(['functions/api/battles.js','src/routes/BattleResults.js','src/routes/EncounterSelect.js'].map(read));
  const joined = files.join('\n');
  assert.doesNotMatch(joined, /margin >= 0|Effective Squad Power|mockEncounters/);
});

test('mobile overlays fully leave hit testing and async handlers retain their button references', async () => {
  const [arenaCss, flowCss, squad, results] = await Promise.all([
    read('src/styles/battle-arena.css'),
    read('src/styles/battle-flow.css'),
    read('src/routes/SquadBuilder.js'),
    read('src/routes/BattleResults.js'),
  ]);
  assert.match(arenaCss, /\.battle-arena \[hidden\] \{ display:none!important; \}/);
  assert.match(flowCss, /\.battle-results-page \[hidden\] \{ display:none!important; \}/);
  assert.match(flowCss, /\.reward-queue\.is-complete \{ opacity:0; pointer-events:none; \}/);
  assert.match(squad, /const button = event\.currentTarget/);
  assert.doesNotMatch(squad, /await saveBattleSquad[^}]+event\.currentTarget/s);
  assert.match(results, /const button = event\.currentTarget/);
});

test('Worker exposes the documented battle reward contract endpoint', async () => {
  const worker = await readFile(new URL('../worker.js', import.meta.url), 'utf8');
  assert.match(worker, /battleRewardContract/);
  assert.match(worker, /'\/api\/battle-reward-contract': battleRewardContract/);
});
