import * as health from './functions/api/health.js';
import * as schema from './functions/api/schema.js';
import * as schemaDetails from './functions/api/schema-details.js';
import * as images from './functions/api/images.js';
import * as imagesSummary from './functions/api/images-summary.js';
import * as cardImage from './functions/api/card-image.js';
import * as cards from './functions/api/cards.js';
import * as vaultInventory from './functions/api/vault-inventory.js';
import * as vault from './functions/api/vault.js';
import * as submissionInventory from './functions/api/submission-inventory.js';
import * as submissionReviewAudit from './functions/api/submission-review-audit.js';
import * as pullPool from './functions/api/pull-pool.js';
import * as pullSimulate from './functions/api/pull-simulate.js';
import * as pulls from './functions/api/pulls.js';
import * as pullResources from './functions/api/pull-resources.js';
import * as pullHistory from './functions/api/pull-history.js';
import * as pullTopUp from './functions/api/pull-top-up.js';
import * as battleInventory from './functions/api/battle-inventory.js';
import * as battleSimulate from './functions/api/battle-simulate.js';
import * as battleSquad from './functions/api/battle-squad.js';
import * as battleAttempt from './functions/api/battle-attempt.js';
import * as battles from './functions/api/battles.js';
import * as battleHistory from './functions/api/battle-history.js';
import * as submissions from './functions/api/submissions.js';
import * as adminCards from './functions/api/admin/cards.js';
import * as adminCardMechanics from './functions/api/admin/card-mechanics.js';
import * as adminSubmissions from './functions/api/admin/submissions.js';
import * as adminSubmission from './functions/api/admin/submission.js';
import * as adminSubmissionAction from './functions/api/admin/submission-action.js';
import * as authUsers from './functions/api/auth/users.js';
import * as authMe from './functions/api/auth/me.js';
import * as authSetupPin from './functions/api/auth/setup-pin.js';
import * as authLogin from './functions/api/auth/login.js';
import * as authLogout from './functions/api/auth/logout.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function methodHandler(module, method) {
  return module[`onRequest${method[0] + method.slice(1).toLowerCase()}`];
}

function context(request, env, ctx, params = {}) {
  return { request, env, params, context: ctx, waitUntil: ctx?.waitUntil?.bind(ctx) };
}

const routeModules = {
  '/api/health': health,
  '/api/schema': schema,
  '/api/schema-details': schemaDetails,
  '/api/images': images,
  '/api/images-summary': imagesSummary,
  '/api/card-image': cardImage,
  '/api/cards': cards,
  '/api/vault-inventory': vaultInventory,
  '/api/vault': vault,
  '/api/submission-inventory': submissionInventory,
  '/api/submission-review-audit': submissionReviewAudit,
  '/api/pull-pool': pullPool,
  '/api/pull-simulate': pullSimulate,
  '/api/pulls': pulls,
  '/api/pull-resources': pullResources,
  '/api/pull-history': pullHistory,
  '/api/pull-top-up': pullTopUp,
  '/api/battle-inventory': battleInventory,
  '/api/battle-simulate': battleSimulate,
  '/api/battle-squad': battleSquad,
  '/api/battle-attempt': battleAttempt,
  '/api/battles': battles,
  '/api/battle-history': battleHistory,
  '/api/submissions': submissions,
  '/api/admin/cards': adminCards,
  '/api/admin/card-mechanics': adminCardMechanics,
  '/api/admin/submissions': adminSubmissions,
  '/api/admin/submission': adminSubmission,
  '/api/admin/submission-action': adminSubmissionAction,
  '/api/auth/users': authUsers,
  '/api/auth/me': authMe,
  '/api/auth/setup-pin': authSetupPin,
  '/api/auth/login': authLogin,
  '/api/auth/logout': authLogout,
};

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }

  const module = routeModules[url.pathname];
  if (!module) {
    return json({ ok: false, error: 'API route not found.', path: url.pathname }, 404);
  }

  const handler = methodHandler(module, method);
  if (!handler) {
    return json({ ok: false, error: 'Method not allowed.', path: url.pathname, method }, 405);
  }

  return handler(context(request, env, ctx));
}

function serveAssets(request, env) {
  if (env.ASSETS?.fetch) {
    return env.ASSETS.fetch(request);
  }

  return new Response('Commune TCG Worker is missing the ASSETS binding. Deploy with wrangler.toml [assets].', {
    status: 500,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, ctx);
    }

    return serveAssets(request, env);
  },
};
