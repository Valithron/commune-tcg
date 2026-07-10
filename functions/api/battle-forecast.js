/* Non-authoritative labels generated from canonical isolated-lane combat. */

import { getSessionUser } from '../_shared/auth.js';
import { loadOwnedFormation } from '../_shared/battle-adapter.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { forecastFormation } from '../../shared/battle/battle-forecast.js';
import { encounterEnemyFormation, getEncounterById } from '../../shared/battle/encounter-registry.js';

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in to forecast formation.', 401);
    const payload = await request.json().catch(() => ({}));
    const encounter = getEncounterById(payload.encounterId);
    if (!encounter) return jsonResponse({ ok: false, code: 'encounter-not-found', error: 'Encounter not found.' }, { status: 404 });
    const formation = await loadOwnedFormation(env, { ownerUserId: user.id, orderedCardIds: payload.orderedCardIds || payload.squadCardIds });
    if (!formation.ok) return jsonResponse(formation, { status: formation.status || 400 });
    const forecasts = forecastFormation({ playerCards: formation.cards, enemyCards: encounterEnemyFormation(encounter), samples: 160, seedPrefix: `${user.id}:${encounter.id}:${formation.orderedCardIds.join(':')}` });
    return jsonResponse({ ok: true, encounterId: encounter.id, orderedCardIds: formation.orderedCardIds, forecasts: forecasts.map(({ winRate: _, ...forecast }, index) => ({ ...forecast, lane: ['left', 'center', 'right'][index] })), note: 'Forecasts exclude reinforcement and are not guarantees.' });
  } catch (error) {
    return errorResponse('Failed to forecast formation.', 500, error.message);
  }
}

