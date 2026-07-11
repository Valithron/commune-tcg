/* Persisted battle results plus automatic, skippable reward presentation. */

import { renderCardFrame } from '../components/CardFrame.js';
import { toRenderableBattleCard } from '../components/battle/BattleCard.js';
import { refreshTopBarResources } from '../components/TopBar.js';
import { createBattleAttempt, finalizeBattleAttempt, recoverBattleAttempt } from '../services/battleApi.js';

let activeResultAttempt = null;
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function formationHref(attempt) { return `#/battle/squad?encounter=${encodeURIComponent(attempt.encounterId)}&squadCardIds=${encodeURIComponent(attempt.orderedCardIds.join(','))}`; }

function renderXp(application) {
  const requirement = application.xpIntoCurrentLevel + application.xpToNextLevel;
  const percent = application.maxLevelReached ? 100 : (requirement > 0 ? application.xpIntoCurrentLevel / requirement * 100 : 0);
  return `<article class="result-xp-card"><div><strong>${escapeHtml(application.cardTitle)}</strong><span>Level ${escapeHtml(application.nextLevel)}</span></div><div class="result-xp-bar"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></div><small>+${escapeHtml(application.gainedXp)} XP${application.xpToNextLevel ? ` · ${escapeHtml(application.xpToNextLevel)} to next level` : ' · Max level'}</small></article>`;
}

function rewardQueue(settlement) {
  const items = [{ type: 'currency', kicker: 'Battle Rewards', title: `${settlement.reward.gold} Gold`, copy: settlement.reward.firstDailyVictory ? `Includes first daily victory bonus: +${settlement.reward.bonusGold} Gold.` : 'Gold added to your account.' }];
  for (const xp of settlement.xpApplied) {
    items.push({ type: 'xp', kicker: 'Squad XP', title: `${xp.cardTitle} +${xp.gainedXp} XP`, copy: `Level ${xp.previousLevel} progress has been saved.` });
    for (const level of xp.levelsGained || []) items.push({ type: 'level', kicker: 'Level Up', title: `${xp.cardTitle} reached Level ${level.reachedLevel}`, copy: 'New effective stats will apply in the next battle.' });
  }
  return items;
}

export async function renderBattleResults({ query }) {
  try {
    let payload = await recoverBattleAttempt({ attemptId: query.attemptId });
    if (!payload.attempt) throw new Error('Battle result not found.');
    if (payload.attempt.status === 'pending') { await finalizeBattleAttempt({ attemptId: payload.attempt.attemptId }); payload = await recoverBattleAttempt({ attemptId: payload.attempt.attemptId }); }
    activeResultAttempt = payload.attempt;
    const attempt = activeResultAttempt;
    const result = attempt.result;
    const settlement = attempt.settlement;
    if (!settlement) throw new Error('Persisted settlement is unavailable.');
    const victory = settlement.reward.victory;
    const mvp = victory ? result.combat.mvp : null;
    const mvpCard = mvp ? result.playerSnapshot.find((card) => card.instanceId === mvp.cardId) : null;
    const queue = rewardQueue(settlement);
    const summary = result.combat.analytics;
    return `<section class="battle-results-page ${victory ? 'is-victory' : 'is-defeat'}" data-results-root data-attempt-id="${escapeHtml(attempt.attemptId)}">
      <header class="battle-results-hero"><span class="section-kicker">${settlement.surrender ? 'Retreated' : 'Battle Complete'}</span><h1>${victory ? 'VICTORY' : 'DEFEAT'}</h1><p>${escapeHtml(result.encounter.name)} ended after ${escapeHtml(result.combat.rounds)} rounds.</p></header>
      ${mvpCard ? `<section class="battle-mvp"><div class="battle-mvp-card">${renderCardFrame(toRenderableBattleCard(mvpCard), { showOwnership: false, showStats: true, density: 'standard', context: 'battle-mvp' })}</div><div><span class="section-kicker">Battle MVP</span><h2>${escapeHtml(mvp.cardName)}</h2><p>${escapeHtml(mvp.explanation)}</p></div></section>` : ''}
      <section class="result-summary-grid"><div><span>Result</span><strong>${victory ? 'Victory' : 'Defeat'}</strong></div><div><span>Rounds</span><strong>${escapeHtml(result.combat.rounds)}</strong></div><div><span>First lane broken</span><strong>${escapeHtml(summary.firstLaneBroken || 'None')}</strong></div><div><span>Reinforcement damage</span><strong>${escapeHtml(summary.reinforcementDamage)}</strong></div></section>
      <section class="result-rewards"><div class="section-heading"><div><span class="section-kicker">Rewards Applied</span><h2>Battle gains</h2></div><span class="status-pill">Saved</span></div><div class="result-currency"><strong>◎ ${escapeHtml(settlement.reward.gold)} Gold</strong>${settlement.reward.firstDailyVictory ? '<span>First daily victory bonus applied</span>' : ''}</div><div class="result-xp-list">${settlement.xpApplied.map(renderXp).join('')}</div></section>
      <nav class="battle-result-actions"><button class="button button-primary" type="button" data-battle-again>Battle Again</button><a class="button button-secondary" href="${formationHref(attempt)}">Edit Formation</a><a class="button button-secondary" href="#/battle/encounters">Choose Encounter</a><a class="button button-secondary" href="#/battle">Battle Hub</a><p data-result-status></p></nav>
      <section class="reward-queue" data-reward-queue data-items="${escapeHtml(JSON.stringify(queue))}"><div data-reward-stage><span class="section-kicker">Rewards</span><h2>Preparing…</h2><p></p><small>Tap to continue</small></div><button type="button" data-reward-skip>Skip All</button></section>
    </section>`;
  } catch (error) {
    activeResultAttempt = null;
    return `<section class="hero-panel"><span class="section-kicker">Battle Results</span><h1 class="hero-title">Results unavailable.</h1><p>${escapeHtml(error.message)}</p><a class="button button-secondary" href="#/battle">Battle Hub</a></section>`;
  }
}

export function initBattleResults(root) {
  const page = root.querySelector('[data-results-root]');
  if (!page || !activeResultAttempt) return;
  refreshTopBarResources(document).catch(() => {});
  const queue = page.querySelector('[data-reward-queue]');
  const stage = page.querySelector('[data-reward-stage]');
  const items = JSON.parse(queue.dataset.items || '[]');
  let index = 0;
  let timer = null;
  const finish = () => { if (timer) clearTimeout(timer); queue.classList.add('is-complete'); window.setTimeout(() => { queue.hidden = true; }, 250); };
  const show = () => {
    if (index >= items.length) return finish();
    const item = items[index];
    stage.className = `reward-stage is-${item.type}`;
    stage.querySelector('span').textContent = item.kicker;
    stage.querySelector('h2').textContent = item.title;
    stage.querySelector('p').textContent = item.copy;
    stage.classList.remove('is-entering'); requestAnimationFrame(() => stage.classList.add('is-entering'));
    timer = window.setTimeout(() => { index += 1; show(); }, item.type === 'level' ? 1800 : 1200);
  };
  stage.addEventListener('click', () => { if (timer) clearTimeout(timer); index += 1; show(); });
  page.querySelector('[data-reward-skip]').addEventListener('click', finish);
  show();
  page.querySelector('[data-battle-again]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true; button.textContent = 'Preparing…';
    const status = page.querySelector('[data-result-status]');
    try {
      const payload = await createBattleAttempt({ encounterId: activeResultAttempt.encounterId, orderedCardIds: activeResultAttempt.orderedCardIds });
      sessionStorage.removeItem(`commune-battle-entered:${payload.attempt.attemptId}`);
      window.location.hash = `#/battle/arena?attemptId=${encodeURIComponent(payload.attempt.attemptId)}`;
    } catch (error) { status.textContent = error.message; button.disabled = false; button.textContent = 'Battle Again'; }
  });
}
