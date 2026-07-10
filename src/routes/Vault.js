/* ============================================================================
   Vault Route
   Phase auth-current-user responsibility: render the signed-in player's Vault.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml } from '../components/format.js';
import { loadVaultCards } from '../data/vaultData.js';

function formatVaultOwnerName(vault) {
  return String(vault.ownerDisplayName || vault.selectedOwnerUserId || 'User')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'User';
}

function renderVaultCard(card) {
  const duplicateCount = Number(card.duplicateGroupCount || 1);
  const duplicateIndex = Number(card.duplicateGroupIndex || 1);
  const duplicateBadge = duplicateCount > 1
    ? `<span class="status-pill vault-copy-pill" style="position:absolute;left:0.45rem;top:0.45rem;z-index:4;min-height:1.45rem;padding:0.2rem 0.5rem;background:rgba(8,10,20,0.82);box-shadow:0 0.35rem 1rem rgba(0,0,0,0.25);" aria-label="Duplicate copy ${duplicateIndex} of ${duplicateCount}">Copy ${duplicateIndex}/${duplicateCount}</span>`
    : '';

  return `
    <div class="vault-card-slot" style="position:relative;min-width:0;" data-duplicate-group="${escapeHtml(card.duplicateGroupKey || card.id || '')}">
      ${duplicateBadge}
      ${renderCardFrame(card, { href: `#/vault/card/${card.id}`, context: 'vault' })}
    </div>
  `;
}

export async function renderVault() {
  const vault = await loadVaultCards({ force: true });
  const ownerName = formatVaultOwnerName(vault);

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">${ownerName}'s Vault</h2>
      <p class="hero-copy">This Vault is scoped to the currently signed-in player. Duplicate copies are grouped together by card template while preserving each owned copy.</p>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Collection</span>
          <h2 class="section-title">Owned Cards</h2>
        </div>
        <span class="status-pill">${vault.cards.length} owned</span>
      </div>
      <div class="card-grid vault-card-grid">
        ${vault.cards.map((card) => renderVaultCard(card)).join('')}
      </div>
    </section>
  `;
}
