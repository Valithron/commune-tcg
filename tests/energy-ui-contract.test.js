import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Energy pill opens a live server-backed recharge modal', async () => {
  const [topBar, resources, styles] = await Promise.all([
    readFile(new URL('../src/components/TopBar.js', import.meta.url), 'utf8'),
    readFile(new URL('../functions/api/pull-resources.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/energy-modal.css', import.meta.url), 'utf8'),
  ]);

  assert.match(topBar, /data-energy-pill/);
  assert.match(topBar, /data-energy-modal/);
  assert.match(topBar, /aria-haspopup="dialog"/);
  assert.match(topBar, /Next Energy in/);
  assert.match(topBar, /setInterval\(syncEnergyView,\s*250\)/);
  assert.match(topBar, /requestEnergyRefresh/);
  assert.match(topBar, /visibilitychange/);
  assert.match(topBar, /refreshTopBarResources\(activeRoot/);
  assert.match(topBar, /preferServer:\s*true/);

  assert.match(resources, /ENERGY_REGEN_INTERVAL_MS/);
  assert.match(resources, /nextEnergyAt/);
  assert.match(resources, /serverNow/);
  assert.match(resources, /energyMax:\s*ENERGY_MAX/);

  assert.match(styles, /\.energy-modal-backdrop/);
  assert.match(styles, /\.energy-modal-countdown/);
  assert.match(styles, /\.energy-resource-pill/);
});
