/* ============================================================================
   Card Frame Tuner
   Phase 7.6 responsibility: Card Lab-only visual tuning tool for card frames.
   Produces CSS/JSON output only. No backend writes.
   ============================================================================ */

const storageKeyPrefix = 'commune-tcg-card-frame-tuner';

const baseDefaults = {
  art: { label: 'Art', x: 3, y: 2, w: 94, h: 92, minW: 34, minH: 24 },
  nameplate: { label: 'Nameplate', x: 2, y: 82, w: 96, h: 16, minW: 42, minH: 10 },
  pills: { label: 'Pill row', x: 5, y: 88, w: 90, h: 5, minW: 42, minH: 4.8 },
  stats: { label: 'Stats', x: 25, y: 75, w: 50, h: 7, minW: 28, minH: 5 },
};

const stageDefaults = {
  showcase: baseDefaults,
  standard: {
    ...baseDefaults,
    nameplate: { ...baseDefaults.nameplate, y: 77 },
    pills: { ...baseDefaults.pills, y: 83 },
  },
};

function getDefaults(stageId) {
  return stageDefaults[stageId] || baseDefaults;
}

function getStorageKey(stageId) {
  return `${storageKeyPrefix}-${stageId || 'default'}-v1`;
}

function cloneDefaults(stageId) {
  return JSON.parse(JSON.stringify(getDefaults(stageId)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadState(stageId) {
  const defaults = getDefaults(stageId);

  try {
    const saved = JSON.parse(localStorage.getItem(getStorageKey(stageId)) || 'null');

    if (!saved || typeof saved !== 'object') {
      return cloneDefaults(stageId);
    }

    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [
      key,
      { ...fallback, ...(saved[key] || {}) },
    ]));
  } catch {
    return cloneDefaults(stageId);
  }
}

function saveState(stageId, state) {
  try {
    localStorage.setItem(getStorageKey(stageId), JSON.stringify(state));
  } catch {
    // Local tuning persistence is optional.
  }
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function px(value) {
  return `${Math.round(value)}px`;
}

function dimensionsFor(stageRect, value) {
  return {
    x: (value.x / 100) * stageRect.width,
    y: (value.y / 100) * stageRect.height,
    w: (value.w / 100) * stageRect.width,
    h: (value.h / 100) * stageRect.height,
  };
}

function centeredFlags(value) {
  const centerX = value.x + (value.w / 2);
  const centerY = value.y + (value.h / 2);
  const flags = [];

  if (Math.abs(centerX - 50) <= 0.75) {
    flags.push('center X');
  }

  if (Math.abs(centerY - 50) <= 0.75) {
    flags.push('center Y');
  }

  return flags;
}

function cssVarPrefix(stageId) {
  return stageId === 'standard' ? 'standard-card' : 'showcase-card';
}

function toCssVars(state, stageId) {
  const prefix = cssVarPrefix(stageId);

  return Object.entries(state).flatMap(([key, value]) => [
    `--${prefix}-${key}-x: ${round(value.x)}%;`,
    `--${prefix}-${key}-y: ${round(value.y)}%;`,
    `--${prefix}-${key}-w: ${round(value.w)}%;`,
    `--${prefix}-${key}-h: ${round(value.h)}%;`,
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
      <span data-tuner-box-label>${label}</span>
      <i class="frame-tuner-anchor frame-tuner-anchor--move" data-tuner-action="move" aria-hidden="true"></i>
      <i class="frame-tuner-anchor frame-tuner-anchor--resize" data-tuner-action="resize" aria-hidden="true"></i>
    </div>
  `;
}

function renderPanel(title) {
  return `
    <section class="card-frame-tuner-panel" data-card-frame-tuner-panel>
      <div>
        <span class="section-kicker">Card Maker</span>
        <h3 class="card-lab-row-title">${title}</h3>
        <p class="body-copy">Move or resize the art, nameplate, pill row, and stat row. Pixel labels are only for visual feedback; final implementation should use the percentage ratios.</p>
      </div>
      <div class="card-frame-tuner-actions">
        <button class="button button-secondary" type="button" data-tuner-reset>Reset</button>
        <button class="button button-secondary" type="button" data-tuner-copy="css">Copy CSS</button>
        <button class="button button-secondary" type="button" data-tuner-copy="json">Copy JSON</button>
      </div>
      <div class="card-frame-tuner-readout" data-tuner-readout></div>
      <pre class="card-frame-tuner-output" data-tuner-output></pre>
    </section>
  `;
}

function updateBoxLabels(stage, panel, state, defaults) {
  const stageRect = stage.getBoundingClientRect();
  const card = stage.querySelector('.tcg-card');
  const cardRect = card?.getBoundingClientRect() || stageRect;

  const cardFlag = stage.querySelector('[data-tuner-card-flag]');

  if (cardFlag) {
    cardFlag.textContent = `Card ${px(cardRect.width)} × ${px(cardRect.height)}`;
  }

  Object.entries(state).forEach(([key, value]) => {
    const box = stage.querySelector(`[data-tuner-box="${key}"]`);
    const label = box?.querySelector('[data-tuner-box-label]');
    const dims = dimensionsFor(cardRect, value);
    const flags = centeredFlags(value);

    if (label) {
      label.textContent = `${defaults[key].label} ${px(dims.w)} × ${px(dims.h)}${flags.length ? ` · ${flags.join(' · ')}` : ''}`;
    }

    box?.classList.toggle('is-centered-x', flags.includes('center X'));
    box?.classList.toggle('is-centered-y', flags.includes('center Y'));
  });

  const readout = panel.querySelector('[data-tuner-readout]');

  if (readout) {
    const artDims = dimensionsFor(cardRect, state.art);
    const nameplateDims = dimensionsFor(cardRect, state.nameplate);
    const pillsDims = dimensionsFor(cardRect, state.pills);
    const statsDims = dimensionsFor(cardRect, state.stats);

    readout.innerHTML = `
      <span>Card ${px(cardRect.width)} × ${px(cardRect.height)}</span>
      <span>Art ${px(artDims.w)} × ${px(artDims.h)}</span>
      <span>Nameplate ${px(nameplateDims.w)} × ${px(nameplateDims.h)}</span>
      <span>Pills ${px(pillsDims.w)} × ${px(pillsDims.h)}</span>
      <span>Stats ${px(statsDims.w)} × ${px(statsDims.h)}</span>
    `;
  }
}

function applyState(stage, panel, state, stageId, defaults) {
  Object.entries(state).forEach(([key, value]) => {
    stage.style.setProperty(`--tuner-${key}-x`, `${round(value.x)}%`);
    stage.style.setProperty(`--tuner-${key}-y`, `${round(value.y)}%`);
    stage.style.setProperty(`--tuner-${key}-w`, `${round(value.w)}%`);
    stage.style.setProperty(`--tuner-${key}-h`, `${round(value.h)}%`);
  });

  updateBoxLabels(stage, panel, state, defaults);

  const output = panel.querySelector('[data-tuner-output]');

  if (output) {
    output.textContent = `${toCssVars(state, stageId)}\n\n${toJson(state)}`;
  }
}

function bindCopyButtons(panel, state, stageId) {
  panel.querySelectorAll('[data-tuner-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const mode = button.getAttribute('data-tuner-copy');
      const text = mode === 'json' ? toJson(state) : toCssVars(state, stageId);

      try {
        await navigator.clipboard.writeText(text);
        const original = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 900);
      } catch {
        const output = panel.querySelector('[data-tuner-output]');
        output?.focus();
      }
    });
  });
}

function bindReset(stage, panel, state, stageId, defaults) {
  const button = panel.querySelector('[data-tuner-reset]');

  button?.addEventListener('click', () => {
    const resetState = cloneDefaults(stageId);
    Object.keys(state).forEach((key) => {
      state[key] = resetState[key];
    });
    saveState(stageId, state);
    applyState(stage, panel, state, stageId, defaults);
  });
}

function bindResizeObserver(stage, panel, state, defaults) {
  if (!window.ResizeObserver) {
    return;
  }

  const observer = new ResizeObserver(() => updateBoxLabels(stage, panel, state, defaults));
  observer.observe(stage);
}

function bindDrag(stage, panel, state, stageId, defaults) {
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
      applyState(stage, panel, state, stageId, defaults);
    }

    function handleEnd(endEvent) {
      box.classList.remove('is-dragging');
      saveState(stageId, state);
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

function initStage(stage) {
  const stageId = stage.dataset.tunerId || 'showcase';
  const panelHost = document.querySelector(`[data-card-frame-tuner-panel-target="${stageId}"]`);
  const defaults = getDefaults(stageId);

  if (!panelHost || stage.dataset.cardFrameTunerReady === 'true') {
    return;
  }

  stage.dataset.cardFrameTunerReady = 'true';
  stage.classList.add('card-frame-tuner');
  stage.insertAdjacentHTML('beforeend', `
    <div class="frame-tuner-overlay" aria-hidden="true">
      <div class="frame-tuner-card-flag" data-tuner-card-flag>Card</div>
      <div class="frame-tuner-center-line frame-tuner-center-line--x"></div>
      <div class="frame-tuner-center-line frame-tuner-center-line--y"></div>
      ${Object.entries(defaults).map(([key, value]) => renderBox(key, value.label)).join('')}
    </div>
  `);
  panelHost.insertAdjacentHTML('afterbegin', renderPanel(stage.dataset.tunerTitle || 'Drag the boxes.'));

  const panel = panelHost.querySelector('[data-card-frame-tuner-panel]');
  const state = loadState(stageId);

  applyState(stage, panel, state, stageId, defaults);
  bindDrag(stage, panel, state, stageId, defaults);
  bindCopyButtons(panel, state, stageId);
  bindReset(stage, panel, state, stageId, defaults);
  bindResizeObserver(stage, panel, state, defaults);
}

export function initCardFrameTuner(root = document) {
  root.querySelectorAll('[data-card-frame-tuner-stage]').forEach(initStage);
}
