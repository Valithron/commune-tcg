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

function readNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pluralizeCopy(count) {
  return `${count} ${count === 1 ? 'copy' : 'copies'}`;
}

function readOwnershipText(card, context) {
  if (context === 'library') {
    const userOwnedCopies = readNumber(card.userOwnedCopies ?? card.ownedCopies ?? 0, 0) || 0;
    return userOwnedCopies > 0 ? `Owned, ${pluralizeCopy(userOwnedCopies)}` : 'Not yet owned';
  }

  const copies = readNumber(card.copies, 0) || 0;
  return card.owned ? `Owned, ${pluralizeCopy(copies || 1)}` : 'Not yet owned';
}

function renderOptionalMechanicsRows(card) {
  const maxLevel = readNumber(card.maxLevel ?? card.max_level ?? card.levelCap ?? card.level_cap);
  const growthPerLevel = readNumber(card.growthPerLevel ?? card.growth_per_level);
  const originBonus = readNumber(card.originBonusPercent ?? card.origin_bonus_percent);
  const originRarity = card.originRarity || card.origin_rarity || '';
  const rows = [];

  if (maxLevel) rows.push(`<div class="detail-row"><span>Max Level</span><strong>${escapeHtml(String(maxLevel))}</strong></div>`);
  if (growthPerLevel) rows.push(`<div class="detail-row"><span>Growth</span><strong>${escapeHtml('+' + growthPerLevel + ' total stats / level')}</strong></div>`);
  if (originRarity) rows.push(`<div class="detail-row"><span>Origin Rarity</span><strong>${escapeHtml(titleCase(originRarity))}</strong></div>`);
  if (originBonus !== null) rows.push(`<div class="detail-row"><span>Origin Bonus</span><strong>${escapeHtml('+' + originBonus + '%')}</strong></div>`);

  return rows.join('');
}

function renderDetailRows(card, context) {
  const ownershipText = readOwnershipText(card, context);
  const contextText = context === 'vault'
    ? 'Your Vault keeps this owned copy, including its level, XP, and duplicate count.'
    : 'The Library shows every available card design and whether you own a copy.';
  const creator = readCreator(card) || 'Unknown';

  return `
    <div class="detail-row"><span>Rarity</span><strong>${escapeHtml(titleCase(card.rarity))}</strong></div>
    <div class="detail-row"><span>Category</span><strong>${escapeHtml(card.category)}</strong></div>
    <div class="detail-row"><span>Creator</span><strong>${escapeHtml(creator)}</strong></div>
    <div class="detail-row"><span>Ownership</span><strong>${escapeHtml(ownershipText)}</strong></div>
    ${renderOptionalMechanicsRows(card)}
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
