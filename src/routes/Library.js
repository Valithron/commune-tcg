/* ============================================================================
   Library Route
   Phase 2 responsibility: global card pool preview linking to template details.
   Real submission, approval, and discovery status belong in later phases.
   ============================================================================ */

import { mockCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderLibrary() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Global Pool</span>
      <h2 class="hero-title">The Library</h2>
      <p class="hero-copy">The Library represents every approved card template that can enter the pull pool. Tap a card to inspect its template detail.</p>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Preview</span>
          <h2 class="section-title">All Known Cards</h2>
        </div>
        <span class="status-pill">${mockCards.length} cards</span>
      </div>
      <div class="card-grid">
        ${mockCards.map((card) => renderCardFrame(card, { href: `#/library/card/${card.id}` })).join('')}
      </div>
    </section>
  `;
}
