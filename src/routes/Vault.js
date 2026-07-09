/* ============================================================================
   Vault Route
   Phase auth-current-user responsibility: render the signed-in player's Vault.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { loadVaultCards } from '../data/vaultData.js';

function formatVaultOwnerName(vault) {
  return String(vault.ownerDisplayName || vault.selectedOwnerUserId || 'User')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'User';
}

export async function renderVault() {
  const vault = await loadVaultCards({ force: true });
  const ownerName = formatVaultOwnerName(vault);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">${ownerName}'s Vault</h2>
      <p class="hero-copy">This Vault is scoped to the currently signed-in player. Pulled cards and rewards should attach to this account.</p>
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
