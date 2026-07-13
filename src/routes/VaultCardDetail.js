/* ============================================================================
   Vault Card Detail Route
   Phase auth-current-user responsibility: resolve owned card detail through the
   signed-in player's Vault only.
   ============================================================================ */

import { renderCardDetailPanel } from '../components/CardDetailPanel.js';
import { findVaultCardById } from '../data/vaultData.js';
import { renderCardInspectionModal } from '../components/CardInspectionModal.js';

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

  return renderCardInspectionModal({
    cardId: card.id,
    context: 'vault',
    title: card.name || card.title || 'Owned Card',
    description: `This owned copy belongs to ${ownerName}'s Vault. Its level and XP stay with this copy.`,
    content: renderCardDetailPanel(card, { context: 'vault' }),
  });
}
