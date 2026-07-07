import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { reviewSubmission } from '../../_shared/submission-review.js';

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    id: formData.get('id'),
    action: formData.get('action'),
    reviewNotes: formData.get('review_notes'),
    creatorDisplayName: formData.get('creator_display_name'),
  };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);

  try {
    const payload = await readPayload(request);
    const result = await reviewSubmission(env, {
      id: payload.id,
      action: payload.action,
      reviewNotes: payload.reviewNotes,
      creatorDisplayName: payload.creatorDisplayName,
    });

    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.error, submission: result.submission || null }, { status: result.status });
    }

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions + cards',
      phase: '10F.4',
      action: result.action,
      approvedCardId: result.approvedCardId || '',
      approvalProfile: result.approvalProfile || null,
      creatorDisplayName: result.creatorDisplayName || '',
      submission: result.submission,
      warnings: [
        'Temporary reviewer placeholder is used until real admin authorization exists.',
        'Pull eligibility is not implemented yet.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to review submission.', 500, error.message);
  }
}
