import test from 'node:test';
import assert from 'node:assert/strict';

import { createBattlePlayback } from '../src/services/battlePlayback.js';

test('concurrent resume taps cannot start duplicate playback loops', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  let completions = 0;
  const classes = new Set();
  const root = {
    classList: {
      add(value) { classes.add(value); },
      remove(value) { classes.delete(value); },
    },
  };
  try {
    const playback = createBattlePlayback({ root, events: [], onComplete() { completions += 1; } });
    const first = playback.play();
    const second = playback.play();
    assert.equal(first, second);
    await Promise.all([first, second]);
    assert.equal(completions, 1);
    assert.equal(classes.has('battle-playback-running'), false);
  } finally {
    globalThis.window = originalWindow;
  }
});
