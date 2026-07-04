/* ============================================================================
   Vault Route
   Phase 8.3 responsibility: read Sterling's temporary Vault from the read-only
   backend endpoint, with mock owned-card fallback if the endpoint is unavailable.
   ============================================================================ */

import { ownedCards } from '../data/mockCards.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

const temporaryVaultOwner = 'sterling';

async function loadVaultCards() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(`${routes.vault}?ownerUserId=${encodeURIComponent(temporaryVaultOwner)}`);

    if (!payload?.ok || !Array.isArray(payload.cards)) {
      return {
        cards: ownedCards,
        source: 'mock',
        warnings: payload?.warnings || ['No backend Vault cards were returned.'],
      };
    }

    return {
      cards: payload.cards,
      source: 'backend',
      warnings: payload.warnings || [],
    };
  } catch (error) {
    return {
      cards: ownedCards,
      source: 'mock',
      warnings: [error.message],
    };
  }
}

export async function renderVault() {
  const vault = await loadVaultCards();
  const sourceLabel = vault.source === 'backend'
    ? `Live Vault · ${temporaryVaultOwner}`
    : 'Mock Vault fallback';

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Cards</span>
      <h2 class="hero-title">Your Vault</h2>
      <p class="hero-copy">The Vault is currently mapped to Sterling as the temporary active owner until real authentication exists.</p>
    </section>

    <div class="empty-note">Source: ${sourceLabel}</div>

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
