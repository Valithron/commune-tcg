import { escapeHtml } from './format.js';
import { trackTelemetry } from '../services/telemetry.js';

export function renderCardInspectionModal({ cardId, context, title, description, content }) {
  const returnRoute = context === 'vault' ? '/vault' : '/library';
  return `
    <div class="card-inspection-backdrop" data-card-inspection data-card-id="${escapeHtml(cardId)}" data-card-context="${escapeHtml(context)}" data-card-return="${returnRoute}">
      <section class="card-inspection-modal" role="dialog" aria-modal="true" aria-labelledby="card-inspection-title" tabindex="-1" data-card-inspection-dialog>
        <a class="card-inspection-close" href="#${returnRoute}" aria-label="Close card inspection" data-card-inspection-close>×</a>
        <header class="card-inspection-header">
          <span class="section-kicker">${context === 'vault' ? 'Owned Card' : 'Available Design'}</span>
          <h2 id="card-inspection-title">${escapeHtml(title)}</h2>
          <p>${escapeHtml(description)}</p>
        </header>
        ${content}
      </section>
    </div>
  `;
}

export function initCardInspection(root) {
  const backdrop = root.querySelector('[data-card-inspection]');
  if (!backdrop) return;
  const returnRoute = backdrop.getAttribute('data-card-return') || '/home';
  const cardId = backdrop.getAttribute('data-card-id') || '';
  const context = backdrop.getAttribute('data-card-context') || '';

  trackTelemetry('card.inspected', { outcome: 'success', relatedId: cardId });
  backdrop.querySelector('[data-card-inspection-dialog]')?.focus({ preventScroll: true });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) window.location.hash = returnRoute;
  });
  backdrop.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.location.hash = returnRoute;
  });
  backdrop.dataset.inspectionReady = context;
}
