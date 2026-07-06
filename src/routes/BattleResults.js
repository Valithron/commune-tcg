/* ============================================================================
   Battle Results Route
   Phase 10A responsibility: player-facing battle result polish. Mechanics stay
   the same: selected squad IDs, attempt preflight, protected resolve, rewards.
   ============================================================================ */

import { refreshTopBarResources } from '../components/TopBar.js';
import { getEncounterById } from '../data/mockBattle.js';
import {
  buildSquadBuilderHref,
  fetchBattleAttemptStatus,
  fetchBattleInventory,
  getBattleSquadPower,
  getEligibleBattleCards,
  getSelectedBattleIds,
  normalizeBattleAttemptId,
  resolveSelectedBattleSquad,
} from '../services/battleSquadSelection.js';
import { getApiRoutes } from '../services/apiClient.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLevelNote(row) {
  const previousLevel = Number(row.previousLevel || 1);
  const nextLevel = Number(row.nextLevel || previousLevel);

  if (nextLevel > previousLevel) {
    return `Level Up! ${previousLevel} → ${nextLevel}`;
  }

  return `Level ${nextLevel}`;
}

function renderAppliedXpRows(xpApplied = []) {
  if (!Array.isArray(xpApplied) || !xpApplied.length) {
    return '<div class="empty-note">No squad XP has been claimed yet.</div>';
  }

  return xpApplied.map((row) => `
    <div class="detail-row battle-applied-row">
      <span>${escapeHtml(row.cardTitle || row.cardId || 'Card')}</span>
      <strong>+${escapeHtml(row.gainedXp || 0)} XP · ${escapeHtml(getLevelNote(row))}</strong>
    </div>
  `).join('');
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

function renderClaimedRewards(payload) {
  if (!payload) {
    return `
      <div class="battle-state-note battle-state-note-pending">
        <strong>Rewards unclaimed.</strong>
        <span>Claim rewards to add gold and squad XP.</span>
      </div>
    `;
  }

  if (!payload.ok) {
    return `
      <div class="battle-state-note battle-state-note-error">
        <strong>${payload.code === 'duplicate-battle-attempt' ? 'Already claimed.' : 'Rewards failed.'}</strong>
        <span>${escapeHtml(payload.error || 'The rewards could not be claimed.')}</span>
      </div>
    `;
  }

  const reward = payload.rewardApplied || {};
  const simulation = payload.simulation || {};
  const alreadyResolved = Boolean(payload.alreadyResolved);

  return `
    <div class="battle-state-note battle-state-note-live">
      <strong>${alreadyResolved ? 'Already claimed.' : 'Rewards claimed.'}</strong>
      <span>${alreadyResolved ? 'These rewards were claimed earlier.' : 'Gold and squad XP have been added.'}</span>
    </div>

    <div class="battle-reward-grid">
      <div class="battle-reward-card"><span>Gold Earned</span><strong>◎ ${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="battle-reward-card"><span>Squad XP</span><strong>+${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="battle-reward-card"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Defeat'}</strong></div>
    </div>

    <section class="glass-panel battle-summary-panel battle-live-panel">
      <span class="section-kicker">Squad Progress</span>
      <h2 class="section-title">Cards that gained XP</h2>
      <p class="body-copy">Your selected squad received these rewards.</p>
      <div class="detail-list">
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
    const squadPower = getBattleSquadPower(selectedCards);
    const margin = squadPower - encounter.enemyPower;
    const victory = margin >= 0;
    const previewGold = victory ? encounter.rewardGold : Math.floor(encounter.rewardGold * 0.25);
    const previewXp = victory ? encounter.rewardXp : Math.floor(encounter.rewardXp * 0.35);
    const alreadyResolved = Boolean(attemptStatus?.resolved && attemptStatus?.battle);
    const canResolve = selectedCards.length > 0 && Boolean(attemptId) && !alreadyResolved;
    const resultWord = victory ? 'Victory' : 'Defeat';
    const heroTitle = alreadyResolved ? `${resultWord} Claimed` : (canResolve ? resultWord : 'Battle Paused');

    return `
      <section class="result-banner battle-result-hero ${victory ? 'battle-result-victory' : 'battle-result-defeat'}">
        <span class="section-kicker">Battle Results</span>
        <h2 class="hero-title">${escapeHtml(heroTitle)}</h2>
        <p class="hero-copy">${escapeHtml(encounter.name)} is complete. ${alreadyResolved ? 'These rewards have already been claimed.' : 'Claim your rewards when you are ready.'}</p>
        <div class="action-row">
          ${canResolve ? `<button class="button button-primary" type="button" data-battle-resolve data-encounter-id="${escapeHtml(encounter.id)}" data-squad-card-ids="${escapeHtml(selectedIds.join(','))}" data-attempt-id="${escapeHtml(attemptId)}">Claim Rewards</button>` : `<span class="button ${alreadyResolved ? 'button-resolved' : 'button-secondary'}" aria-disabled="true">${alreadyResolved ? 'Already Claimed' : 'Select a Squad'}</span>`}
          <a class="button button-secondary" href="${buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: selectedIds })}">Edit Squad</a>
          <a class="button button-secondary" href="#/battle/encounters">Choose New Encounter</a>
        </div>
      </section>

      <section class="glass-panel battle-summary-panel battle-preview-panel">
        <span class="section-kicker">Battle Preview</span>
        <h2 class="section-title">${escapeHtml(encounter.name)}</h2>
        <div class="battle-score-grid">
          <div class="battle-score-card"><span>Enemy Power</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>
          <div class="battle-score-card"><span>Squad Power</span><strong>${escapeHtml(squadPower)}</strong></div>
          <div class="battle-score-card"><span>Outlook</span><strong>${margin >= 0 ? `Favored +${margin}` : `Risky ${margin}`}</strong></div>
        </div>
        <div class="battle-reward-grid">
          <div class="battle-reward-card"><span>Gold</span><strong>◎ ${escapeHtml(previewGold)}</strong></div>
          <div class="battle-reward-card"><span>Squad XP</span><strong>+${escapeHtml(previewXp)}</strong></div>
        </div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel">
        <span class="section-kicker">Rewards</span>
        <h2 class="section-title">${alreadyResolved ? 'Already claimed' : 'Claim battle rewards'}</h2>
        <div class="empty-note" data-battle-resolve-status>${alreadyResolved ? 'These rewards have already been claimed.' : (canResolve ? 'Rewards have not been claimed yet.' : 'Choose a squad before claiming rewards.')}</div>
        <div data-battle-resolve-result>
          ${renderClaimedRewards(alreadyResolved ? attemptStatus.battle : null)}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Your Squad</span>
            <h2 class="section-title">Reward targets</h2>
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
  const button = root.querySelector('[data-battle-resolve]');
  const status = root.querySelector('[data-battle-resolve-status]');
  const resultTarget = root.querySelector('[data-battle-resolve-result]');

  if (!button || !status || !resultTarget) {
    return;
  }

  button.addEventListener('click', async () => {
    const encounterId = button.getAttribute('data-encounter-id') || 'training-yard-goblin';
    const squadCardIds = button.getAttribute('data-squad-card-ids') || '';
    const attemptId = button.getAttribute('data-attempt-id') || '';
    const routes = getApiRoutes();
    button.disabled = true;
    button.textContent = 'Claiming...';
    button.classList.add('button-working');
    status.textContent = 'Claiming rewards...';

    try {
      const response = await fetch(routes.battles, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ encounterId, squadCardIds, attemptId }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        if (payload?.code === 'duplicate-battle-attempt') {
          resultTarget.innerHTML = renderClaimedRewards({
            ok: false,
            code: payload.code,
            error: 'These rewards have already been claimed.',
          });
          status.textContent = 'These rewards have already been claimed.';
          button.disabled = true;
          button.textContent = 'Already Claimed';
          button.classList.remove('button-working');
          button.classList.add('button-resolved');
          button.setAttribute('aria-disabled', 'true');
          button.setAttribute('data-resolved', 'true');
          return;
        }

        throw new Error(payload?.error || `Battle failed with ${response.status}`);
      }

      if (payload.ok) {
        await refreshTopBarResources(document, {
          gold: payload.rewardApplied?.goldAfter,
        });
      }

      resultTarget.innerHTML = renderClaimedRewards(payload);
      status.textContent = payload.ok ? 'Rewards claimed.' : 'Rewards could not be claimed.';
      button.classList.remove('button-working');

      if (payload.ok) {
        button.textContent = 'Claimed';
        button.classList.add('button-resolved');
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('data-resolved', 'true');
      } else {
        button.disabled = false;
        button.textContent = 'Claim Rewards';
      }
    } catch (error) {
      status.textContent = error.message;
      resultTarget.innerHTML = renderClaimedRewards({ ok: false, error: error.message });
      button.disabled = false;
      button.textContent = 'Claim Rewards';
      button.classList.remove('button-working', 'button-resolved');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('data-resolved');
    }
  });
}
