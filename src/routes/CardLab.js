/* ============================================================================
   Card Lab Route
   Phase 7.5 responsibility: live card-frame inspection using real Library data
   and title-length samples. No backend writes or gameplay systems.
   ============================================================================ */

import { loadLibraryCards } from '../data/libraryData.js';
import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';

const sampleDefinitions = [
  { key: 'shortest', label: 'Shortest', percentile: 0 },
  { key: 'p25', label: '25th Percentile', percentile: 0.25 },
  { key: 'median', label: 'Median', percentile: 0.5 },
  { key: 'p80', label: '80th Percentile', percentile: 0.8 },
  { key: 'longest', label: 'Longest', percentile: 1 },
];

const densityRows = [
  {
    density: 'showcase',
    title: 'Showcase Size',
    note: 'Large desktop inspection size for shape, crop, title, and footer checks.',
  },
  {
    density: 'standard',
    title: 'Standard Mobile Size',
    note: 'Normal collection and mobile card sizing target.',
  },
  {
    density: 'thumbnail',
    title: 'Thumbnail Size',
    note: 'Small collection, result, and compressed-list stress test.',
  },
];

function titleLength(card) {
  return String(card.name || '').length;
}

function selectTitleSamples(cards) {
  const sortedCards = [...cards].sort((a, b) => titleLength(a) - titleLength(b));
  const usedIds = new Set();

  return sampleDefinitions.map((definition) => {
    if (!sortedCards.length) {
      return { ...definition, card: null };
    }

    const targetIndex = Math.round(definition.percentile * (sortedCards.length - 1));
    const rankedCandidates = sortedCards
      .map((card, index) => ({ card, index, distance: Math.abs(index - targetIndex) }))
      .sort((a, b) => a.distance - b.distance || titleLength(a.card) - titleLength(b.card));

    const match = rankedCandidates.find(({ card }) => !usedIds.has(String(card.id))) || rankedCandidates[0];
    usedIds.add(String(match.card.id));

    return {
      ...definition,
      card: match.card,
      index: match.index,
    };
  });
}

function renderSampleMeta(sample) {
  if (!sample.card) {
    return '<div class="card-lab-meta"><strong>No card</strong><span>No Library cards loaded.</span></div>';
  }

  return `
    <div class="card-lab-meta">
      <strong>${escapeHtml(sample.label)}</strong>
      <span>${escapeHtml(String(titleLength(sample.card)))} chars · ${escapeHtml(titleCase(sample.card.rarity || 'common'))}</span>
    </div>
  `;
}

function renderCardCell(sample, density) {
  if (!sample.card) {
    return '<div class="card-lab-cell"><div class="empty-note">No card available.</div></div>';
  }

  return `
    <article class="card-lab-cell card-lab-cell--${escapeHtml(density)}">
      ${renderSampleMeta(sample)}
      <div class="card-lab-card-stage">
        ${renderCardFrame(sample.card, {
          density,
          context: 'library',
          showOwnership: false,
          showStats: true,
        })}
      </div>
      <div class="card-lab-title-readout">${escapeHtml(sample.card.name)}</div>
    </article>
  `;
}

function renderDensityRow(row, samples) {
  return `
    <section class="card-lab-section">
      <div class="section-heading card-lab-section-heading">
        <div>
          <span class="section-kicker">${escapeHtml(row.density)}</span>
          <h2 class="section-title">${escapeHtml(row.title)}</h2>
        </div>
        <span class="status-pill">5 samples</span>
      </div>
      <p class="body-copy card-lab-note">${escapeHtml(row.note)}</p>
      <div class="card-lab-row card-lab-row--${escapeHtml(row.density)}">
        ${samples.map((sample) => renderCardCell(sample, row.density)).join('')}
      </div>
    </section>
  `;
}

export async function renderCardLab() {
  const library = await loadLibraryCards();
  const samples = selectTitleSamples(library.cards);
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';

  return `
    <section class="hero-panel card-lab-hero">
      <span class="section-kicker">Card Lab</span>
      <h2 class="hero-title">Stress the frame.</h2>
      <p class="hero-copy">Live title-length samples from the Library render at showcase, standard, and thumbnail sizes before we lock the production overlay shape.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/library">Back to Library</a>
        <a class="button button-secondary" href="#/inventory">Inventory</a>
      </div>
    </section>

    <section class="glass-panel card-lab-summary">
      <div class="detail-list">
        <div class="detail-row"><span>Source</span><strong>${escapeHtml(sourceLabel)}</strong></div>
        <div class="detail-row"><span>Total Cards</span><strong>${escapeHtml(String(library.cards.length))}</strong></div>
        <div class="detail-row"><span>Title Limit Target</span><strong>28 characters</strong></div>
        <div class="detail-row"><span>Title Rule</span><strong>No ellipsis, fixed size per density</strong></div>
      </div>
    </section>

    <div class="card-lab">
      ${densityRows.map((row) => renderDensityRow(row, samples)).join('')}
    </div>
  `;
}
