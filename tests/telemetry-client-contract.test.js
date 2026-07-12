import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('client telemetry remains non-blocking and covers the core Phase 1 session', async () => {
  const telemetry = await readFile(new URL('../src/services/telemetry.js', import.meta.url), 'utf8');
  const sources = await Promise.all([
    '../src/main.js',
    '../src/services/authClient.js',
    '../src/components/PullConfirmationBottomSheet.js',
    '../src/routes/TicketShop.js',
    '../src/services/battleSquadSelection.js',
    '../src/services/battleApi.js',
    '../src/routes/BattleArena.js',
  ].map((path) => readFile(new URL(path, import.meta.url), 'utf8')));
  const combined = sources.join('\n');

  assert.match(telemetry, /fetch\(getApiRoutes\(\)\.telemetry/);
  assert.match(telemetry, /\.catch\(\(\) => \{ console\.warn\('Telemetry delivery failed\.'\); \}\)/);
  assert.match(telemetry, /Telemetry must never change gameplay behavior/);
  for (const eventName of ['session.started', 'route.viewed', 'pull.started', 'pull.completed', 'squad.saved', 'battle.created', 'battle.playback_started', 'battle.completed', 'reward.finalized', 'error.displayed']) {
    assert.ok(combined.includes(eventName) || telemetry.includes(eventName), `${eventName} should be instrumented`);
  }
});

test('telemetry retention is scheduled outside player requests', async () => {
  const [worker, wrangler] = await Promise.all([
    readFile(new URL('../worker.js', import.meta.url), 'utf8'),
    readFile(new URL('../wrangler.toml', import.meta.url), 'utf8'),
  ]);
  assert.match(worker, /async scheduled\(/);
  assert.match(worker, /runTelemetryRetention\(env\)/);
  assert.match(wrangler, /\[triggers\][\s\S]*crons\s*=/);
});

test('telemetry storage failure cannot throw into gameplay', async () => {
  const originals = {
    fetch: globalThis.fetch,
    window: globalThis.window,
    navigator: globalThis.navigator,
    warn: console.warn,
  };
  const storage = new Map();
  try {
    globalThis.window = {
      innerWidth: 390,
      location: { hash: '#/pull' },
      sessionStorage: {
        getItem(key) { return storage.get(key) || null; },
        setItem(key, value) { storage.set(key, value); },
      },
    };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { maxTouchPoints: 1, onLine: true, userAgent: 'test' } });
    globalThis.fetch = () => Promise.reject(new Error('simulated telemetry storage outage'));
    let warnings = 0;
    console.warn = () => { warnings += 1; };
    const { trackTelemetry } = await import(`../src/services/telemetry.js?failure-test=${Date.now()}`);
    assert.doesNotThrow(() => trackTelemetry('route.viewed', { route: '/pull', outcome: 'success' }));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(warnings, 1);
  } finally {
    globalThis.fetch = originals.fetch;
    if (originals.window === undefined) delete globalThis.window; else globalThis.window = originals.window;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originals.navigator });
    console.warn = originals.warn;
  }
});
