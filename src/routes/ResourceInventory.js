import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Phase 10.4 hardens live pulls with resource and history checks.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Pull Chamber</a>
        <a class="button button-secondary" href="#/vault">Vault</a>
        <a class="button button-secondary" href="#/backend">Backend Status</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
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
      <h2 class="section-title">Verify pull hardening</h2>
      <div class="admin-checklist">
        <div>Open Pull Resources and confirm tickets.</div>
        <div>Open Pull History and confirm recent pulls.</div>
        <div>Confirm Pull and Confirm show live ticket data.</div>
        <div>Confirm low tickets block Resolve Pull.</div>
        <div>Confirm battle and rewards are unchanged.</div>
      </div>
    </section>
  `;
}
