/* ============================================================================
   Vault Route
   Phase 1 responsibility: owned-card collection using the canonical card frame.
   Filtering, sorting, details, and upgrades belong in later phases.
   ============================================================================ */

import { ownedCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderVault() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">Your Vault</h2>
      <p class="hero-copy">The Vault is the player's pulled collection. Phase 1 shows mock ownership, levels, and copy counts only.</p>
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
        ${ownedCards.map((card) => renderCardFrame(card)).join('')}
      </div>
    </section>
  `;
}
