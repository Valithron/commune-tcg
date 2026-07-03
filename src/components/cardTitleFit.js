/* ============================================================================
   Card Title Fit Utility
   Phase 7.6 responsibility: one-time post-render title fitting for title-bearing
   card densities. No observers, polling, or backend behavior.
   ============================================================================ */

const minScaleByDensity = {
  showcase: 0.5,
  standard: 0.44,
};

function getDensity(card) {
  if (card.classList.contains('tcg-card--showcase')) {
    return 'showcase';
  }

  if (card.classList.contains('tcg-card--thumbnail')) {
    return 'thumbnail';
  }

  return 'standard';
}

function fitTitle(title) {
  const card = title.closest('.tcg-card');
  const density = card ? getDensity(card) : 'standard';

  if (!card || density === 'thumbnail') {
    return;
  }

  title.style.removeProperty('--card-title-fit-size');
  title.dataset.cardTitleFit = 'pending';

  const computed = window.getComputedStyle(title);
  const naturalSize = Number.parseFloat(computed.fontSize);
  const availableWidth = title.clientWidth;
  const requiredWidth = title.scrollWidth;

  if (!naturalSize || !availableWidth || !requiredWidth) {
    title.dataset.cardTitleFit = 'skipped';
    return;
  }

  if (requiredWidth <= availableWidth) {
    title.dataset.cardTitleFit = 'natural';
    return;
  }

  const minSize = naturalSize * (minScaleByDensity[density] || minScaleByDensity.standard);
  const fittedSize = Math.max(minSize, naturalSize * (availableWidth / requiredWidth) * 0.92);

  title.style.setProperty('--card-title-fit-size', `${fittedSize.toFixed(2)}px`);
  title.dataset.cardTitleFit = 'fit';
}

export function fitCardTitles(root = document) {
  const runFit = () => {
    root.querySelectorAll('.tcg-card:not(.tcg-card--thumbnail) .card-title').forEach(fitTitle);
  };

  window.requestAnimationFrame(runFit);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => window.requestAnimationFrame(runFit));
  }
}
