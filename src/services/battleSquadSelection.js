/* ============================================================================
   Battle Squad Selection Service
   Phase auth-current-user responsibility: shared helpers for selecting, saving,
   and loading signed-in-player battle squads.
   ============================================================================ */

import { fetchJson, getApiRoutes } from './apiClient.js';
import { telemetryErrorCategory, trackTelemetry } from './telemetry.js';

export const battleSquadMaxSize = 3;
export const defaultBattleOwnerUserId = '';

export function getBattleCardKey(card) { return String(card?.sourceRowId || card?.id || '').trim(); }
export function createBattleAttemptId() { const randomPart = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Math.random().toString(36).slice(2, 14); return `attempt_${Date.now().toString(36)}_${randomPart}`; }
export function normalizeBattleAttemptId(value) { return String(value || '').trim().slice(0, 120); }
export function parseSquadCardIds(value) { if (Array.isArray(value)) return value.map((id) => String(id).trim()).filter(Boolean); return String(value || '').split(',').map((id) => id.trim()).filter(Boolean); }
export function encodeSquadCardIds(ids = []) { return parseSquadCardIds(ids).join(','); }

function addOwnerParam(params, ownerUserId) { if (ownerUserId) params.set('ownerUserId', ownerUserId); }

export async function fetchBattleInventory({ ownerUserId = defaultBattleOwnerUserId } = {}) {
  const routes = getApiRoutes();
  const params = new URLSearchParams();
  addOwnerParam(params, ownerUserId);
  params.set('_', String(Date.now()));
  return fetchJson(routes.battleInventory + '?' + params.toString());
}

export async function fetchSavedBattleSquad({ ownerUserId = defaultBattleOwnerUserId } = {}) {
  const routes = getApiRoutes();
  const params = new URLSearchParams();
  addOwnerParam(params, ownerUserId);
  params.set('_', String(Date.now()));
  return fetchJson(routes.battleSquad + '?' + params.toString());
}

export async function saveBattleSquad({ ownerUserId = defaultBattleOwnerUserId, squadCardIds = [] } = {}) {
  const routes = getApiRoutes();
  const payload = { squadCardIds: encodeSquadCardIds(squadCardIds) };
  if (ownerUserId) payload.ownerUserId = ownerUserId;
  const response = await fetch(routes.battleSquad, { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const responsePayload = await response.json().catch(() => null);
  if (!response.ok || !responsePayload?.ok) {
    const error = Object.assign(new Error(responsePayload?.error || `Saved squad request failed with ${response.status}`), { status: response.status });
    trackTelemetry('squad.saved', { outcome: 'failure', errorCategory: telemetryErrorCategory(error) });
    throw error;
  }
  trackTelemetry('squad.saved', { outcome: 'success' });
  return responsePayload;
}

export async function fetchBattleAttemptStatus({ ownerUserId = defaultBattleOwnerUserId, attemptId } = {}) {
  const safeAttemptId = normalizeBattleAttemptId(attemptId);
  if (!safeAttemptId) return { ok: false, resolved: false, attemptId: '', battle: null, error: 'attemptId is required' };
  const routes = getApiRoutes();
  const params = new URLSearchParams();
  addOwnerParam(params, ownerUserId);
  params.set('attemptId', safeAttemptId);
  params.set('_', String(Date.now()));
  return fetchJson(routes.battleAttempt + '?' + params.toString());
}

export function getEligibleBattleCards(inventory) { return Array.isArray(inventory?.battleEligibleCards) ? inventory.battleEligibleCards : []; }
export function getDefaultBattleSquad(cards = []) { return [...cards].filter((card) => card?.eligible !== false).sort((a, b) => Number(b.baseBattlePower || b.battlePower || 0) - Number(a.baseBattlePower || a.battlePower || 0)).slice(0, battleSquadMaxSize); }
export function resolveSelectedBattleSquad(cards = [], requestedIds = []) { const cleanRequestedIds = parseSquadCardIds(requestedIds).slice(0, battleSquadMaxSize); const lookup = new Map(); for (const card of cards) { lookup.set(String(card.id || ''), card); lookup.set(String(card.sourceRowId || ''), card); } const selected = []; const selectedKeys = new Set(); for (const requestedId of cleanRequestedIds) { const card = lookup.get(requestedId); const key = getBattleCardKey(card); if (card && key && !selectedKeys.has(key) && card.eligible !== false) { selected.push(card); selectedKeys.add(key); } } if (!cleanRequestedIds.length) return { selected: getDefaultBattleSquad(cards), requestedIds: cleanRequestedIds, selectionSource: 'default-highest-power' }; return { selected, requestedIds: cleanRequestedIds, selectionSource: 'url-query' }; }
export function getSelectedBattleIds(cards = []) { return cards.map(getBattleCardKey).filter(Boolean); }
export function getBattleSquadPower(cards = []) { return cards.reduce((total, card) => total + Number(card.battlePower || 0), 0); }
export function toggleBattleCardSelection({ selectedIds = [], cardId, maxSize = battleSquadMaxSize } = {}) { const cleanSelectedIds = parseSquadCardIds(selectedIds); const key = String(cardId || '').trim(); if (!key) return cleanSelectedIds; if (cleanSelectedIds.includes(key)) return cleanSelectedIds.filter((id) => id !== key); if (cleanSelectedIds.length >= maxSize) return cleanSelectedIds; return [...cleanSelectedIds, key]; }
