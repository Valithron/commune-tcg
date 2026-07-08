/* ============================================================================
   Library Data Source
   Phase 7 responsibility: prefer read-only backend Library data and fall back
   to mock cards when deployed resources are unavailable or unmapped.
   ============================================================================ */

import { mockCards, findCardById } from './mockCards.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

let libraryCache = null;

function withMockFallback(errorMessage = '') {
  return {
    cards: mockCards,
    source: 'mock',
    table: null,
    warnings: errorMessage ? [errorMessage] : ['Using local mock cards.'],
  };
}

export async function loadLibraryCards({ force = false } = {}) {
  if (libraryCache && !force) {
    return libraryCache;
  }

  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.cards);

    if (!payload?.ok || !Array.isArray(payload.cards)) {
      libraryCache = withMockFallback(payload?.warnings?.join(' ') || 'No backend Library cards were returned.');
      return libraryCache;
    }

    libraryCache = {
      cards: payload.cards,
      source: 'backend',
      table: payload.table || null,
      warnings: payload.warnings || [],
      currentUserId: payload.currentUserId || '',
      ownedRowsExcluded: payload.ownedRowsExcluded || 0,
      ownershipMappedCount: payload.ownershipMappedCount || 0,
    };

    return libraryCache;
  } catch (error) {
    libraryCache = withMockFallback(error.message);
    return libraryCache;
  }
}

export async function findLibraryCardById(cardId) {
  const library = await loadLibraryCards({ force: true });
  const card = library.cards.find((candidate) => String(candidate.id) === String(cardId)
    || String(candidate.sourceRowId || '') === String(cardId)
    || String(candidate.templateId || '') === String(cardId)) || findCardById(cardId);

  return {
    ...library,
    card,
  };
}
