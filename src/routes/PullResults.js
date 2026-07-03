/* ============================================================================
   Pull Results Route
   Phase 2 responsibility: deterministic mock result reveal using CardFrame.
   Real inventory writes, duplicate handling, and animation belong later.
   ============================================================================ */

import { getMockPullResults } from '../data/mockPull.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { clampPullCount } from '../components/format.js';

export function renderPullResults({ query }) {
  const count = clampPullCount(query.count);
  const results = getMockPullResults(count);
  const headline = count === 5 ? 'Five cards joined the archive.' : 'A new card appears.';

  return `
    <section class="result-banner">
      <span class="section-kicker">Pull Results</span>
      <h2 class="hero-title">${headline}</h2>
      <p class="hero-copy">These are deterministic Phase 2 mock results. Later, this screen will read from the pull engine and write to the Vault.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=${count}">Pull Again</a>
        <a class="button button-secondary" href="#/vault">Go to Vault</a>
      </div>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Revealed</span>
          <h2 class="section-title">Result Cards</h2>
        </div>
        <span class="status-pill">${count}-Pull</span>
      </div>
      <div class="card-grid result-grid">
        ${results.map((card) => renderCardFrame(card, { href: `#/library/card/${card.id}` })).join('')}
      </div>
    </section>
  `;
}
