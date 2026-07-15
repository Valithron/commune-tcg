/* Bottom-anchored Standard Summon confirmation and dedicated rates layer. */

import { pullOptions as fallbackPullOptions, rarityOdds as fallbackRarityOdds } from '../data/mockPull.js';
import { clampPullCount } from './format.js';
import { beginPullTransaction } from '../services/pullTransaction.js';

function getPoolOption(pool, count) {
  const safeCount = clampPullCount(count || 1);
  const option = pool?.pullOptions?.[safeCount] || pool?.pullOptions?.[String(safeCount)] || fallbackPullOptions[safeCount];
  return {
    count: safeCount,
    ticketCost: Number(option?.ticketCost ?? safeCount),
    label: option?.label || `${safeCount}-Pull`,
  };
}

function renderSheetOption(pool, count, selectedCount, balance) {
  const option = getPoolOption(pool, count);
  const selected = option.count === selectedCount;
  const affordable = balance >= option.ticketCost;
  return `
    <button class="pull-sheet-option${selected ? ' is-selected' : ''}" type="button"
      data-pull-option="${option.count}" data-ticket-cost="${option.ticketCost}"
      aria-pressed="${selected ? 'true' : 'false'}">
      <span class="pull-sheet-option-label">${option.count === 1 ? 'Single' : 'Five'}</span>
      <strong><span>${option.ticketCost}</span><span aria-hidden="true">🎟</span></strong>
      <span>${option.count === 1 ? '1 Pull' : '5 Pulls'}</span>
      <small>${affordable ? 'Available' : `Need ${option.ticketCost - balance} more`}</small>
    </button>
  `;
}

function normalizeOdds(pool) {
  const odds = Array.isArray(pool?.rarityOdds) ? pool.rarityOdds : fallbackRarityOdds;
  return odds.map((entry) => ({
    rarity: entry.label || entry.rarity,
    percentage: entry.percentage ?? Number(String(entry.odds || '').replace('%', '')),
  }));
}

function renderRatesLayer(pool) {
  const cards = Array.isArray(pool?.cards) ? pool.cards : [];
  const odds = normalizeOdds(pool);
  return `
    <div class="pull-rates-overlay" data-pull-rates-layer hidden aria-hidden="true" tabindex="-1">
      <section class="pull-rates-panel" role="dialog" aria-modal="true" aria-labelledby="pull-rates-title">
        <header class="pull-rates-header">
          <div><span class="section-kicker">Pool Details</span><h2 id="pull-rates-title">Standard Summon Rates</h2></div>
          <button type="button" class="pull-rates-close" data-pull-rates-close aria-label="Close summon rates">×</button>
        </header>
        <p class="pull-rates-summary">Permanent pool · ${Number(pool?.eligibleCount || cards.length || 0)} eligible card designs</p>
        <div class="pull-rates-odds">
          ${odds.map((entry) => `<div class="detail-row" data-rarity="${String(entry.rarity || '').toLowerCase()}"><span>${entry.rarity}</span><strong>${Number(entry.percentage || 0)}%</strong></div>`).join('')}
        </div>
        <div class="pull-rates-rule"><strong>Duplicates</strong><span>${pool?.duplicateBehavior || 'Each result grants a distinct owned card copy in the Vault.'}</span></div>
        <div class="pull-rates-pool">
          <h3>Current Pool</h3>
          ${cards.length
            ? `<ul>${cards.map((card) => `<li><span>${card.name || 'Unnamed Card'}</span><small>${card.rarity || 'common'} · ${card.typeLabel || card.type || 'Neutral'}</small></li>`).join('')}</ul>`
            : '<p>Pool contents could not be loaded. Do not rely on this preview for odds validation.</p>'}
        </div>
      </section>
    </div>
  `;
}

function getStatus(pool, balance, count) {
  const option = getPoolOption(pool, count);
  const shortfall = Math.max(0, option.ticketCost - balance);
  return shortfall ? `Need ${shortfall} more ticket${shortfall === 1 ? '' : 's'}` : 'Ready to summon';
}

export function renderPullConfirmationBottomSheet({ selectedCount = 1, resources, sheetOpen = false, pool = null }) {
  const safeCount = clampPullCount(selectedCount || 1);
  const balance = Number(resources?.tickets || 0);
  const option = getPoolOption(pool, safeCount);
  return `
    <div class="pull-sheet-overlay${sheetOpen ? ' is-open' : ''}" data-pull-sheet
      data-selected-count="${safeCount}" data-ticket-balance="${balance}"
      aria-hidden="${sheetOpen ? 'false' : 'true'}" tabindex="-1" ${sheetOpen ? '' : 'hidden'}>
      <div class="pull-sheet" data-pull-sheet-panel role="dialog" aria-modal="true" aria-labelledby="pull-confirm-title">
        <div class="pull-sheet-header" data-pull-swipe-zone>
          <button class="pull-sheet-handle" type="button" data-pull-drag-handle aria-label="Swipe down or tap to close pull confirmation"></button>
          <span class="section-kicker">Standard Summon</span>
          <h2 id="pull-confirm-title">Choose your pull</h2>
          <p>Balance: <strong>🎟 ${balance}</strong>. Nothing is spent until you confirm.</p>
        </div>

        <div class="pull-sheet-options" aria-label="Pull quantity">
          ${renderSheetOption(pool, 1, safeCount, balance)}
          ${renderSheetOption(pool, 5, safeCount, balance)}
        </div>

        <button class="pull-sheet-odds-link" type="button" data-pull-rates-open>
          <span>Rates & Pool Details</span><span aria-hidden="true">↗</span>
        </button>

        <div class="pull-sheet-status" data-pull-status>${getStatus(pool, balance, safeCount)}</div>
        <button class="button button-primary pull-sheet-confirm" type="button" data-pull-confirm ${balance >= option.ticketCost ? '' : 'disabled'}>
          <span aria-hidden="true">✦</span><span data-pull-confirm-label>Confirm Summon</span>
        </button>
        <button class="pull-sheet-cancel" type="button" data-pull-close>Cancel</button>
      </div>
    </div>
    ${renderRatesLayer(pool)}
  `;
}

function setPullHash(selectedCount, closed = false) {
  const params = new URLSearchParams({ count: String(selectedCount) });
  if (closed) params.set('closed', '1');
  window.history.replaceState(null, '', `#/pull?${params}`);
}

export function initPullConfirmationBottomSheet(root) {
  const overlay = root.querySelector('[data-pull-sheet]');
  if (!overlay) return;

  const sheet = overlay.querySelector('[data-pull-sheet-panel]');
  const handle = overlay.querySelector('[data-pull-drag-handle]');
  const status = overlay.querySelector('[data-pull-status]');
  const confirm = overlay.querySelector('[data-pull-confirm]');
  const confirmLabel = overlay.querySelector('[data-pull-confirm-label]');
  const rates = root.querySelector('[data-pull-rates-layer]');
  const balance = Number(overlay.dataset.ticketBalance || 0);
  let selectedCount = clampPullCount(overlay.dataset.selectedCount || 1);
  let closeTimer = null;
  let dragState = null;

  const optionCost = (count) => Number(overlay.querySelector(`[data-pull-option="${count}"]`)?.dataset.ticketCost || count);

  function updateSelection(nextCount) {
    selectedCount = clampPullCount(nextCount || 1);
    overlay.dataset.selectedCount = String(selectedCount);
    overlay.querySelectorAll('[data-pull-option]').forEach((button) => {
      const selected = Number(button.dataset.pullOption) === selectedCount;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const cost = optionCost(selectedCount);
    const shortfall = Math.max(0, cost - balance);
    if (status) status.textContent = shortfall ? `Need ${shortfall} more ticket${shortfall === 1 ? '' : 's'}` : 'Ready to summon';
    if (confirm) confirm.disabled = shortfall > 0;
  }

  function runOpenAnimation() {
    window.clearTimeout(closeTimer);
    overlay.hidden = false;
    overlay.classList.remove('is-open', 'is-closing');
    overlay.setAttribute('aria-hidden', 'false');
    sheet.style.transform = '';
    overlay.style.opacity = '';
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      overlay.focus({ preventScroll: true });
    });
  }

  function openSheet(count = 1) {
    updateSelection(count);
    setPullHash(selectedCount, false);
    runOpenAnimation();
  }

  function closeSheet(updateHash = true) {
    if (!overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    overlay.setAttribute('aria-hidden', 'true');
    sheet.style.transform = '';
    overlay.style.opacity = '';
    if (updateHash) setPullHash(selectedCount, true);
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      overlay.classList.remove('is-closing');
      overlay.hidden = true;
    }, 260);
  }

  function openRates() {
    if (!rates) return;
    rates.hidden = false;
    rates.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => rates.classList.add('is-open'));
    rates.focus({ preventScroll: true });
  }

  function closeRates() {
    if (!rates) return;
    rates.classList.remove('is-open');
    rates.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { rates.hidden = true; }, 220);
  }

  root.querySelectorAll('[data-pull-open]').forEach((button) => button.addEventListener('click', () => openSheet(button.dataset.pullOpen || 1)));
  overlay.querySelectorAll('[data-pull-option]').forEach((button) => button.addEventListener('click', () => updateSelection(button.dataset.pullOption)));
  overlay.querySelectorAll('[data-pull-close]').forEach((button) => button.addEventListener('click', () => closeSheet(true)));
  root.querySelector('[data-pull-rates-open]')?.addEventListener('click', openRates);
  root.querySelectorAll('[data-pull-rates-close]').forEach((button) => button.addEventListener('click', closeRates));
  rates?.addEventListener('click', (event) => { if (event.target === rates) closeRates(); });
  rates?.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeRates(); });
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeSheet(true); });
  overlay.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSheet(true); });

  confirm?.addEventListener('click', () => {
    const cost = optionCost(selectedCount);
    if (balance < cost || confirm.disabled) return;
    confirm.disabled = true;
    confirm.classList.add('button-working');
    if (confirmLabel) confirmLabel.textContent = 'Opening Core…';
    if (status) status.textContent = 'Beginning one secure summon request…';
    beginPullTransaction({ count: selectedCount, source: 'initial', forceNew: true }).catch(() => {});
    window.location.hash = `/pull/reveal?count=${selectedCount}&cinematic=1`;
  });

  function beginDrag(event) {
    const target = event.target;
    if (target !== handle && !target.closest?.('[data-pull-swipe-zone]')) return;
    dragState = { startY: event.clientY, distance: 0 };
    sheet.classList.add('is-dragging');
    sheet.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragState) return;
    const distance = Math.max(0, event.clientY - dragState.startY);
    dragState.distance = distance;
    sheet.style.transform = `translateY(${distance}px)`;
    overlay.style.opacity = String(Math.max(0.35, 1 - distance / 360));
  }

  function endDrag() {
    if (!dragState) return;
    const shouldClose = dragState.distance > 80;
    dragState = null;
    sheet.classList.remove('is-dragging');
    sheet.style.transform = '';
    overlay.style.opacity = '';
    if (shouldClose) closeSheet(true);
  }

  sheet.addEventListener('pointerdown', beginDrag);
  sheet.addEventListener('pointermove', moveDrag);
  sheet.addEventListener('pointerup', endDrag);
  sheet.addEventListener('pointercancel', endDrag);
  handle?.addEventListener('click', () => closeSheet(true));
  updateSelection(selectedCount);
  if (overlay.classList.contains('is-open')) runOpenAnimation();
}
