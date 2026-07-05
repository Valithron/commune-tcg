import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Resource and contract diagnostics now live inside the isolated admin shell. This keeps player routes clean while preserving the tools needed to verify battle and pull systems.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Admin Home</a>
        <a class="button button-secondary" href="#/admin/backend">Backend Status</a>
        <a class="button button-secondary" href="#/admin/card-lab">Card Lab</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.battleInventory}" target="_blank" rel="noreferrer"><span>Battle Inventory</span><strong>${routes.battleInventory}</strong></a>
        <a href="${routes.battleSimulate}?encounterId=training-yard-goblin" target="_blank" rel="noreferrer"><span>Battle Simulate</span><strong>${routes.battleSimulate}</strong></a>
        <a href="${routes.battleHistory}" target="_blank" rel="noreferrer"><span>Battle History</span><strong>${routes.battleHistory}</strong></a>
        <a href="/api/battle-reward-contract" target="_blank" rel="noreferrer"><span>Battle Contract</span><strong>/api/battle-reward-contract</strong></a>
        <a href="${routes.pullResources}" target="_blank" rel="noreferrer"><span>Pull Resources</span><strong>${routes.pullResources}</strong></a>
        <a href="${routes.pullHistory}" target="_blank" rel="noreferrer"><span>Pull History</span><strong>${routes.pullHistory}</strong></a>
        <a href="${routes.pullSimulate}?count=5" target="_blank" rel="noreferrer"><span>Pull Simulate</span><strong>${routes.pullSimulate}</strong></a>
        <a href="${routes.pullPool}" target="_blank" rel="noreferrer"><span>Pull Pool</span><strong>${routes.pullPool}</strong></a>
        <a href="${routes.vault}?ownerUserId=sterling" target="_blank" rel="noreferrer"><span>Sterling Vault API</span><strong>${routes.vault}</strong></a>
        <a href="${routes.submissionReviewAudit}" target="_blank" rel="noreferrer"><span>Submission Review Audit</span><strong>${routes.submissionReviewAudit}</strong></a>
        <a href="${routes.submissions}" target="_blank" rel="noreferrer"><span>Submissions API</span><strong>${routes.submissions}</strong></a>
        <a href="${routes.vault}" target="_blank" rel="noreferrer"><span>Vault Cards API</span><strong>${routes.vault}</strong></a>
        <a href="${routes.vaultInventory}" target="_blank" rel="noreferrer"><span>Vault Ownership Inventory</span><strong>${routes.vaultInventory}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards API</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>Schema Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>Image Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Capture Checklist</span>
      <h2 class="section-title">Verify containment</h2>
      <div class="admin-checklist">
        <div>Open #/admin and confirm AdminShell renders instead of the player shell.</div>
        <div>Open Battle Contract and confirm phase is battle-4.</div>
        <div>Confirm POST /api/battles still writes battle_history only.</div>
        <div>Confirm player Home, Library, Pull, Battle, Vault, and Shop have no admin links.</div>
        <div>Confirm no progression, currency, stamina, energy, or Vault writes occurred.</div>
      </div>
    </section>
  `;
}
