import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Phase 8.2 adds a read-only Vault endpoint before wiring real owned-card data into the Vault route.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Library</a>
        <a class="button button-secondary" href="#/vault">Vault</a>
        <a class="button button-secondary" href="#/backend">Backend Status</a>
        <a class="button button-secondary" href="#/admin">Admin</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Inventory Endpoints</span>
      <h2 class="section-title">Open after Cloudflare deploy</h2>
      <div class="backend-endpoint-list">
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
      <h2 class="section-title">Document before Vault route wiring</h2>
      <div class="admin-checklist">
        <div>Open /api/vault and confirm owned cards normalize into the CardFrame shape.</div>
        <div>Record ownerUserIds and decide the temporary owner strategy before wiring #/vault.</div>
        <div>Check whether progression fields are real or placeholder values.</div>
        <div>Check whether image keys resolve through /api/card-image.</div>
        <div>Keep /api/vault read-only until auth and user boundaries are explicit.</div>
      </div>
    </section>
  `;
}
