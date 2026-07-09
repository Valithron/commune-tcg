import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { temporaryStartingTickets } from '../_shared/pull-engine.js';

const allowedAmounts = new Set([1, 5, 12]);

function cleanAmount(value) {
  const amount = Number(value);
  return allowedAmounts.has(amount) ? amount : 1;
}

async function ensureResources(env, now, user) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS user_resources (
      user_id TEXT PRIMARY KEY,
      pull_tickets INTEGER NOT NULL,
      gold INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await env.DB.prepare(`
    INSERT OR IGNORE INTO user_resources (user_id, pull_tickets, gold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(user.id, temporaryStartingTickets, 0, now, now).run();
}

async function readResources(env, user) {
  return env.DB.prepare(`
    SELECT user_id AS userId, pull_tickets AS pullTickets, gold, created_at AS createdAt, updated_at AS updatedAt
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.id).first();
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    amount: formData.get('amount'),
  };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const user = await getSessionUser(request, env);
    if (!user) return errorResponse('Sign in before topping up tickets.', 401);
    const now = new Date().toISOString();
    const payload = await readPayload(request);
    const amount = cleanAmount(payload.amount);

    await ensureResources(env, now, user);

    const before = await readResources(env, user);

    await env.DB.prepare(`
      UPDATE user_resources
      SET pull_tickets = pull_tickets + ?, updated_at = ?
      WHERE user_id = ?
    `).bind(amount, now, user.id).run();

    const after = await readResources(env, user);

    return jsonResponse({
      ok: true,
      source: 'D1 user_resources',
      phase: 'auth-current-user',
      userId: user.id,
      ownerDisplayName: user.displayName,
      amount,
      ticketsBefore: Number(before?.pullTickets || 0),
      ticketsAfter: Number(after?.pullTickets || 0),
      resources: after,
      warnings: ['Testing top-up only. No payment, purchase, or real economy validation is implemented yet.'],
    });
  } catch (error) {
    return errorResponse('Failed to top up pull tickets.', 500, error.message);
  }
}
