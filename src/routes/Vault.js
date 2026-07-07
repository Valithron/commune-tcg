/* ============================================================================
   Vault Route
   Phase 8.4 responsibility: render the temporary active user's Vault using the
   shared Vault data source, with mock fallback owned by src/data/vaultData.js.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { loadVaultCards, temporaryVaultOwner } from '../data/vaultData.js';

function formatVaultOwnerName(ownerUserId) {
  return String(ownerUserId || temporaryVaultOwner || 'User')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'User';
}

export async function renderVault() {
  const vault = await loadVaultCards();
  const ownerName = formatVaultOwnerName(vault.selectedOwnerUserId);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">${ownerName}'s Vault</h2>
      <p class="hero-copy">The Vault is currently mapped to ${temporaryVaultOwner} as the temporary active owner until real authentication exists.</p>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Collection</span>
          <h2 class="section-title">Owned Cards</h2>
        </div>
        <span class="status-pill">${vault.cards.length} owned</span>
      </div>
      <div class="card-grid">
        ${vault.cards.map((card) => renderCardFrame(card, { href: `#/vault/card/${card.id}`, context: 'vault' })).join('')}
      </div>
    </section>
  `;
}
