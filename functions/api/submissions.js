/* ============================================================================
   API Submissions Endpoint
   Phase 9.2 responsibility: create pending-review card submissions with image
   upload to R2 and metadata insert to D1. Approval remains deferred.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { insertSubmission, listSubmissions } from '../_shared/submission-store.js';

const maxImageBytes = 8 * 1024 * 1024;
const temporarySubmitterUserId = 'temporary-sterling';
const temporarySubmitterDisplayName = 'Sterling';

const allowedMimeTypes = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);

const allowedRarities = new Set(['common', 'uncommon', 'rare', 'legendary', 'mythic']);
const allowedCharacters = new Set(['sterling', 'cydney', 'ryan', 'gabi', 'cooper', 'kenly', 'ashley']);
const allowedTypes = new Set(['support', 'battle', 'craft', 'magic', 'alchemy', 'training', 'defense', 'utility']);

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeChoice(value, allowed, fallback) {
  const cleaned = String(value || '').trim().toLowerCase();
  return allowed.has(cleaned) ? cleaned : fallback;
}

function toStat(value, fallback = 1) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 10);
}

function getImageExtension(file) {
  const fromMime = allowedMimeTypes.get(file.type);

  if (fromMime) {
    return fromMime;
  }

  const name = String(file.name || '').toLowerCase();
  const extension = name.split('.').pop();

  if (extension === 'png') return 'png';
  if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
  if (extension === 'webp') return 'webp';

  return '';
}

function validateImage(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return 'Card art image is required.';
  }

  if (file.size <= 0) {
    return 'Card art image is empty.';
  }

  if (file.size > maxImageBytes) {
    return 'Card art image must be 8 MB or smaller.';
  }

  if (!getImageExtension(file)) {
    return 'Card art must be PNG, JPG, or WEBP.';
  }

  return '';
}

function validateSubmission(fields, file) {
  const errors = [];

  if (!fields.cardName) errors.push('Card name is required.');
  if (fields.cardName.length > 25) errors.push('Card name must be 25 characters or fewer.');
  if (!fields.flavorText) errors.push('Flavor text is required.');
  if (!fields.characterId) errors.push('Character is required.');
  if (!fields.cardType) errors.push('Card type is required.');

  const imageError = validateImage(file);
  if (imageError) errors.push(imageError);

  return errors;
}

function buildSubmissionId() {
  return 'sub_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8);
}

function buildFields(formData) {
  return {
    cardName: cleanText(formData.get('card_name'), 25),
    characterId: normalizeChoice(formData.get('character_id'), allowedCharacters, 'sterling'),
    cardType: normalizeChoice(formData.get('card_type'), allowedTypes, 'support'),
    raritySuggestion: normalizeChoice(formData.get('rarity_suggestion'), allowedRarities, 'common'),
    pow: toStat(formData.get('pow'), 1),
    def: toStat(formData.get('def'), 1),
    spd: toStat(formData.get('spd'), 1),
    flavorText: cleanText(formData.get('flavor_text'), 220),
    abilityText: cleanText(formData.get('ability_text'), 220),
    cropJson: cleanText(formData.get('crop_json'), 2000) || '{}',
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

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
      warnings: ['GET /api/submissions is read-only. POST creates pending-review submissions.'],
    });
  } catch (error) {
    return errorResponse('Failed to read submissions.', 500, error.message);
  }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  if (!env.CARD_IMAGES) {
    return errorResponse('R2 binding CARD_IMAGES is not available.', 503);
  }

  try {
    const formData = await request.formData();
    const fields = buildFields(formData);
    const imageFile = formData.get('image');
    const errors = validateSubmission(fields, imageFile);

    if (errors.length) {
      return jsonResponse({ ok: false, error: 'Submission validation failed.', errors }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = buildSubmissionId();
    const extension = getImageExtension(imageFile);
    const imageKey = `submissions/${id}/original.${extension}`;
    const imageBuffer = await imageFile.arrayBuffer();

    await env.CARD_IMAGES.put(imageKey, imageBuffer, {
      httpMetadata: {
        contentType: imageFile.type || `image/${extension}`,
      },
      customMetadata: {
        submissionId: id,
        originalName: cleanText(imageFile.name, 160),
      },
    });

    const submission = {
      id,
      submitterUserId: temporarySubmitterUserId,
      submitterDisplayName: temporarySubmitterDisplayName,
      cardName: fields.cardName,
      characterId: fields.characterId,
      cardType: fields.cardType,
      raritySuggestion: fields.raritySuggestion,
      pow: fields.pow,
      def: fields.def,
      spd: fields.spd,
      flavorText: fields.flavorText,
      abilityText: fields.abilityText,
      imageKey,
      imageOriginalName: cleanText(imageFile.name, 160),
      imageMimeType: imageFile.type || `image/${extension}`,
      imageSizeBytes: imageFile.size,
      cropJson: fields.cropJson,
      moderationStatus: 'pending_review',
      reviewNotes: '',
      approvedCardId: '',
      createdAt: now,
      updatedAt: now,
      reviewedAt: '',
      reviewedBy: '',
    };

    try {
      await insertSubmission(env, submission);
    } catch (error) {
      await env.CARD_IMAGES.delete(imageKey).catch(() => null);
      throw error;
    }

    return jsonResponse({
      ok: true,
      source: 'D1 card_submissions + R2 CARD_IMAGES',
      phase: '9.2',
      submission: {
        ...submission,
        imageUrl: `/api/card-image?key=${encodeURIComponent(imageKey)}`,
      },
      warnings: [
        'Temporary submitter placeholder is used until real authentication exists.',
        'Submission is pending_review and does not enter Library or pulls until a future approval endpoint exists.',
      ],
    }, { status: 201 });
  } catch (error) {
    return errorResponse('Failed to create submission.', 500, error.message);
  }
}
