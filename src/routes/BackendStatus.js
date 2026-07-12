import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Backend</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Backend checks include the canonical seeded battle engine, pending attempt lifecycle, Energy, and exactly-once settlement.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Admin Home</a>
        <a class="button button-secondary" href="#/admin/inventory">Resource Inventory</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">API Endpoints</span>
      <h2 class="section-title">Checks and endpoint links</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.health}" target="_blank" rel="noreferrer"><span>Health</span><strong>${routes.health}</strong></a>
        <a href="${routes.battleInventory}" target="_blank" rel="noreferrer"><span>Battle Inventory</span><strong>${routes.battleInventory}</strong></a>
        <a href="${routes.battleEncounters}" target="_blank" rel="noreferrer"><span>Battle Encounters</span><strong>${routes.battleEncounters}</strong></a>
        <a href="${routes.battleHistory}" target="_blank" rel="noreferrer"><span>Battle History</span><strong>${routes.battleHistory}</strong></a>
        <a href="/api/battle-reward-contract" target="_blank" rel="noreferrer"><span>Battle Contract</span><strong>/api/battle-reward-contract</strong></a>
        <a href="${routes.pullResources}" target="_blank" rel="noreferrer"><span>Pull Resources</span><strong>${routes.pullResources}</strong></a>
        <a href="${routes.pullHistory}" target="_blank" rel="noreferrer"><span>Pull History</span><strong>${routes.pullHistory}</strong></a>
        <a href="${routes.pullSimulate}?count=5" target="_blank" rel="noreferrer"><span>Pull Simulate</span><strong>${routes.pullSimulate}</strong></a>
        <a href="${routes.pullPool}" target="_blank" rel="noreferrer"><span>Pull Pool</span><strong>${routes.pullPool}</strong></a>
        <a href="${routes.vault}" target="_blank" rel="noreferrer"><span>Signed-in Vault API</span><strong>${routes.vault}</strong></a>
        <a href="${routes.adminTelemetry}?limit=200" target="_blank" rel="noreferrer"><span>Telemetry Export</span><strong>${routes.adminTelemetry}</strong></a>
        <a href="${routes.submissionReviewAudit}" target="_blank" rel="noreferrer"><span>Submission Review Audit</span><strong>${routes.submissionReviewAudit}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards API</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Schema</span><strong>${routes.schema}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>D1 Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Images</span><strong>${routes.images}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>R2 Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Safety</span>
      <h2 class="section-title">Battle guardrails</h2>
      <div class="admin-checklist">
        <div>This page is rendered by AdminShell, not AppShell.</div>
        <div>POST /api/battles validates before pending-attempt and Energy writes.</div>
        <div>POST /api/battle-finalize settles stored outcome, Gold, XP, levels, and history once.</div>
        <div>No pull tickets, drops, shards, or Vault grants are written.</div>
      </div>
    </section>
  `;
}
