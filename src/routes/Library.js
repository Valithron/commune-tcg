/* ============================================================================
   Library Route
   Phase 4.5 responsibility: clean player Library with no admin/debug links.
   ============================================================================ */

import { loadLibraryCards } from '../data/libraryData.js';
import { renderCardFrame } from '../components/CardFrame.js';

function renderSourceNote(library) {
  const sourceLabel = library.source === 'backend'
    ? `Live D1${library.table ? ` · ${library.table}` : ''}`
    : 'Mock fallback';

  return `
    <div class="empty-note">
      Source: ${sourceLabel}${library.warnings?.length ? ` · ${library.warnings[0]}` : ''}
    </div>
  `;
}

export async function renderLibrary() {
  const library = await loadLibraryCards();

  return `
    <section class="hero-panel">
      <span class="section-kicker">Global Pool</span>
      <h2 class="hero-title">The Library</h2>
      <p class="hero-copy">The Library shows the global card pool for the player experience. Admin frame checks and diagnostics now live in the isolated admin area.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/submit">Submit Card</a>
        <a class="button button-secondary" href="#/pull">Start Pulling</a>
      </div>
    </section>

    ${renderSourceNote(library)}

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Preview</span>
          <h2 class="section-title">All Known Cards</h2>
        </div>
        <span class="status-pill">${library.cards.length} cards</span>
      </div>
      <div class="card-grid">
        ${library.cards.map((card) => renderCardFrame(card, { href: `#/library/card/${card.id}`, context: 'library', showOwnership: false })).join('')}
      </div>
    </section>
  `;
}
