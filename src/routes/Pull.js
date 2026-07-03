/* ============================================================================
   Pull Route
   Phase 1 responsibility: static gacha entry screen and CTA layout.
   Real odds, ticket spend, and results belong in later phases.
   ============================================================================ */

import { mockUser } from '../data/mockUser.js';

export function renderPull() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">This is the Phase 1 static pull screen. Confirmation, animation, results, pity rules, and duplicate conversion are intentionally deferred.</p>
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
        <a class="quick-card" href="#/pull"><strong>1-Pull</strong><span>Costs 1 ticket. Phase 2 will route through confirmation.</span></a>
        <a class="quick-card" href="#/pull"><strong>5-Pull</strong><span>Costs 5 tickets. Phase 2 will add result batching.</span></a>
      </div>
    </section>
  `;
}
