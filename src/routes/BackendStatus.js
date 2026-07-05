import { getApiRoutes } from '../services/apiClient.js';

export function renderBackendStatus() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Backend Status</span>
      <h2 class="hero-title">Bridge, then bind.</h2>
      <p class="hero-copy">Battle Phase 2 adds no-write battle simulation while keeping battle history, rewards, XP, and currency writes deferred.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/inventory">Resource Inventory</a>
        <a class="button button-secondary" href="#/battle">Battle Hub</a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">API Endpoints</span>
      <h2 class="section-title">Checks and endpoint links</h2>
      <div class="backend-endpoint-list">
        <a href="${routes.health}" target="_blank" rel="noreferrer"><span>Health</span><strong>${routes.health}</strong></a>
        <a href="${routes.battleInventory}" target="_blank" rel="noreferrer"><span>Battle Inventory</span><strong>${routes.battleInventory}</strong></a>
        <a href="${routes.battleSimulate}?encounterId=training-yard-goblin" target="_blank" rel="noreferrer"><span>Battle Simulate</span><strong>${routes.battleSimulate}</strong></a>
        <a href="${routes.pullResources}" target="_blank" rel="noreferrer"><span>Pull Resources</span><strong>${routes.pullResources}</strong></a>
        <a href="${routes.pullHistory}" target="_blank" rel="noreferrer"><span>Pull History</span><strong>${routes.pullHistory}</strong></a>
        <a href="${routes.pullSimulate}?count=5" target="_blank" rel="noreferrer"><span>Pull Simulate</span><strong>${routes.pullSimulate}</strong></a>
        <a href="${routes.pullPool}" target="_blank" rel="noreferrer"><span>Pull Pool</span><strong>${routes.pullPool}</strong></a>
        <a href="${routes.vault}?ownerUserId=sterling" target="_blank" rel="noreferrer"><span>Sterling Vault</span><strong>${routes.vault}</strong></a>
        <a href="${routes.submissionReviewAudit}" target="_blank" rel="noreferrer"><span>Submission Review Audit</span><strong>${routes.submissionReviewAudit}</strong></a>
        <a href="${routes.cards}" target="_blank" rel="noreferrer"><span>Library Cards</span><strong>${routes.cards}</strong></a>
        <a href="${routes.schema}" target="_blank" rel="noreferrer"><span>D1 Schema</span><strong>${routes.schema}</strong></a>
        <a href="${routes.schemaDetails}" target="_blank" rel="noreferrer"><span>D1 Details</span><strong>${routes.schemaDetails}</strong></a>
        <a href="${routes.images}" target="_blank" rel="noreferrer"><span>R2 Images</span><strong>${routes.images}</strong></a>
        <a href="${routes.imagesSummary}" target="_blank" rel="noreferrer"><span>R2 Summary</span><strong>${routes.imagesSummary}</strong></a>
      </div>
    </section>

    <section class="glass-panel backend-panel">
      <span class="section-kicker">Safety</span>
      <h2 class="section-title">Battle Phase 2 guardrails</h2>
      <div class="admin-checklist">
        <div>Battle Inventory and Battle Simulate are read-only.</div>
        <div>No battle_history rows are written.</div>
        <div>No rewards, XP, level, currency, stamina, energy, or Vault data are changed.</div>
        <div>Pulls, submissions, Library, and Vault behavior are unchanged.</div>
      </div>
    </section>
  `;
}
