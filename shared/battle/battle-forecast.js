/* Isolated-lane forecasts reuse the canonical engine and deliberately exclude
   reinforcement. Exact percentages are server/admin data, never player UI. */

import { FORECAST_VERSION } from './battle-config.js';
import { runBattle } from './battle-engine.js';

export function forecastLabel(winRate) {
  if (winRate >= 0.65) return 'Favored';
  if (winRate <= 0.35) return 'Risky';
  return 'Even';
}

export function simulateLaneForecast({ playerCard, enemyCard, samples = 200, seedPrefix = 'forecast', rules = {} }) {
  let wins = 0;
  for (let index = 0; index < samples; index += 1) {
    const result = runBattle({ player: [{ ...playerCard, lane: 'center' }], enemy: [{ ...enemyCard, lane: 'center' }] }, { seed: `${seedPrefix}:${index}`, rules });
    if (result.outcome === 'victory') wins += 1;
  }
  const winRate = samples > 0 ? wins / samples : 0;
  return { version: FORECAST_VERSION, label: forecastLabel(winRate), winRate, samples, excludesReinforcement: true };
}

export function forecastFormation({ playerCards, enemyCards, samples = 200, seedPrefix = 'formation-forecast', rules = {} }) {
  return playerCards.map((playerCard, index) => simulateLaneForecast({ playerCard, enemyCard: enemyCards[index], samples, seedPrefix: `${seedPrefix}:${playerCard.lane || index}`, rules }));
}

