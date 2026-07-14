/* ============================================================================
   Admin Home Layout Calibrator
   Phase 2A support responsibility: let Sterling tune Core Commons overlay
   positions visually without changing player-facing runtime behavior.
   No persistence, no API writes, no production data changes.
   ============================================================================ */

import { escapeHtml } from '../components/format.js';

const storageKey = 'imago-home-layout-calibrator-v3';
const percentPrecision = 1;
const backgroundAsset = '/assets/home-background.png';

const homeLayoutElements = [
  {
    id: 'topRail',
    label: 'Top resource/account rail',
    selector: '.app-shell--home .app-topbar',
    className: 'calibrator-box--rail',
    x: 4,
    y: 1.5,
    w: 92,
    h: 7,
    note: 'Gold, Tickets, Energy, account menu.',
  },
  {
    id: 'nameplate',
    label: 'Card title nameplate',
    selector: '.home-commons-nameplate',
    className: 'calibrator-box--nameplate',
    x: 31.6,
    y: 9.4,
    w: 36.8,
    h: 3,
    note: 'Card title plate above the portal. X is mathematically centered.',
  },
  {
    id: 'portal',
    label: 'Featured art portal',
    selector: '.home-commons-portal',
    className: 'calibrator-box--portal',
    x: 36.9,
    y: 18.6,
    w: 26.2,
    h: 19.8,
    note: 'Oval featured-card art mask and rarity glow.',
  },
  {
    id: 'coreSummon',
    label: 'Core summon button',
    selector: '.home-commons-core-summon',
    className: 'calibrator-box--core',
    x: 41.6,
    y: 46.4,
    w: 17,
    h: 9.2,
    note: 'Move this circle over the Core machine. Links to Pull.',
  },
  {
    id: 'daily',
    label: 'Daily Ticket socket',
    selector: '.home-commons-daily',
    className: 'calibrator-box--daily',
    x: 79.5,
    y: 19.4,
    w: 13.5,
    h: 9.3,
    note: 'Claim Daily Ticket / Use Tickets smart action.',
  },
  {
    id: 'library',
    label: 'Library support socket',
    selector: '.home-commons-library',
    className: 'calibrator-box--support',
    x: 79.9,
    y: 36.8,
    w: 13.7,
    h: 8.6,
    note: 'Available card-design catalog link.',
  },
  {
    id: 'vault',
    label: 'Vault support socket',
    selector: '.home-commons-vault',
    className: 'calibrator-box--support',
    x: 78,
    y: 52,
    w: 17,
    h: 8.2,
    note: 'Owned-card collection link.',
  },
  {
    id: 'futureA',
    label: 'A',
    selector: '.home-commons-future-a',
    className: 'calibrator-box--future',
    x: 8.4,
    y: 19.6,
    w: 11.7,
    h: 9.6,
    note: 'Future left-side socket A.',
  },
  {
    id: 'futureB',
    label: 'B',
    selector: '.home-commons-future-b',
    className: 'calibrator-box--future',
    x: 8.7,
    y: 36.9,
    w: 12.2,
    h: 8.9,
    note: 'Future left-side socket B.',
  },
  {
    id: 'futureC',
    label: 'C',
    selector: '.home-commons-future-c',
    className: 'calibrator-box--future',
    x: 8.5,
    y: 52.7,
    w: 13.4,
    h: 8,
    note: 'Future left-side socket C.',
  },
  {
    id: 'battle',
    label: 'Battle gate',
    selector: '.home-commons-battle-gate',
    className: 'calibrator-box--battle',
    x: 15.7,
    y: 87.1,
    w: 68.6,
    h: 11.3,
    note: 'Enter Battle lower threshold, just above the nav. X is mathematically centered.',
  },
];

function roundPercent(value, precision = percentPrecision) {
  const factor = 10 ** precision;
  return Math.round(Number(value) * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

function readSavedLayout() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return homeLayoutElements.map((element) => ({
      ...element,
      ...(saved[element.id] || {}),
    }));
  } catch {
    return homeLayoutElements.map((element) => ({ ...element }));
  }
}

function renderBox(element) {
  return `
    <article
      class="home-layout-calibrator-box ${escapeHtml(element.className)}"
      data-layout-box="${escapeHtml(element.id)}"
      style="left:${element.x}%;top:${element.y}%;width:${element.w}%;height:${element.h}%;"
      tabindex="0"
      aria-label="${escapeHtml(element.label)}"
    >
      <div class="home-layout-calibrator-box-label">
        <strong>${escapeHtml(element.label)}</strong>
        <span>${escapeHtml(element.id)}</span>
      </div>
      <span class="home-layout-resize-anchor" data-resize-anchor="nw" aria-hidden="true"></span>
      <span class="home-layout-resize-anchor" data-resize-anchor="ne" aria-hidden="true"></span>
      <span class="home-layout-resize-anchor" data-resize-anchor="sw" aria-hidden="true"></span>
      <span class="home-layout-resize-anchor" data-resize-anchor="se" aria-hidden="true"></span>
    </article>
  `;
}

function renderReadoutRow(element) {
  return `
    <tr data-layout-readout="${escapeHtml(element.id)}">
      <td><strong>${escapeHtml(element.label)}</strong><small>${escapeHtml(element.selector)}</small></td>
      <td data-field="x">${element.x}%</td>
      <td data-field="y">${element.y}%</td>
      <td data-field="w">${element.w}%</td>
      <td data-field="h">${element.h}%</td>
      <td>${escapeHtml(element.note)}</td>
    </tr>
  `;
}

export function renderAdminHomeLayoutCalibrator() {
  const elements = readSavedLayout();
  return `
    <section class="hero-panel admin-home-layout-hero">
      <span class="section-kicker">Admin Tool</span>
      <h2 class="hero-title">Home Layout Calibrator</h2>
      <p class="hero-copy">Drag and resize the Core Commons overlay boxes over the live Home background. This tool does not write to production data or change player Home CSS. It only produces rounded percentage values to copy into the Home overlay implementation.</p>
      <div class="action-row">
        <button class="button button-primary" type="button" data-copy-layout-css>Copy CSS values</button>
        <button class="button button-secondary" type="button" data-copy-layout-json>Copy JSON</button>
        <button class="button button-secondary" type="button" data-reset-layout>Reset defaults</button>
        <a class="button button-secondary" href="${backgroundAsset}" target="_blank" rel="noreferrer">Open Background</a>
        <a class="button button-secondary" href="#/home">Open Home</a>
      </div>
    </section>

    <section class="glass-panel admin-home-layout-panel" data-home-layout-calibrator>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Core Commons Stage</span>
          <h2 class="section-title">Drag boxes. Resize from corners.</h2>
        </div>
        <span class="status-pill" data-layout-status>Ready</span>
      </div>
      <p class="body-copy">Values are stored locally in this browser so you can refresh without losing a tuning pass. Drag boxes by their body. Resize from the corner anchors. Output is rounded to 0.1% so finger precision does not create noisy CSS.</p>
      <div class="home-layout-calibrator-frame">
        <div
          class="home-layout-calibrator-stage"
          data-layout-stage
          style="background-image:url('${backgroundAsset}')"
          role="img"
          aria-label="Core Commons Home background calibration stage"
        >
          <div class="home-layout-calibrator-grid" aria-hidden="true"></div>
          ${elements.map(renderBox).join('')}
        </div>
      </div>
    </section>

    <section class="glass-panel admin-home-layout-output">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Rounded Output</span>
          <h2 class="section-title">Use these values for Home CSS.</h2>
        </div>
      </div>
      <div class="home-layout-readout-wrap">
        <table class="home-layout-readout">
          <thead><tr><th>Element</th><th>x</th><th>y</th><th>w</th><th>h</th><th>Note</th></tr></thead>
          <tbody>
            ${elements.map(renderReadoutRow).join('')}
          </tbody>
        </table>
      </div>
      <textarea class="home-layout-copy-buffer" data-layout-copy-output readonly aria-label="Copied layout output"></textarea>
    </section>
  `;
}

function getElementMap(root) {
  return new Map([...root.querySelectorAll('[data-layout-box]')].map((box) => [box.dataset.layoutBox, box]));
}

function getLayoutFromDom(root) {
  const boxes = getElementMap(root);
  return homeLayoutElements.reduce((layout, element) => {
    const box = boxes.get(element.id);
    if (!box) return layout;
    layout[element.id] = {
      x: roundPercent(parseFloat(box.style.left)),
      y: roundPercent(parseFloat(box.style.top)),
      w: roundPercent(parseFloat(box.style.width)),
      h: roundPercent(parseFloat(box.style.height)),
    };
    return layout;
  }, {});
}

function persistLayout(root) {
  window.localStorage.setItem(storageKey, JSON.stringify(getLayoutFromDom(root)));
}

function applyBoxValues(box, values) {
  const next = {
    x: clamp(values.x, 0, 98),
    y: clamp(values.y, 0, 98),
    w: clamp(values.w, 3, 100),
    h: clamp(values.h, 3, 100),
  };
  next.w = Math.min(next.w, 100 - next.x);
  next.h = Math.min(next.h, 100 - next.y);
  box.style.left = `${roundPercent(next.x)}%`;
  box.style.top = `${roundPercent(next.y)}%`;
  box.style.width = `${roundPercent(next.w)}%`;
  box.style.height = `${roundPercent(next.h)}%`;
}

function updateReadout(root) {
  const layout = getLayoutFromDom(root);
  Object.entries(layout).forEach(([id, values]) => {
    const row = root.querySelector(`[data-layout-readout="${id}"]`);
    if (!row) return;
    row.querySelector('[data-field="x"]').textContent = `${values.x}%`;
    row.querySelector('[data-field="y"]').textContent = `${values.y}%`;
    row.querySelector('[data-field="w"]').textContent = `${values.w}%`;
    row.querySelector('[data-field="h"]').textContent = `${values.h}%`;
  });
}

function setStatus(root, message) {
  const status = root.querySelector('[data-layout-status]');
  if (status) status.textContent = message;
}

function buildCssOutput(root) {
  const layout = getLayoutFromDom(root);
  const lines = [];
  homeLayoutElements.forEach((element) => {
    const values = layout[element.id];
    if (!values) return;
    lines.push(`${element.selector} {`);
    lines.push(`  left: ${values.x}%;`);
    lines.push(`  top: ${values.y}%;`);
    lines.push(`  width: ${values.w}%;`);
    lines.push(`  height: ${values.h}%;`);
    lines.push('}');
    lines.push('');
  });
  return lines.join('\n').trim();
}

function buildJsonOutput(root) {
  return JSON.stringify(getLayoutFromDom(root), null, 2);
}

async function copyOutput(root, mode) {
  const output = mode === 'css' ? buildCssOutput(root) : buildJsonOutput(root);
  const buffer = root.querySelector('[data-layout-copy-output]');
  if (buffer) buffer.value = output;
  try {
    await navigator.clipboard.writeText(output);
    setStatus(root, mode === 'css' ? 'CSS copied' : 'JSON copied');
  } catch {
    buffer?.select();
    setStatus(root, 'Copy blocked; select the text below');
  }
}

function resetLayout(root) {
  window.localStorage.removeItem(storageKey);
  const boxes = getElementMap(root);
  homeLayoutElements.forEach((element) => {
    const box = boxes.get(element.id);
    if (box) applyBoxValues(box, element);
  });
  updateReadout(root);
  setStatus(root, 'Defaults restored');
}

function startInteraction(root, event) {
  const box = event.target.closest('[data-layout-box]');
  if (!box) return;
  const stage = root.querySelector('[data-layout-stage]');
  if (!stage) return;
  event.preventDefault();
  box.setPointerCapture?.(event.pointerId);

  const anchor = event.target.closest('[data-resize-anchor]')?.dataset.resizeAnchor || '';
  const rect = stage.getBoundingClientRect();
  const start = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x: parseFloat(box.style.left),
    y: parseFloat(box.style.top),
    w: parseFloat(box.style.width),
    h: parseFloat(box.style.height),
  };

  function delta(nextEvent) {
    return {
      dx: ((nextEvent.clientX - start.pointerX) / rect.width) * 100,
      dy: ((nextEvent.clientY - start.pointerY) / rect.height) * 100,
    };
  }

  function onMove(moveEvent) {
    const { dx, dy } = delta(moveEvent);
    if (!anchor) {
      applyBoxValues(box, { ...start, x: start.x + dx, y: start.y + dy });
    } else {
      const next = { ...start };
      if (anchor.includes('e')) next.w = start.w + dx;
      if (anchor.includes('s')) next.h = start.h + dy;
      if (anchor.includes('w')) { next.x = start.x + dx; next.w = start.w - dx; }
      if (anchor.includes('n')) { next.y = start.y + dy; next.h = start.h - dy; }
      applyBoxValues(box, next);
    }
    updateReadout(root);
  }

  function onUp() {
    box.releasePointerCapture?.(event.pointerId);
    persistLayout(root);
    setStatus(root, 'Saved locally');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  }

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

export function initAdminHomeLayoutCalibrator(root) {
  const panel = root.querySelector('[data-home-layout-calibrator]');
  if (!panel) return;
  panel.addEventListener('pointerdown', (event) => startInteraction(root, event));
  root.querySelector('[data-copy-layout-css]')?.addEventListener('click', () => copyOutput(root, 'css'));
  root.querySelector('[data-copy-layout-json]')?.addEventListener('click', () => copyOutput(root, 'json'));
  root.querySelector('[data-reset-layout]')?.addEventListener('click', () => resetLayout(root));
  updateReadout(root);
}
