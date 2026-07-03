/* ============================================================================
   API Client Shell
   Phase 5 responsibility: centralize future API fetches without coupling routes
   directly to endpoint strings. Static routes can link to endpoints for now.
   ============================================================================ */

const apiRoutes = {
  health: '/api/health',
  schema: '/api/schema',
  images: '/api/images',
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
