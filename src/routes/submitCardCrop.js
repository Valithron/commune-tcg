/* ============================================================================
   Submit Card Crop Helper
   Purpose: route-local image preview and crop metadata capture for submissions.
   ============================================================================ */

const defaultCrop = { x: 50, y: 50, zoom: 1 };
const maxImageBytes = 5 * 1024 * 1024;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const point = (event) => ({ x: event.clientX, y: event.clientY });
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
  const preview = form.querySelector('[data-submit-preview]');
  const cropInput = form.querySelector('[name="crop_json"]');
  const cropHelp = form.querySelector('[data-submit-crop-help]');
  const changeButton = form.querySelector('[data-submit-change-art]');

  if (!box || !input || !preview || !cropInput) return;

  const pointers = new Map();
  let crop = { ...defaultCrop };
  let start = null;
  let objectUrl = '';
  let lastTap = 0;

  const hasImage = () => box.classList.contains('has-image');

  function writeCrop() {
    const next = rounded(crop);
    cropInput.value = JSON.stringify(next);
    preview.style.objectPosition = `${next.x}% ${next.y}%`;
    preview.style.transform = `scale(${next.zoom})`;
    preview.style.transformOrigin = `${next.x}% ${next.y}%`;
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
    const rect = box.getBoundingClientRect();
    if (!active.length || !rect.width || !rect.height) return;

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

  function clearPreview() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    preview.src = '';
    preview.hidden = true;
    preview.removeAttribute('style');
    box.classList.remove('has-image');
    if (cropHelp) cropHelp.hidden = true;
    if (changeButton) changeButton.hidden = true;
    crop = { ...defaultCrop };
    cropInput.value = JSON.stringify(defaultCrop);
  }

  box.addEventListener('click', () => {
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
      status.textContent = error;
      input.value = '';
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.hidden = false;
    box.classList.add('has-image');
    if (cropHelp) cropHelp.hidden = false;
    if (changeButton) changeButton.hidden = false;
    status.textContent = 'Art loaded. Set the crop, then submit.';
    resetCrop();
  });

  box.addEventListener('pointerdown', (event) => {
    if (!hasImage()) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      resetCrop();
      lastTap = 0;
      event.preventDefault();
      return;
    }
    lastTap = now;

    box.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, point(event));
    beginGesture();
    event.preventDefault();
  });

  box.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
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
