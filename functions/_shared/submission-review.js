/* ============================================================================
   Submission Review Helper
   Phase 9.4 responsibility: server-owned review transitions for submitted cards.
   Approval creates an unowned Library card row. Pull engine remains deferred.
   ============================================================================ */

import { ensureSubmissionSchema, getSubmissionById } from './submission-store.js';

const temporaryReviewerId = 'temporary-admin-sterling';
const allowedActions = new Set(['approve', 'needs_changes', 'reject']);

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function titleCase(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusFromAction(action) {
  if (action === 'approve') return 'approved';
  if (action === 'reject') return 'rejected';
  return action;
}

function buildApprovedCardId(submission) {
  return 'approved_' + String(submission.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function buildApprovedCardJson(submission) {
  return JSON.stringify({
    id: buildApprovedCardId(submission),
    name: submission.cardName,
    character: submission.characterId,
    character_id: submission.characterId,
    type: submission.cardType,
    card_type: submission.cardType,
    category: titleCase(submission.cardType),
    rarity: submission.raritySuggestion,
    stats: submission.stats,
    pow: submission.stats.pow,
    def: submission.stats.def,
    spd: submission.stats.spd,
    flavor: submission.flavorText,
    flavor_text: submission.flavorText,
    ability: submission.abilityText || '',
    ability_text: submission.abilityText || '',
    abilityIcon: '✦',
    image_key: submission.imageKey,
    imageKey: submission.imageKey,
    source: 'card_submissions',
    source_submission_id: submission.id,
    approved_by: temporaryReviewerId,
    approved_at: new Date().toISOString(),
  });
}

async function insertApprovedLibraryCard(env, submission, now) {
  const approvedCardId = buildApprovedCardId(submission);
  const cardJson = buildApprovedCardJson(submission);

  await env.DB.prepare(`
    INSERT INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    approvedCardId,
    null,
    submission.characterId,
    cardJson,
    now,
    now
  ).run();

  return approvedCardId;
}

async function updateSubmissionReview(env, submission, action, reviewNotes, approvedCardId, now) {
  const nextStatus = statusFromAction(action);

  await env.DB.prepare(`
    UPDATE card_submissions
    SET moderation_status = ?,
        review_notes = ?,
        approved_card_id = ?,
        reviewed_at = ?,
        reviewed_by = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    nextStatus,
    reviewNotes,
    approvedCardId || submission.approvedCardId || '',
    now,
    temporaryReviewerId,
    now,
    submission.id
  ).run();
}

export async function reviewSubmission(env, { id, action, reviewNotes = '' }) {
  await ensureSubmissionSchema(env);

  const normalizedAction = String(action || '').trim().toLowerCase();

  if (!allowedActions.has(normalizedAction)) {
    return {
      ok: false,
      status: 400,
      error: 'Unsupported review action.',
    };
  }

  const submission = await getSubmissionById(env, id);

  if (!submission) {
    return {
      ok: false,
      status: 404,
      error: 'Submission was not found.',
    };
  }

  if (!['pending_review', 'needs_changes'].includes(submission.moderationStatus)) {
    return {
      ok: false,
      status: 409,
      error: 'Submission is not reviewable in its current status.',
      submission,
    };
  }

  const now = new Date().toISOString();
  const cleanedNotes = cleanText(reviewNotes);
  let approvedCardId = submission.approvedCardId || '';

  if (normalizedAction === 'approve') {
    approvedCardId = buildApprovedCardId(submission);

    try {
      await insertApprovedLibraryCard(env, submission, now);
    } catch (error) {
      if (!String(error.message || '').toLowerCase().includes('unique')) {
        throw error;
      }
    }
  }

  await updateSubmissionReview(env, submission, normalizedAction, cleanedNotes, approvedCardId, now);
  const updatedSubmission = await getSubmissionById(env, id);

  return {
    ok: true,
    status: 200,
    action: normalizedAction,
    approvedCardId,
    submission: updatedSubmission,
    reviewerId: temporaryReviewerId,
  };
}
