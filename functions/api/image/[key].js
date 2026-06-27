export async function onRequestGet({ params, env }) {
  try {
    const key = decodeURIComponent(params.key || '');
    if (!key) return new Response('Missing image key', { status: 400 });

    const object = await env.CARD_IMAGES.get(key);
    if (!object) return new Response('Image not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(error.message || 'Failed to load image', { status: 500 });
  }
}
