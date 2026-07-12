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

    <section class="pull-device pull-banner-device" aria-label="Standard summon banner">
      <button class="pull-banner-button" type="button" data-pull-open="${selectedCount}" aria-label="Open Standard Summon confirmation">
        <img class="pull-banner-image" src="/assets/standard-banner-ic.png" alt="Seven Imago Core characters being summoned through the Core device" />
        <span class="pull-banner-copy" aria-hidden="true">
          <span class="pull-banner-kicker">Standard Pool</span>
          <span class="pull-banner-title">Standard Summon</span>
          <span class="pull-banner-subtitle">Use tickets to reveal Core variants.</span>
        </span>
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
