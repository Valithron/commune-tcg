import test from 'node:test';
import assert from 'node:assert/strict';

import { BATTLE_RULES, createBattleRules } from '../shared/battle/battle-config.js';
import { calculateMaxHp, getDoubleStrikeProfile, normalizeCombatCard } from '../shared/battle/battle-contracts.js';
import { calculateCritChance, calculateDamage, getTypeMultiplier } from '../shared/battle/battle-damage.js';
import { createSeededRng } from '../shared/battle/battle-rng.js';
import { replayBattleEvents, runBattle } from '../shared/battle/battle-engine.js';
import { forecastLabel } from '../shared/battle/battle-forecast.js';

const card = (id, lane, stats = { atk: 10, def: 10, spd: 10 }, extra = {}) => ({ id, name: id, lane, level: 1, type: 'neutral', stats, ...extra });
const formation = (prefix, stats) => ['left', 'center', 'right'].map((lane, index) => card(`${prefix}${index}`, lane, stats));

test('seeded RNG repeats the same sequence and separates different seeds', () => {
  const a = createSeededRng('same');
  const b = createSeededRng('same');
  const c = createSeededRng('different');
  const sequenceA = Array.from({ length: 8 }, () => a.next());
  assert.deepEqual(sequenceA, Array.from({ length: 8 }, () => b.next()));
  assert.notDeepEqual(sequenceA, Array.from({ length: 8 }, () => c.next()));
});

test('HP scales universally by level', () => {
  assert.equal(calculateMaxHp(1), 240);
  assert.equal(calculateMaxHp(10), 285);
});

test('damage uses one final rounding, overkill cap, and minimum one', () => {
  const attacker = normalizeCombatCard(card('a', 'left', { atk: 10, def: 10, spd: 10 }));
  const defender = normalizeCombatCard(card('d', 'left', { atk: 10, def: 10_000, spd: 10 }, { currentHp: 1 }));
  const result = calculateDamage({ attacker, defender, rng: createSeededRng('damage'), critical: false });
  assert.equal(result.displayedDamage, 1);
  assert.equal(result.appliedDamage, 1);
});

test('type multipliers follow battle-specific 8/-3 design', () => {
  assert.equal(getTypeMultiplier('flame', 'bloom'), 1.08);
  assert.equal(getTypeMultiplier('flame', 'tide'), 0.97);
  assert.equal(getTypeMultiplier('neutral', 'flame'), 1);
});

test('crit chance is bounded from five to ten percent', () => {
  assert.equal(calculateCritChance({ stats: { atk: 10, def: 10, spd: 10 } }), 0.05);
  assert.equal(calculateCritChance({ stats: { atk: 1, def: 1, spd: 100 } }), 0.10);
});

test('Double-Strike eligibility and all charge tiers are normalized', () => {
  assert.equal(getDoubleStrikeProfile({ atk: 100, def: 100, spd: 114 }).eligible, false);
  assert.equal(getDoubleStrikeProfile({ atk: 100, def: 100, spd: 115 }).chargePerTurn, 17);
  assert.equal(getDoubleStrikeProfile({ atk: 100, def: 100, spd: 125 }).chargePerTurn, 20);
  assert.equal(getDoubleStrikeProfile({ atk: 100, def: 100, spd: 140 }).chargePerTurn, 25);
  assert.equal(getDoubleStrikeProfile({ atk: 100, def: 100, spd: 155 }).chargePerTurn, 34);
});

test('same seed and inputs reproduce identical events and final state', () => {
  const input = { player: formation('p', { atk: 10, def: 10, spd: 10 }), enemy: formation('e', { atk: 10, def: 10, spd: 10 }) };
  assert.deepEqual(runBattle(input, { seed: 'determinism' }), runBattle(input, { seed: 'determinism' }));
});

test('round order snapshots highest SPD and rerolls equal ties by round', () => {
  const result = runBattle({ player: formation('p', { atk: 5, def: 40, spd: 20 }), enemy: formation('e', { atk: 5, def: 40, spd: 20 }) }, { seed: 'ties' });
  const orders = result.events.filter((event) => event.type === 'turn-order');
  assert.ok(orders.length > 1);
  assert.notDeepEqual(orders[0].order.map((entry) => entry.actorId), orders[1].order.map((entry) => entry.actorId));
});

test('a knockout cancels the defeated card pending turn and ends immediately after final knockout', () => {
  const player = [card('p0', 'left', { atk: 100, def: 10, spd: 100 }), card('p1', 'center', { atk: 100, def: 10, spd: 2 }), card('p2', 'right', { atk: 100, def: 10, spd: 2 })];
  const enemy = [card('e0', 'left', { atk: 1, def: 1, spd: 5 }), card('e1', 'center', { atk: 1, def: 1, spd: 20 }), card('e2', 'right', { atk: 1, def: 1, spd: 20 })];
  const result = runBattle({ player, enemy }, { seed: 'cancel' });
  assert.ok(result.events.some((event) => event.type === 'turn-cancelled'));
  const finalIndex = result.events.findIndex((event) => event.type === 'final-knockout');
  const endIndex = result.events.findIndex((event) => event.type === 'battle-end');
  assert.ok(finalIndex >= 0 && endIndex > finalIndex);
  assert.equal(result.events.slice(finalIndex + 1, endIndex).some((event) => event.type === 'damage'), false);
});

test('side lane winners route to center and reinforcement is identified', () => {
  const player = [card('p-left', 'left', { atk: 100, def: 20, spd: 30 }), card('p-center', 'center', { atk: 1, def: 30, spd: 5 }), card('p-right', 'right', { atk: 1, def: 30, spd: 4 })];
  const enemy = [card('e-left', 'left', { atk: 1, def: 1, spd: 1 }), card('e-center', 'center', { atk: 1, def: 50, spd: 1 }), card('e-right', 'right', { atk: 1, def: 50, spd: 1 })];
  const result = runBattle({ player, enemy }, { seed: 'routing' });
  assert.ok(result.events.some((event) => event.type === 'target-selected' && event.actorId === 'p-left' && event.targetId === 'e-center' && event.reinforcement));
});

test('center winner reinforces the lower allied HP side', () => {
  const player = [card('p-left', 'left', { atk: 1, def: 20, spd: 1 }, { currentHp: 60 }), card('p-center', 'center', { atk: 100, def: 20, spd: 50 }), card('p-right', 'right', { atk: 1, def: 20, spd: 1 }, { currentHp: 200 })];
  const enemy = [card('e-left', 'left', { atk: 1, def: 30, spd: 1 }), card('e-center', 'center', { atk: 1, def: 1, spd: 1 }), card('e-right', 'right', { atk: 1, def: 30, spd: 1 })];
  const result = runBattle({ player, enemy }, { seed: 'center-routing' });
  assert.ok(result.events.some((event) => event.type === 'target-selected' && event.actorId === 'p-center' && event.targetId === 'e-left' && event.reinforcement));
});

test('legal retargeting prevents an allied reinforcement knockout from wasting a turn', () => {
  const player = [card('p-left', 'left', { atk: 100, def: 20, spd: 60 }), card('p-center', 'center', { atk: 20, def: 20, spd: 10 }), card('p-right', 'right', { atk: 1, def: 30, spd: 2 })];
  const enemy = [card('e-left', 'left', { atk: 1, def: 1, spd: 1 }), card('e-center', 'center', { atk: 1, def: 1, spd: 1 }), card('e-right', 'right', { atk: 1, def: 40, spd: 1 })];
  const result = runBattle({ player, enemy }, { seed: 'retarget' });
  assert.ok(result.events.some((event) => event.type === 'target-selected' && event.actorId === 'p-center' && event.targetId === 'e-right'));
});

test('Double-Strike spends 100 with overflow, cannot crit, and does not retarget after a lane-killing normal hit', () => {
  const specialist = card('specialist', 'left', { atk: 30, def: 10, spd: 50 }, { doubleStrike: { charge: 90 } });
  const player = [specialist, card('p-center', 'center', { atk: 1, def: 50, spd: 1 }), card('p-right', 'right', { atk: 1, def: 50, spd: 1 })];
  const enemy = [card('e-left', 'left', { atk: 1, def: 1, spd: 1 }, { currentHp: 20 }), card('e-center', 'center', { atk: 1, def: 60, spd: 1 }), card('e-right', 'right', { atk: 1, def: 60, spd: 1 })];
  const result = runBattle({ player, enemy }, { seed: 'double-strike' });
  const firstKnockout = result.events.find((event) => event.type === 'knockout' && event.targetId === 'e-left');
  const firstDouble = result.events.find((event) => event.type === 'double-strike' && event.actorId === 'specialist');
  assert.ok(firstDouble.round > firstKnockout.round);
  const doubleDamage = result.events.filter((event) => event.type === 'damage' && event.doubleStrike);
  assert.ok(doubleDamage.length > 0);
  assert.equal(doubleDamage.some((event) => event.critical), false);
  assert.ok(result.events.some((event) => event.type === 'double-strike' && event.chargeAfter >= 0 && event.chargeAfter < 100));
});

test('display damage retains overkill while useful contribution is capped', () => {
  const result = runBattle({ player: [card('a', 'center', { atk: 100, def: 1, spd: 10 })], enemy: [card('d', 'center', { atk: 1, def: 1, spd: 1 }, { currentHp: 5 })] }, { seed: 'overkill' });
  const damage = result.events.find((event) => event.type === 'damage');
  assert.ok(damage.displayedDamage > damage.appliedDamage);
  assert.equal(damage.appliedDamage, 5);
  assert.equal(result.analytics.cards.a.usefulDamage, 5);
});

test('event replay reconstructs authoritative HP and charge state', () => {
  const result = runBattle({ player: formation('p', { atk: 10, def: 10, spd: 20 }), enemy: formation('e', { atk: 10, def: 10, spd: 10 }) }, { seed: 'replay' });
  assert.deepEqual(replayBattleEvents(result.initialState, result.events), result.finalState);
});

test('cross-lane multiplier changes reinforcement damage and is recorded', () => {
  const player = [card('p-left', 'left', { atk: 100, def: 30, spd: 30 }), card('p-center', 'center', { atk: 1, def: 30, spd: 5 }), card('p-right', 'right', { atk: 1, def: 30, spd: 4 })];
  const enemy = [card('e-left', 'left', { atk: 1, def: 1, spd: 1 }), card('e-center', 'center', { atk: 1, def: 50, spd: 1 }), card('e-right', 'right', { atk: 1, def: 50, spd: 1 })];
  const full = runBattle({ player, enemy }, { seed: 'cross', rules: { crossLaneMultiplier: 1 } });
  const taxed = runBattle({ player, enemy }, { seed: 'cross', rules: { crossLaneMultiplier: 0.70 } });
  const firstFull = full.events.find((event) => event.type === 'damage' && event.reinforcement);
  const firstTaxed = taxed.events.find((event) => event.type === 'damage' && event.reinforcement);
  assert.ok(firstFull.displayedDamage > firstTaxed.displayedDamage);
  assert.equal(firstTaxed.damageMultiplier, 0.70);
});

test('forecast labels honor approved thresholds', () => {
  assert.equal(forecastLabel(0.65), 'Favored');
  assert.equal(forecastLabel(0.64), 'Even');
  assert.equal(forecastLabel(0.36), 'Even');
  assert.equal(forecastLabel(0.35), 'Risky');
});

test('production rules default cross-lane damage to 100%', () => {
  assert.equal(BATTLE_RULES.crossLaneMultiplier, 1);
  assert.equal(createBattleRules().crossLaneMultiplier, 1);
});
