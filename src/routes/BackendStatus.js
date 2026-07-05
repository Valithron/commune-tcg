import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Backend</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Backend checks now live inside the isolated admin shell. These links inspect health, schema, pulls, battle history, and battle contracts without sending the user back into the player game.</p>
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
        <a href="${routes.battleSimulate}?encounterId=training-yard-goblin" target="_blank" rel="noreferrer"><span>Battle Simulate</span><strong>${routes.battleSimulate}</strong></a>
        <a href="${routes.battleHistory}" target="_blank" rel="noreferrer"><span>Battle History</span><strong>${routes.battleHistory}</strong></a>
        <a href="/api/battle-reward-contract" target="_blank" rel="noreferrer"><span>Battle Contract</span><strong>/api/battle-reward-contract</strong></a>
        <a href="${routes.pullResources}" target="_blank" rel="noreferrer"><span>Pull Resources</span><strong>${routes.pullResources}</strong></a>
        <a href="${routes.pullHistory}" target="_blank" rel="noreferrer"><span>Pull History</span><strong>${routes.pullHistory}</strong></a>
        <a href="${routes.pullSimulate}?count=5" target="_blank" rel="noreferrer"><span>Pull Simulate</span><strong>${routes.pullSimulate}</strong></a>
        <a href="${routes.pullPool}" target="_blank" rel="noreferrer"><span>Pull Pool</span><strong>${routes.pullPool}</strong></a>
        <a href="${routes.vault}?ownerUserId=sterling" target="_blank" rel="noreferrer"><span>Sterling Vault API</span><strong>${routes.vault}</strong></a>
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
      <h2 class="section-title">Admin containment guardrails</h2>
      <div class="admin-checklist">
        <div>This page is rendered by AdminShell, not AppShell.</div>
        <div>Internal page links stay inside #/admin routes.</div>
        <div>Endpoint links open raw API diagnostics only.</div>
        <div>POST /api/battles still writes battle_history only.</div>
      </div>
    </section>
  `;
}
