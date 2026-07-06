/* ============================================================================
   Battle Squad Selection Service
   Phase 7 responsibility: shared helpers for selecting backend-owned battle
   cards by URL state. No DOM mutation and no writes.
   ============================================================================ */

import { fetchJson, getApiRoutes } from './apiClient.js';

export const battleSquadMaxSize = 3;
export const defaultBattleOwnerUserId = 'sterling';

export function getBattleCardKey(card) {
  return String(card?.sourceRowId || card?.id || '').trim();
}

export function parseSquadCardIds(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function encodeSquadCardIds(ids = []) {
  return parseSquadCardIds(ids).join(',');
}

export function buildBattleResultsHref({ encounterId, squadCardIds = [] }) {
  const params = new URLSearchParams();
  params.set('encounter', encounterId || 'training-yard-goblin');

  const encodedSquad = encodeSquadCardIds(squadCardIds);
  if (encodedSquad) {
    params.set('squadCardIds', encodedSquad);
  }

  return '#/battle/results?' + params.toString();
}

export function buildSquadBuilderHref({ encounterId, squadCardIds = [] }) {
  const params = new URLSearchParams();
  params.set('encounter', encounterId || 'training-yard-goblin');

  const encodedSquad = encodeSquadCardIds(squadCardIds);
  if (encodedSquad) {
    params.set('squadCardIds', encodedSquad);
  }

  return '#/battle/squad?' + params.toString();
}

export async function fetchBattleInventory({ ownerUserId = defaultBattleOwnerUserId } = {}) {
  const routes = getApiRoutes();
  const params = new URLSearchParams();
  params.set('ownerUserId', ownerUserId);
  params.set('_', String(Date.now()));

  return fetchJson(routes.battleInventory + '?' + params.toString());
}

export function getEligibleBattleCards(inventory) {
  return Array.isArray(inventory?.battleEligibleCards) ? inventory.battleEligibleCards : [];
}

export function getDefaultBattleSquad(cards = []) {
  return [...cards]
    .filter((card) => card?.eligible !== false)
    .sort((a, b) => Number(b.battlePower || 0) - Number(a.battlePower || 0))
    .slice(0, battleSquadMaxSize);
}

export function resolveSelectedBattleSquad(cards = [], requestedIds = []) {
  const cleanRequestedIds = parseSquadCardIds(requestedIds).slice(0, battleSquadMaxSize);
  const lookup = new Map();

  for (const card of cards) {
    lookup.set(String(card.id || ''), card);
    lookup.set(String(card.sourceRowId || ''), card);
  }

  const selected = [];
  const selectedKeys = new Set();

  for (const requestedId of cleanRequestedIds) {
    const card = lookup.get(requestedId);
    const key = getBattleCardKey(card);

    if (card && key && !selectedKeys.has(key) && card.eligible !== false) {
      selected.push(card);
      selectedKeys.add(key);
    }
  }

  if (!cleanRequestedIds.length) {
    return {
      selected: getDefaultBattleSquad(cards),
      requestedIds: cleanRequestedIds,
      selectionSource: 'default-highest-power',
    };
  }

  return {
    selected,
    requestedIds: cleanRequestedIds,
    selectionSource: 'url-query',
  };
}

export function getSelectedBattleIds(cards = []) {
  return cards.map(getBattleCardKey).filter(Boolean);
}

export function getBattleSquadPower(cards = []) {
  return cards.reduce((total, card) => total + Number(card.battlePower || 0), 0);
}

export function toggleBattleCardSelection({ selectedIds = [], cardId, maxSize = battleSquadMaxSize } = {}) {
  const cleanSelectedIds = parseSquadCardIds(selectedIds);
  const key = String(cardId || '').trim();

  if (!key) {
    return cleanSelectedIds;
  }

  if (cleanSelectedIds.includes(key)) {
    return cleanSelectedIds.filter((id) => id !== key);
  }

  if (cleanSelectedIds.length >= maxSize) {
    return cleanSelectedIds;
  }

  return [...cleanSelectedIds, key];
}
