import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Phase 9.2 adds pending-review submission writes while keeping approval and Library insertion deferred.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/submit">Submit Card</a>
        <a class="button button-secondary" href="#/admin">Admin</a>
        <a class="button button-secondary" href="#/backend">Backend Status</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.submissions}" target="_blank" rel="noreferrer"><span>Submissions</span><strong>${routes.submissions}</strong></a>
        <a href="${routes.adminSubmissions}" target="_blank" rel="noreferrer"><span>Admin Submissions</span><strong>${routes.adminSubmissions}</strong></a>
        <a href="${routes.submissionInventory}" target="_blank" rel="noreferrer"><span>Submission Inventory</span><strong>${routes.submissionInventory}</strong></a>
        <a href="${routes.vault}" target="_blank" rel="noreferrer"><span>Vault Cards</span><strong>${routes.vault}</strong></a>
        <a href="${routes.vaultInventory}" target="_blank" rel="noreferrer"><span>Vault Ownership Inventory</span><strong>${routes.vaultInventory}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>Schema Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>Image Summary</span><strong>${routes.imagesSummary}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>Tables</span><strong>${routes.schema}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>Image Sample</span><strong>${routes.images}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Capture Checklist</span>
      <h2 class="section-title">Verify submission pipeline</h2>
      <div class="admin-checklist">
        <div>Open /api/submissions and confirm it returns the pending-review queue.</div>
        <div>Open /api/admin/submissions and confirm Admin reads the same rows.</div>
        <div>Submit one test card with a small PNG/JPG/WEBP image.</div>
        <div>Confirm the image key uses submissions/SUBMISSION_ID/original.EXT.</div>
        <div>Confirm no card appears in Library or pulls until a future approval endpoint exists.</div>
      </div>
    </section>
  `;
}
