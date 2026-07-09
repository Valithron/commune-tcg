/* ============================================================================
   Admin Submit Crop Lab
   Purpose: compare submit-page preview crop approaches before changing live UX.
   ============================================================================ */

import { renderCardFrame } from '../components/CardFrame.js';
import { escapeHtml, titleCase } from '../components/format.js';

const defaultCrop = { x: 50, y: 50, zoom: 1 };
const sampleCard = {
  id: 'submit-crop-lab-sample',
  name: 'Creator Beta Preview',
  cid: 'cydney',
  character: 'cydney',
  characterId: 'cydney',
  type: 'radiant',
  cardType: 'radiant',
  category: 'Radiant',
  rarity: 'rare',
  symbol: '◆',
  ability: '',
  abilityIcon: '✦',
  stats: { pow: '?', def: '?', spd: '?' },
  owned: false,
  level: 1,
  copies: 0,
  flavor: 'Upload test art and try cropping directly inside each preview.',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const point = (event) => ({ x: event.clientX, y: event.clientY });
const touchPoint = (touch) => ({ x: touch.clientX, y: touch.clientY });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function rounded(crop) {
  return {
    x: Math.round(crop.x * 10) / 10,
    y: Math.round(crop.y * 10) / 10,
    zoom: Math.round(crop.zoom * 100) / 100,
  };
}

function renderOptionOne() {
  return `
    <article class="glass-panel crop-lab-option" data-crop-lab-option="cardframe">
      <div class="crop-lab-option-head">
        <div>
          <span class="section-kicker">Option 1</span>
          <h3>Canonical CardFrame preview</h3>
        </div>
        <span class="status-pill">Least duplication</span>
      </div>
      <p class="hero-copy">Uses the real reusable card renderer, then makes the existing art window draggable/pinchable.</p>
      <div class="crop-lab-card-stage crop-lab-card-stage--canonical" data-crop-lab-target="cardframe">
        ${renderCardFrame({ ...sampleCard, crop: defaultCrop }, { density: 'showcase', context: 'library', showOwnership: false, showStats: false })}
      </div>
      <div class="empty-note crop-lab-readout" data-crop-lab-readout="cardframe">Crop: x 50 / y 50 / zoom 1.00</div>
    </article>
  `;
}

function renderOptionTwo() {
  return `
    <article class="glass-panel crop-lab-option" data-crop-lab-option="custom">
      <div class="crop-lab-option-head">
        <div>
          <span class="section-kicker">Option 2</span>
          <h3>Submit-specific creator preview</h3>
        </div>
        <span class="status-pill">More control</span>
      </div>
      <p class="hero-copy">A dedicated submit preview shell where the art/crop layer is built as the primary interaction target.</p>
      <div class="crop-lab-card-stage crop-lab-card-stage--custom" data-crop-lab-target="custom">
        <article class="submit-preview-card" data-rarity="rare" aria-label="Submit-specific preview card">
          <div class="submit-preview-art" data-crop-lab-art>
            <span class="card-art-symbol">◆</span>
          </div>
          <div class="submit-preview-nameplate">
            <h3>${escapeHtml(sampleCard.name)}</h3>
            <p>${escapeHtml(sampleCard.flavor)}</p>
          </div>
          <div class="submit-preview-pills">
            <span>R</span>
            <span>CY</span>
            <span>${escapeHtml(titleCase(sampleCard.type))}</span>
            <span>✦</span>
          </div>
        </article>
      </div>
      <div class="empty-note crop-lab-readout" data-crop-lab-readout="custom">Crop: x 50 / y 50 / zoom 1.00</div>
    </article>
  `;
}

export function renderAdminSubmitCropLab() {
  return `
    <section class="hero-panel">
      <span class="section-kicker">Submit UX Lab</span>
      <h2 class="hero-title">Crop preview comparison</h2>
      <p class="hero-copy">This admin-only test renders both proposed Submit Card crop approaches without changing the live submit page.</p>
      <div class="action-row"><a class="button button-secondary" href="#/admin">Back to Admin</a><a class="button button-secondary" href="#/submit">Open Live Submit Page</a></div>
    </section>

    <section class="glass-panel admin-panel crop-lab-upload-panel">
      <span class="section-kicker">Shared Test Art</span>
      <h2 class="section-title">Upload once, test both</h2>
      <p class="hero-copy">Tap the upload control, then drag or pinch inside each card preview. Each option keeps an independent crop state so the feel can be compared directly.</p>
      <label class="button button-primary crop-lab-upload-button">
        Upload Test Art
        <input data-crop-lab-upload type="file" accept="image/png,image/jpeg,image/webp" />
      </label>
      <div class="empty-note" data-crop-lab-status>No image loaded yet.</div>
    </section>

    <section class="crop-lab-grid" aria-label="Submit crop option comparison">
      ${renderOptionOne()}
      ${renderOptionTwo()}
    </section>
  `;
}

function setImageForTarget(target, imageUrl) {
  const isCustom = target.getAttribute('data-crop-lab-target') === 'custom';
  const art = isCustom ? target.querySelector('[data-crop-lab-art]') : target.querySelector('.card-art');
  if (!art) return null;

  let image = art.querySelector('img');
  if (!image) {
    image = document.createElement('img');
    image.alt = '';
    image.className = isCustom ? 'submit-preview-art-image' : 'card-art-image';
    art.innerHTML = '';
    art.appendChild(image);
  }

  image.src = imageUrl;
  return image;
}

function installCropController(target, readout) {
  const pointers = new Map();
  let crop = { ...defaultCrop };
  let start = null;
  let touchStart = null;
  let lastTap = 0;
  let nativeTouchMode = false;

  const getArt = () => target.getAttribute('data-crop-lab-target') === 'custom'
    ? target.querySelector('[data-crop-lab-art]')
    : target.querySelector('.card-art');
  const getImage = () => getArt()?.querySelector('img');
  const hasImage = () => Boolean(getImage());

  function writeCrop() {
    const next = rounded(crop);
    const image = getImage();
    if (image) {
      image.style.objectPosition = `${next.x}% ${next.y}%`;
      image.style.transform = `scale(${next.zoom})`;
      image.style.transformOrigin = `${next.x}% ${next.y}%`;
    }
    if (readout) readout.textContent = `Crop: x ${next.x} / y ${next.y} / zoom ${next.zoom.toFixed(2)}`;
  }

  function setCrop(next) {
    crop = {
      x: clamp(Number(next.x), 0, 100),
      y: clamp(Number(next.y), 0, 100),
      zoom: clamp(Number(next.zoom), 1, 3),
    };
    writeCrop();
  }

  function resetCrop() {
    setCrop(defaultCrop);
  }

  function beginGesture() {
    const active = [...pointers.values()];
    if (!active.length) {
      start = null;
      return;
    }
    start = {
      crop: { ...crop },
      points: active,
      midpoint: active.length > 1 ? midpoint(active[0], active[1]) : active[0],
      distance: active.length > 1 ? Math.max(distance(active[0], active[1]), 1) : 1,
    };
  }

  function updateGesture() {
    if (!start || !hasImage()) return;
    const active = [...pointers.values()];
    const rect = getArt()?.getBoundingClientRect();
    if (!active.length || !rect?.width || !rect?.height) return;

    if (active.length > 1 && start.points.length > 1) {
      const currentMidpoint = midpoint(active[0], active[1]);
      const currentDistance = Math.max(distance(active[0], active[1]), 1);
      setCrop({
        x: start.crop.x - ((currentMidpoint.x - start.midpoint.x) / rect.width) * 100,
        y: start.crop.y - ((currentMidpoint.y - start.midpoint.y) / rect.height) * 100,
        zoom: start.crop.zoom * (currentDistance / start.distance),
      });
      return;
    }

    setCrop({
      x: start.crop.x - ((active[0].x - start.points[0].x) / rect.width) * 100,
      y: start.crop.y - ((active[0].y - start.points[0].y) / rect.height) * 100,
      zoom: start.crop.zoom,
    });
  }

  function beginTouchGesture(touches) {
    const active = Array.from(touches).map(touchPoint);
    if (!active.length) {
      touchStart = null;
      return;
    }
    touchStart = {
      crop: { ...crop },
      points: active,
      midpoint: active.length > 1 ? midpoint(active[0], active[1]) : active[0],
      distance: active.length > 1 ? Math.max(distance(active[0], active[1]), 1) : 1,
    };
  }

  function updateTouchGesture(touches) {
    if (!touchStart || !hasImage()) return;
    const active = Array.from(touches).map(touchPoint);
    const rect = getArt()?.getBoundingClientRect();
    if (!active.length || !rect?.width || !rect?.height) return;

    if (active.length > 1 && touchStart.points.length > 1) {
      const currentMidpoint = midpoint(active[0], active[1]);
      const currentDistance = Math.max(distance(active[0], active[1]), 1);
      setCrop({
        x: touchStart.crop.x - ((currentMidpoint.x - touchStart.midpoint.x) / rect.width) * 100,
        y: touchStart.crop.y - ((currentMidpoint.y - touchStart.midpoint.y) / rect.height) * 100,
        zoom: touchStart.crop.zoom * (currentDistance / touchStart.distance),
      });
      return;
    }

    setCrop({
      x: touchStart.crop.x - ((active[0].x - touchStart.points[0].x) / rect.width) * 100,
      y: touchStart.crop.y - ((active[0].y - touchStart.points[0].y) / rect.height) * 100,
      zoom: touchStart.crop.zoom,
    });
  }

  target.addEventListener('pointerdown', (event) => {
    if (!hasImage() || (nativeTouchMode && event.pointerType === 'touch')) return;
    const now = Date.now();
    if (now - lastTap < 300) {
      resetCrop();
      lastTap = 0;
      event.preventDefault();
      return;
    }
    lastTap = now;
    target.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, point(event));
    beginGesture();
    event.preventDefault();
  });

  target.addEventListener('pointermove', (event) => {
    if ((nativeTouchMode && event.pointerType === 'touch') || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, point(event));
    updateGesture();
    event.preventDefault();
  });

  const endPointer = (event) => {
    pointers.delete(event.pointerId);
    beginGesture();
  };
  target.addEventListener('pointerup', endPointer);
  target.addEventListener('pointercancel', endPointer);

  target.addEventListener('touchstart', (event) => {
    if (!hasImage()) return;
    nativeTouchMode = true;
    pointers.clear();
    beginTouchGesture(event.touches);
    event.preventDefault();
  }, { passive: false });

  target.addEventListener('touchmove', (event) => {
    if (!hasImage()) return;
    updateTouchGesture(event.touches);
    event.preventDefault();
  }, { passive: false });

  target.addEventListener('touchend', (event) => {
    if (!hasImage()) return;
    beginTouchGesture(event.touches);
    if (!event.touches.length) nativeTouchMode = false;
  }, { passive: false });

  target.addEventListener('wheel', (event) => {
    if (!hasImage()) return;
    event.preventDefault();
    setCrop({ ...crop, zoom: crop.zoom * Math.exp(-event.deltaY * 0.0012) });
  }, { passive: false });

  return {
    loadImage(imageUrl) {
      setImageForTarget(target, imageUrl);
      resetCrop();
    },
  };
}

export function initAdminSubmitCropLab(root) {
  const upload = root.querySelector('[data-crop-lab-upload]');
  const status = root.querySelector('[data-crop-lab-status]');
  const controllers = [...root.querySelectorAll('[data-crop-lab-target]')].map((target) => installCropController(
    target,
    root.querySelector(`[data-crop-lab-readout="${target.getAttribute('data-crop-lab-target')}"]`)
  ));
  let objectUrl = '';

  upload?.addEventListener('change', () => {
    const file = upload.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      status.textContent = 'Use PNG, JPG, or WEBP test art.';
      upload.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      status.textContent = 'Test art must be 5 MB or smaller.';
      upload.value = '';
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    controllers.forEach((controller) => controller.loadImage(objectUrl));
    status.textContent = 'Image loaded. Drag inside either preview. Pinch or scroll to zoom. Double tap is not wired here yet.';
  });
}
