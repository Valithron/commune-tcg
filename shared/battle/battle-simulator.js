/* Reproducible batch simulation and balance metrics. No DOM, D1, auth, clock,
   or reward mutation belongs here. */

import { LANES } from './battle-config.js';
import { runBattle } from './battle-engine.js';

export function estimatePlaybackDuration(result, speed = 1) {
  const attacks = result.events.filter((event) => event.type === 'damage').length;
  const criticals = result.events.filter((event) => event.type === 'critical').length;
  const doubleStrikes = result.events.filter((event) => event.type === 'double-strike').length;
  const knockouts = result.events.filter((event) => event.type === 'knockout').length;
  const milliseconds = 2400 + attacks * 800 + criticals * 180 + doubleStrikes * 450 + knockouts * 420 + 1800;
  return milliseconds / Math.max(1, speed) / 1000;
}

export function runBattleBatch({ playerCards, enemyCards, iterations = 1000, seedPrefix = 'batch', rules = {} }) {
  const results = [];
  for (let index = 0; index < iterations; index += 1) {
    const result = runBattle({ player: playerCards, enemy: enemyCards }, { seed: `${seedPrefix}:${index}`, rules });
    const isolatedPlayerWins = playerCards.reduce((wins, playerCard, laneIndex) => {
      const enemyCard = enemyCards[laneIndex];
      const isolated = runBattle({ player: [{ ...playerCard, lane: 'center' }], enemy: [{ ...enemyCard, lane: 'center' }] }, { seed: `${seedPrefix}:${index}:isolated:${laneIndex}`, rules });
      return wins + (isolated.outcome === 'victory' ? 1 : 0);
    }, 0);
    result.analytics.reinforcementReversal = (isolatedPlayerWins >= 2) !== (result.outcome === 'victory');
    results.push(result);
  }
  return summarizeBatch(results);
}

export function summarizeBatch(results) {
  const count = results.length || 1;
  const victories = results.filter((result) => result.outcome === 'victory').length;
  const laneWinCounts = Object.fromEntries(LANES.map((lane) => [lane, 0]));
  const firstLaneBroken = Object.fromEntries(LANES.map((lane) => [lane, 0]));
  const mvpFrequency = {};
  let rounds = 0;
  let firstKnockoutRound = 0;
  let reinforcementAttacks = 0;
  let reinforcementDamage = 0;
  let doubleStrikes = 0;
  let playbackSeconds = 0;
  let playerRemainingHp = 0;
  let enemyRemainingHp = 0;
  let reinforcementReversals = 0;
  for (const result of results) {
    rounds += result.rounds;
    firstKnockoutRound += result.analytics.firstKnockoutRound || result.rounds;
    reinforcementAttacks += result.analytics.reinforcementAttacks;
    reinforcementDamage += result.analytics.reinforcementDamage;
    doubleStrikes += result.analytics.doubleStrikes;
    playbackSeconds += estimatePlaybackDuration(result);
    playerRemainingHp += result.finalState.player.reduce((sum, card) => sum + card.currentHp, 0);
    enemyRemainingHp += result.finalState.enemy.reduce((sum, card) => sum + card.currentHp, 0);
    if (result.analytics.firstLaneBroken) firstLaneBroken[result.analytics.firstLaneBroken] += 1;
    for (const win of result.analytics.laneWins) if (win.winnerSide === 'player') laneWinCounts[win.lane] += 1;
    if (result.mvp) mvpFrequency[result.mvp.cardId] = (mvpFrequency[result.mvp.cardId] || 0) + 1;
    if (result.analytics.reinforcementReversal && result.analytics.reinforcementAttacks > 0) reinforcementReversals += 1;
  }
  return {
    battles: results.length,
    winRate: victories / count,
    laneWinRates: Object.fromEntries(LANES.map((lane) => [lane, laneWinCounts[lane] / count])),
    firstLaneBroken: Object.fromEntries(LANES.map((lane) => [lane, firstLaneBroken[lane] / count])),
    averageFirstKnockoutRound: firstKnockoutRound / count,
    averageRounds: rounds / count,
    averageRemainingHp: { player: playerRemainingHp / count, enemy: enemyRemainingHp / count },
    averageReinforcementAttacks: reinforcementAttacks / count,
    averageReinforcementDamage: reinforcementDamage / count,
    outcomesReversedByReinforcement: reinforcementReversals,
    averageDoubleStrikes: doubleStrikes / count,
    mvpFrequency,
    averagePlaybackSeconds: playbackSeconds / count,
  };
}

export function permutations(cards) {
  if (cards.length <= 1) return [cards];
  return cards.flatMap((card, index) => permutations(cards.filter((_, candidateIndex) => candidateIndex !== index)).map((rest) => [card, ...rest]));
}

export function formationPermutations(cards) {
  return permutations(cards).map((formation) => formation.map((card, index) => ({ ...card, lane: LANES[index] })));
}

export function battlesPerLevel({ level, xpPerVictory = 18, firstDailyBonusXp = 12 }) {
  const required = 40 + level * 15;
  return {
    level,
    xpRequired: required,
    ordinaryVictories: Math.ceil(required / xpPerVictory),
    firstDailyThenOrdinary: 1 + Math.max(0, Math.ceil((required - xpPerVictory - firstDailyBonusXp) / xpPerVictory)),
    defeats: Math.ceil(required / Math.round(xpPerVictory * 0.25)),
  };
}
