import { errorResponse, jsonResponse } from '../_shared/json.js';

const allowedHost = 'preview-pull-catalog-art-dir.commune-tcg.pages.dev';
const oneUseToken = 'f8a3d91c7b6e42e0a5d4c9b8e1f60732';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('Preview D1 binding is unavailable.', 503);

  const url = new URL(request.url);
  if (url.hostname !== allowedHost || url.searchParams.get('token') !== oneUseToken) {
    return errorResponse('Not found.', 404);
  }

  const user = await env.DB.prepare(`
    SELECT slot_id AS slotId, username, display_name AS displayName
    FROM player_auth_users
    WHERE lower(COALESCE(username, '')) = lower(?)
       OR lower(COALESCE(display_name, '')) = lower(?)
    LIMIT 1
  `).bind('P1Sterling', 'P1Sterling').first();

  if (!user?.slotId) {
    return errorResponse('P1Sterling was not found in the preview auth table.', 404);
  }

  const before = await env.DB.prepare(`
    SELECT pull_tickets AS pullTickets
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.slotId).first();

  if (!before) {
    return errorResponse('P1Sterling has no preview resource row.', 404);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE user_resources
    SET pull_tickets = 30, updated_at = ?
    WHERE user_id = ?
  `).bind(now, user.slotId).run();

  const after = await env.DB.prepare(`
    SELECT pull_tickets AS pullTickets
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.slotId).first();

  return jsonResponse({
    ok: true,
    previewOnly: true,
    slotId: user.slotId,
    username: user.username || '',
    displayName: user.displayName || '',
    ticketsBefore: Number(before.pullTickets || 0),
    ticketsAfter: Number(after?.pullTickets || 0),
  });
}
