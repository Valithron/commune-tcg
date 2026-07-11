/* ============================================================================
   API Health Endpoint
   Phase 5 responsibility: prove Cloudflare Pages Functions are reachable and
   report whether expected bindings are present. No data is read or written.
   ============================================================================ */

import { jsonResponse } from '../_shared/json.js';

export async function onRequestGet({ env }) {
  return jsonResponse({
    ok: true,
    phase: 5,
    service: 'imago-core-api',
    bindings: {
      DB: Boolean(env.DB),
      CARD_IMAGES: Boolean(env.CARD_IMAGES),
    },
  });
}
