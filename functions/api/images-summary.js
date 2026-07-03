/* ============================================================================
   API Images Summary Endpoint
   Phase 6 responsibility: read-only R2 object key inventory for art mapping.
   Samples object keys and reports extension and folder-prefix patterns.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

function getExtension(key) {
  const lastSegment = key.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  return dotIndex > -1 ? lastSegment.slice(dotIndex + 1).toLowerCase() : '(none)';
}

function getTopPrefix(key) {
  const parts = key.split('/').filter(Boolean);
  return parts.length > 1 ? parts[0] : '(root)';
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toSortedEntries(map) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export async function onRequestGet({ env }) {
  if (!env.CARD_IMAGES) {
    return errorResponse('R2 binding CARD_IMAGES is not available.', 503);
  }

  try {
    const listing = await env.CARD_IMAGES.list({ limit: 200 });
    const extensions = new Map();
    const prefixes = new Map();

    const objects = listing.objects.map((object) => {
      const extension = getExtension(object.key);
      const topPrefix = getTopPrefix(object.key);
      increment(extensions, extension);
      increment(prefixes, topPrefix);

      return {
        key: object.key,
        size: object.size,
        uploaded: object.uploaded,
        extension,
        topPrefix,
      };
    });

    return jsonResponse({
      ok: true,
      source: 'R2 CARD_IMAGES sampled inventory',
      sampled: objects.length,
      truncated: listing.truncated,
      cursor: listing.cursor || null,
      extensions: toSortedEntries(extensions),
      topPrefixes: toSortedEntries(prefixes),
      objects,
    });
  } catch (error) {
    return errorResponse('Failed to summarize CARD_IMAGES bucket.', 500, error.message);
  }
}
