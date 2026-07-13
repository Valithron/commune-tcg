/* ============================================================================
   Home Route
   Phase 2A responsibility: present the signed-in player's live daily state and
   recommend one clear next action without changing economy rules.
   ============================================================================ */

import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { loadVaultCards } from '../data/vaultData.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { formatNumber } from '../components/format.js';
import { trackTelemetry } from '../services/telemetry.js';

function getAggregateStats(card) {
  const stats = card?.stats || {};
  return Number(stats.pow || 0) + Number(stats.def || 0) + Number(stats.spd || 0);
}

function getStrongestVaultCard(cards = []) {
  return [...cards]
    .sort((a, b) => {
      const aggregateDifference = getAggregateStats(b) - getAggregateStats(a);
      if (aggregateDifference !== 0) return aggregateDifference;
      const levelDifference = Number(b?.level || 0) - Number(a?.level || 0);
      if (levelDifference !== 0) return levelDifference;
      return String(a?.name || '').localeCompare(String(b?.name || ''));
    })[0] || null;
}

async function loadHomeResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(`${routes.pullResources}?_=${Date.now()}`, { cache: 'no-store' });
    const resources = payload.resources || {};
    return {
      pullTickets: Number(resources.pullTickets || 0),
      gold: Number(resources.gold || 0),
      energy: Number(resources.energy || 0),
      energyMax: Number(resources.energyMax || 10),
      dailyTicketAvailable: resources.dailyTicketAvailable !== false,
      live: true,
    };
  } catch {
    return { pullTickets: 0, gold: 0, energy: 0, energyMax: 10, dailyTicketAvailable: false, live: false };
  }
}

function getSmartAction(resources) {
  if (!resources.live) {
    return { id: 'retry-resources', href: '#/home?refresh=1', label: 'Refresh Daily State', detail: 'Reconnect to see the best next action.' };
  }
  if (resources.dailyTicketAvailable) {
    return { id: 'claim-daily-ticket', href: '#/shop?focus=daily', label: 'Claim Today\'s Ticket', detail: 'Your free daily Ticket is ready.' };
  }
  if (resources.pullTickets >= 1) {
    return { id: 'make-pull', href: '#/pull?count=1&confirm=1', label: 'Make a Pull', detail: `${formatNumber(resources.pullTickets)} Ticket${resources.pullTickets === 1 ? '' : 's'} ready to spend.` };
  }
  if (resources.gold >= 1000) {
    return { id: 'exchange-gold', href: '#/shop', label: 'Exchange Gold for Tickets', detail: `${formatNumber(resources.gold)} Gold is available in the Ticket Shop.` };
  }
  if (resources.energy >= 1) {
    return { id: 'start-battle', href: '#/battle', label: 'Start a Battle', detail: `${formatNumber(resources.energy)} of ${formatNumber(resources.energyMax)} Energy available.` };
  }
  return { id: 'open-vault', href: '#/vault', label: 'Visit Your Vault', detail: 'Review your owned cards while resources recover.' };
}

function renderVaultHighlight(strongestCard) {
  if (!strongestCard) {
    return `
      <div class="home-feature-empty">
        <strong>Your Vault is empty</strong>
        <span>Claim a Ticket and make a pull to begin your collection.</span>
        <a class="button button-secondary" href="#/pull">Open Pull</a>
      </div>
    `;
  }

  return `
    <div class="home-feature-card">
      ${renderCardFrame(strongestCard, { href: `#/vault/card/${strongestCard.id}`, context: 'vault' })}
    </div>
  `;
}

export async function renderHome() {
  const [vault, resources] = await Promise.all([
    loadVaultCards({ force: true }),
    loadHomeResources(),
  ]);
  const strongestCard = getStrongestVaultCard(vault?.cards || []);
  const action = getSmartAction(resources);

  return `
    <section class="hero-panel home-daily-hero">
      <span class="section-kicker">Today in Imago Core</span>
      <h2 class="hero-title">Your next step is ready.</h2>
      <p class="hero-copy">Claim, pull, collect, and battle from one clear daily starting point.</p>
      <a class="button button-primary home-smart-action" href="${action.href}" data-home-smart-action="${action.id}">
        <strong>${action.label}</strong>
        <span>${action.detail}</span>
      </a>
      <div class="home-resource-summary" aria-label="Current resources">
        <span><strong>🎟 ${formatNumber(resources.pullTickets)}</strong> Tickets</span>
        <span><strong>◎ ${formatNumber(resources.gold)}</strong> Gold</span>
        <span><strong>⚡ ${formatNumber(resources.energy)}/${formatNumber(resources.energyMax)}</strong> Energy</span>
        <span><strong>${resources.dailyTicketAvailable ? 'Ready' : 'Claimed'}</strong> Daily Ticket</span>
      </div>
      ${resources.live ? '' : '<p class="home-resource-warning">Live resources could not be refreshed. No resource was changed.</p>'}
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Your Collection</span>
          <h2 class="section-title">Strongest Owned Card</h2>
        </div>
        <a class="status-pill" href="#/vault">${vault?.cards?.length || 0} owned</a>
      </div>
      <div class="home-collection-layout">
        ${renderVaultHighlight(strongestCard)}
        <div class="home-collection-actions">
          <a class="home-feature-button" href="#/vault"><strong>Vault</strong><span>Your owned card copies.</span></a>
          <a class="home-feature-button" href="#/library"><strong>Library</strong><span>Every available card design.</span></a>
          <a class="home-feature-button" href="#/battle"><strong>Battle</strong><span>Take your saved Squad into an encounter.</span></a>
        </div>
      </div>
    </section>
  `;
}

export function initHome(root) {
  root.querySelector('[data-home-smart-action]')?.addEventListener('click', (event) => {
    trackTelemetry('home.next_action_selected', {
      outcome: 'success',
      relatedId: event.currentTarget.getAttribute('data-home-smart-action') || '',
    });
  });
}
