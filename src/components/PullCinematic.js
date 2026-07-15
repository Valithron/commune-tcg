/* Required six-second Core cinematic that runs beside the idempotent pull request. */

import { fitCardTitles } from './cardTitleFit.js';
import { initPullRevealModal, renderPullRevealModal } from './PullRevealModal.js';
import { resumePendingPullTransaction } from '../services/pullTransaction.js';

export const pullCinematicAsset = '/assets/core-summon-transition.MP4';

export function renderPullCinematic({ count = 1 } = {}) {
  return `
    <section class="pull-cinematic" data-pull-cinematic data-count="${Number(count) === 5 ? 5 : 1}">
      <video class="pull-cinematic-video" data-pull-cinematic-video
        src="${pullCinematicAsset}" preload="auto" autoplay muted playsinline webkit-playsinline></video>
      <div class="pull-cinematic-hold" data-pull-cinematic-hold aria-live="polite">
        <span class="pull-cinematic-core" aria-hidden="true"></span>
        <p data-pull-cinematic-status>Opening the Core…</p>
      </div>
      <div class="pull-cinematic-error" data-pull-cinematic-error hidden>
        <span class="section-kicker">Cinematic Error</span>
        <h1>The transition could not play.</h1>
        <p data-pull-cinematic-error-copy>Your Pull result remains protected.</p>
        <button class="button button-primary" type="button" data-pull-cinematic-continue hidden>Continue to Reveal</button>
        <button class="button button-secondary" type="button" data-pull-cinematic-retry hidden>Retry Request</button>
      </div>
    </section>
  `;
}

export function initPullCinematic(root) {
  const stage = root.querySelector('[data-pull-cinematic]');
  if (!stage) return;

  const video = stage.querySelector('[data-pull-cinematic-video]');
  const hold = stage.querySelector('[data-pull-cinematic-hold]');
  const status = stage.querySelector('[data-pull-cinematic-status]');
  const errorPanel = stage.querySelector('[data-pull-cinematic-error]');
  const errorCopy = stage.querySelector('[data-pull-cinematic-error-copy]');
  const continueButton = stage.querySelector('[data-pull-cinematic-continue]');
  const retryButton = stage.querySelector('[data-pull-cinematic-retry]');
  const count = Number(stage.dataset.count) === 5 ? 5 : 1;

  let videoReady = false;
  let videoFailed = false;
  let revealPayload = null;
  let requestError = null;

  function showReveal() {
    if (!revealPayload || (!videoReady && !videoFailed)) return;
    root.innerHTML = renderPullRevealModal(revealPayload);
    fitCardTitles(root);
    initPullRevealModal(root);
  }

  function refreshFailureUi() {
    if (!videoFailed && !requestError) return;
    errorPanel.hidden = false;
    hold.classList.add('is-dimmed');

    if (videoFailed && revealPayload) {
      errorCopy.textContent = 'The required video failed, but your completed Pull result is safe. This preview must still be treated as a cinematic validation failure.';
      continueButton.hidden = false;
    } else if (requestError) {
      errorCopy.textContent = requestError.message || 'The Pull request did not complete.';
      retryButton.hidden = false;
    } else {
      errorCopy.textContent = 'The required video could not be loaded. Waiting for the protected Pull result.';
    }
  }

  function onVideoComplete() {
    if (videoReady) return;
    videoReady = true;
    stage.classList.add('is-holding');
    if (status) status.textContent = revealPayload ? 'Summon resolved.' : 'The Core is resolving your summon…';
    showReveal();
  }

  video?.addEventListener('ended', onVideoComplete, { once: true });
  video?.addEventListener('error', () => {
    videoFailed = true;
    stage.classList.add('has-video-error', 'is-holding');
    refreshFailureUi();
  }, { once: true });

  const playPromise = video?.play?.();
  playPromise?.catch(() => {
    videoFailed = true;
    stage.classList.add('has-video-error', 'is-holding');
    refreshFailureUi();
  });

  function startRequest() {
    requestError = null;
    retryButton.hidden = true;
    if (status) status.textContent = videoReady ? 'The Core is resolving your summon…' : 'Opening the Core…';

    resumePendingPullTransaction({ count })
      .then((payload) => {
        revealPayload = payload;
        if (status) status.textContent = videoReady ? 'Summon resolved.' : 'Card signatures acquired…';
        if (videoFailed) refreshFailureUi();
        else showReveal();
      })
      .catch((error) => {
        requestError = error;
        stage.classList.add('is-holding');
        refreshFailureUi();
      });
  }

  continueButton?.addEventListener('click', showReveal);
  retryButton?.addEventListener('click', startRequest);
  startRequest();
}
