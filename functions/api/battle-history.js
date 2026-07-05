/* ============================================================================
   API Battle History Endpoint
   Battle Phase 3 responsibility: read battle_history rows for diagnostics.
   Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { readBattleHistory, temporaryBattleUserId } from '../_shared/battle-engine.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || temporaryBattleUserId;
  const limit = url.searchParams.get('limit') || 20;

  try {
    const history = await readBattleHistory(env, { ownerUserId, limit });

    return jsonResponse({
      ok: true,
      phase: 'battle-3',
      readOnly: true,
      source: 'D1 battle_history',
      ownerUserId,
      ...history,
      notes: [
        'This endpoint performs no writes.',
        'Battle history rows are written only by POST /api/battles.',
        'Rewards, XP, currency, stamina, energy, Vault changes, and card progression remain deferred.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read battle history.', 500, error.message);
  }
}
