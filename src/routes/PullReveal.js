/* ============================================================================
   Pull Reveal Route
   Responsibility: read the saved reveal payload and delegate reveal rendering and
   behavior to the PullRevealModal component.
   ============================================================================ */

import { initPullRevealModal, renderPullRevealModal } from '../components/PullRevealModal.js';
import { readPullRevealPayload } from '../services/pullRevealStore.js';

function getRevealCards(payload) {
  return Array.isArray(payload?.cards) ? payload.cards.filter(Boolean) : [];
}

export async function renderPullReveal() {
  const payload = readPullRevealPayload();
  const cards = getRevealCards(payload);

  return renderPullRevealModal({
    cards,
    count: Number(payload?.count || cards.length || 0),
  });
}

export function initPullReveal(root) {
  initPullRevealModal(root);
}
