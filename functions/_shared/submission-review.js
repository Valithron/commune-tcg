import { rollApprovalProfile } from './approval-rolls.js';
import { buildApprovedTemplateTraits } from './card-mechanics.js';
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

function resolveCreatorDisplayName(submission) {
  return cleanText(
    submission.creatorDisplayNameOverride
      || submission.creatorDisplayName
      || submission.submitterDisplayName
      || submission.submitterUserId
      || 'Unknown',
    120
  );
}

function buildApprovedCardJson(submission, now, approvalProfile) {
  const cropJson = cleanText(submission.cropJson || '{"x":50,"y":50,"zoom":1}', 2000);
  const templateTraits = buildApprovedTemplateTraits({ approvalProfile });
  const stats = templateTraits.stats;
  const creatorDisplayName = resolveCreatorDisplayName(submission);
  const creatorUserId = cleanText(submission.submitterUserId || '', 120);
  const creatorDisplayNameOverride = cleanText(submission.creatorDisplayNameOverride || '', 120);
  const submitterDisplayName = cleanText(submission.submitterDisplayName || creatorDisplayName, 120);

  return JSON.stringify({
    id: buildApprovedCardId(submission),
    name: submission.cardName,
    character: submission.characterId,
    character_id: submission.characterId,
    cid: submission.characterId,
    type: submission.cardType,
    card_type: submission.cardType,
    category: titleCase(submission.cardType),
    creator: creatorDisplayName,
    creator_name: creatorDisplayName,
    creatorDisplayName,
    creator_display_name: creatorDisplayName,
    creatorDisplayNameOverride,
    creator_display_name_override: creatorDisplayNameOverride,
    creatorUserId,
    creator_user_id: creatorUserId,
    submitterDisplayName,
    submitter_display_name: submitterDisplayName,
    submitterUserId: creatorUserId,
    submitter_user_id: creatorUserId,
    mechanicsVersion: templateTraits.mechanicsVersion,
    rarity: templateTraits.rarity,
    rarity_source: templateTraits.raritySource,
    raritySource: templateTraits.raritySource,
    rarity_suggestion: submission.raritySuggestion,
    traitSource: templateTraits.traitSource,
    trait_source: templateTraits.traitSource,
    statsSource: templateTraits.statsSource,
    stats_source: templateTraits.statsSource,
    baseStats: templateTraits.baseStats,
    base_stats: templateTraits.baseStats,
    stats,
    pow: stats.pow,
    def: stats.def,
    spd: stats.spd,
    flavor: submission.flavorText,
    flavor_text: submission.flavorText,
    ability: submission.abilityText || '',
    ability_text: submission.abilityText || '',
    abilityIcon: '✦',
    image_key: submission.imageKey,
    imageKey: submission.imageKey,
    crop: cropJson,
    crop_json: cropJson,
    image_crop: cropJson,
    imageCrop: cropJson,
    source: 'card_submissions',
    source_submission_id: submission.id,
    approved_by: temporaryReviewerId,
    approved_at: now,
    createdAt: now,
    created_at: now,
    updatedAt: now,
    updated_at: now,
  });
}

async function upsertApprovedLibraryCard(env, submission, now, approvalProfile) {
  const approvedCardId = buildApprovedCardId(submission);
  const cardJson = buildApprovedCardJson(submission, now, approvalProfile);

  await env.DB.prepare(`
    INSERT OR IGNORE INTO cards (id, owner_user_id, character_id, card_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    approvedCardId,
    '',
    submission.characterId,
    cardJson,
    now,
    now
  ).run();

  await env.DB.prepare(`
    UPDATE cards
    SET owner_user_id = ?,
        character_id = ?,
        card_json = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    '',
    submission.characterId,
    cardJson,
    now,
    approvedCardId
  ).run();

  return approvedCardId;
}

async function updateSubmissionReview(env, submission, action, reviewNotes, approvedCardId, creatorDisplayNameOverride, now) {
  await env.DB.prepare(`
    UPDATE card_submissions
    SET moderation_status = ?,
        review_notes = ?,
        creator_display_name_override = ?,
        approved_card_id = ?,
        reviewed_at = ?,
        reviewed_by = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    statusFromAction(action),
    reviewNotes,
    creatorDisplayNameOverride,
    approvedCardId || submission.approvedCardId || '',
    now,
    temporaryReviewerId,
    now,
    submission.id
  ).run();
}

export async function reviewSubmission(env, { id, action, reviewNotes = '', creatorDisplayName = '' }) {
  await ensureSubmissionSchema(env);

  const normalizedAction = String(action || '').trim().toLowerCase();

  if (!allowedActions.has(normalizedAction)) {
    return { ok: false, status: 400, error: 'Unsupported review action.' };
  }

  const submission = await getSubmissionById(env, id);

  if (!submission) {
    return { ok: false, status: 404, error: 'Submission was not found.' };
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
  const creatorOverride = cleanText(creatorDisplayName, 120) || cleanText(submission.creatorDisplayNameOverride || '', 120);
  const submissionForReview = {
    ...submission,
    creatorDisplayNameOverride: creatorOverride,
    creatorDisplayName: creatorOverride || submission.creatorDisplayName,
  };
  let approvedCardId = submission.approvedCardId || '';
  let approvalProfile = null;

  if (normalizedAction === 'approve') {
    approvalProfile = rollApprovalProfile();
    approvedCardId = await upsertApprovedLibraryCard(env, submissionForReview, now, approvalProfile);
  }

  await updateSubmissionReview(env, submission, normalizedAction, cleanedNotes, approvedCardId, creatorOverride, now);
  const updatedSubmission = await getSubmissionById(env, id);

  return {
    ok: true,
    status: 200,
    action: normalizedAction,
    approvedCardId,
    approvalProfile,
    submission: updatedSubmission,
    reviewerId: temporaryReviewerId,
    creatorDisplayName: updatedSubmission?.creatorDisplayName || '',
  };
}
