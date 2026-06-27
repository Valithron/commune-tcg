function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

const mimeToExt = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

function decodeImagePayload(payload) {
  const comma = payload.indexOf(',');
  if (!payload.startsWith('data:image/') || comma === -1) return null;

  const meta = payload.slice(5, comma);
  const mime = meta.split(';')[0];
  if (!mimeToExt[mime]) return null;

  const encoded = payload.slice(comma + 1);
  const raw = atob(encoded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  return { mime, bytes, ext: mimeToExt[mime] };
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const decoded = decodeImagePayload(body.dataUrl || '');
    if (!decoded) return json({ error: 'Supported image upload required' }, 400);
    if (decoded.bytes.byteLength > 8 * 1024 * 1024) return json({ error: 'Image is too large' }, 413);

    const character = String(body.cid || 'card').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40) || 'card';
    const safeId = String(body.id || crypto.randomUUID()).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80) || crypto.randomUUID();
    const key = `${character}-${Date.now()}-${safeId}.${decoded.ext}`;

    await env.CARD_IMAGES.put(key, decoded.bytes, {
      httpMetadata: { contentType: decoded.mime },
      customMetadata: { character }
    });

    return json({ key, url: `/api/image/${encodeURIComponent(key)}` });
  } catch (error) {
    return json({ error: error.message || 'Failed to upload image' }, 500);
  }
}
