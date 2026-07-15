import { getSessionUser } from '../_shared/auth.js';
import { errorResponse } from '../_shared/json.js';

const allowedHost = 'preview-pull-catalog-art-dir.commune-tcg.pages.dev';

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('Preview D1 binding is unavailable.', 503);

  const url = new URL(request.url);
  if (url.hostname !== allowedHost) return errorResponse('Not found.', 404);

  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to the PR #10 preview first.', 401);

  const isP1Sterling = String(user.username || user.displayName || '').trim().toLowerCase() === 'p1sterling';
  if (!isP1Sterling) return errorResponse('This preview grant is restricted to P1Sterling.', 403);

  const before = await env.DB.prepare(`
    SELECT pull_tickets AS pullTickets
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.id).first();

  if (!before) return errorResponse('P1Sterling has no preview resource row.', 404);

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE user_resources
    SET pull_tickets = 30, updated_at = ?
    WHERE user_id = ?
  `).bind(now, user.id).run();

  const after = await env.DB.prepare(`
    SELECT pull_tickets AS pullTickets
    FROM user_resources
    WHERE user_id = ?
    LIMIT 1
  `).bind(user.id).first();

  if (Number(after?.pullTickets || 0) !== 30) {
    return errorResponse('Preview ticket grant did not persist.', 500);
  }

  return Response.redirect(`${url.origin}/#/pull?previewGrant=30`, 302);
}
