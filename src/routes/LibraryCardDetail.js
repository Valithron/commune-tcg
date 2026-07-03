/* ============================================================================
   Library Card Detail Route
   Phase 2 responsibility: show global card-template detail from mock data.
   Submission, moderation, and pull-pool eligibility are deferred.
   ============================================================================ */

import { findCardById } from '../data/mockCards.js';
import { renderCardDetailPanel } from '../components/CardDetailPanel.js';

export function renderLibraryCardDetail({ params }) {
  const card = findCardById(params.cardId);

  if (!card) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Library Detail</span>
        <h2 class="hero-title">Card not found.</h2>
        <p class="hero-copy">This card id does not exist in the Phase 2 mock Library.</p>
        <div class="action-row"><a class="button button-secondary" href="#/library">Back to Library</a></div>
      </section>
    `;
  }

  return `
    <section class="hero-panel">
      <span class="section-kicker">Global Template</span>
      <h2 class="hero-title">Library Detail</h2>
      <p class="hero-copy">Template-level card information lives here before player-specific Vault data is applied.</p>
      <div class="action-row"><a class="button button-secondary" href="#/library">Back to Library</a></div>
    </section>
    ${renderCardDetailPanel(card, { context: 'library' })}
  `;
}
