/* ============================================================================
   Pull Route
   Responsibility: load current pull resources and compose the Pull page. Pull
   confirmation behavior lives in the PullConfirmationBottomSheet component.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';
import { clampPullCount } from '../components/format.js';
import { initPullConfirmationBottomSheet, renderPullConfirmationBottomSheet } from '../components/PullConfirmationBottomSheet.js';
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

export async function renderPull({ query = {} } = {}) {
  const resources = await loadResources();
  const selectedCount = clampPullCount(query.count || 5);
  const sheetOpen = query.confirm === '1';

  return `
    <section class="hero-panel pull-hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Choose a single pull or a five-pull, then confirm before tickets are spent.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-pull-open="${selectedCount}">Start Pull</button>
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="pull-device" aria-label="Prototype pull device">
      <button class="pull-orb-image-button" type="button" data-pull-open="${selectedCount}" aria-label="Open pull confirmation">
        <img class="pull-orb-image" src="/assets/commune-pull-orb.svg" alt="Commune Pull" />
      </button>
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
        <button class="quick-card quick-card-button" type="button" data-pull-open="1"><strong>1-Pull</strong><span>Costs 1 ticket.</span></button>
        <button class="quick-card quick-card-button" type="button" data-pull-open="5"><strong>5-Pull</strong><span>Costs 5 tickets.</span></button>
      </div>
    </section>

    ${renderPullConfirmationBottomSheet({ selectedCount, resources, sheetOpen })}
  `;
}

export function initPull(root) {
  initPullConfirmationBottomSheet(root);
}
