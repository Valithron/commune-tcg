/* ============================================================================
   Backend Status Route
   Phase 5 responsibility: expose safe endpoint links and integration status.
   This route does not perform automatic API calls during render.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Backend Status</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Phase 5 adds read-only Cloudflare Pages Function scaffolding so the connected D1 and R2 resources can be inspected before real game writes exist.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Back to Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">API Endpoints</span>
      <h2 class="section-title">Read-only checks</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.health}" target="_blank" rel="noreferrer"><span>Health</span><strong>${routes.health}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Schema</span><strong>${routes.schema}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Images</span><strong>${routes.images}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Safety</span>
      <h2 class="section-title">Phase 5 guardrails</h2>
      <div class="admin-checklist">
        <div>No endpoint spends tickets, grants rewards, approves cards, uploads files, or deletes objects.</div>
        <div>Schema inspection only reads `sqlite_master` from D1.</div>
        <div>Image inspection only lists a small sample from `CARD_IMAGES`.</div>
        <div>Real gameplay endpoints still require authentication and server-owned validation.</div>
      </div>
    </section>
  `;
}
