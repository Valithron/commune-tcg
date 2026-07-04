import { shopOffers } from '../data/mockShop.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

async function loadResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    return {
      tickets: Number(payload.resources?.pullTickets || 0),
      source: payload.resources?.bootstrapped ? 'Live' : 'Starter',
    };
  } catch {
    return {
      tickets: 0,
      source: 'Unavailable',
    };
  }
}

export async function renderTicketShop() {
  const resources = await loadResources();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Ticket Shop</span>
      <h2 class="hero-title">Fuel the next pull.</h2>
      <p class="hero-copy">Phase 10.5 uses temporary Sterling ticket top-ups for testing. This is not a real purchase flow.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="glass-panel confirm-panel" data-ticket-shop-panel>
      <div class="detail-list">
        <div class="detail-row"><span>${resources.source} Tickets</span><strong>🎟 ${resources.tickets}</strong></div>
        <div class="detail-row"><span>Status</span><strong data-shop-status>Ready</strong></div>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Offers</span>
          <h2 class="section-title">Testing Top-Ups</h2>
        </div>
      </div>
      <div class="shop-grid">
        ${shopOffers.map((offer) => `
          <article class="shop-card">
            <span class="section-kicker">${offer.price}</span>
            <h3>${offer.title}</h3>
            <strong>${offer.amount}</strong>
            <p>${offer.description}</p>
            <button class="button button-secondary" type="button" data-top-up-amount="${offer.ticketAmount}">Add Tickets</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function initTicketShop(root) {
  const status = root.querySelector('[data-shop-status]');

  root.querySelectorAll('[data-top-up-amount]').forEach((button) => {
    button.addEventListener('click', async () => {
      const routes = getApiRoutes();
      const amount = Number(button.getAttribute('data-top-up-amount') || 1);

      status.textContent = 'Adding tickets...';

      try {
        const response = await fetch(routes.pullTopUp, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || `Top-up failed with ${response.status}`);
        }

        status.textContent = `Added ${payload.amount}. Tickets ${payload.ticketsBefore} -> ${payload.ticketsAfter}.`;
        window.setTimeout(() => window.location.reload(), 600);
      } catch (error) {
        status.textContent = error.message;
      }
    });
  });
}
