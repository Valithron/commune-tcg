/* ============================================================================
   Vault Card Detail Route
   Phase 2 responsibility: show player-owned card detail from mock data.
   Upgrade actions and inventory writes are intentionally deferred.
   ============================================================================ */

import { findCardById } from '../data/mockCards.js';
import { renderCardDetailPanel } from '../components/CardDetailPanel.js';

export function renderVaultCardDetail({ params }) {
  const card = findCardById(params.cardId);

  if (!card || !card.owned) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Vault Detail</span>
        <h2 class="hero-title">Card not owned.</h2>
        <p class="hero-copy">This Phase 2 route only shows cards currently marked as owned in mock data.</p>
        <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
      </section>
    `;
  }

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Card</span>
      <h2 class="hero-title">Vault Detail</h2>
      <p class="hero-copy">Player-specific card state lives here: level, copies, and future upgrade hooks.</p>
      <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
    </section>
    ${renderCardDetailPanel(card, { context: 'vault' })}
  `;
}
