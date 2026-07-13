/* ============================================================================
   Pull Route
   Responsibility: load current pull resources and compose the Pull page. Pull
   confirmation behavior lives in the PullConfirmationBottomSheet component.
   ============================================================================ */

import { clampPullCount } from '../components/format.js';
import { initPullConfirmationBottomSheet, renderPullConfirmationBottomSheet } from '../components/PullConfirmationBottomSheet.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { trackTelemetry } from '../services/telemetry.js';

async function loadResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    return {
      tickets: Number(payload.resources?.pullTickets || 0),
      available: true,
    };
  } catch {
    return {
      tickets: 0,
      available: false,
    };
  }
}

export async function renderPull({ query = {} } = {}) {
  const resources = await loadResources();
  const selectedCount = clampPullCount(query.count || 5);
  const sheetOpen = query.confirm === '1';
  const canPullOne = resources.available && resources.tickets >= 1;
  const canPullFive = resources.available && resources.tickets >= 5;
  const selectedAvailable = selectedCount === 1 ? canPullOne : canPullFive;

  return `
    <section class="hero-panel pull-hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Your balance is <strong>🎟 ${resources.tickets}</strong>. Choose one card for 1 Ticket or five cards for 5 Tickets. You will confirm before anything is spent.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-pull-open="${selectedCount}" ${selectedAvailable ? '' : 'disabled'}>Start ${selectedCount}-Pull</button>
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="pull-device pull-banner-device" aria-label="Standard summon banner">
      <button class="pull-banner-button" type="button" data-pull-open="${selectedCount}" aria-label="Open Standard Summon confirmation" ${selectedAvailable ? '' : 'disabled'}>
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
        <span class="resource-pill">🎟 ${resources.tickets} available</span>
      </div>
      <div class="quick-grid">
        <button class="quick-card quick-card-button" type="button" data-pull-open="1" ${canPullOne ? '' : 'disabled'}><strong>1-Pull</strong><span>1 card · 1 Ticket</span><small>${canPullOne ? 'Ready' : 'Not enough Tickets'}</small></button>
        <button class="quick-card quick-card-button" type="button" data-pull-open="5" ${canPullFive ? '' : 'disabled'}><strong>5-Pull</strong><span>5 cards · 5 Tickets</span><small>${canPullFive ? 'Ready' : 'Not enough Tickets'}</small></button>
      </div>
      ${resources.available ? '' : '<div class="empty-note">Ticket balance could not be refreshed. Pull controls are paused so no resource can be spent from stale state.</div>'}
    </section>

    ${renderPullConfirmationBottomSheet({ selectedCount, resources, sheetOpen })}
  `;
}

export function initPull(root) {
  root.querySelectorAll('[data-pull-open]').forEach((button) => {
    button.addEventListener('click', () => {
      trackTelemetry('pull.option_selected', {
        outcome: 'success',
        relatedId: `pull-count-${button.getAttribute('data-pull-open') || 'unknown'}`,
      });
    });
  });
  initPullConfirmationBottomSheet(root);
}
