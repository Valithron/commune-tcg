import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Energy hotfix is server-backed and refreshes the top bar at the recharge boundary', async () => {
  const [energy, endpoint, topBar, styles] = await Promise.all([
    read('functions/_shared/energy.js'),
    read('functions/api/pull-resources.js'),
    read('src/components/TopBar.js'),
    read('src/styles/energy-modal.css'),
  ]);

  assert.match(energy, /ENERGY_MAX = 10/);
  assert.match(energy, /ENERGY_REGEN_INTERVAL_MS = 7 \* 60 \* 1000/);
  assert.match(energy, /WHERE user_id = \?/);
  assert.match(endpoint, /reconcileEnergy\(env, \{ userId: user\.id, now \}\)/);
  assert.match(endpoint, /nextEnergyAt/);
  assert.match(endpoint, /serverNow/);
  assert.match(topBar, /data-energy-pill/);
  assert.match(topBar, /role="dialog"/);
  assert.match(topBar, /Next Energy in/);
  assert.match(topBar, /energyRegenIntervalMs \/ 60000/);
  assert.match(topBar, /requestEnergyRefresh\(\)/);
  assert.match(topBar, /ENERGY_REGEN_INTERVAL_MS_FALLBACK = 7 \* 60 \* 1000/);
  assert.match(topBar, /preferServer: true/);
  assert.match(topBar, /visibilitychange/);
  assert.match(styles, /\.energy-modal-backdrop/);
});
