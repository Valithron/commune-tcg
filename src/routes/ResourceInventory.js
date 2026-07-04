import { getApiRoutes } from '../services/apiClient.js';

export function renderResourceInventory() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Resource Inventory</span>
      <h2 class="hero-title">Map what exists.</h2>
      <p class="hero-copy">Phase 8.1 adds a read-only Vault ownership inventory pass before wiring real owned-card data into the Vault route.</p>
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
      <h2 class="section-title">Document before Phase 8 read model</h2>
      <div class="admin-checklist">
        <div>Record whether cards.owner_user_id has owned rows and unique owners.</div>
        <div>Record any populated candidate ownership tables and their visible columns.</div>
        <div>Check whether owned cards have valid card_json payloads and image keys.</div>
        <div>Check whether the endpoint says Vault can likely map from cards.owner_user_id.</div>
        <div>Update docs/cloudflare-resource-inventory.md with findings before wiring real Vault reads.</div>
      </div>
    </section>
  `;
}
