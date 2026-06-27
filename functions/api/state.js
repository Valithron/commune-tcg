async function ensureSchema(env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS vault (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function onRequestGet({ env }) {
  try {
    await ensureSchema(env);
    const row = await env.DB.prepare('SELECT value FROM vault WHERE key = ?')
      .bind('state')
      .first();

    if (!row) return json({ state: null });

    return json({ state: JSON.parse(row.value) });
  } catch (error) {
    return json({ error: error.message || 'Failed to load state' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    await ensureSchema(env);
    const state = await request.json();

    // Guard against accidentally persisting large base64 image blobs in D1.
    if (Array.isArray(state.cards)) {
      state.cards = state.cards.map((card) => {
        if (card && typeof card.img === 'string' && card.img.startsWith('data:')) {
          return { ...card, img: null };
        }
        return card;
      });
    }

    await env.DB.prepare(`
      INSERT INTO vault (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).bind('state', JSON.stringify(state)).run();

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message || 'Failed to save state' }, 500);
  }
}
