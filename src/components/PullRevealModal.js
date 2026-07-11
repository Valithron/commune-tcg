/* ============================================================================
   Pull Reveal Modal
   Responsibility: render and initialize single- and five-card reveal flows,
   including staged reveal, reveal-all, and expanded card preview.
   ============================================================================ */

import { renderCardFrame } from './CardFrame.js';
import { fitCardTitles } from './cardTitleFit.js';
import { escapeHtml, titleCase } from './format.js';
import { clearPullRevealPayload } from '../services/pullRevealStore.js';

const rarityRank = {
  common: 1,
  uncommon: 2,
  rare: 3,
  legendary: 4,
  mythic: 5,
};

function getVaultCardHref(card) {
  const cardId = card?.id || card?.ownedCardId || card?.owned_card_id || '';
  return cardId ? `#/vault/card/${encodeURIComponent(cardId)}` : '#/vault';
}

function getRarity(card) {
  return String(card?.rarity || 'common').toLowerCase();
}

function getDominantRarity(cards) {
  return cards.reduce((best, card) => {
    const rarity = getRarity(card);
    return (rarityRank[rarity] || 1) > (rarityRank[best] || 1) ? rarity : best;
  }, 'common');
}

function renderParticles() {
  return Array.from({ length: 10 }, (_, index) => `
    <span class="pull-reveal-particle pull-reveal-particle--${index + 1}"></span>
  `).join('');
}

function renderRevealCard(card, index, { mini = false } = {}) {
  const rarity = getRarity(card);
  const name = card.name || 'Pulled card';

  return `
    <div
      class="pull-reveal-card${mini ? ' pull-reveal-card--mini' : ''}"
      role="button"
      tabindex="0"
      data-pull-reveal-card
      data-reveal-index="${index}"
      data-rarity="${escapeHtml(rarity)}"
      aria-label="Tap to reveal ${escapeHtml(name)}"
    >
      <div class="pull-reveal-card-inner">
        <div class="pull-reveal-card-face pull-reveal-card-back" data-pull-reveal-back aria-hidden="false">
          <img src="/assets/commune-card-back.png" alt="Imago Core card back" />
        </div>
        <div class="pull-reveal-card-face pull-reveal-card-front" data-pull-reveal-front aria-hidden="true">
          ${renderCardFrame(card, { context: 'pull', showOwnership: true, density: mini ? 'thumbnail' : 'standard' })}
        </div>
      </div>
    </div>
  `;
}

function renderPreviewModal(cards) {
  return `
    <div class="pull-reveal-preview" data-pull-reveal-preview hidden aria-hidden="true" tabindex="-1">
      <div class="pull-reveal-preview-panel" data-pull-reveal-preview-panel role="dialog" aria-modal="true" aria-labelledby="pull-reveal-preview-title">
        <button class="pull-reveal-preview-handle" type="button" data-pull-preview-close aria-label="Swipe down or tap to close card preview"></button>
        <div class="pull-reveal-preview-copy">
          <span class="section-kicker">Card Preview</span>
          <h2 id="pull-reveal-preview-title">Expanded View</h2>
        </div>
        <button class="pull-reveal-preview-close" type="button" data-pull-preview-close aria-label="Close card preview">×</button>
        <div class="pull-reveal-preview-cards">
          ${cards.map((card, index) => `
            <article class="pull-reveal-preview-card" data-pull-preview-card data-preview-index="${index}" hidden>
              ${renderCardFrame(card, { context: 'pull', showOwnership: true, density: 'standard' })}
            </article>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMissingReveal() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Reveal Expired</span>
      <h2 class="hero-title">No card is waiting.</h2>
      <p class="hero-copy">Start a fresh pull to open the reveal animation. This keeps refreshes from spending tickets again.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=1">Start 1 Pull</a>
      </div>
    </section>
  `;
}

function renderSingleReveal(card) {
  const rarity = getRarity(card);
  const cardName = card.name || 'Revealed Card';

  return `
    <section class="pull-reveal-screen" data-pull-reveal data-reveal-mode="single" data-rarity="${escapeHtml(rarity)}">
      <div class="pull-reveal-atmosphere" aria-hidden="true">
        ${renderParticles()}
      </div>

      <div class="pull-reveal-stage">
        <div class="pull-reveal-copy" data-pull-reveal-copy>
          <span class="section-kicker">One Pull</span>
          <h2>Summon Ready</h2>
          <p>Tap the card back to reveal what entered your Vault.</p>
        </div>

        <div class="pull-reveal-glow" aria-hidden="true"></div>
        <div class="pull-reveal-burst" data-pull-reveal-burst aria-hidden="true"></div>

        ${renderRevealCard(card, 0)}

        <div class="pull-reveal-prompt" data-pull-reveal-prompt>
          <span class="pull-reveal-loader" aria-hidden="true"><span></span></span>
          <p>Tap to Reveal</p>
        </div>

        <div class="pull-reveal-revealed-copy" data-pull-reveal-revealed-copy hidden>
          <span>${escapeHtml(titleCase(rarity))}</span>
          <strong>${escapeHtml(cardName)}</strong>
        </div>

        <div class="pull-reveal-actions" data-pull-reveal-actions hidden>
          <a class="button button-primary" href="${getVaultCardHref(card)}" data-pull-reveal-clear>View in Vault</a>
          <a class="button button-secondary" href="#/pull/confirm?count=1" data-pull-reveal-clear>Pull Again</a>
        </div>
      </div>
    </section>
  `;
}

function renderFiveReveal(cards) {
  const rarity = getDominantRarity(cards);

  return `
    <section class="pull-reveal-screen pull-reveal-screen--multi" data-pull-reveal data-reveal-mode="multi" data-rarity="${escapeHtml(rarity)}">
      <div class="pull-reveal-atmosphere" aria-hidden="true">
        ${renderParticles()}
      </div>

      <div class="pull-reveal-stage pull-reveal-stage--multi">
        <div class="pull-reveal-copy" data-pull-reveal-copy>
          <h2>Five Seals Ready</h2>
        </div>

        <div class="pull-reveal-glow" aria-hidden="true"></div>
        <div class="pull-reveal-burst" data-pull-reveal-burst aria-hidden="true"></div>

        <div class="pull-reveal-five-layout" aria-label="Five pulled cards">
          ${cards.map((card, index) => renderRevealCard(card, index, { mini: true })).join('')}
        </div>

        <div class="pull-reveal-prompt pull-reveal-prompt--multi" data-pull-reveal-prompt>
          <span class="pull-reveal-loader" aria-hidden="true"><span></span></span>
          <p>Choose a Card</p>
        </div>

        <button class="button button-primary pull-reveal-all" type="button" data-pull-reveal-all>
          Reveal All
        </button>

        <div class="pull-reveal-actions" data-pull-reveal-actions hidden>
          <a class="button button-primary" href="#/vault" data-pull-reveal-clear>View in Vault</a>
          <a class="button button-secondary" href="#/pull/confirm?count=5" data-pull-reveal-clear>Pull Again</a>
        </div>
      </div>

      ${renderPreviewModal(cards)}
    </section>
  `;
}

export function renderPullRevealModal({ cards = [], count = 0 } = {}) {
  const safeCards = cards.filter(Boolean);

  if (!safeCards.length) {
    return renderMissingReveal();
  }

  return safeCards.length >= 5 || Number(count) === 5
    ? renderFiveReveal(safeCards.slice(0, 5))
    : renderSingleReveal(safeCards[0]);
}

function updatePrompt(prompt, text) {
  if (!prompt) {
    return;
  }

  prompt.classList.add('is-revealed');
  const promptCopy = prompt.querySelector('p');
  if (promptCopy) {
    promptCopy.textContent = text;
  }
}

function initPreviewModal({ revealRoot, preview, previewPanel, previewCards, revealCards, isMulti }) {
  let closeTimer = null;
  let dragState = null;

  function areAllCardsRevealed() {
    return revealCards.length > 0 && revealCards.every((card) => card.classList.contains('is-revealed'));
  }

  function openPreview(index) {
    if (!isMulti || !preview || !previewPanel || !areAllCardsRevealed()) {
      return;
    }

    window.clearTimeout(closeTimer);
    previewCards.forEach((card) => {
      card.hidden = card.dataset.previewIndex !== String(index);
    });
    preview.hidden = false;
    preview.setAttribute('aria-hidden', 'false');
    preview.classList.remove('is-closing');
    previewPanel.style.transform = '';

    window.requestAnimationFrame(() => {
      preview.classList.add('is-open');
      preview.focus({ preventScroll: true });
      fitCardTitles(preview);
    });
  }

  function closePreview() {
    if (!preview || !preview.classList.contains('is-open')) {
      return;
    }

    preview.classList.remove('is-open');
    preview.classList.add('is-closing');
    preview.setAttribute('aria-hidden', 'true');
    if (previewPanel) {
      previewPanel.style.transform = '';
    }

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      preview.classList.remove('is-closing');
      preview.hidden = true;
    }, 240);
  }

  preview?.addEventListener('click', (event) => {
    if (event.target === preview) {
      closePreview();
    }
  });

  preview?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePreview();
    }
  });

  revealRoot.querySelectorAll('[data-pull-preview-close]').forEach((button) => {
    button.addEventListener('click', closePreview);
  });

  previewPanel?.addEventListener('pointerdown', (event) => {
    const target = event.target;
    const isHandle = target.closest?.('[data-pull-preview-close]') || target.closest?.('.pull-reveal-preview-copy');
    if (!isHandle) {
      return;
    }

    dragState = {
      startY: event.clientY,
      distance: 0,
    };
    previewPanel.classList.add('is-dragging');
    previewPanel.setPointerCapture?.(event.pointerId);
  });

  previewPanel?.addEventListener('pointermove', (event) => {
    if (!dragState || !previewPanel) {
      return;
    }

    const distance = Math.max(0, event.clientY - dragState.startY);
    dragState.distance = distance;
    previewPanel.style.transform = `translateY(${distance}px)`;
    if (preview) {
      preview.style.opacity = String(Math.max(0.35, 1 - distance / 360));
    }
  });

  function endPreviewDrag() {
    if (!dragState || !previewPanel) {
      return;
    }

    const shouldClose = dragState.distance > 80;
    dragState = null;
    previewPanel.classList.remove('is-dragging');
    previewPanel.style.transform = '';
    if (preview) {
      preview.style.opacity = '';
    }

    if (shouldClose) {
      closePreview();
    }
  }

  previewPanel?.addEventListener('pointerup', endPreviewDrag);
  previewPanel?.addEventListener('pointercancel', endPreviewDrag);

  return { openPreview };
}

export function initPullRevealModal(root) {
  const revealRoot = root.querySelector('[data-pull-reveal]');
  if (!revealRoot) {
    return;
  }

  const revealCards = Array.from(revealRoot.querySelectorAll('[data-pull-reveal-card]'));
  const prompt = revealRoot.querySelector('[data-pull-reveal-prompt]');
  const actions = revealRoot.querySelector('[data-pull-reveal-actions]');
  const revealedCopy = revealRoot.querySelector('[data-pull-reveal-revealed-copy]');
  const copy = revealRoot.querySelector('[data-pull-reveal-copy]');
  const burst = revealRoot.querySelector('[data-pull-reveal-burst]');
  const revealAllButton = revealRoot.querySelector('[data-pull-reveal-all]');
  const preview = revealRoot.querySelector('[data-pull-reveal-preview]');
  const previewPanel = revealRoot.querySelector('[data-pull-reveal-preview-panel]');
  const previewCards = Array.from(revealRoot.querySelectorAll('[data-pull-preview-card]'));
  const isMulti = revealRoot.dataset.revealMode === 'multi';
  const previewController = initPreviewModal({ revealRoot, preview, previewPanel, previewCards, revealCards, isMulti });

  function areAllCardsRevealed() {
    return revealCards.length > 0 && revealCards.every((card) => card.classList.contains('is-revealed'));
  }

  function completeRevealIfReady() {
    if (!areAllCardsRevealed()) {
      return;
    }

    revealRoot.classList.add('is-revealed');
    copy?.classList.add('is-revealed');
    burst?.classList.add('is-active');
    updatePrompt(prompt, isMulti ? 'Tap a Card to Inspect' : 'Revealed');

    if (revealAllButton) {
      revealAllButton.hidden = true;
    }

    window.setTimeout(() => {
      if (revealedCopy) {
        revealedCopy.hidden = false;
      }
      if (actions) {
        actions.hidden = false;
      }
    }, 560);
  }

  function revealOne(revealCard) {
    if (!revealCard || revealCard.classList.contains('is-revealed')) {
      return;
    }

    revealCard.classList.add('is-revealed');
    revealCard.setAttribute('aria-label', 'Pulled card revealed');
    revealCard.querySelector('[data-pull-reveal-back]')?.setAttribute('aria-hidden', 'true');
    revealCard.querySelector('[data-pull-reveal-front]')?.setAttribute('aria-hidden', 'false');

    if (!isMulti) {
      completeRevealIfReady();
      return;
    }

    const revealedCount = revealCards.filter((card) => card.classList.contains('is-revealed')).length;
    updatePrompt(prompt, `${revealedCount} of ${revealCards.length} Revealed`);
    completeRevealIfReady();
  }

  function revealAll() {
    revealCards.forEach((revealCard, index) => {
      if (revealCard.classList.contains('is-revealed')) {
        return;
      }

      window.setTimeout(() => revealOne(revealCard), index * 90);
    });
  }

  revealCards.forEach((revealCard) => {
    revealCard.addEventListener('click', () => {
      if (isMulti && revealCard.classList.contains('is-revealed') && areAllCardsRevealed()) {
        previewController.openPreview(revealCard.dataset.revealIndex || '0');
        return;
      }

      revealOne(revealCard);
    });

    revealCard.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      if (isMulti && revealCard.classList.contains('is-revealed') && areAllCardsRevealed()) {
        previewController.openPreview(revealCard.dataset.revealIndex || '0');
        return;
      }

      revealOne(revealCard);
    });
  });

  revealAllButton?.addEventListener('click', revealAll);

  revealRoot.querySelectorAll('[data-pull-reveal-clear]').forEach((link) => {
    link.addEventListener('click', () => clearPullRevealPayload());
  });
}
