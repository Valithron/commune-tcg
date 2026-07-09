/* ============================================================================
   Vault Card Detail Route
   Phase auth-current-user responsibility: resolve owned card detail through the
   signed-in player's Vault only.
   ============================================================================ */

import { renderCardDetailPanel } from '../components/CardDetailPanel.js';
import { findVaultCardById, getVaultSourceLabel } from '../data/vaultData.js';

function formatVaultOwnerName(vault) {
  return String(vault.ownerDisplayName || vault.selectedOwnerUserId || 'User')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'User';
}

export async function renderVaultCardDetail({ params }) {
  const vault = await findVaultCardById(params.cardId, { force: true });
  const card = vault.card;
  const ownerName = formatVaultOwnerName(vault);

  if (!card || !card.owned) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Vault Detail</span>
        <h2 class="hero-title">Card not owned.</h2>
        <p class="hero-copy">This card was not found in ${ownerName}'s signed-in Vault.</p>
        <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
      </section>
    `;
  }

  const sourceLabel = getVaultSourceLabel(vault);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Card</span>
      <h2 class="hero-title">Vault Detail</h2>
      <p class="hero-copy">This card is resolved from ${ownerName}'s signed-in Vault.</p>
      <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
    </section>
    <div class="empty-note">Source: ${sourceLabel}</div>
    ${renderCardDetailPanel(card, { context: 'vault' })}
  `;
}
