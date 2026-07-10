/* Canonical deterministic 3-lane combat engine. It performs no I/O, reads no
   clock, uses no DOM, and never calls Math.random. */

import { BATTLE_RULES_VERSION, LANES, createBattleRules } from './battle-config.js';
import { normalizeBattleInput, publicCardSnapshot } from './battle-contracts.js';
import { calculateDamage } from './battle-damage.js';
import { createSeededRng } from './battle-rng.js';
import { scoreBattleMvp } from './battle-mvp.js';

function opposingSide(side) { return side === 'player' ? 'enemy' : 'player'; }
function hpPercent(card) { return card.maxHp > 0 ? card.currentHp / card.maxHp : 0; }
function cardKey(card) { return `${card.side}:${card.instanceId}`; }

export function runBattle(input, options = {}) {
  const rules = createBattleRules(options.rules || {});
  if (options.rulesVersion && options.rulesVersion !== BATTLE_RULES_VERSION) throw new Error(`Unsupported battle rules version: ${options.rulesVersion}`);
  const rng = createSeededRng(options.seed ?? input.seed);
  const normalized = normalizeBattleInput(input, rules);
  const cards = [...normalized.player, ...normalized.enemy].map((card) => ({ ...card, stats: { ...card.stats }, doubleStrike: { ...card.doubleStrike } }));
  const byId = new Map(cards.map((card) => [card.instanceId, card]));
  const events = [];
  const analytics = { cards: {}, laneWins: [], firstLaneBroken: null, firstKnockoutRound: null, reinforcementAttacks: 0, reinforcementDamage: 0, doubleStrikes: 0 };
  cards.forEach((card) => { analytics.cards[card.instanceId] = { usefulDamage: 0, displayedDamage: 0, overkill: 0, knockouts: 0, lanesWon: 0, firstLaneWon: false, reinforcementAttacks: 0, reinforcementDamage: 0, doubleStrikes: 0, criticalHits: 0, finalKnockout: false }; });
  let sequence = 0;
  let round = 0;
  let winner = null;
  let battleEnded = false;

  const emit = (type, payload = {}) => {
    const event = { sequence: ++sequence, type, round, ...payload };
    events.push(event);
    return event;
  };
  const living = (side) => cards.filter((card) => card.side === side && card.alive);
  const snapshot = () => ({ player: cards.filter((card) => card.side === 'player').map(publicCardSnapshot), enemy: cards.filter((card) => card.side === 'enemy').map(publicCardSnapshot) });

  emit('battle-start', { rulesVersion: rules.version, seed: rng.seed, crossLaneMultiplier: rules.crossLaneMultiplier, state: snapshot() });

  while (!battleEnded && round < rules.maxRounds) {
    round += 1;
    emit('round-start', { state: snapshot() });
    const scheduled = buildTurnOrder(cards.filter((card) => card.alive), rng);
    emit('turn-order', { order: scheduled.map((card) => ({ actorId: card.instanceId, side: card.side, lane: card.lane, spd: card.stats.spd })) });

    for (const scheduledCard of scheduled) {
      const actor = byId.get(scheduledCard.instanceId);
      if (!actor?.alive) {
        emit('turn-cancelled', { actorId: scheduledCard.instanceId, side: scheduledCard.side, reason: 'knocked-out-before-turn' });
        continue;
      }
      emit('turn-start', { actorId: actor.instanceId, side: actor.side, hp: actor.currentHp });
      if (actor.doubleStrike.eligible) {
        const before = actor.doubleStrike.charge;
        actor.doubleStrike.charge += actor.doubleStrike.chargePerTurn;
        emit('charge-gained', { actorId: actor.instanceId, before, gained: actor.doubleStrike.chargePerTurn, after: actor.doubleStrike.charge, threshold: rules.doubleStrike.threshold });
        if (before < rules.doubleStrike.threshold && actor.doubleStrike.charge >= rules.doubleStrike.threshold) emit('double-strike-ready', { actorId: actor.instanceId, charge: actor.doubleStrike.charge });
      }
      const target = selectTarget(actor, cards, rng);
      if (!target) continue;
      const reinforcement = target.lane !== actor.lane;
      emit('target-selected', { actorId: actor.instanceId, targetId: target.instanceId, actorLane: actor.lane, targetLane: target.lane, reinforcement });
      const normalResult = resolveHit({ actor, target, reinforcement, isDoubleStrike: false, rules, rng, emit, analytics, living });
      if (normalResult.battleEnded) { winner = actor.side; battleEnded = true; break; }

      if (actor.doubleStrike.eligible && actor.doubleStrike.charge >= rules.doubleStrike.threshold && target.alive) {
        const before = actor.doubleStrike.charge;
        actor.doubleStrike.charge -= rules.doubleStrike.threshold;
        emit('double-strike', { actorId: actor.instanceId, targetId: target.instanceId, chargeBefore: before, chargeAfter: actor.doubleStrike.charge });
        analytics.cards[actor.instanceId].doubleStrikes += 1;
        analytics.doubleStrikes += 1;
        const doubleResult = resolveHit({ actor, target, reinforcement, isDoubleStrike: true, rules, rng, emit, analytics, living });
        if (doubleResult.battleEnded) { winner = actor.side; battleEnded = true; break; }
      }
    }
  }

  if (!winner) {
    const playerHp = living('player').reduce((sum, card) => sum + card.currentHp, 0);
    const enemyHp = living('enemy').reduce((sum, card) => sum + card.currentHp, 0);
    winner = playerHp >= enemyHp ? 'player' : 'enemy';
    battleEnded = true;
    emit('battle-limit-reached', { playerHp, enemyHp, winner });
  }
  const finalState = snapshot();
  for (const card of cards) analytics.cards[card.instanceId].survived = card.alive;
  const outcome = winner === 'player' ? 'victory' : 'defeat';
  const result = {
    rulesVersion: rules.version,
    seed: rng.seed,
    outcome,
    winner,
    rounds: round,
    events,
    initialState: events[0].state,
    finalState,
    analytics,
    rng: rng.snapshot(),
  };
  result.mvp = scoreBattleMvp(result);
  emit('battle-end', { outcome, winner, rounds: round, finalState, mvp: result.mvp });
  if (result.mvp) emit('mvp-awarded', { ...result.mvp });
  result.events = events;
  return result;
}

function buildTurnOrder(livingCards, rng) {
  const grouped = new Map();
  for (const card of livingCards) {
    const group = grouped.get(card.stats.spd) || [];
    group.push(card);
    grouped.set(card.stats.spd, group);
  }
  return [...grouped.keys()].sort((a, b) => b - a).flatMap((spd) => rng.shuffle(grouped.get(spd)));
}

function selectTarget(actor, cards, rng) {
  const enemies = cards.filter((card) => card.side === opposingSide(actor.side) && card.alive);
  const home = enemies.find((card) => card.lane === actor.lane);
  if (home) return home;
  if (!enemies.length) return null;
  if (enemies.length === 1) return enemies[0];
  if (actor.lane !== 'center') return enemies.find((card) => card.lane === 'center') || enemies[0];
  const leftEnemy = enemies.find((card) => card.lane === 'left');
  const rightEnemy = enemies.find((card) => card.lane === 'right');
  if (!leftEnemy || !rightEnemy) return leftEnemy || rightEnemy || enemies[0];
  const allies = cards.filter((card) => card.side === actor.side && card.alive);
  const leftAlly = allies.find((card) => card.lane === 'left');
  const rightAlly = allies.find((card) => card.lane === 'right');
  const leftAllyHp = leftAlly ? hpPercent(leftAlly) : 0;
  const rightAllyHp = rightAlly ? hpPercent(rightAlly) : 0;
  if (leftAllyHp !== rightAllyHp) return leftAllyHp < rightAllyHp ? leftEnemy : rightEnemy;
  const leftEnemyHp = hpPercent(leftEnemy);
  const rightEnemyHp = hpPercent(rightEnemy);
  if (leftEnemyHp !== rightEnemyHp) return leftEnemyHp < rightEnemyHp ? leftEnemy : rightEnemy;
  return rng.pick([leftEnemy, rightEnemy]);
}

function resolveHit({ actor, target, reinforcement, isDoubleStrike, rules, rng, emit, analytics, living }) {
  const crossLaneMultiplier = reinforcement ? rules.crossLaneMultiplier : 1;
  const damageMultiplier = crossLaneMultiplier * (isDoubleStrike ? rules.doubleStrike.damageMultiplier : 1);
  emit('attack-start', { actorId: actor.instanceId, targetId: target.instanceId, reinforcement, doubleStrike: isDoubleStrike });
  const beforeHp = target.currentHp;
  const damage = calculateDamage({ attacker: actor, defender: target, rng, rules, canCrit: !isDoubleStrike, damageMultiplier });
  target.currentHp = Math.max(0, target.currentHp - damage.appliedDamage);
  target.alive = target.currentHp > 0;
  const contribution = analytics.cards[actor.instanceId];
  contribution.usefulDamage += damage.appliedDamage;
  contribution.displayedDamage += damage.displayedDamage;
  contribution.overkill += damage.overkill;
  if (damage.critical) contribution.criticalHits += 1;
  if (reinforcement) {
    contribution.reinforcementAttacks += 1;
    contribution.reinforcementDamage += damage.appliedDamage;
    analytics.reinforcementAttacks += 1;
    analytics.reinforcementDamage += damage.appliedDamage;
  }
  emit('damage', {
    actorId: actor.instanceId, targetId: target.instanceId, actorSide: actor.side, targetSide: target.side,
    actorLane: actor.lane, targetLane: target.lane, beforeHp, afterHp: target.currentHp, maxHp: target.maxHp,
    displayedDamage: damage.displayedDamage, appliedDamage: damage.appliedDamage, overkill: damage.overkill,
    critical: damage.critical, critChance: damage.critChance, variance: damage.variance, typeRelationship: damage.typeRelationship,
    typeMultiplier: damage.typeMultiplier, damageMultiplier, reinforcement, doubleStrike: isDoubleStrike,
  });
  if (damage.critical) emit('critical', { actorId: actor.instanceId, targetId: target.instanceId, displayedDamage: damage.displayedDamage });
  if (!target.alive) {
    contribution.knockouts += 1;
    contribution.lanesWon += 1;
    const knockoutEvent = emit('knockout', { actorId: actor.instanceId, targetId: target.instanceId, lane: target.lane, displayedDamage: damage.displayedDamage, appliedDamage: damage.appliedDamage });
    if (analytics.firstKnockoutRound === null) analytics.firstKnockoutRound = knockoutEvent.round;
    const laneWin = { lane: target.lane, winnerId: actor.instanceId, winnerSide: actor.side, defeatedId: target.instanceId, round: knockoutEvent.round };
    analytics.laneWins.push(laneWin);
    const isFirstLane = !analytics.firstLaneBroken;
    if (isFirstLane) {
      analytics.firstLaneBroken = target.lane;
      contribution.firstLaneWon = true;
    }
    emit('lane-won', { actorId: actor.instanceId, defeatedId: target.instanceId, lane: target.lane, firstLane: isFirstLane });
    if (!living(target.side).length) {
      contribution.finalKnockout = true;
      emit('final-knockout', { actorId: actor.instanceId, targetId: target.instanceId, winner: actor.side });
      return { battleEnded: true };
    }
  }
  return { battleEnded: false };
}

export function replayBattleEvents(initialState, events) {
  const state = JSON.parse(JSON.stringify(initialState));
  const cards = new Map([...state.player, ...state.enemy].map((card) => [card.instanceId, card]));
  for (const event of events) {
    if (event.type === 'damage') {
      const target = cards.get(event.targetId);
      if (target) { target.currentHp = event.afterHp; target.alive = event.afterHp > 0; }
    } else if (event.type === 'charge-gained') {
      const actor = cards.get(event.actorId);
      if (actor) actor.doubleStrike.charge = event.after;
    } else if (event.type === 'double-strike') {
      const actor = cards.get(event.actorId);
      if (actor) actor.doubleStrike.charge = event.chargeAfter;
    }
  }
  return state;
}

export function createFormation(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) throw new Error('Formation requires exactly three cards.');
  return cards.map((card, index) => ({ ...card, lane: LANES[index] }));
}
