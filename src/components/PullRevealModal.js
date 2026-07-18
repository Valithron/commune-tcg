/* Interactive single- and five-card reveal stage with direct repull support. */

import { renderCardFrame } from './CardFrame.js';
import { fitCardTitles } from './cardTitleFit.js';
import { escapeHtml, titleCase } from './format.js';
import { beginPullTransaction } from '../services/pullTransaction.js';
import { clearPullRevealPayload } from '../services/pullRevealStore.js';

function getVaultCardHref(card) {
  const id = card?.id || card?.ownedCardId || card?.owned_card_id || '';
  return id ? `#/vault/card/${encodeURIComponent(id)}` : '#/vault';
}

function getRarity(card) {
  return String(card?.rarity || 'common').toLowerCase();
}

function renderParticles() {
  return Array.from({ length: 14 }, (_, index) => `<span class="pull-reveal-particle pull-reveal-particle--${index + 1}"></span>`).join('');
}

function renderRevealCard(card, index, mini = false) {
  const rarity = getRarity(card);
  return `
    <div class="pull-reveal-card${mini ? ' pull-reveal-card--mini' : ''}" role="button" tabindex="0"
      data-pull-reveal-card data-reveal-index="${index}" data-rarity="${escapeHtml(rarity)}"
      style="--reveal-index:${index}" aria-label="Reveal hidden card ${index + 1}">
      <span class="pull-reveal-ripple" aria-hidden="true"></span>
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

function renderPreview(cards) {
  return `
    <div class="pull-reveal-preview" data-pull-preview hidden aria-hidden="true">
      <div class="pull-reveal-preview-panel" role="dialog" aria-modal="true" aria-label="Revealed card inspection">
        <button class="pull-reveal-preview-close" type="button" data-pull-preview-close aria-label="Close card inspection">×</button>
        ${cards.map((card, index) => `<article data-pull-preview-card data-preview-index="${index}" hidden>${renderCardFrame(card, { context: 'pull', showOwnership: true, density: 'standard' })}</article>`).join('')}
      </div>
    </div>
  `;
}

function renderRepullConfirmation({ count, ticketsAfter }) {
  const cost = count === 5 ? 5 : 1;
  const balance = Number(ticketsAfter || 0);
  const affordable = balance >= cost;
  return `
    <div class="pull-repull-overlay" data-pull-repull hidden aria-hidden="true">
      <section class="pull-repull-panel" role="dialog" aria-modal="true" aria-labelledby="pull-repull-title">
        <span class="section-kicker">Standard Summon</span>
        <h2 id="pull-repull-title">Pull ${count === 5 ? 'five more' : 'again'}?</h2>
        <p>${count} Pull${count === 1 ? '' : 's'} · ${cost} Ticket${cost === 1 ? '' : 's'} · Balance 🎟 ${balance}</p>
        <p class="pull-repull-status" data-pull-repull-status>${affordable ? 'The reveal stage will remain open. The cinematic will not replay.' : 'Not enough Tickets.'}</p>
        <div class="pull-repull-actions">
          <button class="button button-primary" type="button" data-pull-repull-confirm ${affordable ? '' : 'disabled'}>Confirm</button>
          <button class="button button-secondary" type="button" data-pull-repull-close>Cancel</button>
          ${affordable ? '' : '<a class="button button-secondary" href="#/shop">Open Store</a>'}
        </div>
      </section>
    </div>
  `;
}

function renderMissingReveal() {
  return `
    <section class="pull-reveal-missing">
      <span class="section-kicker">Reveal Expired</span>
      <h1>No card is waiting.</h1>
      <p>Start a fresh summon. Refreshing this page never spends another Ticket.</p>
      <a class="button button-primary" href="#/pull">Return to Summons</a>
    </section>
  `;
}

function renderSingle(cards, payload) {
  const card = cards[0];
  return `
    <section class="pull-reveal-screen" data-pull-reveal data-reveal-mode="single" data-count="1" data-ticket-balance="${Number(payload.ticketsAfter || 0)}">
      <div class="pull-reveal-atmosphere" aria-hidden="true">${renderParticles()}<span class="pull-reveal-mist"></span><span class="pull-reveal-rings"></span></div>
      <div class="pull-reveal-stage">
        <div class="pull-reveal-copy" data-pull-reveal-copy><span class="section-kicker">Standard Summon</span><h1>Resonance Formed</h1><p>Tap the card back when you are ready.</p></div>
        <div class="pull-reveal-core-response" data-pull-core-response aria-hidden="true"></div>
        ${renderRevealCard(card, 0)}
        <div class="pull-reveal-prompt" data-pull-reveal-prompt>Tap to Reveal</div>
        <div class="pull-reveal-result-copy" data-pull-result-copy hidden><span>${escapeHtml(titleCase(getRarity(card)))}</span><strong>${escapeHtml(card.name || 'Revealed Card')}</strong></div>
        <div class="pull-reveal-actions" data-pull-reveal-actions hidden>
          <a class="button button-primary" href="${getVaultCardHref(card)}" data-pull-clear>View in Vault</a>
          <button class="button button-secondary" type="button" data-pull-again>Pull Again</button>
        </div>
      </div>
      ${renderRepullConfirmation({ count: 1, ticketsAfter: payload.ticketsAfter })}
    </section>
  `;
}

function renderFive(cards, payload) {
  return `
    <section class="pull-reveal-screen pull-reveal-screen--multi" data-pull-reveal data-reveal-mode="multi" data-count="5" data-ticket-balance="${Number(payload.ticketsAfter || 0)}">
      <div class="pull-reveal-atmosphere" aria-hidden="true">${renderParticles()}<span class="pull-reveal-mist"></span><span class="pull-reveal-rings"></span></div>
      <div class="pull-reveal-stage pull-reveal-stage--multi">
        <div class="pull-reveal-copy" data-pull-reveal-copy><span class="section-kicker">Standard Summon</span><h1>Five Resonances</h1><p>Reveal them in any order.</p></div>
        <div class="pull-reveal-core-response" data-pull-core-response aria-hidden="true"></div>
        <div class="pull-reveal-five-layout" aria-label="Five hidden pulled cards">${cards.map((card, index) => renderRevealCard(card, index, true)).join('')}</div>
        <div class="pull-reveal-prompt" data-pull-reveal-prompt>Choose a Card</div>
        <button class="button button-primary pull-reveal-all" type="button" data-pull-reveal-all>Reveal All</button>
        <div class="pull-reveal-actions" data-pull-reveal-actions hidden>
          <a class="button button-primary" href="#/vault" data-pull-clear>View in Vault</a>
          <button class="button button-secondary" type="button" data-pull-again>Pull Again</button>
        </div>
      </div>
      ${renderPreview(cards)}
      ${renderRepullConfirmation({ count: 5, ticketsAfter: payload.ticketsAfter })}
    </section>
  `;
}

export function renderPullRevealModal(payload = {}) {
  const cards = Array.isArray(payload.cards) ? payload.cards.filter(Boolean) : [];
  if (!cards.length) return renderMissingReveal();
  const count = Number(payload.count || cards.length) === 5 ? 5 : 1;
  return count === 5 ? renderFive(cards.slice(0, 5), payload) : renderSingle(cards, payload);
}

export function initPullRevealModal(root) {
  const revealRoot = root.querySelector('[data-pull-reveal]');
  if (!revealRoot) return;

  const cards = [...revealRoot.querySelectorAll('[data-pull-reveal-card]')];
  const prompt = revealRoot.querySelector('[data-pull-reveal-prompt]');
  const actions = revealRoot.querySelector('[data-pull-reveal-actions]');
  const resultCopy = revealRoot.querySelector('[data-pull-result-copy]');
  const revealAll = revealRoot.querySelector('[data-pull-reveal-all]');
  const coreResponse = revealRoot.querySelector('[data-pull-core-response]');
  const repull = revealRoot.querySelector('[data-pull-repull]');
  const repullStatus = revealRoot.querySelector('[data-pull-repull-status]');
  const repullConfirm = revealRoot.querySelector('[data-pull-repull-confirm]');
  const preview = revealRoot.querySelector('[data-pull-preview]');
  const count = Number(revealRoot.dataset.count) === 5 ? 5 : 1;
  let revealingAll = false;

  function revealedCards() {
    return cards.filter((card) => card.classList.contains('is-revealed'));
  }

  function completeIfReady() {
    const total = revealedCards().length;
    if (prompt) prompt.textContent = total === cards.length ? 'Summon Complete' : `${total} of ${cards.length} Revealed`;
    if (total !== cards.length) return;
    revealRoot.classList.add('is-complete');
    if (revealAll) revealAll.hidden = true;
    window.setTimeout(() => {
      if (resultCopy) resultCopy.hidden = false;
      if (actions) actions.hidden = false;
    }, 480);
  }

  function revealOne(card) {
    if (!card || card.classList.contains('is-revealed') || card.classList.contains('is-charging')) return Promise.resolve();
    const rarity = card.dataset.rarity || 'common';
    card.classList.add('is-charging');
    revealRoot.dataset.activeRarity = rarity;
    coreResponse?.classList.remove('is-active', 'tell-legendary', 'tell-mythic');
    void coreResponse?.offsetWidth;
    coreResponse?.classList.add('is-active');
    if (rarity === 'legendary') coreResponse?.classList.add('tell-legendary');
    if (rarity === 'mythic') coreResponse?.classList.add('tell-mythic');

    return new Promise((resolve) => {
      window.setTimeout(() => {
        card.classList.remove('is-charging');
        card.classList.add('is-revealed');
        card.querySelector('[data-pull-reveal-back]')?.setAttribute('aria-hidden', 'true');
        card.querySelector('[data-pull-reveal-front]')?.setAttribute('aria-hidden', 'false');
        card.setAttribute('aria-label', 'Revealed card');
        fitCardTitles(card);
        completeIfReady();
        resolve();
      }, rarity === 'legendary' || rarity === 'mythic' ? 430 : 260);
    });
  }

  function openPreview(index) {
    if (!preview || revealedCards().length !== cards.length) return;
    preview.querySelectorAll('[data-pull-preview-card]').forEach((card) => { card.hidden = card.dataset.previewIndex !== String(index); });
    preview.hidden = false;
    preview.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => preview.classList.add('is-open'));
    fitCardTitles(preview);
  }

  function closePreview() {
    if (!preview) return;
    preview.classList.remove('is-open');
    preview.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { preview.hidden = true; }, 220);
  }

  function activateCard(card) {
    if (card.classList.contains('is-revealed')) openPreview(card.dataset.revealIndex || 0);
    else revealOne(card);
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => activateCard(card));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activateCard(card);
    });
  });

  revealAll?.addEventListener('click', async () => {
    if (revealingAll) return;
    revealingAll = true;
    revealAll.disabled = true;
    for (const card of cards) {
      if (!card.classList.contains('is-revealed')) {
        await revealOne(card);
        await new Promise((resolve) => window.setTimeout(resolve, 140));
      }
    }
    revealingAll = false;
  });

  revealRoot.querySelectorAll('[data-pull-preview-close]').forEach((button) => button.addEventListener('click', closePreview));
  preview?.addEventListener('click', (event) => { if (event.target === preview) closePreview(); });
  revealRoot.querySelectorAll('[data-pull-clear]').forEach((link) => link.addEventListener('click', clearPullRevealPayload));

  function closeRepull() {
    repull?.classList.remove('is-open');
    repull?.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { if (repull) repull.hidden = true; }, 180);
  }

  revealRoot.querySelector('[data-pull-again]')?.addEventListener('click', () => {
    if (!repull) return;
    repull.hidden = false;
    repull.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => repull.classList.add('is-open'));
  });
  revealRoot.querySelectorAll('[data-pull-repull-close]').forEach((button) => button.addEventListener('click', closeRepull));
  repull?.addEventListener('click', (event) => { if (event.target === repull) closeRepull(); });

  repullConfirm?.addEventListener('click', async () => {
    if (repullConfirm.disabled) return;
    repullConfirm.disabled = true;
    repullConfirm.textContent = 'Summoning…';
    if (repullStatus) repullStatus.textContent = 'Creating one new protected Pull request…';
    revealRoot.classList.add('is-rematerializing');
    try {
      const payload = await beginPullTransaction({ count, source: 'repull', forceNew: true });
      root.innerHTML = renderPullRevealModal(payload);
      fitCardTitles(root);
      initPullRevealModal(root);
    } catch (error) {
      revealRoot.classList.remove('is-rematerializing');
      repullConfirm.disabled = false;
      repullConfirm.textContent = 'Try Again';
      if (repullStatus) repullStatus.textContent = error.message;
    }
  });
}
