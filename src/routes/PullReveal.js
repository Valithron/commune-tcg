/* Pull reveal route: cinematic for the initial summon, direct stage for resolved payloads. */

import { initPullCinematic, renderPullCinematic } from '../components/PullCinematic.js';
import { initPullRevealModal, renderPullRevealModal } from '../components/PullRevealModal.js';
import { readPendingPullTransaction } from '../services/pullTransaction.js';
import { readPullRevealPayload } from '../services/pullRevealStore.js';

function getRevealCards(payload) {
  return Array.isArray(payload?.cards) ? payload.cards.filter(Boolean) : [];
}

export async function renderPullReveal({ query = {} } = {}) {
  const payload = readPullRevealPayload();
  const cards = getRevealCards(payload);
  const pending = readPendingPullTransaction();
  const count = Number(query.count || pending?.count || payload?.count || cards.length || 1) === 5 ? 5 : 1;
  const cinematicRequired = query.cinematic === '1' || (!cards.length && Boolean(pending?.requestId));

  if (cinematicRequired) return renderPullCinematic({ count });
  return renderPullRevealModal({ ...payload, cards, count });
}

export function initPullReveal(root) {
  if (root.querySelector('[data-pull-cinematic]')) initPullCinematic(root);
  else initPullRevealModal(root);
}
