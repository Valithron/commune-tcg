/* ============================================================================
   Backend Status Route
   Phase 7 repair responsibility: expose safe endpoint links without raw
   backticks inside route template strings.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Backend Status</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Phase 6 expands read-only Cloudflare diagnostics into a resource inventory pass before real game writes exist.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/inventory">Resource Inventory</a>
        <a class="button button-secondary" href="#/admin">Back to Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">API Endpoints</span>
      <h2 class="section-title">Read-only checks</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.health}" target="_blank" rel="noreferrer"><span>Health</span><strong>${routes.health}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Schema</span><strong>${routes.schema}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>D1 Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Images</span><strong>${routes.images}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>R2 Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Safety</span>
      <h2 class="section-title">Phase 6 guardrails</h2>
      <div class="admin-checklist">
        <div>No endpoint spends tickets, grants rewards, approves cards, uploads files, or deletes objects.</div>
        <div>Schema inventory reads D1 metadata and table pragma information only.</div>
        <div>Image inventory lists sampled object metadata from CARD_IMAGES only.</div>
        <div>Real gameplay endpoints still require authentication and server-owned validation.</div>
      </div>
    </section>
  `;
}
