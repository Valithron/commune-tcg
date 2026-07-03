/* ============================================================================
   Cloudflare Function JSON Helpers
   Phase 5 responsibility: common safe JSON responses for API scaffolding.
   ============================================================================ */

export function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

export function errorResponse(message, status = 500, detail = null) {
  return jsonResponse({ ok: false, error: message, detail }, { status });
}
