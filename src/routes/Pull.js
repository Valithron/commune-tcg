import { mockUser } from '../data/mockUser.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

async function loadResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    return {
      tickets: Number(payload.resources?.pullTickets ?? mockUser.pullTickets),
      source: payload.resources?.bootstrapped ? 'Live Tickets' : 'Starter Tickets',
    };
  } catch {
    return {
      tickets: mockUser.pullTickets,
      source: 'Mock Tickets',
    };
  }
}

export async function renderPull() {
  const routes = getApiRoutes();
  const resources = await loadResources();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Phase 10.4 shows live Sterling ticket resources and pull history diagnostics.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
        <a class="button button-secondary" href="${routes.pullPool}" target="_blank" rel="noreferrer">Pull Pool Audit</a>
        <a class="button button-secondary" href="${routes.pullHistory}" target="_blank" rel="noreferrer">Pull History</a>
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
        <span class="resource-pill">🎟 ${resources.tickets} · ${resources.source}</span>
      </div>
      <div class="quick-grid">
        <a class="quick-card" href="#/pull/confirm?count=1"><strong>1-Pull</strong><span>Costs 1 ticket.</span></a>
        <a class="quick-card" href="#/pull/confirm?count=5"><strong>5-Pull</strong><span>Costs 5 tickets.</span></a>
      </div>
    </section>
  `;
}
