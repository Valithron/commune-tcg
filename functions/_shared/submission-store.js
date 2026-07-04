/* ============================================================================
   Submission Store Helper
   Phase 9.2 responsibility: shared D1 schema bootstrap and row normalization
   for write-enabled card submissions. Approval remains deferred.
   ============================================================================ */

const createTableSql = `
  CREATE TABLE IF NOT EXISTS card_submissions (
    id TEXT PRIMARY KEY,
    submitter_user_id TEXT NOT NULL,
    submitter_display_name TEXT NOT NULL,
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

export async function ensureSubmissionSchema(env) {
  await env.DB.prepare(createTableSql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_card_submissions_status ON card_submissions (moderation_status)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_card_submissions_created ON card_submissions (created_at)').run();
}

export function normalizeSubmissionRow(row) {
  return {
    id: row.id,
    submitterUserId: row.submitter_user_id,
    submitterDisplayName: row.submitter_display_name,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    submission.id,
    submission.submitterUserId,
    submission.submitterDisplayName,
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
