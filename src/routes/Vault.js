/* ============================================================================
   Vault Route
   Phase 2 responsibility: owned-card collection linking to owned detail screens.
   Filtering, sorting, upgrades, and backend ownership belong in later phases.
   ============================================================================ */

import { ownedCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderVault() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">Your Vault</h2>
      <p class="hero-copy">The Vault is the player's pulled collection. Tap a card to inspect its Phase 2 detail screen.</p>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Collection</span>
          <h2 class="section-title">Owned Cards</h2>
        </div>
        <span class="status-pill">${ownedCards.length} owned</span>
      </div>
      <div class="card-grid">
        ${ownedCards.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}` })).join('')}
      </div>
    </section>
  `;
}
