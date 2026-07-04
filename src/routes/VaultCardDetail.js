/* ============================================================================
   Vault Card Detail Route
   Phase 8.3 responsibility: show owned card detail from the read-only backend
   Vault endpoint, with mock fallback while real auth is deferred.
   ============================================================================ */

import { findCardById, ownedCards } from '../data/mockCards.js';
import { renderCardDetailPanel } from '../components/CardDetailPanel.js';
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

export async function renderVaultCardDetail({ params }) {
  const vault = await loadVaultCards();
  const card = vault.cards.find((candidate) => String(candidate.id) === String(params.cardId)) || findCardById(params.cardId);

  if (!card || !card.owned) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Vault Detail</span>
        <h2 class="hero-title">Card not owned.</h2>
        <p class="hero-copy">This card was not found in Sterling's temporary Vault mapping.</p>
        <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
      </section>
    `;
  }

  const sourceLabel = vault.source === 'backend'
    ? `Live Vault · ${temporaryVaultOwner}`
    : 'Mock Vault fallback';

  return `
    <section class="hero-panel">
      <span class="section-kicker">Owned Card</span>
      <h2 class="hero-title">Vault Detail</h2>
      <p class="hero-copy">Player-specific card state is currently read from the Phase 8.2 Vault endpoint for Sterling.</p>
      <div class="action-row"><a class="button button-secondary" href="#/vault">Back to Vault</a></div>
    </section>
    <div class="empty-note">Source: ${sourceLabel}</div>
    ${renderCardDetailPanel(card, { context: 'vault' })}
  `;
}
