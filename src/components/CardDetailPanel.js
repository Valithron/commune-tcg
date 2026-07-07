/* ============================================================================
   Card Detail Panel Component
   Phase 10F.5 responsibility: reusable detail layout for Vault and Library cards,
   including card creator attribution when mapped.
   ============================================================================ */

import { renderCardFrame } from './CardFrame.js';
import { escapeHtml, titleCase } from './format.js';

function readCreator(card) {
  return String(card.creatorDisplayName || card.creator_display_name || card.creatorName || card.creator_name || card.creator || card.createdBy || card.created_by || card.submitterDisplayName || card.submitter_display_name || card.artistName || card.artist_name || card.artist || card.author || '').trim();
}

function renderDetailRows(card, context) {
  const ownershipText = card.owned ? `Owned, ${card.copies} ${card.copies === 1 ? 'copy' : 'copies'}` : 'Not yet owned';
  const contextText = context === 'vault'
    ? 'Vault view tracks player-specific progress such as level, copies, and future upgrade state.'
    : 'Library view describes the global card template before player-specific ownership is applied.';
  const creator = readCreator(card) || 'Unknown';

  return `
    <div class="detail-row"><span>Rarity</span><strong>${escapeHtml(titleCase(card.rarity))}</strong></div>
    <div class="detail-row"><span>Category</span><strong>${escapeHtml(card.category)}</strong></div>
    <div class="detail-row"><span>Creator</span><strong>${escapeHtml(creator)}</strong></div>
    <div class="detail-row"><span>Ownership</span><strong>${escapeHtml(ownershipText)}</strong></div>
    <div class="detail-row"><span>Context</span><strong>${escapeHtml(contextText)}</strong></div>
  `;
}

export function renderCardDetailPanel(card, { context }) {
  return `
    <section class="detail-layout detail-layout--${escapeHtml(context)}">
      <div class="detail-card-stage">
        ${renderCardFrame(card, {
          density: 'showcase',
          context,
          showOwnership: context !== 'library',
          showStats: true,
        })}
      </div>
      <div class="glass-panel detail-panel">
        <span class="section-kicker">${context === 'vault' ? 'Vault Detail' : 'Library Detail'}</span>
        <h2 class="detail-title">${escapeHtml(card.name)}</h2>
        <p class="body-copy">${escapeHtml(card.flavor || 'No flavor text has been mapped for this card yet.')}</p>
        <div class="detail-list">
          ${renderDetailRows(card, context)}
        </div>
      </div>
    </section>
  `;
}
