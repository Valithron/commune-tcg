import { renderCardFrame } from '../components/CardFrame.js';
import { clearPullRevealPayload, readPullRevealPayload } from '../services/pullRevealStore.js';

function getRevealCard(payload) {
  return payload?.cards?.[0] || null;
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

  return `
    <section class="pull-reveal-screen" data-pull-reveal>
      <div class="pull-reveal-atmosphere" aria-hidden="true">
        <span class="pull-reveal-particle pull-reveal-particle--one"></span>
        <span class="pull-reveal-particle pull-reveal-particle--two"></span>
        <span class="pull-reveal-particle pull-reveal-particle--three"></span>
        <span class="pull-reveal-particle pull-reveal-particle--four"></span>
      </div>

      <div class="pull-reveal-stage">
        <div class="pull-reveal-glow" aria-hidden="true"></div>
        <div class="pull-reveal-card" role="button" tabindex="0" data-pull-reveal-card aria-label="Tap to reveal pulled card">
          <div class="pull-reveal-card-inner">
            <div class="pull-reveal-card-face pull-reveal-card-back" aria-hidden="false">
              <img src="/assets/commune-card-back.png" alt="Commune card back" />
            </div>
            <div class="pull-reveal-card-face pull-reveal-card-front" aria-hidden="true">
              ${renderCardFrame(card, { context: 'pull', showOwnership: true })}
            </div>
          </div>
        </div>

        <div class="pull-reveal-prompt" data-pull-reveal-prompt>
          <span class="pull-reveal-loader" aria-hidden="true"><span></span></span>
          <p>Tap to Reveal</p>
        </div>

        <div class="pull-reveal-actions" data-pull-reveal-actions hidden>
          <a class="button button-primary" href="#/vault/card/${encodeURIComponent(card.id)}" data-pull-reveal-clear>View in Vault</a>
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

  function reveal() {
    if (!revealCard || revealCard.classList.contains('is-revealed')) {
      return;
    }

    revealCard.classList.add('is-revealed');
    revealCard.setAttribute('aria-label', 'Pulled card revealed');

    if (prompt) {
      prompt.classList.add('is-revealed');
      prompt.querySelector('p').textContent = 'Revealed';
    }

    if (actions) {
      window.setTimeout(() => {
        actions.hidden = false;
      }, 520);
    }
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
