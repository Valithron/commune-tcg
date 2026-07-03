/* ============================================================================
   Ticket Shop Route
   Phase 2 responsibility: static shop layout and resource loop placeholder.
   Payment, economy validation, and account writes require backend contracts later.
   ============================================================================ */

import { shopOffers } from '../data/mockShop.js';

export function renderTicketShop() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Ticket Shop</span>
      <h2 class="hero-title">Fuel the next pull.</h2>
      <p class="hero-copy">This shop is a static Phase 2 layout. No real currency changes, payments, claims, or server validation happen yet.</p>
      <div class="action-row"><a class="button button-secondary" href="#/pull">Back to Pull</a></div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Offers</span>
          <h2 class="section-title">Mock Ticket Offers</h2>
        </div>
      </div>
      <div class="shop-grid">
        ${shopOffers.map((offer) => `
          <article class="shop-card">
            <span class="section-kicker">${offer.price}</span>
            <h3>${offer.title}</h3>
            <strong>${offer.amount}</strong>
            <p>${offer.description}</p>
            <a class="button button-secondary" href="#/shop">Preview Only</a>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
