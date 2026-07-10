/* Browser transport for authoritative battle lifecycle. No result, reward, or
   stat calculation belongs in this module. */

import { getApiRoutes } from './apiClient.js';
import { createBattleAttemptId, encodeSquadCardIds, normalizeBattleAttemptId } from './battleSquadSelection.js';

async function requestJson(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { accept: 'application/json', ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) } });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) throw Object.assign(new Error(payload?.error || `Battle request failed with ${response.status}`), { status: response.status, code: payload?.code, payload });
  return payload;
}

export async function fetchBattleEncounters() { return requestJson(getApiRoutes().battleEncounters); }

export async function createBattleAttempt({ encounterId, orderedCardIds, attemptId = createBattleAttemptId() }) {
  return requestJson(getApiRoutes().battles, { method: 'POST', body: JSON.stringify({ encounterId, orderedCardIds, squadCardIds: encodeSquadCardIds(orderedCardIds), attemptId: normalizeBattleAttemptId(attemptId) }) });
}

export async function recoverBattleAttempt({ attemptId = '' } = {}) {
  const params = new URLSearchParams();
  if (attemptId) params.set('attemptId', normalizeBattleAttemptId(attemptId));
  params.set('_', String(Date.now()));
  return requestJson(`${getApiRoutes().battleAttempt}?${params}`);
}

export async function finalizeBattleAttempt({ attemptId, surrender = false }) {
  return requestJson(getApiRoutes().battleFinalize, { method: 'POST', body: JSON.stringify({ attemptId: normalizeBattleAttemptId(attemptId), action: surrender ? 'surrender' : 'finalize' }) });
}

export async function fetchFormationForecast({ encounterId, orderedCardIds }) {
  return requestJson(getApiRoutes().battleForecast, { method: 'POST', body: JSON.stringify({ encounterId, orderedCardIds }) });
}

