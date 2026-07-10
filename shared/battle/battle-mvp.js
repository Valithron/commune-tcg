/* Versioned contribution scoring based only on authoritative battle analytics. */

import { MVP_VERSION, MVP_WEIGHTS } from './battle-config.js';

export function scoreBattleMvp(result, weights = MVP_WEIGHTS) {
  if (result.outcome !== 'victory') return null;
  const playerCards = result.finalState.player;
  const scored = playerCards.map((card) => {
    const contribution = result.analytics.cards[card.instanceId] || {};
    const criticalSurvival = card.alive && card.currentHp / card.maxHp < 0.25;
    const score = (contribution.usefulDamage || 0) * weights.usefulDamage
      + (contribution.knockouts || 0) * weights.knockout
      + (contribution.lanesWon || 0) * weights.laneWon
      + (contribution.firstLaneWon ? weights.firstLaneWon : 0)
      + (contribution.reinforcementDamage || 0) * weights.reinforcementDamage
      + (contribution.finalKnockout ? weights.finalKnockout : 0)
      + (card.alive ? weights.survived : 0)
      + (criticalSurvival ? weights.criticalSurvival : 0)
      + (contribution.doubleStrikes || 0) * weights.doubleStrike;
    return { card, contribution, criticalSurvival, score };
  }).sort((a, b) => b.score - a.score || b.contribution.usefulDamage - a.contribution.usefulDamage || a.card.instanceId.localeCompare(b.card.instanceId));
  const winner = scored[0];
  if (!winner) return null;
  return {
    version: MVP_VERSION,
    cardId: winner.card.instanceId,
    cardName: winner.card.name,
    score: Math.round(winner.score * 100) / 100,
    explanation: explainMvp(winner, scored),
    contribution: { ...winner.contribution, criticalSurvival: winner.criticalSurvival },
  };
}

function explainMvp(winner, allScores) {
  const contribution = winner.contribution;
  const clauses = [];
  if (contribution.firstLaneWon) clauses.push('won the first lane');
  if (contribution.reinforcementDamage > 0) {
    const most = Math.max(...allScores.map((item) => item.contribution.reinforcementDamage || 0));
    clauses.push(contribution.reinforcementDamage === most ? 'dealt the most reinforcement damage' : 'added decisive reinforcement damage');
  }
  if (contribution.finalKnockout) clauses.push('landed the final knockout');
  if (winner.criticalSurvival) clauses.push('survived at critically low HP');
  if (clauses.length < 2 && contribution.knockouts > 0) clauses.push(`secured ${contribution.knockouts} knockout${contribution.knockouts === 1 ? '' : 's'}`);
  if (clauses.length < 2) {
    const mostDamage = Math.max(...allScores.map((item) => item.contribution.usefulDamage || 0));
    if (contribution.usefulDamage === mostDamage) clauses.push('removed the most enemy HP');
  }
  const chosen = clauses.slice(0, 2);
  return chosen.length ? `${capitalize(chosen.join(' and '))}.` : 'Made the strongest all-around contribution.';
}

function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

