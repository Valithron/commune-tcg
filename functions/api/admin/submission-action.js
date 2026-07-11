import { errorResponse, jsonResponse } from '../../_shared/json.js';
import { reviewSubmission } from '../../_shared/submission-review.js';
import { getAdminSessionUser } from '../../_shared/auth.js';

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
    targetRarity: formData.get('target_rarity'),
    finalRarityOverride: formData.get('final_rarity_override'),
    approvedCardType: formData.get('approved_card_type'),
    approvedCardTypes: formData.getAll('approved_card_types'),
    approvedTypeOdds: formData.get('approved_type_odds'),
  };
}

function parseTypeOdds(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try { return JSON.parse(value); } catch { return []; }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    const payload = await readPayload(request);
    const result = await reviewSubmission(env, {
      id: payload.id,
      action: payload.action,
      reviewNotes: payload.reviewNotes,
      creatorDisplayName: payload.creatorDisplayName,
      targetRarity: payload.targetRarity,
      finalRarityOverride: payload.finalRarityOverride,
      approvedCardType: payload.approvedCardType,
      approvedCardTypes: payload.approvedCardTypes,
      approvedTypeOdds: parseTypeOdds(payload.approvedTypeOdds),
    });

    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.error, submission: result.submission || null }, { status: result.status });
    }

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions + cards',
      phase: 'weighted-type-pools',
      action: result.action,
      approvedCardId: result.approvedCardId || '',
      approvedCardType: result.approvedCardType || '',
      approvedTypePool: result.approvedTypePool || [],
      approvedTypeOdds: result.approvedTypeOdds || [],
      approvalProfile: result.approvalProfile || null,
      creatorDisplayName: result.creatorDisplayName || '',
      submission: result.submission,
      warnings: [
        'Review action authorized by the active admin session.',
        'Approved type odds now govern pull-time owned-card type rolls and stat allocation.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to review submission.', 500, error.message);
  }
}
