/* ============================================================================
   Battle Results Route
   Phase 6.1 responsibility: player-facing battle result screen with clear
   preview-vs-applied labels and a visibly resolved backend reward button.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { getBattleOutcome } from '../data/mockBattle.js';
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
        <strong>Resolution failed.</strong>
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
      <span>This section reflects the backend write that was just applied.</span>
    </div>

    <div class="detail-list">
      <div class="detail-row"><span>Battle ID</span><strong>${escapeHtml(payload.battleId)}</strong></div>
      <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name || payload.historyRow?.encounterId || 'Unknown')}</strong></div>
      <div class="detail-row"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Loss'}</strong></div>
      <div class="detail-row"><span>Gold Applied</span><strong>◎ ${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="detail-row"><span>Total XP Applied</span><strong>${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="detail-row"><span>Writes</span><strong>${escapeHtml((payload.writes || []).join(', ') || 'None')}</strong></div>
    </div>

    <section class="glass-panel battle-summary-panel battle-live-panel">
      <span class="section-kicker">Real Applied Progression</span>
      <h2 class="section-title">Cards that actually received XP</h2>
      <p class="body-copy">This is the source of truth for which owned cards received XP from the backend.</p>
      <div class="detail-list">
        ${renderAppliedXpRows(payload.xpApplied)}
      </div>
    </section>
  `;
}

export function renderBattleResults({ query }) {
  const result = getBattleOutcome(query.encounter);
  const resultLabel = result.victory ? 'Ready to Resolve' : 'Risky Result';

  return `
    <section class="result-banner">
      <span class="section-kicker">Battle Results</span>
      <h2 class="hero-title">${resultLabel}</h2>
      <p class="hero-copy">This is a two-step battle screen. The preview is placeholder forecasting. The Resolve Battle button is the real backend reward write.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-battle-resolve data-encounter-id="${escapeHtml(result.encounter.id)}">Resolve Battle</button>
        <a class="button button-secondary" href="#/battle/squad?encounter=${result.encounter.id}">Battle Again</a>
        <a class="button button-secondary" href="#/battle/encounters">Choose New</a>
      </div>
    </section>

    <section class="glass-panel battle-summary-panel battle-preview-panel">
      <span class="section-kicker">Placeholder Preview</span>
      <h2 class="section-title">Forecast only, not yet written</h2>
      <div class="battle-state-note battle-state-note-preview">
        <strong>Preview only.</strong>
        <span>These numbers help frame the fight, but they are not the account write. Click Resolve Battle for the real result.</span>
      </div>
      <p class="body-copy">Real squad selection is not wired yet, so the backend may resolve with its default eligible owned squad. The applied XP section below shows the actual rewarded cards.</p>
      <div class="detail-row"><span>Encounter</span><strong>${result.encounter.name}</strong></div>
      <div class="detail-row"><span>Preview Squad Power</span><strong>${result.squadPower}</strong></div>
      <div class="detail-row"><span>Preview Gold</span><strong>◎ ${result.rewards.gold}</strong></div>
      <div class="detail-row"><span>Preview XP</span><strong>${result.rewards.xp}</strong></div>
    </section>

    <section class="glass-panel battle-summary-panel battle-live-panel">
      <span class="section-kicker">Real Backend Result</span>
      <h2 class="section-title">Applied rewards</h2>
      <div class="empty-note" data-battle-resolve-status>Nothing has been written yet.</div>
      <div data-battle-resolve-result>
        ${renderResolvedBattle(null)}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Placeholder Squad Preview</span>
          <h2 class="section-title">Preview participants</h2>
        </div>
      </div>
      <div class="card-grid">
        ${result.squad.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}` })).join('')}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Placeholder Log</span>
          <h2 class="section-title">Combat Summary</h2>
        </div>
      </div>
      <div class="battle-log">
        ${result.log.map((entry) => `<div>${entry}</div>`).join('')}
      </div>
    </section>
  `;
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
    const routes = getApiRoutes();
    button.disabled = true;
    button.textContent = 'Resolving...';
    button.classList.add('button-working');
    status.textContent = 'Resolving battle and applying real backend rewards...';

    try {
      const response = await fetch(routes.battles, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ encounterId }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        throw new Error(payload?.error || `Battle failed with ${response.status}`);
      }

      resultTarget.innerHTML = renderResolvedBattle(payload);
      status.textContent = payload.ok ? 'Resolved. Real gold and XP were applied.' : 'Battle returned a validation error.';
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
