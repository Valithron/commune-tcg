/* ============================================================================
   API Admin Submissions Endpoint
   Phase 9.2 responsibility: read the pending submission queue from D1.
   Admin approval/rejection writes are deferred.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { listSubmissions } from '../../_shared/submission-store.js';
import { getAdminSessionUser } from '../../_shared/auth.js';

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  const limit = url.searchParams.get('limit') || 100;

  try {
    const submissions = await listSubmissions(env, { status, limit });

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions',
      phase: '9.2',
      readOnly: true,
      submissions,
      totalReturned: submissions.length,
      warnings: [
        'Admin submissions endpoint is read-only in Phase 9.2.',
        'Approval, rejection, and Library insertion remain deferred.',
        'Read authorized by the active admin session.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read admin submissions.', 500, error.message);
  }
}
