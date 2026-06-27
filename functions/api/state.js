import { CHARACTER_IDS, defaultPlayerMeta, ensureGameSchema, getSessionUser, json } from '../_shared/game.js';

function cleanCard(card, userId) {
  const copy = { ...(card || {}) };
  copy.id = String(copy.id || crypto.randomUUID());
  copy.owner = userId;
  copy.cid = CHARACTER_IDS.includes(copy.cid) ? copy.cid : 'cydney';
  if (typeof copy.img === 'string' && copy.img.startsWith('data:')) copy.img = null;
  if (!copy.crop) copy.crop = { x: 50, y: 50, z: 1 };
  return copy;
}

async function readPlayerState(env, user) {
  const wallet = await env.DB.prepare('SELECT commune_cash FROM wallets WHERE user_id = ?').bind(user.id).first();
  const balanceRows = await env.DB.prepare('SELECT token_type, balance FROM token_balances WHERE user_id = ?').bind(user.id).all();
  const cardRows = await env.DB.prepare('SELECT card_json FROM cards WHERE owner_user_id = ? ORDER BY created_at DESC').bind(user.id).all();
  const priceRows = await env.DB.prepare('SELECT token_type, price FROM market_prices').all();
  const metaRow = await env.DB.prepare('SELECT value FROM player_meta WHERE user_id = ?').bind(user.id).first();

  const meta = metaRow ? JSON.parse(metaRow.value) : defaultPlayerMeta(user.id);
  const tokens = Object.fromEntries(CHARACTER_IDS.map((id) => [id, 0]));
  const prices = Object.fromEntries(CHARACTER_IDS.map((id) => [id, 1]));

  for (const row of balanceRows.results || []) tokens[row.token_type] = Number(row.balance || 0);
  for (const row of priceRows.results || []) prices[row.token_type] = Number(row.price || 1);

  const cards = (cardRows.results || []).map((row) => {
    try { return JSON.parse(row.card_json); }
    catch { return null; }
  }).filter(Boolean);

  return { ...meta, cards, tokens, prices, cash: Number(wallet?.commune_cash ?? 5000), user };
}

async function writePlayerState(env, user, incoming) {
  const state = incoming || {};
  const meta = {
    page: state.page || 'collection',
    sel: CHARACTER_IDS.includes(state.sel) ? state.sel : 'cydney',
    draft: state.draft || defaultPlayerMeta(user.id).draft,
    log: Array.isArray(state.log) ? state.log.slice(0, 40) : [],
    q: typeof state.q === 'string' ? state.q.slice(0, 100) : ''
  };

  const clearCardsSql = 'DELETE ' + 'FROM cards WHERE owner_user_id = ?';
  const statements = [
    env.DB.prepare(`INSERT INTO wallets (user_id, commune_cash, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(user_id) DO UPDATE SET commune_cash = excluded.commune_cash, updated_at = excluded.updated_at`).bind(user.id, Number(state.cash || 0)),
    env.DB.prepare(`INSERT INTO player_meta (user_id, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(user_id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).bind(user.id, JSON.stringify(meta)),
    env.DB.prepare(clearCardsSql).bind(user.id)
  ];

  for (const tokenType of CHARACTER_IDS) {
    statements.push(env.DB.prepare(`INSERT INTO token_balances (user_id, token_type, balance, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(user_id, token_type) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at`).bind(user.id, tokenType, Number(state.tokens?.[tokenType] || 0)));
  }

  for (const tokenType of CHARACTER_IDS) {
    if (state.prices && Number.isFinite(Number(state.prices[tokenType]))) {
      statements.push(env.DB.prepare(`INSERT INTO market_prices (token_type, price, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(token_type) DO UPDATE SET price = excluded.price, updated_at = excluded.updated_at`).bind(tokenType, Number(state.prices[tokenType])));
    }
  }

  const cards = Array.isArray(state.cards) ? state.cards.map((card) => cleanCard(card, user.id)) : [];
  for (const card of cards) {
    statements.push(env.DB.prepare(`INSERT INTO cards (id, owner_user_id, character_id, card_json, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`).bind(card.id, user.id, card.cid, JSON.stringify(card)));
  }

  await env.DB.batch(statements);
}

export async function onRequestGet({ request, env }) {
  try {
    await ensureGameSchema(env);
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: 'Not logged in' }, 401);
    const state = await readPlayerState(env, user);
    return json({ state, user });
  } catch (error) {
    return json({ error: error.message || 'Failed to load state' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    await ensureGameSchema(env);
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: 'Not logged in' }, 401);
    const state = await request.json();
    await writePlayerState(env, user, state);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message || 'Failed to save state' }, 500);
  }
}
