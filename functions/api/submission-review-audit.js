/* ============================================================================
   API Submission Review Audit Endpoint
   Phase 9.5 responsibility: read-only hardening diagnostics for submission
   review output before the Pull engine is built.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { ensureSubmissionSchema, listSubmissions } from '../_shared/submission-store.js';
import { getAdminSessionUser } from '../_shared/auth.js';

async function readApprovedCard(env, approvedCardId) {
  if (!approvedCardId) {
    return null;
  }

  try {
    const row = await env.DB.prepare(`
      SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
      FROM cards
      WHERE id = ?
      LIMIT 1
    `).bind(approvedCardId).first();

    if (!row) {
      return null;
    }

    let parsedCardJson = null;

    try {
      parsedCardJson = JSON.parse(row.card_json || '{}');
    } catch {
      parsedCardJson = null;
    }

    return {
      id: row.id,
      ownerUserId: row.owner_user_id || '',
      characterId: row.character_id || '',
      hasCardJson: Boolean(row.card_json),
      cardJsonValid: Boolean(parsedCardJson),
      cardJsonName: parsedCardJson?.name || '',
      cardJsonImageKey: parsedCardJson?.image_key || parsedCardJson?.imageKey || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    return {
      id: approvedCardId,
      error: error.message,
    };
  }
}

function countByStatus(submissions) {
  return submissions.reduce((counts, submission) => {
    const status = submission.moderationStatus || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function buildReadiness({ approvedCount, missingApprovedCards, ownedApprovedCards, invalidCardJson }) {
  if (missingApprovedCards.length || ownedApprovedCards.length || invalidCardJson.length) {
    return {
      status: 'review-output-needs-attention',
      summary: 'One or more approved submissions have missing, owned, or invalid Library rows.',
      nextStep: 'Fix review output before Phase 10 Pull engine work.',
    };
  }

  if (approvedCount > 0) {
    return {
      status: 'ready-for-pull-planning',
      summary: 'Approved submissions have matching unowned Library card rows.',
      nextStep: 'Begin Phase 10 with Pull engine planning and read-only pool diagnostics.',
    };
  }

  return {
    status: 'no-approved-submissions-yet',
    summary: 'The review pipeline is available, but no approved submissions were found to audit.',
    nextStep: 'Approve one disposable submission, then rerun this audit before Phase 10.',
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }
  if (!await getAdminSessionUser(request, env)) return errorResponse('Admin authorization required.', 403);

  try {
    await ensureSubmissionSchema(env);
    const submissions = await listSubmissions(env, { limit: 200 });
    const approvedSubmissions = submissions.filter((submission) => submission.moderationStatus === 'approved');
    const approvedAudits = [];

    for (const submission of approvedSubmissions) {
      const card = await readApprovedCard(env, submission.approvedCardId);
      approvedAudits.push({
        submissionId: submission.id,
        cardName: submission.cardName,
        approvedCardId: submission.approvedCardId,
        status: submission.moderationStatus,
        card,
        checks: {
          hasApprovedCardId: Boolean(submission.approvedCardId),
          cardExists: Boolean(card && !card.error),
          cardJsonValid: Boolean(card?.cardJsonValid),
          isUnownedLibraryCard: Boolean(card && !card.error && !card.ownerUserId),
          imageKeyMatches: Boolean(card?.cardJsonImageKey && card.cardJsonImageKey === submission.imageKey),
        },
      });
    }

    const missingApprovedCards = approvedAudits.filter((audit) => !audit.checks.cardExists || !audit.checks.hasApprovedCardId);
    const ownedApprovedCards = approvedAudits.filter((audit) => audit.card?.ownerUserId);
    const invalidCardJson = approvedAudits.filter((audit) => audit.card && !audit.card.error && !audit.card.cardJsonValid);

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions + cards read-only review audit',
      phase: '9.5',
      readOnly: true,
      totalSubmissions: submissions.length,
      statusCounts: countByStatus(submissions),
      approvedCount: approvedSubmissions.length,
      approvedAudits,
      findings: {
        missingApprovedCards,
        ownedApprovedCards,
        invalidCardJson,
      },
      readiness: buildReadiness({
        approvedCount: approvedSubmissions.length,
        missingApprovedCards,
        ownedApprovedCards,
        invalidCardJson,
      }),
      notes: [
        'This endpoint performs no writes.',
        'Approved cards should exist in cards with empty owner_user_id so Library sees them and Vault excludes them.',
        'Pull eligibility is still deferred.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to audit submission review output.', 500, error.message);
  }
}
