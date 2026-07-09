import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';
import { clearPullRevealPayload, readPullRevealPayload } from '../services/pullRevealStore.js';

function getRevealCard(payload) {
  return payload?.cards?.[0] || null;
}

function getVaultCardHref(card) {
  const cardId = card?.id || card?.ownedCardId || card?.owned_card_id || '';
  return cardId ? `#/vault/card/${encodeURIComponent(cardId)}` : '#/vault';
}

function getRarity(card) {
  return String(card?.rarity || 'common').toLowerCase();
}

function renderParticles() {
  return Array.from({ length: 10 }, (_, index) => `
    <span class="pull-reveal-particle pull-reveal-particle--${index + 1}"></span>
  `).join('');
}

function renderMissingReveal() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Reveal Expired</span>
      <h2 class="hero-title">No card is waiting.</h2>
      <p class="hero-copy">Start a fresh one-pull to open the reveal animation. This keeps refreshes from spending tickets again.</p>
      <div class="action-row">
        <a class="button button-primary" href="#/pull/confirm?count=1">Start 1 Pull</a>
        <a class="button button-secondary" href="#/pull">Back to Pull</a>
      </div>
    </section>
  `;
}

export async function renderPullReveal() {
  const payload = readPullRevealPayload();
  const card = getRevealCard(payload);

  if (!card) {
    return renderMissingReveal();
  }

  const rarity = getRarity(card);
  const cardName = card.name || 'Revealed Card';

  return `
    <section class="pull-reveal-screen" data-pull-reveal data-rarity="${escapeHtml(rarity)}">
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

        <div class="pull-reveal-card" role="button" tabindex="0" data-pull-reveal-card aria-label="Tap to reveal pulled card">
          <div class="pull-reveal-card-inner">
            <div class="pull-reveal-card-face pull-reveal-card-back" data-pull-reveal-back aria-hidden="false">
              <img src="/assets/commune-card-back.png" alt="Commune card back" />
            </div>
            <div class="pull-reveal-card-face pull-reveal-card-front" data-pull-reveal-front aria-hidden="true">
              ${renderCardFrame(card, { context: 'pull', showOwnership: true })}
            </div>
          </div>
        </div>

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
          <a class="button button-secondary" href="#/pull" data-pull-reveal-clear>Back to Pull</a>
        </div>
      </div>
    </section>
  `;
}

export function initPullReveal(root) {
  const revealRoot = root.querySelector('[data-pull-reveal]');
  if (!revealRoot) {
    return;
  }

  const revealCard = revealRoot.querySelector('[data-pull-reveal-card]');
  const prompt = revealRoot.querySelector('[data-pull-reveal-prompt]');
  const actions = revealRoot.querySelector('[data-pull-reveal-actions]');
  const revealedCopy = revealRoot.querySelector('[data-pull-reveal-revealed-copy]');
  const copy = revealRoot.querySelector('[data-pull-reveal-copy]');
  const burst = revealRoot.querySelector('[data-pull-reveal-burst]');
  const back = revealRoot.querySelector('[data-pull-reveal-back]');
  const front = revealRoot.querySelector('[data-pull-reveal-front]');

  function reveal() {
    if (!revealCard || revealCard.classList.contains('is-revealed')) {
      return;
    }

    revealRoot.classList.add('is-revealed');
    revealCard.classList.add('is-revealed');
    revealCard.setAttribute('aria-label', 'Pulled card revealed');
    back?.setAttribute('aria-hidden', 'true');
    front?.setAttribute('aria-hidden', 'false');

    if (copy) {
      copy.classList.add('is-revealed');
    }

    if (burst) {
      burst.classList.add('is-active');
    }

    if (prompt) {
      prompt.classList.add('is-revealed');
      const promptCopy = prompt.querySelector('p');
      if (promptCopy) {
        promptCopy.textContent = 'Revealed';
      }
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

  revealCard?.addEventListener('click', reveal);
  revealCard?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    reveal();
  });

  revealRoot.querySelectorAll('[data-pull-reveal-clear]').forEach((link) => {
    link.addEventListener('click', () => clearPullRevealPayload());
  });
}
