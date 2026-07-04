import { mockUser } from '../data/mockUser.js';
import { getApiRoutes } from '../services/apiClient.js';

export function renderPull() {
  const routes = getApiRoutes();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Phase 10.1 maps the pull pool before real pull results exist.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
        <a class="button button-secondary" href="${routes.pullPool}" target="_blank" rel="noreferrer">Pull Pool Audit</a>
      </div>
    </section>

    <section class="pull-device" aria-label="Prototype pull device">
      <div class="pull-orb">Commune<br />Pull</div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Available</span>
          <h2 class="section-title">Pull Options</h2>
        </div>
        <span class="resource-pill">🎟 ${mockUser.pullTickets}</span>
      </div>
      <div class="quick-grid">
        <a class="quick-card" href="#/pull/confirm?count=1"><strong>1-Pull</strong><span>Costs 1 ticket. This is still mock behavior.</span></a>
        <a class="quick-card" href="#/pull/confirm?count=5"><strong>5-Pull</strong><span>Costs 5 tickets. This is still mock behavior.</span></a>
      </div>
    </section>
  `;
}
