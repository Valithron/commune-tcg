/* ============================================================================
   API Admin Submission Detail Endpoint
   Phase 9.3 responsibility: read one submitted card for review detail screens.
   Review actions and Library insertion remain deferred.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { getSubmissionById } from '../../_shared/submission-store.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  if (!id) {
    return errorResponse('Submission id is required.', 400);
  }

  try {
    const submission = await getSubmissionById(env, id);

    if (!submission) {
      return errorResponse('Submission was not found.', 404);
    }

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions',
      phase: '9.3',
      readOnly: true,
      submission,
      warnings: [
        'This endpoint is read-only in Phase 9.3.',
        'Review actions and Library insertion remain deferred.',
        'Real admin authorization is not implemented yet.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read submission detail.', 500, error.message);
  }
}
