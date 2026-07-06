/* ============================================================================
   Battle Results Route
   Phase 8 responsibility: resolve the exact backend-owned squad selected on
   Squad Builder with a unique attempt ID so rewards can only apply once.
   ============================================================================ */

import { refreshTopBarResources } from '../components/TopBar.js';
import { getEncounterById } from '../data/mockBattle.js';
import {
  buildSquadBuilderHref,
  fetchBattleInventory,
  getBattleCardKey,
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

function renderAppliedXpRows(xpApplied = []) {
  if (!Array.isArray(xpApplied) || !xpApplied.length) {
    return '<div class="empty-note">No real XP has been applied yet.</div>';
  }

  return xpApplied.map((row) => `
    <div class="detail-row battle-applied-row">
      <span>${escapeHtml(row.cardTitle || row.cardId || 'Card')}</span>
      <strong>+${escapeHtml(row.gainedXp || 0)} XP · Lv ${escapeHtml(row.previousLevel || 1)} → ${escapeHtml(row.nextLevel || row.previousLevel || 1)}</strong>
    </div>
  `).join('');
}

function renderBackendSquadRows(cards = []) {
  if (!cards.length) {
    return '<div class="empty-note">No backend squad cards selected.</div>';
  }

  return cards.map((card) => `
    <div class="battle-card-row battle-card-row-selected">
      <div>
        <span class="section-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.category)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <small>Lv ${escapeHtml(card.level)} · XP ${escapeHtml(card.xp)} · ${escapeHtml(getBattleCardKey(card))}</small>
      </div>
      <div class="battle-card-stat-stack">
        <span>P${escapeHtml(card.stats?.pow ?? 0)} D${escapeHtml(card.stats?.def ?? 0)} S${escapeHtml(card.stats?.spd ?? 0)}</span>
        <strong>${escapeHtml(card.battlePower || 0)}</strong>
        <small>Will receive XP</small>
      </div>
    </div>
  `).join('');
}

function renderResolvedBattle(payload) {
  if (!payload) {
    return `
      <div class="battle-state-note battle-state-note-pending">
        <strong>Not resolved yet.</strong>
        <span>No gold, XP, level, or battle history write has happened from this screen yet.</span>
      </div>
    `;
  }

  if (!payload.ok) {
    return `
      <div class="battle-state-note battle-state-note-error">
        <strong>${payload.code === 'duplicate-battle-attempt' ? 'Already resolved.' : 'Resolution failed.'}</strong>
        <span>${escapeHtml(payload.error || 'Unknown error')}</span>
      </div>
    `;
  }

  const reward = payload.rewardApplied || {};
  const simulation = payload.simulation || {};
  const encounter = simulation.encounter || {};

  return `
    <div class="battle-state-note battle-state-note-live">
      <strong>Resolved for real.</strong>
      <span>This backend attempt has been marked used and cannot apply rewards again.</span>
    </div>

    <div class="detail-list">
      <div class="detail-row"><span>Battle ID</span><strong>${escapeHtml(payload.battleId)}</strong></div>
      <div class="detail-row"><span>Attempt ID</span><strong>${escapeHtml(payload.attemptId || payload.duplicateProtection?.attemptId || 'missing')}</strong></div>
      <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name || payload.historyRow?.encounterId || 'Unknown')}</strong></div>
      <div class="detail-row"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Loss'}</strong></div>
      <div class="detail-row"><span>Gold Applied</span><strong>◎ ${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="detail-row"><span>Gold After</span><strong>◎ ${escapeHtml(reward.goldAfter ?? 'refresh on next route')}</strong></div>
      <div class="detail-row"><span>Total XP Applied</span><strong>${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="detail-row"><span>Writes</span><strong>${escapeHtml((payload.writes || []).join(', ') || 'None')}</strong></div>
    </div>

    <section class="glass-panel battle-summary-panel battle-live-panel">
      <span class="section-kicker">Real Applied Progression</span>
      <h2 class="section-title">Cards that actually received XP</h2>
      <p class="body-copy">This should now match the backend squad selected before resolving.</p>
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
    const inventory = await fetchBattleInventory();
    const eligibleCards = getEligibleBattleCards(inventory);
    const selection = resolveSelectedBattleSquad(eligibleCards, query.squadCardIds);
    const selectedCards = selection.selected;
    const selectedIds = getSelectedBattleIds(selectedCards);
    const squadPower = getBattleSquadPower(selectedCards);
    const margin = squadPower - encounter.enemyPower;
    const victory = margin >= 0;
    const previewGold = victory ? encounter.rewardGold : Math.floor(encounter.rewardGold * 0.25);
    const previewXp = victory ? encounter.rewardXp : Math.floor(encounter.rewardXp * 0.35);
    const canResolve = selectedCards.length > 0 && Boolean(attemptId);

    return `
      <section class="result-banner">
        <span class="section-kicker">Battle Results</span>
        <h2 class="hero-title">${canResolve ? 'Ready to Resolve' : 'Resolve Blocked'}</h2>
        <p class="hero-copy">This result screen uses the backend-owned squad selected on the previous page and one unique attempt ID. The same attempt cannot apply rewards twice.</p>
        <div class="action-row">
          ${canResolve ? `<button class="button button-primary" type="button" data-battle-resolve data-encounter-id="${escapeHtml(encounter.id)}" data-squad-card-ids="${escapeHtml(selectedIds.join(','))}" data-attempt-id="${escapeHtml(attemptId)}">Resolve Battle</button>` : '<span class="button button-secondary" aria-disabled="true">Resolve Blocked</span>'}
          <a class="button button-secondary" href="${buildSquadBuilderHref({ encounterId: encounter.id, squadCardIds: selectedIds })}">Edit Squad</a>
          <a class="button button-secondary" href="#/battle/encounters">Choose New</a>
        </div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel">
        <span class="section-kicker">Backend Squad Preview</span>
        <h2 class="section-title">These selected cards will receive XP</h2>
        <div class="battle-state-note battle-state-note-preview">
          <strong>${canResolve ? 'Protected battle attempt.' : 'Resolve blocked.'}</strong>
          <span>${canResolve ? 'These selected IDs and this attempt ID are passed into POST /api/battles.' : 'A valid selected backend squad and attempt ID are required before rewards can be written.'}</span>
        </div>
        <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name)}</strong></div>
        <div class="detail-row"><span>Attempt ID</span><strong>${escapeHtml(attemptId || 'missing')}</strong></div>
        <div class="detail-row"><span>Enemy Power</span><strong>${escapeHtml(encounter.enemyPower)}</strong></div>
        <div class="detail-row"><span>Squad Power</span><strong>${escapeHtml(squadPower)}</strong></div>
        <div class="detail-row"><span>Forecast</span><strong>${margin >= 0 ? `Favored +${margin}` : `Risky ${margin}`}</strong></div>
        <div class="detail-row"><span>Preview Gold</span><strong>◎ ${escapeHtml(previewGold)}</strong></div>
        <div class="detail-row"><span>Preview XP</span><strong>${escapeHtml(previewXp)}</strong></div>
        <div class="detail-row"><span>Selected IDs</span><strong>${escapeHtml(selectedIds.join(', ') || 'none')}</strong></div>
      </section>

      <section class="glass-panel battle-summary-panel battle-live-panel">
        <span class="section-kicker">Real Backend Result</span>
        <h2 class="section-title">Applied rewards</h2>
        <div class="empty-note" data-battle-resolve-status>${canResolve ? 'Nothing has been written yet.' : 'Resolve is blocked until a valid backend squad and attempt ID are selected.'}</div>
        <div data-battle-resolve-result>
          ${renderResolvedBattle(null)}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Selected Backend Squad</span>
            <h2 class="section-title">Reward targets</h2>
          </div>
          <span class="status-pill">${selectedCards.length}/3</span>
        </div>
        <div class="battle-card-list">
          ${renderBackendSquadRows(selectedCards)}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Contract Log</span>
            <h2 class="section-title">Combat Summary</h2>
          </div>
        </div>
        <div class="battle-log">
          <div>${escapeHtml(selectedCards[0]?.name || 'Selected squad')} leads ${selectedCards.length} backend card(s) into ${escapeHtml(encounter.name)}.</div>
          <div>Squad power resolves to ${escapeHtml(squadPower)} against enemy power ${escapeHtml(encounter.enemyPower)}.</div>
          <div>${victory ? `The squad is favored by ${margin} power.` : `The squad is short by ${Math.abs(margin)} power.`}</div>
        </div>
      </section>
    `;
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Battle Results</span>
        <h2 class="hero-title">Inventory failed.</h2>
        <p class="hero-copy">The backend squad could not be loaded, so Resolve Battle is blocked to avoid rewarding the wrong cards.</p>
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
    button.textContent = 'Resolving...';
    button.classList.add('button-working');
    status.textContent = 'Resolving battle and applying real backend rewards to the selected squad...';

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
          resultTarget.innerHTML = renderResolvedBattle(payload);
          status.textContent = 'Already resolved. No rewards were applied again.';
          button.disabled = true;
          button.textContent = 'Already Resolved';
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

      resultTarget.innerHTML = renderResolvedBattle(payload);
      status.textContent = payload.ok ? 'Resolved. Rewards were applied to the selected backend squad.' : 'Battle returned a validation error.';
      button.classList.remove('button-working');

      if (payload.ok) {
        button.textContent = 'Resolved';
        button.classList.add('button-resolved');
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('data-resolved', 'true');
      } else {
        button.disabled = false;
        button.textContent = 'Resolve Battle';
      }
    } catch (error) {
      status.textContent = error.message;
      resultTarget.innerHTML = renderResolvedBattle({ ok: false, error: error.message });
      button.disabled = false;
      button.textContent = 'Resolve Battle';
      button.classList.remove('button-working', 'button-resolved');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('data-resolved');
    }
  });
}
