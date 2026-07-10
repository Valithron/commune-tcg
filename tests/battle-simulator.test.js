import test from 'node:test';
import assert from 'node:assert/strict';

import { simulateLaneForecast } from '../shared/battle/battle-forecast.js';
import { formationPermutations, battlesPerLevel, runBattleBatch } from '../shared/battle/battle-simulator.js';

const make = (id, stats, lane = 'center') => ({ id, name: id, stats, lane, type: 'neutral', level: 1 });

test('formation permutations cover all six explicit lane orders', () => {
  const result = formationPermutations([make('a', {}), make('b', {}), make('c', {})]);
  assert.equal(result.length, 6);
  assert.equal(new Set(result.map((formation) => formation.map((card) => card.id).join(','))).size, 6);
  assert.deepEqual(result[0].map((card) => card.lane), ['left', 'center', 'right']);
});

test('batch simulation is reproducible', () => {
  const playerCards = ['left', 'center', 'right'].map((lane, index) => make(`p${index}`, { atk: 10, def: 10, spd: 10 }, lane));
  const enemyCards = ['left', 'center', 'right'].map((lane, index) => make(`e${index}`, { atk: 10, def: 10, spd: 10 }, lane));
  assert.deepEqual(runBattleBatch({ playerCards, enemyCards, iterations: 20, seedPrefix: 'repeat' }), runBattleBatch({ playerCards, enemyCards, iterations: 20, seedPrefix: 'repeat' }));
});

test('lane forecast uses canonical combat and excludes reinforcement', () => {
  const forecast = simulateLaneForecast({ playerCard: make('strong', { atk: 30, def: 30, spd: 30 }), enemyCard: make('weak', { atk: 1, def: 1, spd: 1 }), samples: 40, seedPrefix: 'forecast-test' });
  assert.equal(forecast.label, 'Favored');
  assert.equal(forecast.excludesReinforcement, true);
  assert.equal(forecast.winRate, 1);
});

test('approved XP values produce representative battles-per-level without changing rewards', () => {
  assert.deepEqual(battlesPerLevel({ level: 1 }), { level: 1, xpRequired: 55, ordinaryVictories: 4, firstDailyThenOrdinary: 3, defeats: 11 });
  assert.equal(battlesPerLevel({ level: 30 }).ordinaryVictories, 28);
});
