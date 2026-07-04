/* ============================================================================
   Backend Status Route
   Phase 9.2 responsibility: expose submission endpoint links while review
   actions and Library insertion remain deferred.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Backend Status</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Phase 9.2 adds pending-review submission creation while review actions and Library insertion remain deferred.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/inventory">Resource Inventory</a>
        <a class="button button-secondary" href="#/admin">Back to Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">API Endpoints</span>
      <h2 class="section-title">Checks and submission endpoints</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.health}" target="_blank" rel="noreferrer"><span>Health</span><strong>${routes.health}</strong></a>
        <a href="${routes.submissions}" target="_blank" rel="noreferrer"><span>Submissions</span><strong>${routes.submissions}</strong></a>
        <a href="${routes.adminSubmissions}" target="_blank" rel="noreferrer"><span>Admin Submissions</span><strong>${routes.adminSubmissions}</strong></a>
        <a href="${routes.submissionInventory}" target="_blank" rel="noreferrer"><span>Submission Inventory</span><strong>${routes.submissionInventory}</strong></a>
        <a href="${routes.vault}" target="_blank" rel="noreferrer"><span>Vault Cards</span><strong>${routes.vault}</strong></a>
        <a href="${routes.vaultInventory}" target="_blank" rel="noreferrer"><span>Vault Inventory</span><strong>${routes.vaultInventory}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Schema</span><strong>${routes.schema}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>D1 Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Images</span><strong>${routes.images}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>R2 Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Safety</span>
      <h2 class="section-title">Phase 9.2 guardrails</h2>
      <div class="admin-checklist">
        <div>Submissions create pending-review rows and upload one image to CARD_IMAGES.</div>
        <div>No review action endpoint exists yet.</div>
        <div>No submitted card enters Library or pull results yet.</div>
        <div>Real authentication and admin authorization are still deferred.</div>
      </div>
    </section>
  `;
}
