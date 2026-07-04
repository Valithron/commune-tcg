/* ============================================================================
   API Client Shell
   Phase 8.2 responsibility: centralize API endpoint strings for diagnostics,
   inventory links, and read-only Library/Vault mapping data.
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
