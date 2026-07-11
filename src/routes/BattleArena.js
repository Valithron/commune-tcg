/* Full-screen stored-event battlefield. The browser animates but never resolves. */

import { renderBattleCard, renderBattleInspection } from '../components/battle/BattleCard.js';
import { finalizeBattleAttempt, recoverBattleAttempt } from '../services/battleApi.js';
import { createBattlePlayback } from '../services/battlePlayback.js';

let activeAttempt = null;
let returningToAttempt = false;
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function byLane(cards) { return ['left', 'center', 'right'].map((lane) => cards.find((card) => card.lane === lane)).filter(Boolean); }

export async function renderBattleArena({ query }) {
  try {
    const payload = await recoverBattleAttempt({ attemptId: query.attemptId });
    activeAttempt = payload.attempt;
    if (!activeAttempt) throw new Error('That battle attempt could not be found.');
    if (activeAttempt.status !== 'pending') { window.location.hash = `#/battle/results?attemptId=${encodeURIComponent(activeAttempt.attemptId)}`; return '<section class="battle-route-loading">Opening results…</section>'; }
    const entryKey = `commune-battle-entered:${activeAttempt.attemptId}`;
    returningToAttempt = sessionStorage.getItem(entryKey) === 'true';
    sessionStorage.setItem(entryKey, 'true');
    const result = activeAttempt.result;
    const player = byLane(result.playerSnapshot || result.combat.initialState.player);
    const enemy = byLane(result.enemySnapshot || result.combat.initialState.enemy);
    return `<main class="battle-arena ${escapeHtml(result.encounter.background.className)}" data-battle-arena data-attempt-id="${escapeHtml(activeAttempt.attemptId)}">
      <div class="battle-arena-backdrop"></div><div class="battle-arena-vignette"></div>
      <header class="battle-arena-header"><div><span>${escapeHtml(result.encounter.mode.replace(/-/g, ' '))}</span><strong>${escapeHtml(result.encounter.name)}</strong></div><div class="battle-arena-controls"><button type="button" data-speed-toggle>1×</button><button type="button" data-pause-battle aria-label="Pause battle">Ⅱ</button></div></header>
      <section class="battle-field" aria-label="Three lane battle field">
        <div class="battle-field-row battle-field-enemy">${enemy.map((card) => renderBattleCard(card, { side: 'enemy', lane: card.lane, currentHp: card.currentHp, maxHp: card.maxHp })).join('')}</div>
        <div class="battle-combat-space"><span data-opening-label>FORMATION LOCKED</span><div class="battle-end-banner" data-battle-end-banner></div></div>
        <div class="battle-field-row battle-field-player">${player.map((card) => renderBattleCard(card, { side: 'player', lane: card.lane, currentHp: card.currentHp, maxHp: card.maxHp })).join('')}</div>
      </section>
      <aside class="battle-pause-panel" data-pause-panel hidden><h2>Battle Paused</h2><div><button type="button" data-resume-battle>Resume</button><button type="button" data-pause-speed>Speed: 1×</button><button type="button" data-sound-toggle>Sound: On</button><button type="button" data-log-toggle>Battle Log</button><button type="button" data-motion-toggle>Reduced Motion: Off</button><button class="is-danger" type="button" data-retreat>Retreat / Exit</button></div></aside>
      <aside class="battle-log-panel" data-log-panel hidden><header><h2>Battle Log</h2><button type="button" data-log-close>Close</button></header><ol>${result.combat.events.filter((event) => ['damage','critical','knockout','lane-won','double-strike','battle-end'].includes(event.type)).map((event) => `<li><span>R${event.round}</span> ${escapeHtml(logLine(event, result))}</li>`).join('')}</ol></aside>
      <div data-inspection-host></div>
      <section class="battle-recovery" data-recovery-panel ${returningToAttempt ? '' : 'hidden'}><div><span class="section-kicker">Battle in progress</span><h2>Resume ${escapeHtml(result.encounter.name)}?</h2><p>The authoritative result is already stored. Resuming cannot reroll it.</p><button class="button button-primary" type="button" data-recovery-resume>Resume Battle</button><button class="button button-secondary" type="button" data-skip-results>Skip to Results</button></div></section>
      <div class="battle-interruption" data-playback-error hidden><strong>Playback interrupted.</strong><span>The stored server result is safe. Opening results…</span></div>
    </main>`;
  } catch (error) {
    activeAttempt = null;
    return `<main class="battle-arena battle-arena-error"><section><h1>Battle unavailable</h1><p>${escapeHtml(error.message)}</p><a class="button button-secondary" href="#/battle">Battle Hub</a></section></main>`;
  }
}

function cardName(id, result) { return [...result.playerSnapshot, ...result.enemySnapshot].find((card) => card.instanceId === id)?.name || id; }
function logLine(event, result) {
  if (event.type === 'damage') return `${cardName(event.actorId, result)} dealt ${event.displayedDamage}${event.critical ? ' critical' : ''} damage to ${cardName(event.targetId, result)}.`;
  if (event.type === 'knockout') return `${cardName(event.targetId, result)} was knocked out.`;
  if (event.type === 'lane-won') return `${cardName(event.actorId, result)} won the ${event.lane} lane.`;
  if (event.type === 'double-strike') return `${cardName(event.actorId, result)} triggered Double-Strike.`;
  if (event.type === 'battle-end') return event.outcome === 'victory' ? 'Victory.' : 'Defeat.';
  return 'Critical hit.';
}

export function initBattleArena(root) {
  const arena = root.querySelector('[data-battle-arena]');
  if (!arena || !activeAttempt) return;
  const attemptId = activeAttempt.attemptId;
  const result = activeAttempt.result;
  const events = result.combat.events;
  const checkpointKey = `commune-battle-checkpoint:${attemptId}`;
  const reducedKey = 'commune-battle-reduced-motion';
  const soundKey = 'commune-battle-sound';
  let speed = 1;
  let reducedMotion = localStorage.getItem(reducedKey) === 'true';
  let sound = localStorage.getItem(soundKey) !== 'false';
  let finishing = false;
  let playbackStarted = false;
  arena.classList.toggle('battle-reduced-motion', reducedMotion);
  const checkpoint = returningToAttempt ? Number(sessionStorage.getItem(checkpointKey) || 0) : 0;
  const playback = createBattlePlayback({ root: arena, events, startIndex: checkpoint, reducedMotion, speed, onCheckpoint(index) { sessionStorage.setItem(checkpointKey, String(index)); }, onComplete() { completeAndOpenResults(false); } });

  async function completeAndOpenResults(surrender) {
    if (finishing) return;
    finishing = true;
    playback.stop();
    try {
      await finalizeBattleAttempt({ attemptId, surrender });
      sessionStorage.removeItem(checkpointKey);
      window.location.hash = `#/battle/results?attemptId=${encodeURIComponent(attemptId)}`;
    } catch (error) {
      finishing = false;
      const interruption = arena.querySelector('[data-playback-error]'); interruption.hidden = false; interruption.querySelector('span').textContent = error.message;
    }
  }

  function startPlayback() {
    if (playbackStarted || finishing) return;
    playbackStarted = true;
    arena.querySelector('[data-recovery-panel]').hidden = true;
    const opening = arena.querySelector('[data-opening-label]');
    opening.classList.add('is-visible');
    window.setTimeout(() => { opening.textContent = 'BATTLE START'; window.setTimeout(() => opening.classList.remove('is-visible'), reducedMotion ? 250 : 700); }, reducedMotion ? 200 : 900);
    playback.play().catch((error) => {
      const interruption = arena.querySelector('[data-playback-error]');
      interruption.hidden = false;
      interruption.querySelector('span').textContent = `${error.message || 'The animation stopped.'} The stored result is safe.`;
      completeAndOpenResults(false);
    });
  }

  if (!returningToAttempt) startPlayback();
  arena.querySelector('[data-recovery-resume]')?.addEventListener('click', startPlayback);
  arena.querySelector('[data-skip-results]')?.addEventListener('click', () => completeAndOpenResults(false));
  const pausePanel = arena.querySelector('[data-pause-panel]');
  const pause = () => { playback.pause(); pausePanel.hidden = false; };
  const resume = () => { pausePanel.hidden = true; playback.resume(); };
  arena.querySelector('[data-pause-battle]').addEventListener('click', pause);
  arena.querySelector('[data-resume-battle]').addEventListener('click', resume);
  const updateSpeed = () => { speed = speed === 1 ? 2 : 1; playback.setSpeed(speed); arena.querySelector('[data-speed-toggle]').textContent = `${speed}×`; arena.querySelector('[data-pause-speed]').textContent = `Speed: ${speed}×`; };
  arena.querySelector('[data-speed-toggle]').addEventListener('click', updateSpeed);
  arena.querySelector('[data-pause-speed]').addEventListener('click', updateSpeed);
  arena.querySelector('[data-sound-toggle]').textContent = `Sound: ${sound ? 'On' : 'Off'}`;
  arena.querySelector('[data-sound-toggle]').addEventListener('click', (event) => { sound = !sound; localStorage.setItem(soundKey, String(sound)); event.currentTarget.textContent = `Sound: ${sound ? 'On' : 'Off'}`; });
  arena.querySelector('[data-motion-toggle]').textContent = `Reduced Motion: ${reducedMotion ? 'On' : 'Off'}`;
  arena.querySelector('[data-motion-toggle]').addEventListener('click', (event) => { reducedMotion = !reducedMotion; localStorage.setItem(reducedKey, String(reducedMotion)); arena.classList.toggle('battle-reduced-motion', reducedMotion); event.currentTarget.textContent = `Reduced Motion: ${reducedMotion ? 'On' : 'Off'}`; });
  arena.querySelector('[data-retreat]').addEventListener('click', () => { if (window.confirm('Retreat? Energy remains spent and normal defeat XP will be granted.')) completeAndOpenResults(true); });
  const logPanel = arena.querySelector('[data-log-panel]');
  arena.querySelector('[data-log-toggle]').addEventListener('click', () => { logPanel.hidden = false; });
  arena.querySelector('[data-log-close]').addEventListener('click', () => { logPanel.hidden = true; });

  const cards = [...(result.playerSnapshot || []), ...(result.enemySnapshot || [])];
  const inspectionHost = arena.querySelector('[data-inspection-host]');
  arena.querySelectorAll('[data-battle-card-id]').forEach((element) => element.addEventListener('click', () => {
    const base = cards.find((card) => card.instanceId === element.dataset.battleCardId);
    if (!base) return;
    const snapshot = { ...base, currentHp: Number(element.dataset.currentHp), doubleStrike: { ...base.doubleStrike, charge: Number(element.dataset.charge || 0) } };
    inspectionHost.innerHTML = renderBattleInspection(snapshot);
    inspectionHost.querySelectorAll('[data-close-inspection]').forEach((close) => close.addEventListener('click', (event) => { if (event.target === close || close.hasAttribute('data-close-inspection') && close.tagName === 'BUTTON') inspectionHost.innerHTML = ''; }));
    inspectionHost.querySelector('[data-inspection-panel]')?.addEventListener('click', (event) => event.stopPropagation());
  }));
}
