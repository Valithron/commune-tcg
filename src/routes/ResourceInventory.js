/* ============================================================================
   Resource Inventory Route
   Phase 6 responsibility: link to read-only resource inventory endpoints and
   define what to capture before real backend integration.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Phase 6 inventories the connected Cloudflare D1 and R2 resources before any real gameplay writes are implemented.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/backend">Backend Status</a>
        <a class="button button-secondary" href="#/admin">Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>D1 Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>R2 Summary</span><strong>${routes.imagesSummary}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Tables</span><strong>${routes.schema}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Sample</span><strong>${routes.images}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Capture Checklist</span>
      <h2 class="section-title">Document before Phase 7</h2>
      <div class="admin-checklist">
        <div>Record the actual table names, columns, primary keys, and indexes from D1.</div>
        <div>Record the actual R2 object key patterns, extensions, and top-level prefixes.</div>
        <div>Identify which table, if any, already represents approved card templates.</div>
        <div>Identify which column, if any, maps cards to image object keys.</div>
        <div>Update docs/cloudflare-resource-inventory.md with findings before wiring real Library reads.</div>
      </div>
    </section>
  `;
}
