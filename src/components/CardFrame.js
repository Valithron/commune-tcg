/* ============================================================================
   Card Frame Component
   Phase 7.5 responsibility: single canonical card renderer with density and
   context variants for frame testing, Library, Vault, Pull, and Battle.
   ============================================================================ */

import { escapeHtml, titleCase } from './format.js';

function renderStats(stats = {}) {
  return [
    ['POW', stats.pow ?? 1],
    ['DEF', stats.def ?? 1],
    ['SPD', stats.spd ?? 1],
  ].map(([label, value]) => `
    <span class="card-stat">
      <span class="card-stat-label">${label}</span>
      <span class="card-stat-value">${escapeHtml(String(value))}</span>
    </span>
  `).join('');
}

function renderCardArt(card) {
  if (card.imageUrl) {
    return `<img class="card-art-image" src="${escapeHtml(card.imageUrl)}" alt="" loading="lazy" />`;
  }

  return `<span class="card-art-symbol">${escapeHtml(card.symbol || '◆')}</span>`;
}

function renderOwnershipBadge(card, context, showOwnership) {
  if (!showOwnership || context === 'library') {
    return '';
  }

  return `<span class="status-pill">${card.owned ? `Lv ${escapeHtml(String(card.level ?? 1))}` : 'Locked'}</span>`;
}

export function renderCardFrame(card, options = {}) {
  const {
    href = '',
    showOwnership = true,
    showStats = true,
    density = 'standard',
    context = 'default',
  } = options;

  const tagName = href ? 'a' : 'article';
  const hrefAttribute = href ? ` href="${escapeHtml(href)}"` : '';
  const rarity = card.rarity || 'common';
  const className = [
    'tcg-card',
    `tcg-card--${escapeHtml(density)}`,
    `tcg-card--context-${escapeHtml(context)}`,
  ].join(' ');

  return `
    <${tagName} class="${className}" data-rarity="${escapeHtml(rarity)}"${hrefAttribute} aria-label="${escapeHtml(card.name)} card">
      <div class="card-meta-row">
        <span class="rarity-chip">${escapeHtml(titleCase(rarity))}</span>
        ${renderOwnershipBadge(card, context, showOwnership)}
      </div>
      <div class="card-art" aria-hidden="true">
        ${renderCardArt(card)}
      </div>
      <div class="card-nameplate">
        <h3 class="card-title">${escapeHtml(card.name)}</h3>
        <span class="card-subtitle">${escapeHtml(card.category || 'Library')}</span>
      </div>
      ${showStats ? `<div class="card-stat-row">${renderStats(card.stats)}</div>` : ''}
    </${tagName}>
  `;
}
