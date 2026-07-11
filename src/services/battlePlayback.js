/* Stored-event playback controller. It never recalculates combat. */

const DEFAULT_TIMING = { opening: 2200, attack: 720, critical: 180, doubleStrike: 300, knockout: 380, end: 1500 };

export function createBattlePlayback({ root, events, startIndex = 0, onCheckpoint = () => {}, onComplete = () => {}, reducedMotion = false, speed = 1 }) {
  let index = startIndex;
  let currentSpeed = speed;
  let paused = false;
  let stopped = false;
  let activeTimer = null;
  let activeResolve = null;
  let playPromise = null;
  const timings = reducedMotion ? { opening: 500, attack: 420, critical: 80, doubleStrike: 180, knockout: 220, end: 900 } : DEFAULT_TIMING;

  function delay(milliseconds) {
    return new Promise((resolve) => {
      activeResolve = resolve;
      activeTimer = window.setTimeout(() => { activeTimer = null; activeResolve = null; resolve(); }, milliseconds / currentSpeed);
    });
  }

  async function waitWhilePaused() { while (paused && !stopped) await delay(80); }

  function cardElement(id) { return root.querySelector(`[data-battle-card-id="${CSS.escape(String(id))}"]`); }
  function applyDamage(event) {
    const target = cardElement(event.targetId);
    const attacker = cardElement(event.actorId);
    if (!target) return;
    const fill = target.querySelector('[data-hp-fill]');
    const label = target.querySelector('[data-hp-label]');
    if (fill) fill.style.width = `${Math.max(0, event.afterHp / event.maxHp * 100)}%`;
    if (label) label.textContent = `${event.afterHp} / ${event.maxHp} HP`;
    target.dataset.currentHp = String(event.afterHp);
    target.classList.toggle('battle-card-low-hp', event.afterHp > 0 && event.afterHp / event.maxHp < 0.25);
    target.classList.add(event.critical ? 'battle-card-hit-critical' : 'battle-card-hit');
    attacker?.classList.add(event.reinforcement ? 'battle-card-attacking-cross' : 'battle-card-attacking');
    const number = document.createElement('span');
    number.className = `battle-damage-number${event.critical ? ' is-critical' : ''}${event.doubleStrike ? ' is-double' : ''}`;
    number.textContent = `${event.critical ? 'CRITICAL ' : ''}${event.doubleStrike ? 'DOUBLE-STRIKE ' : ''}-${event.displayedDamage}`;
    target.append(number);
    const clearEffect = () => {
      if (paused && !stopped) { window.setTimeout(clearEffect, 80); return; }
      target.classList.remove('battle-card-hit', 'battle-card-hit-critical'); attacker?.classList.remove('battle-card-attacking', 'battle-card-attacking-cross'); number.remove();
    };
    window.setTimeout(clearEffect, timings.attack / currentSpeed);
  }

  function applyEvent(event) {
    root.dataset.round = String(event.round || 0);
    if (event.type === 'damage') applyDamage(event);
    if (event.type === 'charge-gained' || event.type === 'double-strike') {
      const actor = cardElement(event.actorId);
      const fill = actor?.querySelector('[data-charge-fill]');
      const charge = event.after ?? event.chargeAfter ?? 0;
      if (fill) fill.style.width = `${Math.min(100, charge)}%`;
      if (actor) actor.dataset.charge = String(charge);
    }
    if (event.type === 'knockout') cardElement(event.targetId)?.classList.add('battle-card-knocked-out');
    if (event.type === 'lane-won') {
      const actor = cardElement(event.actorId);
      actor?.classList.add('battle-card-lane-won');
      window.setTimeout(() => actor?.classList.remove('battle-card-lane-won'), timings.knockout / currentSpeed);
    }
    if (event.type === 'battle-end') {
      const banner = root.querySelector('[data-battle-end-banner]');
      if (banner) { banner.textContent = event.outcome === 'victory' ? 'VICTORY' : 'DEFEAT'; banner.classList.add('is-visible'); }
    }
  }

  function eventDelay(event) {
    if (event.type === 'battle-start') return timings.opening;
    if (event.type === 'damage') return timings.attack + (event.critical ? timings.critical : 0);
    if (event.type === 'double-strike') return timings.doubleStrike;
    if (event.type === 'knockout' || event.type === 'lane-won') return timings.knockout;
    if (event.type === 'battle-end') return timings.end;
    return 20;
  }

  async function runPlayback() {
    root.classList.add('battle-playback-running');
    while (index < events.length && !stopped) {
      await waitWhilePaused();
      if (stopped) break;
      const event = events[index];
      applyEvent(event);
      index += 1;
      onCheckpoint(index);
      await delay(eventDelay(event));
    }
    root.classList.remove('battle-playback-running');
    if (!stopped && index >= events.length) onComplete();
  }

  function play() {
    if (playPromise) return playPromise;
    playPromise = runPlayback().finally(() => { playPromise = null; });
    return playPromise;
  }

  return {
    play,
    pause() { paused = true; root.classList.add('battle-is-paused'); if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; activeResolve?.(); activeResolve = null; } },
    resume() { paused = false; root.classList.remove('battle-is-paused'); if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; activeResolve?.(); activeResolve = null; } },
    stop() { stopped = true; paused = false; if (activeTimer) clearTimeout(activeTimer); activeResolve?.(); },
    setSpeed(nextSpeed) { currentSpeed = nextSpeed === 2 ? 2 : 1; },
    getState() { return { index, paused, speed: currentSpeed, stopped }; },
  };
}
