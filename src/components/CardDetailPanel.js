/* ============================================================================
   Card Detail Panel Component
   Phase 2 responsibility: reusable detail layout for Vault and Library cards.
   The canonical visual card still comes from CardFrame.js.
   ============================================================================ */

import { renderCardFrame } from './CardFrame.js';
import { escapeHtml, titleCase } from './format.js';

function renderDetailRows(card, context) {
  const ownershipText = card.owned ? `Owned, ${card.copies} ${card.copies === 1 ? 'copy' : 'copies'}` : 'Not yet owned';
  const contextText = context === 'vault'
    ? 'Vault view tracks player-specific progress such as level, copies, and future upgrade state.'
    : 'Library view describes the global card template before player-specific ownership is applied.';

  return `
    <div class="detail-row"><span>Rarity</span><strong>${escapeHtml(titleCase(card.rarity))}</strong></div>
    <div class="detail-row"><span>Category</span><strong>${escapeHtml(card.category)}</strong></div>
    <div class="detail-row"><span>Ownership</span><strong>${escapeHtml(ownershipText)}</strong></div>
    <div class="detail-row"><span>Phase 2 Note</span><strong>${escapeHtml(contextText)}</strong></div>
  `;
}

export function renderCardDetailPanel(card, { context }) {
  return `
    <section class="detail-layout">
      <div class="detail-card-stage">
        ${renderCardFrame(card)}
      </div>
      <div class="glass-panel detail-panel">
        <span class="section-kicker">${context === 'vault' ? 'Vault Detail' : 'Library Detail'}</span>
        <h2 class="detail-title">${escapeHtml(card.name)}</h2>
        <p class="body-copy">${escapeHtml(card.flavor)}</p>
        <div class="detail-list">
          ${renderDetailRows(card, context)}
        </div>
      </div>
    </section>
  `;
}
