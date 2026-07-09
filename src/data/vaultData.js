/* ============================================================================
   Vault Data Source
   Phase auth-current-user responsibility: centralize signed-in Vault loading for
   list and detail routes, with mock fallback only when backend read fails.
   ============================================================================ */

import { ownedCards, findCardById } from './mockCards.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

export const temporaryVaultOwner = 'sterling';

let vaultCache = null;
let vaultCacheOwner = '';

function currentOwner() {
  const user = getCachedAuthUser();
  return {
    id: user?.id || temporaryVaultOwner,
    displayName: user?.displayName || user?.username || 'User',
  };
}

function mockVault(errorMessage = '') {
  const owner = currentOwner();
  return {
    cards: ownedCards,
    source: 'mock',
    selectedOwnerUserId: owner.id,
    ownerDisplayName: owner.displayName,
    warnings: errorMessage ? [errorMessage] : ['Using local mock owned cards.'],
  };
}

export function getVaultSourceLabel(vault) {
  return vault.source === 'backend' ? 'Live Vault · ' + (vault.ownerDisplayName || vault.selectedOwnerUserId || 'User') : 'Mock Vault fallback';
}

export async function loadVaultCards({ force = false } = {}) {
  const owner = currentOwner();
  if (vaultCache && !force && vaultCacheOwner === owner.id) {
    return vaultCache;
  }

  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.vault, { cache: 'no-store' });

    if (!payload?.ok || !Array.isArray(payload.cards)) {
      vaultCache = mockVault(payload?.warnings?.join(' ') || 'No backend Vault cards were returned.');
      vaultCacheOwner = owner.id;
      return vaultCache;
    }

    vaultCache = {
      cards: payload.cards,
      source: 'backend',
      selectedOwnerUserId: payload.selectedOwnerUserId || owner.id,
      ownerDisplayName: payload.ownerDisplayName || owner.displayName,
      ownerUserIds: payload.ownerUserIds || [],
      warnings: payload.warnings || [],
    };
    vaultCacheOwner = owner.id;

    return vaultCache;
  } catch (error) {
    vaultCache = mockVault(error.message);
    vaultCacheOwner = owner.id;
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
