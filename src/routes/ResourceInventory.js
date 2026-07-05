import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Battle Phase 2 simulates deterministic battle outcomes without writing battle history, rewards, XP, currency, or Vault changes.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/battle">Battle Hub</a>
        <a class="button button-secondary" href="#/vault">Vault</a>
        <a class="button button-secondary" href="#/backend">Backend Status</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.battleInventory}" target="_blank" rel="noreferrer"><span>Battle Inventory</span><strong>${routes.battleInventory}</strong></a>
        <a href="${routes.battleSimulate}?encounterId=training-yard-goblin" target="_blank" rel="noreferrer"><span>Battle Simulate</span><strong>${routes.battleSimulate}</strong></a>
        <a href="${routes.pullResources}" target="_blank" rel="noreferrer"><span>Pull Resources</span><strong>${routes.pullResources}</strong></a>
        <a href="${routes.pullHistory}" target="_blank" rel="noreferrer"><span>Pull History</span><strong>${routes.pullHistory}</strong></a>
        <a href="${routes.pullSimulate}?count=5" target="_blank" rel="noreferrer"><span>Pull Simulate</span><strong>${routes.pullSimulate}</strong></a>
        <a href="${routes.pullPool}" target="_blank" rel="noreferrer"><span>Pull Pool</span><strong>${routes.pullPool}</strong></a>
        <a href="${routes.vault}?ownerUserId=sterling" target="_blank" rel="noreferrer"><span>Sterling Vault</span><strong>${routes.vault}</strong></a>
        <a href="${routes.submissionReviewAudit}" target="_blank" rel="noreferrer"><span>Submission Review Audit</span><strong>${routes.submissionReviewAudit}</strong></a>
        <a href="${routes.submissions}" target="_blank" rel="noreferrer"><span>Submissions</span><strong>${routes.submissions}</strong></a>
        <a href="${routes.vault}" target="_blank" rel="noreferrer"><span>Vault Cards</span><strong>${routes.vault}</strong></a>
        <a href="${routes.vaultInventory}" target="_blank" rel="noreferrer"><span>Vault Ownership Inventory</span><strong>${routes.vaultInventory}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>Schema Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>Image Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Capture Checklist</span>
      <h2 class="section-title">Verify battle simulation</h2>
      <div class="admin-checklist">
        <div>Open Battle Inventory and confirm phase is battle-1.</div>
        <div>Open Battle Simulate and confirm phase is battle-2.</div>
        <div>Confirm readOnly is true and writes is an empty array.</div>
        <div>Confirm simulation includes squad, encounter, victory, rewardPreview, xpPreview, and combatLog.</div>
        <div>Confirm no battle_history, reward, XP, currency, or Vault writes occurred.</div>
      </div>
    </section>
  `;
}
