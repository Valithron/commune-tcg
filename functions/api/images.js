/* ============================================================================
   API Images Endpoint
   Phase 5 responsibility: read-only R2 bucket visibility for card art mapping.
   Lists a tiny sample only. It never uploads, deletes, or mutates objects.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

export async function onRequestGet({ env }) {
  if (!env.CARD_IMAGES) {
    return errorResponse('R2 binding CARD_IMAGES is not available.', 503);
  }

  try {
    const listing = await env.CARD_IMAGES.list({ limit: 10 });

    return jsonResponse({
      ok: true,
      source: 'R2 CARD_IMAGES',
      truncated: listing.truncated,
      objects: listing.objects.map((object) => ({
        key: object.key,
        size: object.size,
        uploaded: object.uploaded,
      })),
    });
  } catch (error) {
    return errorResponse('Failed to inspect CARD_IMAGES bucket.', 500, error.message);
  }
}
