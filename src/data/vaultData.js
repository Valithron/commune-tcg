/* ============================================================================
   Vault Data Source
   Phase 8.4 responsibility: centralize read-only Vault loading for list and
   detail routes. Keeps the temporary owner strategy in one place.
   ============================================================================ */

import { ownedCards, findCardById } from './mockCards.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

export const temporaryVaultOwner = 'sterling';

let vaultCache = null;

function mockVault(errorMessage = '') {
  return {
    cards: ownedCards,
    source: 'mock',
    selectedOwnerUserId: temporaryVaultOwner,
    warnings: errorMessage ? [errorMessage] : ['Using local mock owned cards.'],
  };
}

export function getVaultSourceLabel(vault) {
  return vault.source === 'backend' ? 'Live Vault · ' + temporaryVaultOwner : 'Mock Vault fallback';
}

export async function loadVaultCards({ force = false } = {}) {
  if (vaultCache && !force) {
    return vaultCache;
  }

  try {
    const routes = getApiRoutes();
    const path = routes.vault + '?' + 'ownerUserId=' + encodeURIComponent(temporaryVaultOwner);
    const payload = await fetchJson(path);

    if (!payload?.ok || !Array.isArray(payload.cards)) {
      vaultCache = mockVault(payload?.warnings?.join(' ') || 'No backend Vault cards were returned.');
      return vaultCache;
    }

    vaultCache = {
      cards: payload.cards,
      source: 'backend',
      selectedOwnerUserId: payload.selectedOwnerUserId || temporaryVaultOwner,
      ownerUserIds: payload.ownerUserIds || [],
      warnings: payload.warnings || [],
    };

    return vaultCache;
  } catch (error) {
    vaultCache = mockVault(error.message);
    return vaultCache;
  }
}

export async function findVaultCardById(cardId) {
  const vault = await loadVaultCards();
  const card = vault.cards.find((candidate) => String(candidate.id) === String(cardId)) || findCardById(cardId);

  return {
    ...vault,
    card,
  };
}
