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
  pullPool: '/api/pull-pool',
  pullSimulate: '/api/pull-simulate',
  pulls: '/api/pulls',
  pullResources: '/api/pull-resources',
  pullHistory: '/api/pull-history',
  pullTopUp: '/api/pull-top-up',
  battleInventory: '/api/battle-inventory',
  battleSimulate: '/api/battle-simulate',
  battleSquad: '/api/battle-squad',
  battleAttempt: '/api/battle-attempt',
  battleFinalize: '/api/battle-finalize',
  battleEncounters: '/api/battle-encounters',
  battleForecast: '/api/battle-forecast',
  battles: '/api/battles',
  battleHistory: '/api/battle-history',
  battleRewardContract: '/api/battle-reward-contract',
  submissions: '/api/submissions',
  adminCards: '/api/admin/cards',
  adminCardMechanics: '/api/admin/card-mechanics',
  adminSubmissions: '/api/admin/submissions',
  adminSubmission: '/api/admin/submission',
  adminSubmissionAction: '/api/admin/submission-action',
};

export function getApiRoutes() {
  return { ...apiRoutes };
}

export async function fetchJson(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with ${response.status}`);
  }

  return payload;
}
