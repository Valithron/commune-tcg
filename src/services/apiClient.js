/* ============================================================================
   API Client Shell
   Phase 9.5 responsibility: centralize API endpoint strings for diagnostics,
   submission pipeline endpoints, review actions, and review audit checks.
   ============================================================================ */

const apiRoutes = {
  health: '/api/health',
  schema: '/api/schema',
  schemaDetails: '/api/schema-details',
  images: '/api/images',
  imagesSummary: '/api/images-summary',
  cards: '/api/cards',
  vaultInventory: '/api/vault-inventory',
  vault: '/api/vault',
  submissionInventory: '/api/submission-inventory',
  submissionReviewAudit: '/api/submission-review-audit',
  submissions: '/api/submissions',
  adminSubmissions: '/api/admin/submissions',
  adminSubmission: '/api/admin/submission',
  adminSubmissionAction: '/api/admin/submission-action',
};

export function getApiRoutes() {
  return { ...apiRoutes };
}

export async function fetchJson(path) {
  const response = await fetch(path, {
    headers: { accept: 'application/json' },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with ${response.status}`);
  }

  return payload;
}
