/* ============================================================================
   Admin Battle Test Route
   Phase 8 responsibility: provide an admin-only button for testing the real
   protected battle reward write path without manual raw API calls.
   ============================================================================ */

import { createBattleAttemptId } from '../services/battleSquadSelection.js';
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
    return '<div class="empty-note">No XP application rows returned yet.</div>';
  }

  return xpApplied.map((row) => `
    <div class="detail-row">
      <span>${escapeHtml(row.cardTitle || row.cardId || 'Card')}</span>
      <strong>+${escapeHtml(row.gainedXp || 0)} XP · Lv ${escapeHtml(row.previousLevel || 1)} → ${escapeHtml(row.nextLevel || row.previousLevel || 1)}</strong>
    </div>
  `).join('');
}

function renderResult(payload) {
  if (!payload) {
    return '<div class="empty-note">No battle has been run from this panel yet.</div>';
  }

  if (!payload.ok) {
    return `
      <div class="empty-note">Battle test failed: ${escapeHtml(payload.error || 'Unknown error')}</div>
      <pre class="admin-debug-output">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    `;
  }

  const reward = payload.rewardApplied || {};
  const simulation = payload.simulation || {};
  const encounter = simulation.encounter || {};

  return `
    <div class="detail-list">
      <div class="detail-row"><span>Phase</span><strong>${escapeHtml(payload.phase)}</strong></div>
      <div class="detail-row"><span>Battle ID</span><strong>${escapeHtml(payload.battleId)}</strong></div>
      <div class="detail-row"><span>Attempt ID</span><strong>${escapeHtml(payload.attemptId || payload.duplicateProtection?.attemptId || 'missing')}</strong></div>
      <div class="detail-row"><span>Encounter</span><strong>${escapeHtml(encounter.name || payload.historyRow?.encounterId || 'Unknown')}</strong></div>
      <div class="detail-row"><span>Result</span><strong>${simulation.victory ? 'Victory' : 'Loss'}</strong></div>
      <div class="detail-row"><span>Gold</span><strong>+${escapeHtml(reward.gold || 0)}</strong></div>
      <div class="detail-row"><span>Total XP</span><strong>+${escapeHtml(reward.totalXp || 0)}</strong></div>
      <div class="detail-row"><span>Writes</span><strong>${escapeHtml((payload.writes || []).join(', ') || 'None')}</strong></div>
    </div>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">XP Applied</span>
      <h2 class="section-title">Owned squad card progression</h2>
      <div class="detail-list">
        ${renderAppliedXpRows(payload.xpApplied)}
      </div>
    </section>

    <details class="glass-panel admin-panel">
      <summary class="section-title">Raw response</summary>
      <pre class="admin-debug-output">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    </details>
  `;
}

export function renderAdminBattleTest() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Battle Test</span>
      <h2 class="hero-title">Run one protected test.</h2>
      <p class="hero-copy">This admin-only panel runs the real Phase 8 battle reward path with a fresh attempt ID. Duplicate attempt protection is enforced by the backend.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-admin-battle-test-run>Run Training Battle</button>
        <a class="button button-secondary" href="#/admin/inventory">Inventory</a>
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">What this writes</span>
      <h2 class="section-title">Phase 8 reward path</h2>
      <div class="admin-checklist">
        <div>Generates a fresh attemptId before POST /api/battles.</div>
        <div>Validates the selected battle first.</div>
        <div>Applies gold to user_resources once for that attempt.</div>
        <div>Applies XP and level updates to owned squad cards once for that attempt.</div>
        <div>Writes battle_history with attemptId, rewardApplied, and xpApplied details.</div>
        <div>Does not write drops, tickets, stamina, energy, Vault grants, or auth changes.</div>
      </div>
    </section>

    <section class="glass-panel admin-panel">
      <span class="section-kicker">Result</span>
      <h2 class="section-title">Latest admin test run</h2>
      <div data-admin-battle-test-status class="empty-note">Ready to run Training Yard Goblin.</div>
      <div data-admin-battle-test-result class="admin-test-result">
        ${renderResult(null)}
      </div>
    </section>
  `;
}

export function initAdminBattleTest(root) {
  const button = root.querySelector('[data-admin-battle-test-run]');
  const status = root.querySelector('[data-admin-battle-test-status]');
  const resultTarget = root.querySelector('[data-admin-battle-test-result]');

  if (!button || !status || !resultTarget) {
    return;
  }

  button.addEventListener('click', async () => {
    const routes = getApiRoutes();
    const attemptId = createBattleAttemptId();
    button.disabled = true;
    status.textContent = `Running Training Yard Goblin through POST /api/battles with attempt ${attemptId}...`;

    try {
      const response = await fetch(routes.battles, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          encounterId: 'training-yard-goblin',
          attemptId,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        throw new Error(payload?.error || `Battle test failed with ${response.status}`);
      }

      status.textContent = payload.ok ? 'Battle test complete. Review the protected reward below.' : 'Battle test returned a validation error.';
      resultTarget.innerHTML = renderResult(payload);
    } catch (error) {
      status.textContent = error.message;
      resultTarget.innerHTML = renderResult({ ok: false, error: error.message });
    } finally {
      button.disabled = false;
    }
  });
}
