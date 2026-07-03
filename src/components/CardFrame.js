/* ============================================================================
   Card Frame Component
   Phase 7 responsibility: single canonical card renderer for mock and backend
   Library cards, including optional real image URLs.
   ============================================================================ */

import { escapeHtml, titleCase } from './format.js';

function renderStats(stats) {
  return [
    ['P', stats.pow],
    ['D', stats.def],
    ['S', stats.spd],
  ].map(([label, value]) => `
    <span class="card-stat">
      <span class="card-stat-label">${label}</span>
      <span class="card-stat-value">${value}</span>
    </span>
  `).join('');
}

function renderCardArt(card) {
  if (card.imageUrl) {
    return `<img class="card-art-image" src="${escapeHtml(card.imageUrl)}" alt="" loading="lazy" />`;
  }

  return `<span class="card-art-symbol">${escapeHtml(card.symbol || '◆')}</span>`;
}

export function renderCardFrame(card, options = {}) {
  const {
    href = '',
    showOwnership = true,
    showStats = true,
  } = options;

  const tagName = href ? 'a' : 'article';
  const hrefAttribute = href ? ` href="${escapeHtml(href)}"` : '';

  return `
    <${tagName} class="tcg-card" data-rarity="${escapeHtml(card.rarity)}"${hrefAttribute} aria-label="${escapeHtml(card.name)} card">
      <div class="card-meta-row">
        <span class="rarity-chip">${escapeHtml(titleCase(card.rarity))}</span>
        ${showOwnership ? `<span class="status-pill">${card.owned ? `Lv ${card.level}` : 'Locked'}</span>` : ''}
      </div>
      <div class="card-art" aria-hidden="true">
        ${renderCardArt(card)}
      </div>
      <div class="card-nameplate">
        <h3 class="card-title">${escapeHtml(card.name)}</h3>
        <span class="card-subtitle">${escapeHtml(card.category)}</span>
      </div>
      ${showStats ? `<div class="card-stat-row">${renderStats(card.stats)}</div>` : ''}
    </${tagName}>
  `;
}
