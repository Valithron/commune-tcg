/* Canonical encounter list for previews. */

import { getSessionUser } from '../_shared/auth.js';
import { ENCOUNTERS, ENCOUNTER_REGISTRY_VERSION, getEncounterSquadPower } from '../../shared/battle/encounter-registry.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to view encounters.', 401);
  return jsonResponse({ ok: true, registryVersion: ENCOUNTER_REGISTRY_VERSION, encounters: ENCOUNTERS.map((encounter) => ({ ...encounter, enemySquadPower: getEncounterSquadPower(encounter) })) });
}
