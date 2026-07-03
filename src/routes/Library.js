/* ============================================================================
   Library Route
   Phase 1 responsibility: global card pool preview using the canonical card frame.
   Real submission, approval, and discovery status belong in later phases.
   ============================================================================ */

import { mockCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';

export function renderLibrary() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Global Pool</span>
      <h2 class="hero-title">The Library</h2>
      <p class="hero-copy">The Library represents every approved card template that can enter the pull pool. Phase 1 uses curated mock cards.</p>
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
        ${mockCards.map((card) => renderCardFrame(card)).join('')}
      </div>
    </section>
  `;
}
