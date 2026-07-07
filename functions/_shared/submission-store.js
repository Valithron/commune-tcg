/* ============================================================================
   Submission Store Helper
   Phase 9.3 responsibility: shared D1 schema bootstrap, row normalization,
   list reads, and single-submission lookup. Approval remains deferred.
   ============================================================================ */

const createTableSql = `
  CREATE TABLE IF NOT EXISTS card_submissions (
    id TEXT PRIMARY KEY,
    submitter_user_id TEXT NOT NULL,
    submitter_display_name TEXT NOT NULL,
    creator_display_name_override TEXT,
    card_name TEXT NOT NULL,
    character_id TEXT NOT NULL,
    card_type TEXT NOT NULL,
    rarity_suggestion TEXT NOT NULL,
    pow INTEGER NOT NULL,
    def INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    flavor_text TEXT NOT NULL,
    ability_text TEXT,
    image_key TEXT NOT NULL,
    image_original_name TEXT,
    image_mime_type TEXT NOT NULL,
    image_size_bytes INTEGER NOT NULL,
    crop_json TEXT,
    moderation_status TEXT NOT NULL,
    review_notes TEXT,
    approved_card_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT
  )
`;

const additiveColumns = [
  ['creator_display_name_override', 'TEXT'],
];

async function addColumnIfMissing(env, columnName, definition) {
  try {
    await env.DB.prepare(`ALTER TABLE card_submissions ADD COLUMN ${columnName} ${definition}`).run();
  } catch (error) {
    if (!String(error?.message || '').toLowerCase().includes('duplicate column')) {
      throw error;
    }
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

export async function ensureSubmissionSchema(env) {
  await env.DB.prepare(createTableSql).run();

  for (const [columnName, definition] of additiveColumns) {
    await addColumnIfMissing(env, columnName, definition);
  }

  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_card_submissions_status ON card_submissions (moderation_status)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_card_submissions_created ON card_submissions (created_at)').run();
}

function resolveCreatorDisplayName(row) {
  return cleanText(
    row.creator_display_name_override
      || row.creatorDisplayName
      || row.creator_display_name
      || row.creator_name
      || row.creator
      || row.submitter_display_name
      || row.submitterDisplayName
      || row.submitter_user_id
      || row.submitterUserId
      || 'Unknown',
    120
  );
}

export function normalizeSubmissionRow(row) {
  const creatorDisplayNameOverride = cleanText(row.creator_display_name_override || '', 120);
  const creatorDisplayName = resolveCreatorDisplayName(row);

  return {
    id: row.id,
    submitterUserId: row.submitter_user_id,
    submitterDisplayName: row.submitter_display_name,
    creatorDisplayNameOverride,
    creatorDisplayName,
    cardName: row.card_name,
    characterId: row.character_id,
    cardType: row.card_type,
    raritySuggestion: row.rarity_suggestion,
    stats: {
      pow: Number(row.pow),
      def: Number(row.def),
      spd: Number(row.spd),
    },
    flavorText: row.flavor_text,
    abilityText: row.ability_text || '',
    imageKey: row.image_key,
    imageUrl: row.image_key ? `/api/card-image?key=${encodeURIComponent(row.image_key)}` : '',
    imageOriginalName: row.image_original_name || '',
    imageMimeType: row.image_mime_type,
    imageSizeBytes: Number(row.image_size_bytes || 0),
    cropJson: row.crop_json || '{}',
    moderationStatus: row.moderation_status,
    reviewNotes: row.review_notes || '',
    approvedCardId: row.approved_card_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at || '',
    reviewedBy: row.reviewed_by || '',
  };
}

export async function insertSubmission(env, submission) {
  await ensureSubmissionSchema(env);

  await env.DB.prepare(`
    INSERT INTO card_submissions (
      id,
      submitter_user_id,
      submitter_display_name,
      creator_display_name_override,
      card_name,
      character_id,
      card_type,
      rarity_suggestion,
      pow,
      def,
      spd,
      flavor_text,
      ability_text,
      image_key,
      image_original_name,
      image_mime_type,
      image_size_bytes,
      crop_json,
      moderation_status,
      review_notes,
      approved_card_id,
      created_at,
      updated_at,
      reviewed_at,
      reviewed_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    submission.id,
    submission.submitterUserId,
    submission.submitterDisplayName,
    submission.creatorDisplayNameOverride || '',
    submission.cardName,
    submission.characterId,
    submission.cardType,
    submission.raritySuggestion,
    submission.pow,
    submission.def,
    submission.spd,
    submission.flavorText,
    submission.abilityText,
    submission.imageKey,
    submission.imageOriginalName,
    submission.imageMimeType,
    submission.imageSizeBytes,
    submission.cropJson,
    submission.moderationStatus,
    submission.reviewNotes,
    submission.approvedCardId,
    submission.createdAt,
    submission.updatedAt,
    submission.reviewedAt,
    submission.reviewedBy
  ).run();
}

export async function listSubmissions(env, { limit = 100, status = '' } = {}) {
  await ensureSubmissionSchema(env);

  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);

  if (status) {
    const result = await env.DB.prepare(`
      SELECT * FROM card_submissions
      WHERE moderation_status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(status, safeLimit).all();

    return (result.results || []).map(normalizeSubmissionRow);
  }

  const result = await env.DB.prepare(`
    SELECT * FROM card_submissions
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(safeLimit).all();

  return (result.results || []).map(normalizeSubmissionRow);
}

export async function getSubmissionById(env, submissionId) {
  await ensureSubmissionSchema(env);

  const row = await env.DB.prepare(`
    SELECT * FROM card_submissions
    WHERE id = ?
    LIMIT 1
  `).bind(String(submissionId || '')).first();

  return row ? normalizeSubmissionRow(row) : null;
}
