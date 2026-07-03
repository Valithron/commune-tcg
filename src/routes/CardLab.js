/* ============================================================================
   Card Lab Route
   Phase 7.5 responsibility: live card-frame inspection using real Library data,
   title-length samples, rarity samples, and detail-sheet preview. No backend writes.
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

const rarityDefinitions = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

const densityRows = [
  {
    density: 'showcase',
    title: 'Showcase Size',
    note: 'Large desktop inspection size for shape, crop, title, rarity, and footer checks.',
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

function normalizeRarity(rarity) {
  const value = String(rarity || 'common').toLowerCase();
  return rarityDefinitions.includes(value) ? value : 'common';
}

function withLabRarity(card, rarity, note) {
  if (!card) {
    return null;
  }

  return {
    ...card,
    id: `${card.id || card.name}-lab-${rarity}`,
    rarity,
    labRarityNote: note,
  };
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
      metaLine: `${titleLength(match.card)} chars · ${titleCase(normalizeRarity(match.card.rarity))}`,
    };
  });
}

function selectRaritySamples(cards) {
  const usedIds = new Set();
  const actualByRarity = new Map(rarityDefinitions.map((rarity) => [rarity, []]));

  cards.forEach((card) => {
    actualByRarity.get(normalizeRarity(card.rarity)).push(card);
  });

  const findUnused = (candidates) => candidates.find((card) => !usedIds.has(String(card.id))) || candidates[0] || null;
  const fallbackCards = cards.length ? cards : [];

  return rarityDefinitions.map((rarity) => {
    const actualCard = findUnused(actualByRarity.get(rarity) || []);

    if (actualCard) {
      usedIds.add(String(actualCard.id));
      return {
        key: rarity,
        label: titleCase(rarity),
        card: actualCard,
        metaLine: `${titleLength(actualCard)} chars · live ${titleCase(rarity)}`,
      };
    }

    const fallbackSource = rarity === 'mythic'
      ? findUnused(actualByRarity.get('legendary') || []) || findUnused(fallbackCards)
      : findUnused(fallbackCards);
    const fallbackCard = withLabRarity(fallbackSource, rarity, rarity === 'mythic' ? 'Legendary rendered as Mythic' : 'Lab rarity override');

    if (fallbackSource) {
      usedIds.add(String(fallbackSource.id));
    }

    return {
      key: rarity,
      label: titleCase(rarity),
      card: fallbackCard,
      metaLine: fallbackCard
        ? `${titleLength(fallbackCard)} chars · ${fallbackCard.labRarityNote}`
        : `No ${titleCase(rarity)} sample`,
    };
  });
}

function getDetailCard(titleSamples, cards) {
  return titleSamples.find((sample) => sample.key === 'longest')?.card
    || titleSamples.find((sample) => sample.card)?.card
    || cards[0]
    || null;
}

function renderDetailRow(label, value) {
  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value || 'None'))}</strong>
    </div>
  `;
}

function renderDetailPreview(card, library) {
  if (!card) {
    return '<section class="glass-panel card-lab-detail-preview"><div class="empty-note">No card available for detail preview.</div></section>';
  }

  const stats = card.stats || {};
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';
  const artStatus = card.imageUrl || card.imageKey ? 'Image mapped' : 'No image mapped';

  return `
    <section class="glass-panel card-lab-detail-preview">
      <div class="card-lab-detail-copy">
        <span class="section-kicker">Detail Preview</span>
        <h2 class="section-title">Stats Screen Layout</h2>
        <p class="body-copy">This preview keeps the collectible card face clean while moving source, ownership, description, and expanded metadata into the surrounding stat sheet.</p>
      </div>
      <div class="card-lab-detail-layout">
        <div class="card-lab-detail-card-stage">
          ${renderCardFrame(card, {
            density: 'showcase',
            context: 'library',
            showOwnership: false,
            showStats: true,
          })}
        </div>
        <div class="card-lab-detail-sheet">
          <div>
            <span class="section-kicker">Selected Card</span>
            <h3 class="detail-title">${escapeHtml(card.name)}</h3>
            <p class="body-copy">${escapeHtml(card.flavor || 'No flavor text is mapped for this card yet.')}</p>
          </div>
          <div class="stat-grid card-lab-detail-stat-grid">
            <div class="stat-panel"><span class="stat-label">POW</span><strong class="stat-value">${escapeHtml(String(stats.pow ?? 1))}</strong></div>
            <div class="stat-panel"><span class="stat-label">DEF</span><strong class="stat-value">${escapeHtml(String(stats.def ?? 1))}</strong></div>
            <div class="stat-panel"><span class="stat-label">SPD</span><strong class="stat-value">${escapeHtml(String(stats.spd ?? 1))}</strong></div>
          </div>
          <div class="detail-list">
            ${renderDetailRow('Rarity', titleCase(normalizeRarity(card.rarity)))}
            ${renderDetailRow('Title Length', `${titleLength(card)} / 28 characters`)}
            ${renderDetailRow('Art Status', artStatus)}
            ${renderDetailRow('Data Source', sourceLabel)}
            ${renderDetailRow('Card ID', card.id)}
            ${renderDetailRow('Ownership Context', 'Not shown in Library')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSampleMeta(sample) {
  if (!sample.card) {
    return '<div class="card-lab-meta"><strong>No card</strong><span>No Library cards loaded.</span></div>';
  }

  return `
    <div class="card-lab-meta">
      <strong>${escapeHtml(sample.label)}</strong>
      <span>${escapeHtml(sample.metaLine || `${titleLength(sample.card)} chars · ${titleCase(normalizeRarity(sample.card.rarity))}`)}</span>
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

function renderSampleRow({ density, rowLabel, rowTitle, rowNote, samples }) {
  return `
    <div class="card-lab-subsection">
      <div class="card-lab-subheading">
        <div>
          <span class="section-kicker">${escapeHtml(rowLabel)}</span>
          <h3 class="card-lab-row-title">${escapeHtml(rowTitle)}</h3>
        </div>
        <span class="status-pill">5 cards</span>
      </div>
      <p class="body-copy card-lab-note">${escapeHtml(rowNote)}</p>
      <div class="card-lab-row card-lab-row--${escapeHtml(density)}">
        ${samples.map((sample) => renderCardCell(sample, density)).join('')}
      </div>
    </div>
  `;
}

function renderDensitySection(row, titleSamples, raritySamples) {
  return `
    <section class="card-lab-section">
      <div class="section-heading card-lab-section-heading">
        <div>
          <span class="section-kicker">${escapeHtml(row.density)}</span>
          <h2 class="section-title">${escapeHtml(row.title)}</h2>
        </div>
      </div>
      <p class="body-copy card-lab-note">${escapeHtml(row.note)}</p>
      ${renderSampleRow({
        density: row.density,
        rowLabel: 'Title length',
        rowTitle: `${row.title} Title Samples`,
        rowNote: 'Shortest, 25th percentile, median, 80th percentile, and longest title strings.',
        samples: titleSamples,
      })}
      ${renderSampleRow({
        density: row.density,
        rowLabel: 'Rarity spread',
        rowTitle: `${row.title} Rarity Samples`,
        rowNote: 'Common, Uncommon, Rare, Legendary, and Mythic frames. Missing rarities are rendered as lab-only overrides.',
        samples: raritySamples,
      })}
    </section>
  `;
}

export async function renderCardLab() {
  const library = await loadLibraryCards();
  const titleSamples = selectTitleSamples(library.cards);
  const raritySamples = selectRaritySamples(library.cards);
  const detailCard = getDetailCard(titleSamples, library.cards);
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';

  return `
    <section class="hero-panel card-lab-hero">
      <span class="section-kicker">Card Lab</span>
      <h2 class="hero-title">Stress the frame.</h2>
      <p class="hero-copy">Live detail, title-length, and rarity samples from the Library render before we lock the production overlay shape.</p>
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

    ${renderDetailPreview(detailCard, library)}

    <div class="card-lab">
      ${densityRows.map((row) => renderDensitySection(row, titleSamples, raritySamples)).join('')}
    </div>
  `;
}
