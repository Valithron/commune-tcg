/* Create one authoritative pending battle. This endpoint spends Energy but does
   not settle Gold or XP; playback completion/skip uses battle-finalize. */

import { getSessionUser } from '../_shared/auth.js';
import { validateAttemptId } from '../_shared/battle-adapter.js';
import { attemptForClient, createPendingBattleAttempt } from '../_shared/battle-attempts.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  const form = await request.formData();
  return { encounterId: form.get('encounterId'), squadCardIds: form.get('squadCardIds'), attemptId: form.get('attemptId') };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in before beginning a battle.', 401);
    const payload = await readPayload(request);
    const attemptValidation = validateAttemptId(payload.attemptId);
    if (attemptValidation.error) return jsonResponse({ ok: false, code: attemptValidation.error, error: 'A valid battle attempt ID is required.', writesPerformed: false }, { status: 400 });
    const result = await createPendingBattleAttempt(env, {
      userId: user.id,
      userDisplayName: user.displayName,
      attemptId: attemptValidation.attemptId,
      encounterId: String(payload.encounterId || 'crossroads-patrol'),
      orderedCardIds: payload.orderedCardIds || payload.squadCardIds || [],
    });
    if (!result.ok) return jsonResponse(result, { status: result.status || 400 });
    return jsonResponse({ ok: true, phase: 'battle-attempt-create', idempotent: result.idempotent, writesPerformed: !result.idempotent, energyAfter: result.energyAfter, attempt: attemptForClient(result.attempt), guardrails: ['The server selected the seed and resolved the stored event log.', 'Exactly three current owned eligible cards were re-read in lane order.', 'Energy and pending attempt creation were committed together.', 'No Gold or XP was settled by attempt creation.'] }, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    return errorResponse('Failed to create battle attempt.', error.status || 500, error.message);
  }
}
