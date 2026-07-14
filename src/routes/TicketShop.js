import { shopOffers } from '../data/mockShop.js';
import { escapeHtml, formatNumber } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { telemetryErrorCategory, trackTelemetry } from '../services/telemetry.js';

async function loadResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources + '?_=' + Date.now(), { cache: 'no-store' });
    const resources = payload.resources || {};

    return {
      tickets: Number(resources.pullTickets || 0),
      gold: Number(resources.gold || 0),
      source: resources.bootstrapped ? 'Live' : 'Starter',
      ownerDisplayName: payload.ownerDisplayName || resources.ownerDisplayName || 'Player',
      dailyTicketAvailable: resources.dailyTicketAvailable !== false,
      dailyTicketClaimedOn: resources.dailyTicketClaimedOn || '',
      mountainDate: resources.mountainDate || '',
      dailyResetTimeZone: resources.dailyResetTimeZone || 'America/Denver',
      resourceReadOk: true,
    };
  } catch {
    return {
      tickets: 0,
      gold: 0,
      source: 'Unavailable',
      ownerDisplayName: 'Player',
      dailyTicketAvailable: true,
      dailyTicketClaimedOn: '',
      mountainDate: '',
      dailyResetTimeZone: 'America/Denver',
      resourceReadOk: false,
    };
  }
}

function getOfferButtonCopy(offer) {
  return offer.daily ? 'Claim Today\'s Ticket' : 'Exchange Gold';
}

function getOfferStatus(offer, resources) {
  if (!resources.resourceReadOk) {
    return 'Balance unavailable. Refresh before exchanging.';
  }

  if (offer.daily) {
    return resources.dailyTicketAvailable
      ? 'Available now'
      : `Claimed for ${resources.dailyTicketClaimedOn || resources.mountainDate || 'today'}. Available again after midnight Mountain Time.`;
  }

  if (offer.costGold > resources.gold) {
    return `Costs ${formatNumber(offer.costGold)} gold. Current bank: ${formatNumber(resources.gold)}.`;
  }

  return `${formatNumber(offer.costGold)} gold from bank`;
}

function renderOfferCard(offer, resources) {
  const unavailable = !resources.resourceReadOk || (offer.daily && !resources.dailyTicketAvailable) || offer.costGold > resources.gold;

  return `
    <article class="shop-card${offer.daily ? ' shop-card--daily' : ''}" data-shop-offer-card="${escapeHtml(offer.id)}">
      <span class="section-kicker">${escapeHtml(offer.price)}</span>
      <h3>${escapeHtml(offer.title)}</h3>
      <strong>${escapeHtml(offer.amount)}</strong>
      <p>${escapeHtml(offer.description)}</p>
      <div class="empty-note">${escapeHtml(getOfferStatus(offer, resources))}</div>
      <button
        class="button ${unavailable ? 'button-secondary' : 'button-primary'}"
        type="button"
        data-shop-offer-id="${escapeHtml(offer.id)}"
        ${unavailable ? 'disabled' : ''}
      >${escapeHtml(unavailable && offer.daily ? 'Claimed Today' : getOfferButtonCopy(offer))}</button>
    </article>
  `;
}

export async function renderTicketShop({ query = {} } = {}) {
  const resources = await loadResources();
  const focusDaily = query.focus === 'daily';

  return `
    <section class="hero-panel">
      <span class="section-kicker">Ticket Shop</span>
      <h2 class="hero-title">Fuel the next pull.</h2>
      <p class="hero-copy">Claim one free Ticket each Mountain Time day, or exchange Gold at the listed rate. Current balance: <strong>🎟 ${formatNumber(resources.tickets)}</strong> and <strong>◎ ${formatNumber(resources.gold)}</strong>.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="glass-panel confirm-panel ticket-shop-balance" data-ticket-shop-panel>
      <div class="detail-list">
        <div class="detail-row"><span>Tickets</span><strong>🎟 ${formatNumber(resources.tickets)}</strong></div>
        <div class="detail-row"><span>Gold Bank</span><strong>◎ ${formatNumber(resources.gold)}</strong></div>
        <div class="detail-row"><span>Daily Claim</span><strong>${resources.resourceReadOk ? (resources.dailyTicketAvailable ? 'Available' : 'Claimed') : 'Unknown'}</strong></div>
        <div class="detail-row"><span>Status</span><strong data-shop-status>${resources.resourceReadOk ? 'Ready' : 'Balance unavailable. Refresh to continue.'}</strong></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Offers</span>
          <h2 class="section-title">Ticket Exchange</h2>
        </div>
      </div>
      <div class="shop-grid${focusDaily ? ' is-daily-focused' : ''}">
        ${shopOffers.map((offer) => renderOfferCard(offer, resources)).join('')}
      </div>
    </section>
  `;
}

export function initTicketShop(root) {
  const status = root.querySelector('[data-shop-status]');

  root.querySelectorAll('[data-shop-offer-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.dataset.shopBusy === '1') {
        return;
      }

      const routes = getApiRoutes();
      const offerId = button.getAttribute('data-shop-offer-id') || '';

      button.dataset.shopBusy = '1';
      button.setAttribute('aria-busy', 'true');
      if (status) {
        status.textContent = 'Updating bank...';
      }

      try {
        const response = await fetch(routes.pullTopUp, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ offerId }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw Object.assign(new Error(payload?.error || `Ticket exchange failed with ${response.status}`), { status: response.status });
        }

        trackTelemetry(offerId === 'daily-free-ticket' ? 'ticket.daily_claim_completed' : 'ticket.exchange_completed', { outcome: 'success', relatedId: offerId });

        const goldCopy = payload.goldCost ? ` Gold ${formatNumber(payload.goldBefore)} -> ${formatNumber(payload.goldAfter)}.` : '';
        if (status) {
          status.textContent = `${payload.offerTitle}: +${payload.ticketAmount} ticket${payload.ticketAmount === 1 ? '' : 's'}. Tickets ${formatNumber(payload.ticketsBefore)} -> ${formatNumber(payload.ticketsAfter)}.${goldCopy}`;
        }
        window.setTimeout(() => window.location.reload(), 700);
      } catch (error) {
        trackTelemetry(offerId === 'daily-free-ticket' ? 'ticket.daily_claim_completed' : 'ticket.exchange_completed', { outcome: 'failure', errorCategory: telemetryErrorCategory(error), relatedId: offerId });
        if (status) {
          status.textContent = error.message;
        }
        button.dataset.shopBusy = '0';
        button.removeAttribute('aria-busy');
      }
    });
  });
}
