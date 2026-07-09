/* ============================================================================
   Submit Card Crop Helper
   Purpose: route-local image preview and crop metadata capture for submissions.
   ============================================================================ */

const defaultCrop = { x: 50, y: 50, zoom: 1 };
const maxImageBytes = 5 * 1024 * 1024;

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

function validateFile(file) {
  if (!file) return 'Choose a card illustration first.';
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return 'Card art must be PNG, JPG, or WEBP.';
  if (file.size > maxImageBytes) return 'Card art must be 5 MB or smaller.';
  return '';
}

export function initSubmitImageCropper(form, status) {
  const box = form.querySelector('[data-submit-cropper]');
  const input = form.querySelector('[data-submit-image-input]');
  const cropInput = form.querySelector('[name="crop_json"]');
  const cropHelp = form.querySelector('[data-submit-crop-help]');
  const changeButton = form.querySelector('[data-submit-change-art]');
  const uploadLabelText = form.querySelector('[data-submit-upload-label-text]');

  if (!box || !input || !cropInput) return;

  const art = box.querySelector('.card-art');
  const defaultArtHtml = art?.innerHTML || '<span class="card-art-symbol">◆</span>';
  const pointers = new Map();
  let crop = { ...defaultCrop };
  let start = null;
  let touchStart = null;
  let gestureStartCrop = null;
  let objectUrl = '';
  let lastDesktopTap = 0;
  let nativeTouchMode = false;

  const getArt = () => box.querySelector('.card-art');
  const getPreview = () => getArt()?.querySelector('[data-submit-preview]') || null;
  const hasImage = () => box.classList.contains('has-image') && Boolean(getPreview());

  function showStatus(message) {
    status.hidden = false;
    status.textContent = message;
  }

  function writeCrop() {
    const next = rounded(crop);
    const preview = getPreview();
    cropInput.value = JSON.stringify(next);

    if (preview) {
      preview.style.objectPosition = `${next.x}% ${next.y}%`;
      preview.style.transform = `scale(${next.zoom})`;
      preview.style.transformOrigin = `${next.x}% ${next.y}%`;
    }
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

  function openPicker() {
    input.click();
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

  function clearPreview() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    const nextArt = getArt();
    if (nextArt) nextArt.innerHTML = defaultArtHtml;
    box.classList.remove('has-image');
    if (cropHelp) cropHelp.hidden = true;
    if (changeButton) changeButton.hidden = true;
    if (uploadLabelText) uploadLabelText.textContent = 'Upload Art';
    crop = { ...defaultCrop };
    cropInput.value = JSON.stringify(defaultCrop);
    pointers.clear();
    start = null;
    touchStart = null;
    gestureStartCrop = null;
    lastDesktopTap = 0;
  }

  function installPreviewImage(url) {
    const nextArt = getArt();
    if (!nextArt) return;
    nextArt.innerHTML = '';
    const preview = document.createElement('img');
    preview.className = 'card-art-image';
    preview.setAttribute('data-submit-preview', '');
    preview.alt = '';
    preview.src = url;
    nextArt.appendChild(preview);
  }

  box.addEventListener('click', (event) => {
    if (event.target.closest('input, textarea, select, button, label, a')) return;
    if (!hasImage()) openPicker();
  });

  box.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  });

  changeButton?.addEventListener('click', openPicker);

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    const error = validateFile(file);

    if (error) {
      showStatus(error);
      input.value = '';
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    installPreviewImage(objectUrl);
    box.classList.add('has-image');
    if (cropHelp) cropHelp.hidden = false;
    if (changeButton) changeButton.hidden = false;
    if (uploadLabelText) uploadLabelText.textContent = 'Art Selected';
    showStatus('Art loaded. Drag on the card to crop, then submit.');
    resetCrop();
  });

  box.addEventListener('pointerdown', (event) => {
    if (!hasImage() || (nativeTouchMode && event.pointerType === 'touch')) return;

    if (event.pointerType !== 'touch') {
      const now = Date.now();
      if (now - lastDesktopTap < 300) {
        resetCrop();
        lastDesktopTap = 0;
        event.preventDefault();
        return;
      }
      lastDesktopTap = now;
    }

    box.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, point(event));
    beginGesture();
    event.preventDefault();
  });

  box.addEventListener('pointermove', (event) => {
    if ((nativeTouchMode && event.pointerType === 'touch') || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, point(event));
    updateGesture();
    event.preventDefault();
  });

  const endPointer = (event) => {
    pointers.delete(event.pointerId);
    beginGesture();
  };

  box.addEventListener('pointerup', endPointer);
  box.addEventListener('pointercancel', endPointer);

  box.addEventListener('touchstart', (event) => {
    if (!hasImage()) return;
    nativeTouchMode = true;
    pointers.clear();
    lastDesktopTap = 0;
    beginTouchGesture(event.touches);
    event.preventDefault();
  }, { passive: false });

  box.addEventListener('touchmove', (event) => {
    if (!hasImage()) return;
    updateTouchGesture(event.touches);
    event.preventDefault();
  }, { passive: false });

  box.addEventListener('touchend', (event) => {
    if (!hasImage()) return;
    beginTouchGesture(event.touches);
    if (!event.touches.length) nativeTouchMode = false;
  }, { passive: false });

  box.addEventListener('touchcancel', () => {
    nativeTouchMode = false;
    touchStart = null;
    lastDesktopTap = 0;
  }, { passive: false });

  box.addEventListener('gesturestart', (event) => {
    if (!hasImage()) return;
    lastDesktopTap = 0;
    gestureStartCrop = { ...crop };
    event.preventDefault();
  }, { passive: false });

  box.addEventListener('gesturechange', (event) => {
    if (!hasImage() || !gestureStartCrop) return;
    setCrop({ ...gestureStartCrop, zoom: gestureStartCrop.zoom * Number(event.scale || 1) });
    event.preventDefault();
  }, { passive: false });

  box.addEventListener('gestureend', (event) => {
    gestureStartCrop = null;
    lastDesktopTap = 0;
    event.preventDefault();
  }, { passive: false });

  box.addEventListener('wheel', (event) => {
    if (!hasImage()) return;
    event.preventDefault();
    setCrop({ ...crop, zoom: crop.zoom * Math.exp(-event.deltaY * 0.0012) });
  }, { passive: false });

  box.addEventListener('dblclick', (event) => {
    if (!hasImage()) return;
    event.preventDefault();
    resetCrop();
  });

  form.addEventListener('reset', () => {
    window.setTimeout(clearPreview, 0);
  });
}

export function validateSubmitImage(form) {
  return validateFile(form.querySelector('[data-submit-image-input]')?.files?.[0]);
}
