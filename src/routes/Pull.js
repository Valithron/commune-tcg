/* ============================================================================
   Pull Route
   Phase 2 responsibility: static gacha entry screen and links to confirmation.
   Real odds, ticket spend, and inventory writes belong in later phases.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';

export function renderPull() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Choose a pull size, review the mock confirmation, then reveal deterministic Phase 2 results.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
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
        <a class="quick-card" href="#/pull/confirm?count=1"><strong>1-Pull</strong><span>Costs 1 ticket. Confirm before reveal.</span></a>
        <a class="quick-card" href="#/pull/confirm?count=5"><strong>5-Pull</strong><span>Costs 5 tickets. Shows a batch result screen.</span></a>
      </div>
    </section>
  `;
}
