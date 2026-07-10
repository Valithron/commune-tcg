import { shopOffers } from '../data/mockShop.js';
import { escapeHtml, formatNumber } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

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
  return offer.daily ? 'Claim Ticket' : 'Buy Tickets';
}

function getOfferStatus(offer, resources) {
  if (!resources.resourceReadOk) {
    return 'Server will validate current bank state';
  }

  if (offer.daily) {
    return resources.dailyTicketAvailable
      ? 'Available now'
      : `Already claimed for ${resources.dailyTicketClaimedOn || resources.mountainDate || 'today'}. Server will reject another claim until midnight Mountain Time.`;
  }

  if (offer.costGold > resources.gold) {
    return `Costs ${formatNumber(offer.costGold)} gold. Current bank: ${formatNumber(resources.gold)}.`;
  }

  return `${formatNumber(offer.costGold)} gold from bank`;
}

function renderOfferCard(offer, resources) {
  const shouldWarn = resources.resourceReadOk && ((offer.daily && !resources.dailyTicketAvailable) || offer.costGold > resources.gold);

  return `
    <article class="shop-card">
      <span class="section-kicker">${escapeHtml(offer.price)}</span>
      <h3>${escapeHtml(offer.title)}</h3>
      <strong>${escapeHtml(offer.amount)}</strong>
      <p>${escapeHtml(offer.description)}</p>
      <div class="empty-note">${escapeHtml(getOfferStatus(offer, resources))}</div>
      <button
        class="button ${shouldWarn ? 'button-secondary' : 'button-primary'}"
        type="button"
        data-shop-offer-id="${escapeHtml(offer.id)}"
      >${escapeHtml(getOfferButtonCopy(offer))}</button>
    </article>
  `;
}

export async function renderTicketShop() {
  const resources = await loadResources();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Ticket Shop</span>
      <h2 class="hero-title">Fuel the next pull.</h2>
      <p class="hero-copy">Tickets and gold are scoped to ${escapeHtml(resources.ownerDisplayName)}'s signed-in account. The daily claim resets at midnight Mountain Time.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="glass-panel confirm-panel" data-ticket-shop-panel>
      <div class="detail-list">
        <div class="detail-row"><span>${escapeHtml(resources.source)} Tickets</span><strong>🎟 ${formatNumber(resources.tickets)}</strong></div>
        <div class="detail-row"><span>Gold Bank</span><strong>◎ ${formatNumber(resources.gold)}</strong></div>
        <div class="detail-row"><span>Daily Claim</span><strong>${resources.resourceReadOk ? (resources.dailyTicketAvailable ? 'Available' : 'Claimed') : 'Unknown'}</strong></div>
        <div class="detail-row"><span>Account</span><strong>${escapeHtml(resources.ownerDisplayName)}</strong></div>
        <div class="detail-row"><span>Status</span><strong data-shop-status>${resources.resourceReadOk ? 'Ready' : 'Resource read failed. Try an exchange and the server will validate it.'}</strong></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Offers</span>
          <h2 class="section-title">Ticket Exchange</h2>
        </div>
      </div>
      <div class="shop-grid">
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
          throw new Error(payload?.error || `Ticket exchange failed with ${response.status}`);
        }

        const goldCopy = payload.goldCost ? ` Gold ${formatNumber(payload.goldBefore)} -> ${formatNumber(payload.goldAfter)}.` : '';
        if (status) {
          status.textContent = `${payload.offerTitle}: +${payload.ticketAmount} ticket${payload.ticketAmount === 1 ? '' : 's'}. Tickets ${formatNumber(payload.ticketsBefore)} -> ${formatNumber(payload.ticketsAfter)}.${goldCopy}`;
        }
        window.setTimeout(() => window.location.reload(), 700);
      } catch (error) {
        if (status) {
          status.textContent = error.message;
        }
        button.dataset.shopBusy = '0';
        button.removeAttribute('aria-busy');
      }
    });
  });
}