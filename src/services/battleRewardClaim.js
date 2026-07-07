/* ============================================================================
   Battle Reward Claim Service
   Phase 10E.1 responsibility: one shared client helper for claiming battle
   rewards. Used by manual claim and auto-claim fallback. No UI or DOM logic here.
   ============================================================================ */

import { getApiRoutes } from './apiClient.js';

export async function claimBattleRewards({ encounterId, squadCardIds, attemptId } = {}) {
  const routes = getApiRoutes();
  const response = await fetch(routes.battles, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      encounterId: encounterId || 'training-yard-goblin',
      squadCardIds: squadCardIds || '',
      attemptId: attemptId || '',
    }),
  });
  const payload = await response.json().catch(() => null);

  if (!payload) {
    throw new Error(`Battle reward claim failed with ${response.status}`);
  }

  return {
    ...payload,
    httpStatus: response.status,
    responseOk: response.ok,
  };
}
