/* ============================================================================
   Battle Results Route
   Phase 10E.2 responsibility: auto-settle battle rewards while preserving a
   manual reward reveal moment. Settlement and reveal are intentionally separate.
   ============================================================================ */

import { refreshTopBarResources } from '../components/TopBar.js';
import { getEncounterById } from '../data/mockBattle.js';
import { claimBattleRewards } from '../services/battleRewardClaim.js';
import {
  buildBattleResultsHref,
  buildSquadBuilderHref,
  fetchBattleAttemptStatus,
  fetchBattleInventory,
  getBattleSquadPower,
  getEligibleBattleCards,
  getSelectedBattleIds,
  normalizeBattleAttemptId,
  resolveSelectedBattleSquad,
} from '../services/battleSquadSelection.js';

const rewardRevealStoragePrefix = 'commune-tcg-battle-reveal:';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function getRewardRevealKey(attemptId) {
  return rewardRevealStoragePrefix + String(attemptId || '').trim();
}

function hasSeenRewardReveal(attemptId) {
  try {
    return Boolean(attemptId && globalThis.localStorage?.getItem(getRewardRevealKey(attemptId)) === 'seen');
  } catch {
    return false;
  }
}

function markRewardRevealSeen(attemptId) {
  try {
    if (attemptId) {
      globalThis.localStorage?.setItem(getRewardRevealKey(attemptId), 'seen');
    }
  } catch {
    // Local reveal memory is cosmetic. Backend settlement remains the source of truth.
  }
}

function getLevelNote(row) {
  const previousLevel = Number(row.previousLevel || 1);
  const nextLevel = Number(row.nextLevel || previousLevel);

  if (nextLevel > previousLevel) {
    return `Level Up! ${previousLevel} → ${nextLevel}`;
  }

  return `Level ${nextLevel}`;
}

function getXpProgressPercent(row) {
  const intoLevel = Number(row.xpIntoCurrentLevel ?? row.gainedXp ?? 0);
  const toNextLevel = Number(row.xpToNextLevel ?? 100);

  if (!toNextLevel) {
    return 100;
  }

  return clamp(Math.round((intoLevel / toNextLevel) * 100), 4, 100);
}

function getLeadCard(cards = []) {
  return [...cards].sort((a, b) => Number(b.battlePower || 0) - Number(a.battlePower || 0))[0] || null;
}

function renderLeadCard(card) {
  if (!card) {
    return '';
  }

  return `
    <section class="battle-lead-card glass-panel">
      <span class="battle-mvp-badge">Lead Card</span>
      <div>
        <span class="section-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.category)}</span>
        <h2>${escapeHtml(card.name)}</h2>
        <p>Led the squad with ${escapeHtml(card.battlePower || 0)} battle power.</p>
      </div>
      <div class="battle-lead-stat">
        <span>Power</span>
        <strong>${escapeHtml(card.battlePower || 0)}</strong>
      </div>
    </section>
  `;
}

function renderAppliedXpRows(xpApplied = []) {
  if (!Array.isArray(xpApplied) || !xpApplied.length) {
    return '<div class="empty-note">No squad XP is ready to show yet.</div>';
  }

  return xpApplied.map((row) => {
    const levelNote = getLevelNote(row);
    const leveledUp = levelNote.startsWith('Level Up');
    const progress = getXpProgressPercent(row);

    return `
      <div class="battle-xp-row ${leveledUp ? 'battle-xp-row-level-up' : ''}">
        <div class="battle-xp-row-main">
          <div>
            <strong>${escapeHtml(row.cardTitle || row.cardId || 'Card')}</strong>
            <span>+${escapeHtml(row.gainedXp || 0)} XP</span>
          </div>
          <em>${escapeHtml(levelNote)}</em>
        </div>
        <div class="battle-xp-track" aria-hidden="true">
          <div class="battle-xp-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSquadRows(cards = [], note = 'Will gain XP') {
  if (!cards.length) {
    return '<div class="empty-note">No squad cards selected.</div>';
  }

  return cards.map((card) => `
    <div class="battle-card-row battle-card-row-selected">
      <div>
        <span class="section-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.category)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <small>Level ${escapeHtml(card.level)} · ${escapeHtml(card.xp)} XP</small>
      </div>
      <div class="battle-card-stat-stack">
        <span>P${escapeHtml(card.stats?.pow ?? 0)} D${escapeHtml(card.stats?.def ?? 0)} S${escapeHtml(card.stats?.spd ?? 0)}</span>
        <strong>${escapeHtml(card.battlePower || 0)}</strong>
        <small>${escapeHtml(note)}</small>
      </div>
    </div>
  `).join('');
}

function renderSecuredRewardPrompt({ secured = false, failed = false } = {}) {
  if (failed) {
    return `
      <div class="battle-state-note battle-state-note-error battle-reward-stage">
        <strong>Rewards not secured yet.</strong>
        <span>Tap Reveal Rewards to retry settlement and reveal your rewards.</span>
      </div>
    `;
  }

  return `
    <div class="battle-state-note ${secured ? 'battle-state-note-live' : 'battle-state-note-pending'} battle-reward-stage">
      <strong>${secured ? 'Rewards secured.' : 'Securing rewards.'}</strong>
      <span>${secured ? 'Your rewards are safe. Tap Reveal Rewards when you are ready.' : 'The game is making sure these rewards cannot be lost.'}</span>
    </div>
  `;
}

function renderRevealedRewards(payload) {
  if (!payload) {
    return renderSecuredRewardPrompt({ secured: false });
  }

  if (!payload.ok) {
    return `
      <div class="battle-state-note battle-state-note-error battle-reward-stage">
        <strong>${payload.code === 'duplicate-battle-attempt' ? 'Rewards secured.' : 'Reveal failed.'}</strong>
        <span>${escapeHtml(payload.error || 'The rewards could not be revealed yet.')}</span>
      </div>
    `;
  }

  const reward = payload.rewardApplied || {};
  const simulation = payload.simulation || {};
  const alreadyResolved = Boolean(payload.alreadyResolved);

  return `
    <div class="battle-state-note battle-state-note-live battle-reward-stage">
      <strong>${alreadyResolved ? 'Rewards revealed.' : 'Rewards revealed.'}</strong>
      <span>${alreadyResolved ? 'These rewards were already secured for this battle.' : 'Gold and squad XP have been added.'}</span>
    </div>

    <div class="battle-reward-grid battle-reward-grid-claimed">
      <div class="battle-reward-card battle-reward-card-gold"><span>Gold Earned</span><strong>◎ ${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="battle-reward-card"><span>Squad XP</span><strong>+${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="battle-reward-card"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Defeat'}</strong></div>
    </div>

    <section class="glass-panel battle-summary-panel battle-live-panel battle-progression-panel">
      <span class="section-kicker">Squad Progress</span>
      <h2 class="section-title">Cards that gained XP</h2>
      <p class="body-copy">Your selected squad received these rewards.</p>
      <div class="battle-xp-list">
        ${renderAppliedXpRows(payload.xpApplied)}
      </div>
    </section>
  `;
}

export async function renderBattleResults({ query }) {
  const encounter = getEncounterById(query.encounter);
  const attemptId = normalizeBattleAttemptId(query.attemptId);

  try {
    const [inventory, attemptStatus] = await Promise.all([
      fetchBattleInventory(),
      attemptId ? fetchBattleAttemptStatus({ attemptId }) : Promise.resolve({ resolved: false, battle: null }),
    ]);
    const eligibleCards = getEligibleBattleCards(inventory);
    const selection = resolveSelectedBattleSquad(eligibleCards, query.squadCardIds);
    const selectedCards = selection.selected;
    const selectedIds = getSelectedBattleIds(selectedCards);
    const leadCard = getLeadCard(selectedCards);
    const squadPower = getBattleSquadPower(selectedCards);
    const margin = squadPower - encounter.enemyPower;
    const victory = margin >= 0;
    const previewGold = victory ? encounter.rewardGold : Math.floor(encounter.rewardGold * 0.25);
    const previewXp = victory ? encounter.rewardXp : Math.floor(encounter.rewardXp * 0.35);
    const alreadyResolved = Boolean(attemptStatus?.resolved && attemptStatus?.battle);
    const revealSeen = alreadyResolved && hasSeenRewardReveal(attemptId);
    const canSettle = selectedCards.length > 0 && Boolean(attemptId) && !alreadyResolved;
    const canReveal = selectedCards.length > 0 && Boolean(attemptId) && !revealSeen;
    const resultWord = victory ? 'Victory' : 'Defeat';
    const heroTitle = revealSeen ? `${resultWord} Revealed` : (alreadyResolved ? `${resultWord} Secured` : (canSettle ? resultWord : 'Battle Paused'));
    const battleAgainHref = buildBattleResultsHref({ encounterId: encounter.id, squadCardIds: selectedIds });
    const securedPayload = alreadyResolved ? attemptStatus.battle : null;

    return `
      <section class="result-banner battle-result-hero ${victory ? 'battle-result-victory' : 'battle-result-defeat'}">
        <span class="section-kicker">Battle Results</span>
        <h2 class="hero-title battle-result-title">${escapeHtml(heroTitle)}</h2>
        <p class="hero-copy">${escapeHtml(encounter.name)} is complete. ${revealSeen ? 'Your rewards have been revealed.' : 'Your rewards are protected, and the reveal is yours to open.'}</p>
        <div class="action-row">
          ${canReveal ? `<button class="button button-primary" type="button" data-battle-reveal data-battle-auto-settle="${canSettle ? 'true' : 'false'}" data-encounter-id="${escapeHtml(encounter.id)}" data-squad-card-ids="${escapeHtml(selectedIds.join(','))}" data-attempt-id="${escapeHtml(attemptId)}">Reveal Rewards</button>` : `<span class="button ${revealSeen ? 'button-resolved' : 'button-secondary'}" aria-disabled="true">${revealSeen ? 'Already Revealed' : 'Select a Squad'}</span>`}
          <a class="button button-secondary" href="${battleAgainHref}">Battle Again</a>
          <a class="button button-secondary" href="${buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: selectedIds })}">Edit Squad</a>
        </div>
      </section>

      ${renderLeadCard(leadCard)}

      <section class="glass-panel battle-summary-panel battle-preview-panel battle-rewards-acquired-panel">
        <span class="section-kicker">Rewards</span>
        <h2 class="section-title">${revealSeen ? 'Revealed rewards' : (alreadyResolved ? 'Rewards secured' : 'Rewards being secured')}</h2>
        <div class="battle-reward-grid">
          <div class="battle-reward-card battle-reward-card-gold"><span>Gold</span><strong>◎ ${escapeHtml(previewGold)}</strong></div>
          <div class="battle-reward-card"><span>Squad XP</span><strong>+${escapeHtml(previewXp)}</strong></div>
        </div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel">
        <span class="section-kicker">Reward Reveal</span>
        <h2 class="section-title">${revealSeen ? 'Rewards revealed' : (alreadyResolved ? 'Ready to reveal' : 'Securing rewards')}</h2>
        <div class="empty-note" data-battle-reveal-status>${revealSeen ? 'Your rewards have been revealed.' : (alreadyResolved ? 'Rewards are secured. Tap Reveal Rewards when you are ready.' : (canSettle ? 'Securing rewards in the background.' : 'Choose a squad before revealing rewards.'))}</div>
        <div data-battle-reveal-result>
          ${revealSeen ? renderRevealedRewards(securedPayload) : renderSecuredRewardPrompt({ secured: alreadyResolved })}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Your Squad</span>
            <h2 class="section-title">Cards in this battle</h2>
          </div>
          <span class="status-pill">${selectedCards.length}/3</span>
        </div>
        <div class="battle-card-list">
          ${renderSquadRows(selectedCards, alreadyResolved ? 'Rewarded' : 'Will gain XP')}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Combat Summary</span>
            <h2 class="section-title">What happened</h2>
          </div>
        </div>
        <div class="battle-log">
          <div>${escapeHtml(selectedCards[0]?.name || 'Your squad')} led ${selectedCards.length} card(s) against ${escapeHtml(encounter.name)}.</div>
          <div>Your squad power was ${escapeHtml(squadPower)} against enemy power ${escapeHtml(encounter.enemyPower)}.</div>
          <div>${victory ? `Your squad won by ${margin} power.` : `Your squad fell short by ${Math.abs(margin)} power.`}</div>
        </div>
      </section>
    `;
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Battle Results</span>
        <h2 class="hero-title">Results unavailable.</h2>
        <p class="hero-copy">Your battle result could not be loaded, so rewards are paused for now.</p>
        <div class="action-row"><a class="button button-secondary" href="#/battle">Back to Battle</a></div>
      </section>
      <section class="glass-panel battle-summary-panel">
        <div class="empty-note">${escapeHtml(error.message)}</div>
      </section>
    `;
  }
}

export function initBattleResults(root) {
  const button = root.querySelector('[data-battle-reveal]');
  const status = root.querySelector('[data-battle-reveal-status]');
  const resultTarget = root.querySelector('[data-battle-reveal-result]');

  if (!button || !status || !resultTarget) {
    return;
  }

  let settlementInFlight = false;
  let settledPayload = null;

  async function fetchSettledPayload(attemptId) {
    const attemptStatus = await fetchBattleAttemptStatus({ attemptId });
    return attemptStatus?.battle || null;
  }

  async function revealRewards(payload, attemptId) {
    if (!payload) {
      throw new Error('Rewards are not secured yet.');
    }

    if (payload.ok) {
      await refreshTopBarResources(document, {
        gold: payload.rewardApplied?.goldAfter,
      });
    }

    resultTarget.innerHTML = renderRevealedRewards(payload);
    status.textContent = 'Rewards revealed.';
    button.disabled = true;
    button.textContent = 'Revealed';
    button.classList.remove('button-working');
    button.classList.add('button-resolved');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('data-resolved', 'true');
    markRewardRevealSeen(attemptId);
  }

  async function settleRewards({ revealAfter = false, source = 'auto' } = {}) {
    if (settlementInFlight || button.getAttribute('data-resolved') === 'true') {
      return;
    }

    const encounterId = button.getAttribute('data-encounter-id') || 'training-yard-goblin';
    const squadCardIds = button.getAttribute('data-squad-card-ids') || '';
    const attemptId = button.getAttribute('data-attempt-id') || '';
    const isAuto = source === 'auto';

    settlementInFlight = true;
    button.disabled = true;
    button.textContent = isAuto ? 'Securing...' : 'Preparing...';
    button.classList.add('button-working');
    status.textContent = isAuto ? 'Securing rewards in the background...' : 'Preparing your reward reveal...';

    try {
      const payload = await claimBattleRewards({ encounterId, squadCardIds, attemptId });

      if (!payload.responseOk || !payload.ok) {
        if (payload?.code === 'duplicate-battle-attempt') {
          settledPayload = await fetchSettledPayload(attemptId);
        } else {
          throw new Error(payload?.error || `Battle reward settlement failed with ${payload.httpStatus || 'unknown status'}`);
        }
      } else {
        settledPayload = payload;
      }

      if (!settledPayload) {
        throw new Error('Rewards could not be verified after settlement.');
      }

      button.classList.remove('button-working');
      button.disabled = false;
      button.textContent = 'Reveal Rewards';
      button.setAttribute('data-settled', 'true');
      status.textContent = 'Rewards secured. Tap Reveal Rewards when you are ready.';
      resultTarget.innerHTML = renderSecuredRewardPrompt({ secured: true });

      if (revealAfter) {
        await revealRewards(settledPayload, attemptId);
      }
    } catch (error) {
      status.textContent = isAuto ? `Rewards were not secured automatically. Tap Reveal Rewards to retry. ${error.message}` : error.message;
      resultTarget.innerHTML = renderSecuredRewardPrompt({ failed: true });
      button.disabled = false;
      button.textContent = 'Reveal Rewards';
      button.classList.remove('button-working', 'button-resolved');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('data-resolved');
    } finally {
      settlementInFlight = false;
    }
  }

  button.addEventListener('click', async () => {
    const attemptId = button.getAttribute('data-attempt-id') || '';

    try {
      if (!settledPayload && button.getAttribute('data-settled') === 'true') {
        settledPayload = await fetchSettledPayload(attemptId);
      }

      if (settledPayload) {
        await revealRewards(settledPayload, attemptId);
        return;
      }

      await settleRewards({ revealAfter: true, source: 'manual' });
    } catch (error) {
      status.textContent = error.message;
      resultTarget.innerHTML = renderSecuredRewardPrompt({ failed: true });
      button.disabled = false;
      button.textContent = 'Reveal Rewards';
      button.classList.remove('button-working', 'button-resolved');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('data-resolved');
    }
  });

  if (button.getAttribute('data-battle-auto-settle') === 'true') {
    window.setTimeout(() => {
      settleRewards({ revealAfter: false, source: 'auto' });
    }, 250);
  }
}
