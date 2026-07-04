/* ============================================================================
   Backend Status Route
   Phase 9.4 responsibility: expose submission endpoint links and review-action
   status while pull eligibility remains deferred.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Backend Status</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Phase 9.4 adds server-owned submission review actions. Approved cards enter Library, but pulls remain deferred.</p>
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
        <a href="${routes.adminSubmission}" target="_blank" rel="noreferrer"><span>Admin Submission Detail</span><strong>${routes.adminSubmission}</strong></a>
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
      <h2 class="section-title">Phase 9.4 guardrails</h2>
      <div class="admin-checklist">
        <div>Approve creates an unowned Library card row from a submitted card.</div>
        <div>Needs Changes and Reject update only the submission review status.</div>
        <div>No submitted card enters pulls, Vault, battles, or rewards yet.</div>
        <div>Real authentication and admin authorization are still deferred.</div>
      </div>
    </section>
  `;
}
