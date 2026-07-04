/* ============================================================================
   Vault Card Detail Route
   Phase 8.4 responsibility: resolve owned card detail through the shared Vault
   data source while real auth is deferred.
   ============================================================================ */

import { renderCardDetailPanel } from '../components/CardDetailPanel.js';
import { findVaultCardById, getVaultSourceLabel, temporaryVaultOwner } from '../data/vaultData.js';

export async function renderVaultCardDetail({ params }) {
  const vault = await findVaultCardById(params.cardId);
  const card = vault.card;

  if (!card || !card.owned) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Vault Detail</span>
        <h2 class="hero-title">Card not owned.</h2>
        <p class="hero-copy">This card was not found in ${temporaryVaultOwner}'s temporary Vault mapping.</p>
        <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
      </section>
    `;
  }

  const sourceLabel = getVaultSourceLabel(vault);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Card</span>
      <h2 class="hero-title">Vault Detail</h2>
      <p class="hero-copy">Player-specific card state is currently read from the Phase 8.2 Vault endpoint for ${temporaryVaultOwner}.</p>
      <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
    </section>
    <div class="empty-note">Source: ${sourceLabel}</div>
    ${renderCardDetailPanel(card, { context: 'vault' })}
  `;
}
