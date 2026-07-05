/* ============================================================================
   Battle Results Route
   Phase 6 responsibility: player-facing battle result screen with a deliberate
   button that calls the real Phase 5 reward write endpoint. No automatic writes.
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
    return '<div class="empty-note">XP will appear here after the battle is resolved.</div>';
  }

  return xpApplied.map((row) => `
    <div class="detail-row">
      <span>${escapeHtml(row.cardTitle || row.cardId || 'Card')}</span>
      <strong>+${escapeHtml(row.gainedXp || 0)} XP · Lv ${escapeHtml(row.previousLevel || 1)} → ${escapeHtml(row.nextLevel || row.previousLevel || 1)}</strong>
    </div>
  `).join('');
}

function renderResolvedBattle(payload) {
  if (!payload) {
    return '<div class="empty-note">Rewards have not been applied yet. Click Resolve Battle to write gold, XP, and battle history.</div>';
  }

  if (!payload.ok) {
    return `<div class="empty-note">Battle resolution failed: ${escapeHtml(payload.error || 'Unknown error')}</div>`;
  }

  const reward = payload.rewardApplied || {};
  const simulation = payload.simulation || {};
  const encounter = simulation.encounter || {};

  return `
    <div class="detail-list">
      <div class="detail-row"><span>Battle ID</span><strong>${escapeHtml(payload.battleId)}</strong></div>
      <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name || payload.historyRow?.encounterId || 'Unknown')}</strong></div>
      <div class="detail-row"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Loss'}</strong></div>
      <div class="detail-row"><span>Gold Applied</span><strong>◎ ${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="detail-row"><span>Total XP Applied</span><strong>${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="detail-row"><span>Writes</span><strong>${escapeHtml((payload.writes || []).join(', ') || 'None')}</strong></div>
    </div>

    <section class="glass-panel battle-summary-panel">
      <span class="section-kicker">Progression Applied</span>
      <h2 class="section-title">Squad XP</h2>
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
      <p class="hero-copy">This screen now uses a safe two-step flow. The preview loads first, and gold/XP are written only when you click Resolve Battle.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-battle-resolve data-encounter-id="${escapeHtml(result.encounter.id)}">Resolve Battle</button>
        <a class="button button-secondary" href="#/battle/squad?encounter=${result.encounter.id}">Battle Again</a>
        <a class="button button-secondary" href="#/battle/encounters">Choose New</a>
      </div>
    </section>

    <section class="glass-panel battle-summary-panel">
      <span class="section-kicker">Preview</span>
      <h2 class="section-title">Before reward write</h2>
      <div class="detail-row"><span>Encounter</span><strong>${result.encounter.name}</strong></div>
      <div class="detail-row"><span>Squad Power</span><strong>${result.squadPower}</strong></div>
      <div class="detail-row"><span>Preview Gold</span><strong>◎ ${result.rewards.gold}</strong></div>
      <div class="detail-row"><span>Preview XP</span><strong>${result.rewards.xp}</strong></div>
    </section>

    <section class="glass-panel battle-summary-panel">
      <span class="section-kicker">Live Result</span>
      <h2 class="section-title">Applied rewards</h2>
      <div class="empty-note" data-battle-resolve-status>Not resolved yet.</div>
      <div data-battle-resolve-result>
        ${renderResolvedBattle(null)}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Squad</span>
          <h2 class="section-title">Participants</h2>
        </div>
      </div>
      <div class="card-grid">
        ${result.squad.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}` })).join('')}
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Log</span>
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
    status.textContent = 'Resolving battle and applying rewards...';

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
      status.textContent = payload.ok ? 'Rewards applied. This battle is complete.' : 'Battle returned a validation error.';

      if (!payload.ok) {
        button.disabled = false;
      }
    } catch (error) {
      status.textContent = error.message;
      resultTarget.innerHTML = renderResolvedBattle({ ok: false, error: error.message });
      button.disabled = false;
    }
  });
}
