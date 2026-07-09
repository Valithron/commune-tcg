import { mockUser } from '../data/mockUser.js';
import { pullOptions, rarityOdds } from '../data/mockPull.js';
import { clampPullCount } from '../components/format.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';
import { savePullRevealPayload } from '../services/pullRevealStore.js';

async function loadResources() {
  try {
    const routes = getApiRoutes();
    const payload = await fetchJson(routes.pullResources);
    return {
      tickets: Number(payload.resources?.pullTickets ?? mockUser.pullTickets),
      source: payload.resources?.bootstrapped ? 'Live Tickets' : 'Starter Tickets',
    };
  } catch {
    return {
      tickets: mockUser.pullTickets,
      source: 'Mock Tickets',
    };
  }
}

function renderSheetOption(option, selectedCount) {
  const isSelected = option.count === selectedCount;
  const label = option.count === 1 ? 'Standard' : 'Multi';
  const pullLabel = option.count === 1 ? '1 Pull' : `${option.count} Pulls`;

  return `
    <button
      class="pull-sheet-option${isSelected ? ' is-selected' : ''}"
      type="button"
      data-pull-option="${option.count}"
      data-ticket-cost="${option.ticketCost}"
      aria-pressed="${isSelected ? 'true' : 'false'}"
    >
      ${option.count === 5 ? '<span class="pull-sheet-value-tag">Value</span>' : ''}
      <span class="pull-sheet-option-label">${label}</span>
      <strong><span>${option.ticketCost}</span><span aria-hidden="true">🎟</span></strong>
      <span>${pullLabel}</span>
    </button>
  `;
}

function renderPullSheet({ selectedCount, resources, sheetOpen }) {
  const selectedOption = pullOptions[selectedCount] || pullOptions[5];
  const canAfford = resources.tickets >= selectedOption.ticketCost;
  const status = canAfford ? 'Ready' : `Need ${selectedOption.ticketCost - resources.tickets} more ticket${selectedOption.ticketCost - resources.tickets === 1 ? '' : 's'}`;

  return `
    <div
      class="pull-sheet-overlay${sheetOpen ? ' is-open' : ''}"
      data-pull-sheet
      data-selected-count="${selectedCount}"
      data-ticket-balance="${resources.tickets}"
      aria-hidden="${sheetOpen ? 'false' : 'true'}"
      tabindex="-1"
      ${sheetOpen ? '' : 'hidden'}
    >
      <div class="pull-sheet" data-pull-sheet-panel role="dialog" aria-modal="true" aria-labelledby="pull-confirm-title">
        <div class="pull-sheet-header" data-pull-swipe-zone>
          <button class="pull-sheet-handle" type="button" data-pull-drag-handle aria-label="Swipe down or tap to close pull confirmation"></button>
          <span class="section-kicker">Confirm Pull</span>
          <h2 id="pull-confirm-title">Choose your pull</h2>
          <p>Choose your resonance level to extract cards from the Commune Library.</p>
        </div>

        <div class="pull-sheet-options" aria-label="Pull options">
          ${renderSheetOption(pullOptions[1], selectedCount)}
          ${renderSheetOption(pullOptions[5], selectedCount)}
        </div>

        <button class="pull-sheet-odds-link" type="button" data-pull-odds aria-expanded="false">
          <span data-pull-odds-label>View Rarity Odds</span> <span aria-hidden="true">↗</span>
        </button>

        <div class="pull-sheet-odds-panel odds-list" data-pull-odds-panel hidden>
          ${rarityOdds.map((entry) => `
            <div class="detail-row"><span>${entry.rarity}</span><strong>${entry.odds}</strong></div>
          `).join('')}
        </div>

        <div class="pull-sheet-status" data-pull-status>${status}</div>

        <button class="button button-primary pull-sheet-confirm" type="button" data-pull-confirm ${canAfford ? '' : 'disabled'}>
          <span aria-hidden="true">⚡</span>
          <span data-pull-confirm-label>Confirm Pull</span>
        </button>

        <button class="pull-sheet-cancel" type="button" data-pull-close>Maybe Later</button>
      </div>
    </div>
  `;
}

export async function renderPull({ query = {} } = {}) {
  const resources = await loadResources();
  const selectedCount = clampPullCount(query.count || 5);
  const sheetOpen = query.confirm === '1';

  return `
    <section class="hero-panel pull-hero-panel">
      <span class="section-kicker">Pull Chamber</span>
      <h2 class="hero-title">Spend tickets. Reveal cards.</h2>
      <p class="hero-copy">Choose a single pull or a five-pull, then confirm before tickets are spent.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-pull-open="${selectedCount}">Start Pull</button>
        <a class="button button-secondary" href="#/shop">Open Ticket Shop</a>
        <a class="button button-secondary" href="#/pull/history">Pull History</a>
      </div>
    </section>

    <section class="pull-device" aria-label="Prototype pull device">
      <button class="pull-orb-image-button" type="button" data-pull-open="${selectedCount}" aria-label="Open pull confirmation">
        <img class="pull-orb-image" src="/assets/commune-pull-orb.svg" alt="Commune Pull" />
      </button>
    </section>

    <section>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Available</span>
          <h2 class="section-title">Pull Options</h2>
        </div>
        <span class="resource-pill">🎟 ${resources.tickets} · ${resources.source}</span>
      </div>
      <div class="quick-grid">
        <button class="quick-card quick-card-button" type="button" data-pull-open="1"><strong>1-Pull</strong><span>Costs 1 ticket.</span></button>
        <button class="quick-card quick-card-button" type="button" data-pull-open="5"><strong>5-Pull</strong><span>Costs 5 tickets.</span></button>
      </div>
    </section>

    ${renderPullSheet({ selectedCount, resources, sheetOpen })}
  `;
}

export function initPull(root) {
  const overlay = root.querySelector('[data-pull-sheet]');

  if (!overlay) {
    return;
  }

  const sheet = overlay.querySelector('[data-pull-sheet-panel]');
  const handle = overlay.querySelector('[data-pull-drag-handle]');
  const status = overlay.querySelector('[data-pull-status]');
  const confirmButton = overlay.querySelector('[data-pull-confirm]');
  const confirmLabel = overlay.querySelector('[data-pull-confirm-label]');
  const balance = Number(overlay.dataset.ticketBalance || 0);
  let selectedCount = clampPullCount(overlay.dataset.selectedCount || 5);
  let closeTimer = null;

  function getSelectedOption() {
    return pullOptions[selectedCount] || pullOptions[5];
  }

  function updateSelection(nextCount) {
    selectedCount = clampPullCount(nextCount);
    overlay.dataset.selectedCount = String(selectedCount);

    overlay.querySelectorAll('[data-pull-option]').forEach((button) => {
      const isSelected = Number(button.dataset.pullOption) === selectedCount;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const option = getSelectedOption();
    const canAfford = balance >= option.ticketCost;

    if (status) {
      const shortfall = Math.max(0, option.ticketCost - balance);
      status.textContent = canAfford ? 'Ready' : `Need ${shortfall} more ticket${shortfall === 1 ? '' : 's'}`;
    }

    if (confirmButton) {
      confirmButton.disabled = !canAfford;
    }
  }

  function setPullHash(closed) {
    const params = new URLSearchParams();
    if (closed) {
      params.set('closed', '1');
    }
    params.set('count', String(selectedCount));
    window.history.replaceState(null, '', `#/pull?${params.toString()}`);
  }

  function runOpenAnimation() {
    window.clearTimeout(closeTimer);
    overlay.hidden = false;
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    overlay.setAttribute('aria-hidden', 'false');
    sheet.style.transform = '';
    overlay.style.opacity = '';

    window.requestAnimationFrame(() => {
      overlay.classList.remove('is-closing');
      overlay.classList.add('is-open');
      overlay.focus({ preventScroll: true });
    });
  }

  function openSheet(nextCount = selectedCount) {
    updateSelection(nextCount);
    setPullHash(false);
    runOpenAnimation();
  }

  function closeSheet(updateHash = true) {
    if (!overlay.classList.contains('is-open')) {
      return;
    }

    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    overlay.setAttribute('aria-hidden', 'true');
    sheet.style.transform = '';
    overlay.style.opacity = '';

    if (updateHash) {
      setPullHash(true);
    }

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      overlay.classList.remove('is-closing');
      overlay.hidden = true;
    }, 260);
  }

  root.querySelectorAll('[data-pull-open]').forEach((button) => {
    button.addEventListener('click', () => openSheet(button.dataset.pullOpen || selectedCount));
  });

  overlay.querySelectorAll('[data-pull-option]').forEach((button) => {
    button.addEventListener('click', () => updateSelection(button.dataset.pullOption));
  });

  overlay.querySelectorAll('[data-pull-close]').forEach((button) => {
    button.addEventListener('click', () => closeSheet(true));
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeSheet(true);
    }
  });

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSheet(true);
    }
  });

  const oddsLink = overlay.querySelector('[data-pull-odds]');
  const oddsPanel = overlay.querySelector('[data-pull-odds-panel]');
  const oddsLabel = overlay.querySelector('[data-pull-odds-label]');

  if (oddsLink && oddsPanel) {
    oddsLink.addEventListener('click', () => {
      const isOpening = oddsPanel.hidden;
      oddsPanel.hidden = !isOpening;
      oddsLink.setAttribute('aria-expanded', isOpening ? 'true' : 'false');

      if (oddsLabel) {
        oddsLabel.textContent = isOpening ? 'Hide Rarity Odds' : 'View Rarity Odds';
      }
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener('click', async () => {
      const option = getSelectedOption();
      if (balance < option.ticketCost) {
        return;
      }

      if (selectedCount !== 1) {
        window.location.hash = `/pull/results?count=${selectedCount}&real=1`;
        return;
      }

      confirmButton.disabled = true;
      confirmButton.classList.add('button-working');
      if (confirmLabel) {
        confirmLabel.textContent = 'Opening...';
      }
      if (status) {
        status.textContent = 'Preparing reveal...';
      }

      try {
        const routes = getApiRoutes();
        const response = await fetch(routes.pulls, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ count: 1 }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || `Pull failed with ${response.status}`);
        }

        const card = payload.results?.[0]?.ownedCard;
        if (!card) {
          throw new Error('The pull resolved, but no card was returned for reveal.');
        }

        savePullRevealPayload({
          mode: 'single',
          source: 'real',
          count: 1,
          cards: [card],
          ticketsBefore: payload.ticketsBefore,
          ticketsAfter: payload.ticketsAfter,
          poolSummary: payload.poolSummary,
          fallbackUsed: Boolean(payload.results?.[0]?.fallbackUsed),
        });

        window.location.hash = '/pull/reveal?count=1';
      } catch (error) {
        if (status) {
          status.textContent = error.message;
        }
        if (confirmLabel) {
          confirmLabel.textContent = 'Confirm Pull';
        }
        confirmButton.disabled = false;
        confirmButton.classList.remove('button-working');
      }
    });
  }

  let dragState = null;

  function beginDrag(event) {
    const target = event.target;
    const isHandle = target === handle || target.closest?.('[data-pull-drag-handle]');
    const isSwipeZone = target.closest?.('[data-pull-swipe-zone]');

    if (!isHandle && !isSwipeZone) {
      return;
    }

    dragState = {
      startY: event.clientY,
      distance: 0,
    };
    sheet.classList.add('is-dragging');
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragState) {
      return;
    }

    const distance = Math.max(0, event.clientY - dragState.startY);
    dragState.distance = distance;
    sheet.style.transform = `translateY(${distance}px)`;
    overlay.style.opacity = String(Math.max(0.35, 1 - distance / 360));
  }

  function endDrag() {
    if (!dragState) {
      return;
    }

    const shouldClose = dragState.distance > 80;
    dragState = null;
    sheet.classList.remove('is-dragging');
    sheet.style.transform = '';
    overlay.style.opacity = '';

    if (shouldClose) {
      closeSheet(true);
    }
  }

  sheet.addEventListener('pointerdown', beginDrag);
  sheet.addEventListener('pointermove', moveDrag);
  sheet.addEventListener('pointerup', endDrag);
  sheet.addEventListener('pointercancel', endDrag);

  if (handle) {
    handle.addEventListener('click', () => closeSheet(true));
  }

  updateSelection(selectedCount);

  if (overlay.classList.contains('is-open')) {
    runOpenAnimation();
  }
}
