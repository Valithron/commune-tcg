import { findLibraryCardById } from '../data/libraryData.js';
import { renderCardDetailPanel } from '../components/CardDetailPanel.js';

export async function renderLibraryCardDetail({ params }) {
  const { card, source, table } = await findLibraryCardById(params.cardId);

  if (!card) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Library Detail</span>
        <h2 class="hero-title">Card not found.</h2>
        <p class="hero-copy">This card id does not exist in the current Library data source.</p>
        <div class="action-row"><a class="button button-secondary" href="#/library">Back to Library</a></div>
      </section>
    `;
  }

  const sourceLabel = source === 'backend' ? `Live data${table ? ` · ${table}` : ''}` : 'Mock fallback';

  return `
    <section class="hero-panel">
      <span class="section-kicker">Global Template</span>
      <h2 class="hero-title">Library Detail</h2>
      <p class="hero-copy">Template-level card information is loaded from the Phase 7 Library read model when available.</p>
      <div class="action-row"><a class="button button-secondary" href="#/library">Back to Library</a></div>
    </section>
    <div class="empty-note">Source: ${sourceLabel}</div>
    ${renderCardDetailPanel(card, { context: 'library' })}
  `;
}
