/* Admin diagnostic for the production create -> pending -> finalize lifecycle. */

import { createBattleAttempt, finalizeBattleAttempt } from '../services/battleApi.js';
import { fetchBattleInventory, getBattleCardKey, getDefaultBattleSquad } from '../services/battleSquadSelection.js';

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

export function renderAdminBattleTest() {
  return `<section class="hero-panel"><span class="section-kicker">Admin Battle Test</span><h1 class="hero-title">Verify the authoritative lifecycle.</h1><p class="hero-copy">Creates Crossroads Patrol with the three strongest eligible owned cards, verifies the pending event log, then finalizes once.</p><div class="action-row"><button class="button button-primary" type="button" data-admin-battle-test-run>Run Protected Battle</button><a class="button button-secondary" href="#/admin/inventory">Inventory</a></div></section><section class="glass-panel admin-panel"><div class="admin-checklist"><div>Server selects seed and runs the canonical lane engine.</div><div>Creation spends 1 Energy and stores a pending result.</div><div>Finalization applies persisted Gold and XP once.</div><div>Duplicate create/finalize calls remain idempotent.</div></div></section><section class="glass-panel admin-panel"><span class="section-kicker">Result</span><h2>Latest run</h2><div class="empty-note" data-admin-battle-test-status>Ready.</div><pre class="admin-debug-output" data-admin-battle-test-result>No run yet.</pre></section>`;
}

export function initAdminBattleTest(root) {
  const button = root.querySelector('[data-admin-battle-test-run]');
  const status = root.querySelector('[data-admin-battle-test-status]');
  const output = root.querySelector('[data-admin-battle-test-result]');
  if (!button) return;
  button.addEventListener('click', async () => {
    button.disabled = true; status.textContent = 'Loading owned battle cards…';
    try {
      const inventory = await fetchBattleInventory();
      const ids = getDefaultBattleSquad(inventory.battleEligibleCards || []).map(getBattleCardKey);
      if (ids.length !== 3) throw new Error('Three eligible owned cards are required.');
      status.textContent = 'Creating pending authoritative attempt…';
      const created = await createBattleAttempt({ encounterId: 'crossroads-patrol', orderedCardIds: ids });
      if (created.attempt.status !== 'pending' || !created.attempt.result?.combat?.events?.length) throw new Error('Pending event log was not returned.');
      status.textContent = 'Finalizing stored result once…';
      const finalized = await finalizeBattleAttempt({ attemptId: created.attempt.attemptId });
      status.textContent = 'Protected lifecycle passed.';
      output.textContent = JSON.stringify({ attemptId: created.attempt.attemptId, rulesVersion: created.attempt.rulesVersion, encounterVersion: created.attempt.encounterVersion, eventCount: created.attempt.result.combat.events.length, outcome: created.attempt.result.combat.outcome, mvp: created.attempt.result.combat.mvp, energyAfter: created.energyAfter, reward: finalized.settlement.reward, xpApplied: finalized.settlement.xpApplied }, null, 2);
    } catch (error) { status.textContent = error.message; output.textContent = escapeHtml(error.stack || error.message); }
    finally { button.disabled = false; }
  });
}
