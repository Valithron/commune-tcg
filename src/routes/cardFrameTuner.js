/* ============================================================================
   Card Frame Tuner
   Phase 7.6 responsibility: Card Lab-only visual tuning tool for the large
   detail card. Produces CSS/JSON output only. No backend writes.
   ============================================================================ */

const storageKey = 'commune-tcg-card-frame-tuner-v1';

const defaults = {
  art: { label: 'Art', x: 4, y: 3, w: 92, h: 66, minW: 34, minH: 24 },
  nameplate: { label: 'Nameplate', x: 4, y: 70, w: 92, h: 17, minW: 42, minH: 10 },
  pills: { label: 'Pill row', x: 3, y: 68, w: 94, h: 24, minW: 42, minH: 12 },
  stats: { label: 'Stats', x: 25, y: 91, w: 50, h: 7, minW: 28, minH: 5 },
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(defaults));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');

    if (!saved || typeof saved !== 'object') {
      return cloneDefaults();
    }

    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [
      key,
      { ...fallback, ...(saved[key] || {}) },
    ]));
  } catch {
    return cloneDefaults();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Local tuning persistence is optional.
  }
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function toCssVars(state) {
  return Object.entries(state).flatMap(([key, value]) => [
    `--tuner-${key}-x: ${round(value.x)}%;`,
    `--tuner-${key}-y: ${round(value.y)}%;`,
    `--tuner-${key}-w: ${round(value.w)}%;`,
    `--tuner-${key}-h: ${round(value.h)}%;`,
  ]).join('\n');
}

function toJson(state) {
  return JSON.stringify(Object.fromEntries(Object.entries(state).map(([key, value]) => [
    key,
    {
      x: round(value.x),
      y: round(value.y),
      w: round(value.w),
      h: round(value.h),
    },
  ])), null, 2);
}

function renderBox(key, label) {
  return `
    <div class="frame-tuner-box frame-tuner-box--${key}" data-tuner-box="${key}">
      <span>${label}</span>
      <i class="frame-tuner-anchor frame-tuner-anchor--move" data-tuner-action="move" aria-hidden="true"></i>
      <i class="frame-tuner-anchor frame-tuner-anchor--resize" data-tuner-action="resize" aria-hidden="true"></i>
    </div>
  `;
}

function renderPanel() {
  return `
    <section class="card-frame-tuner-panel" data-card-frame-tuner-panel>
      <div>
        <span class="section-kicker">Card Maker</span>
        <h3 class="card-lab-row-title">Drag the boxes.</h3>
        <p class="body-copy">Move or resize the art, nameplate, pill row, and stat row. Values are responsive percentages and only affect this Card Lab preview.</p>
      </div>
      <div class="card-frame-tuner-actions">
        <button class="button button-secondary" type="button" data-tuner-reset>Reset</button>
        <button class="button button-secondary" type="button" data-tuner-copy="css">Copy CSS</button>
        <button class="button button-secondary" type="button" data-tuner-copy="json">Copy JSON</button>
      </div>
      <pre class="card-frame-tuner-output" data-tuner-output></pre>
    </section>
  `;
}

function applyState(stage, state) {
  Object.entries(state).forEach(([key, value]) => {
    stage.style.setProperty(`--tuner-${key}-x`, `${round(value.x)}%`);
    stage.style.setProperty(`--tuner-${key}-y`, `${round(value.y)}%`);
    stage.style.setProperty(`--tuner-${key}-w`, `${round(value.w)}%`);
    stage.style.setProperty(`--tuner-${key}-h`, `${round(value.h)}%`);
  });

  const output = document.querySelector('[data-tuner-output]');

  if (output) {
    output.textContent = `${toCssVars(state)}\n\n${toJson(state)}`;
  }
}

function bindCopyButtons(state) {
  document.querySelectorAll('[data-tuner-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const mode = button.getAttribute('data-tuner-copy');
      const text = mode === 'json' ? toJson(state) : toCssVars(state);

      try {
        await navigator.clipboard.writeText(text);
        const original = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      } catch {
        const output = document.querySelector('[data-tuner-output]');
        output?.focus();
      }
    });
  });
}

function bindReset(stage, state) {
  const button = document.querySelector('[data-tuner-reset]');

  button?.addEventListener('click', () => {
    const resetState = cloneDefaults();
    Object.keys(state).forEach((key) => {
      state[key] = resetState[key];
    });
    saveState(state);
    applyState(stage, state);
  });
}

function bindDrag(stage, state) {
  stage.addEventListener('pointerdown', (event) => {
    const box = event.target.closest('[data-tuner-box]');

    if (!box || !stage.contains(box)) {
      return;
    }

    event.preventDefault();

    const key = box.getAttribute('data-tuner-box');
    const action = event.target.closest('[data-tuner-action="resize"]') ? 'resize' : 'move';
    const startRect = stage.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startValue = { ...state[key] };
    const config = defaults[key];

    box.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);

    function handleMove(moveEvent) {
      const dx = ((moveEvent.clientX - startX) / startRect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / startRect.height) * 100;
      const next = { ...startValue };

      if (action === 'resize') {
        next.w = clamp(startValue.w + dx, config.minW, 100 - startValue.x);
        next.h = clamp(startValue.h + dy, config.minH, 100 - startValue.y);
      } else {
        next.x = clamp(startValue.x + dx, 0, 100 - startValue.w);
        next.y = clamp(startValue.y + dy, 0, 100 - startValue.h);
      }

      state[key] = next;
      applyState(stage, state);
    }

    function handleEnd(endEvent) {
      box.classList.remove('is-dragging');
      saveState(state);
      stage.releasePointerCapture?.(endEvent.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  });
}

export function initCardFrameTuner(root = document) {
  const stage = root.querySelector('.card-lab-detail-card-stage');
  const detailSheet = root.querySelector('.card-lab-detail-sheet');

  if (!stage || !detailSheet || stage.dataset.cardFrameTunerReady === 'true') {
    return;
  }

  stage.dataset.cardFrameTunerReady = 'true';
  stage.classList.add('card-frame-tuner');
  stage.insertAdjacentHTML('beforeend', `
    <div class="frame-tuner-overlay" aria-hidden="true">
      ${Object.entries(defaults).map(([key, value]) => renderBox(key, value.label)).join('')}
    </div>
  `);
  detailSheet.insertAdjacentHTML('afterbegin', renderPanel());

  const state = loadState();
  applyState(stage, state);
  bindDrag(stage, state);
  bindCopyButtons(state);
  bindReset(stage, state);
}
