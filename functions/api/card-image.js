/* ============================================================================
   API Card Image Endpoint
   Phase 7 responsibility: read-only R2 object serving for Library card art.
   This endpoint never uploads, deletes, or mutates objects.
   ============================================================================ */

function guessContentType(key) {
  const lowerKey = key.toLowerCase();

  if (lowerKey.endsWith('.png')) return 'image/png';
  if (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerKey.endsWith('.webp')) return 'image/webp';
  if (lowerKey.endsWith('.gif')) return 'image/gif';

  return 'application/octet-stream';
}

export async function onRequestGet({ env, request }) {
  if (!env.CARD_IMAGES) {
    return new Response('R2 binding CARD_IMAGES is not available.', { status: 503 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key || key.includes('\0')) {
    return new Response('Missing or invalid image key.', { status: 400 });
  }

  const object = await env.CARD_IMAGES.get(key);

  if (!object) {
    return new Response('Image not found.', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || guessContentType(key),
      'cache-control': 'public, max-age=3600',
    },
  });
}
