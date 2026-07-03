import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Resource inventory now includes the Phase 7 read-only Library model endpoint for comparing normalized card output to the actual database schema.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Library</a>
        <a class="button button-secondary" href="#/backend">Backend Status</a>
        <a class="button button-secondary" href="#/admin">Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>Schema Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>Image Summary</span><strong>${routes.imagesSummary}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>Tables</span><strong>${routes.schema}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>Image Sample</span><strong>${routes.images}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Capture Checklist</span>
      <h2 class="section-title">Document before Phase 8</h2>
      <div class="admin-checklist">
        <div>Record the actual table names, columns, primary keys, and indexes.</div>
        <div>Record the actual image object key patterns, extensions, and top-level prefixes.</div>
        <div>Check whether the cards endpoint selected the correct Library table.</div>
        <div>Check whether image keys resolve through the card image endpoint.</div>
        <div>Update docs/cloudflare-resource-inventory.md with findings before wiring real Vault reads.</div>
      </div>
    </section>
  `;
}
