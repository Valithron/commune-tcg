/* ============================================================================
   API Submission Inventory Endpoint
   Phase 9.1 responsibility: read-only diagnostics for the future submission,
   upload, and moderation pipeline. Performs no writes or uploads.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const submissionTableCandidates = [
  'card_submissions',
  'submissions',
  'user_submissions',
  'pending_cards',
  'submitted_cards',
  'card_drafts',
  'moderation_queue',
  'admin_submissions',
];

const statusCandidates = [
  'draft',
  'uploaded',
  'pending_review',
  'needs_changes',
  'approved',
  'rejected',
  'archived',
];

const proposedFields = [
  'id',
  'submitter_user_id',
  'submitter_display_name',
  'card_name',
  'character_id',
  'card_type',
  'rarity_suggestion',
  'pow',
  'def',
  'spd',
  'flavor_text',
  'ability_text',
  'image_key',
  'image_original_name',
  'image_mime_type',
  'image_size_bytes',
  'crop_json',
  'moderation_status',
  'review_notes',
  'approved_card_id',
  'created_at',
  'updated_at',
  'reviewed_at',
  'reviewed_by',
];

function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

async function runCount(env, sql) {
  const result = await env.DB.prepare(sql).first();
  return Number(result?.count || 0);
}

function classifyColumns(columns) {
  return {
    identity: columns.filter((column) => /id|uuid|slug/i.test(column)),
    submitter: columns.filter((column) => /submitter|user|owner|creator|author/i.test(column)),
    card: columns.filter((column) => /card|name|character|type|rarity|pow|def|spd|flavor|ability|stat/i.test(column)),
    image: columns.filter((column) => /image|art|r2|object|key|mime|size|crop/i.test(column)),
    moderation: columns.filter((column) => /status|review|approve|reject|moderation|notes/i.test(column)),
    timestamps: columns.filter((column) => /created|updated|reviewed|deleted/i.test(column)),
  };
}

async function inspectTable(env, table) {
  const quoted = quoteIdentifier(table);

  try {
    const count = await runCount(env, `SELECT COUNT(*) AS count FROM ${quoted}`);
    const sampleResult = await env.DB.prepare(`SELECT * FROM ${quoted} LIMIT 10`).all();
    const sampleRows = sampleResult.results || [];
    const sampleColumns = sampleRows[0] ? Object.keys(sampleRows[0]) : [];

    return {
      table,
      exists: true,
      error: null,
      rowCount: count,
      sampleColumns,
      classifiedColumns: classifyColumns(sampleColumns),
      sampleRows: sampleRows.map((row) => Object.fromEntries(Object.entries(row).slice(0, 16))),
    };
  } catch (error) {
    return {
      table,
      exists: false,
      error: error.message,
      rowCount: 0,
      sampleColumns: [],
      classifiedColumns: classifyColumns([]),
      sampleRows: [],
    };
  }
}

function getExtension(key) {
  const lastSegment = key.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  return dotIndex > -1 ? lastSegment.slice(dotIndex + 1).toLowerCase() : '(none)';
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toSortedEntries(map) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

async function inspectImageBucket(env) {
  if (!env.CARD_IMAGES) {
    return {
      available: false,
      error: 'R2 binding CARD_IMAGES is not available.',
      sampled: 0,
      submissionLikeKeys: [],
      topPrefixes: [],
      extensions: [],
    };
  }

  try {
    const listing = await env.CARD_IMAGES.list({ limit: 200 });
    const prefixes = new Map();
    const extensions = new Map();
    const submissionLikeKeys = [];

    for (const object of listing.objects || []) {
      const key = object.key || '';
      const topPrefix = key.split('/').filter(Boolean)[0] || '(root)';
      const extension = getExtension(key);
      increment(prefixes, topPrefix);
      increment(extensions, extension);

      if (/submit|draft|pending|upload|card-art|cards/i.test(key)) {
        submissionLikeKeys.push({
          key,
          size: object.size,
          uploaded: object.uploaded,
          extension,
          topPrefix,
        });
      }
    }

    return {
      available: true,
      error: null,
      sampled: listing.objects?.length || 0,
      truncated: listing.truncated,
      cursor: listing.cursor || null,
      submissionLikeKeys: submissionLikeKeys.slice(0, 50),
      topPrefixes: toSortedEntries(prefixes),
      extensions: toSortedEntries(extensions),
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      sampled: 0,
      submissionLikeKeys: [],
      topPrefixes: [],
      extensions: [],
    };
  }
}

function buildReadiness(tableInspections, imageBucket) {
  const populatedTables = tableInspections.filter((table) => table.exists && table.rowCount > 0);
  const existingTables = tableInspections.filter((table) => table.exists);

  if (populatedTables.length > 0) {
    return {
      status: 'existing-submission-data-found',
      summary: 'One or more candidate submission tables exist and contain rows. Map those tables before adding writes.',
      nextStep: 'Review candidate table columns, choose the canonical submission source, then build a read-only admin submissions endpoint.',
    };
  }

  if (existingTables.length > 0) {
    return {
      status: 'empty-submission-table-found',
      summary: 'A candidate submission table exists but appears empty. It may be usable for Phase 9.2 after confirming fields.',
      nextStep: 'Compare the existing table fields to the proposed submission record shape before implementing writes.',
    };
  }

  if (imageBucket.available) {
    return {
      status: 'contract-needed-before-writes',
      summary: 'No existing submission table was found by targeted probes. R2 is available, so schema and upload contract should be finalized before writes.',
      nextStep: 'Create or migrate a canonical card_submissions table in a later write-enabled phase, then implement upload and insert endpoints.',
    };
  }

  return {
    status: 'blocked-until-bindings-confirmed',
    summary: 'Neither a usable submission table nor CARD_IMAGES availability was confirmed.',
    nextStep: 'Confirm Cloudflare bindings before implementing the submission upload pipeline.',
  };
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const candidateSubmissionTables = [];

  for (const table of submissionTableCandidates) {
    candidateSubmissionTables.push(await inspectTable(env, table));
  }

  const imageBucket = await inspectImageBucket(env);

  return jsonResponse({
    ok: true,
    source: 'D1 + R2 targeted read-only submission inventory',
    phase: '9.1',
    readOnly: true,
    currentRoutesReviewed: {
      submitCard: 'src/routes/SubmitCard.js is static and contains the form field inventory only.',
      adminDashboard: 'src/routes/AdminDashboard.js is static and uses mock moderation rows only.',
    },
    proposedSubmissionRecord: {
      table: 'card_submissions',
      fields: proposedFields,
      moderationStatuses: statusCandidates,
    },
    proposedR2KeyStrategy: {
      bucket: 'CARD_IMAGES',
      prefix: 'submissions/{submission_id}/original.{ext}',
      derivativePrefix: 'submissions/{submission_id}/derived/{variant}.{ext}',
      libraryPrefixAfterApproval: 'cards/{card_id}/art.{ext}',
    },
    candidateSubmissionTables,
    imageBucket,
    readiness: buildReadiness(candidateSubmissionTables, imageBucket),
    notes: [
      'This endpoint intentionally performs no writes and does not upload files.',
      'It uses targeted SELECT probes and R2 listing only.',
      'Phase 9.2 should not add writes until the submission table, R2 key contract, moderation lifecycle, and auth boundary are explicit.',
    ],
  });
}
