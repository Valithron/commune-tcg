import { findLibraryCardById } from '../data/libraryData.js';
import { renderCardDetailPanel } from '../components/CardDetailPanel.js';
import { renderCardInspectionModal } from '../components/CardInspectionModal.js';

export async function renderLibraryCardDetail({ params }) {
  const { card } = await findLibraryCardById(params.cardId);

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

  return renderCardInspectionModal({
    cardId: card.id,
    context: 'library',
    title: card.name || card.title || 'Library Card',
    description: 'Library cards are available designs. Pull a card to add an owned copy to your Vault.',
    content: renderCardDetailPanel(card, { context: 'library' }),
  });
}
