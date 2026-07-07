/* ============================================================================
   Admin Card Editor Route
   Lists editable Library cards from D1 and provides contained text/stat/image/crop controls.
   ============================================================================ */

import { getApiRoutes } from '../services/apiClient.js';

const characters = [
  ['sterling', 'Sterling'],
  ['cydney', 'Cydney'],
  ['ryan', 'Ryan'],
  ['gabi', 'Gabi'],
  ['cooper', 'Cooper'],
  ['kenly', 'Kenly'],
  ['ashley', 'Ashley'],
];

const cardTypes = ['support', 'battle', 'craft', 'magic', 'alchemy', 'training', 'defense', 'utility'];
const rarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function selected(value, option) {
  return String(value || '').toLowerCase() === String(option || '').toLowerCase() ? ' selected' : '';
}

function normalizeCrop(card) {
  const crop = card.crop || {};

  return {
    x: Number.isFinite(Number(crop.x)) ? Number(crop.x) : 50,
    y: Number.isFinite(Number(crop.y)) ? Number(crop.y) : 50,
    zoom: Number.isFinite(Number(crop.zoom)) ? Number(crop.zoom) : 1,
  };
}

function renderImagePreview(card, crop) {
  const imageUrl = card.imageUrl || '';
  const style = `object-position:${crop.x}% ${crop.y}%;transform:scale(${crop.zoom});transform-origin:${crop.x}% ${crop.y}%;`;

  if (!imageUrl) {
    return `<div class="admin-card-editor-empty-art" data-admin-card-preview>◆</div>`;
  }

  return `
    <div class="admin-card-editor-art" data-admin-card-preview>
      <img src="${escapeHtml(imageUrl)}" alt="" style="${escapeHtml(style)}" />
    </div>
  `;
}

function renderCardEditor(card) {
  const crop = normalizeCrop(card);
  const stats = card.stats || {};

  return `
    <article class="glass-panel admin-card-editor-card" data-admin-card-row data-card-id="${escapeHtml(card.id)}">
      <div class="admin-card-editor-head">
        ${renderImagePreview(card, crop)}
        <div>
          <span class="section-kicker">${escapeHtml(card.rarity || 'common')} · ${escapeHtml(card.characterId || 'unknown')}</span>
          <h3>${escapeHtml(card.name || 'Unnamed Card')}</h3>
          <p>${escapeHtml(card.id)}</p>
        </div>
        <button class="button button-secondary admin-danger-button" type="button" data-admin-delete-card>Delete</button>
      </div>

      <form class="admin-card-editor-form" data-admin-card-form>
        <input type="hidden" name="id" value="${escapeHtml(card.id)}" />
        <div class="admin-card-editor-grid">
          <label>
            <span>Card Name</span>
            <input name="name" maxlength="60" value="${escapeHtml(card.name || '')}" required />
          </label>
          <label>
            <span>Character</span>
            <select name="character_id">
              ${characters.map(([value, label]) => `<option value="${value}"${selected(card.characterId, value)}>${label}</option>`).join('')}
            </select>
          </label>
          <label>
            <span>Card Type</span>
            <select name="card_type">
              ${cardTypes.map((value) => `<option value="${value}"${selected(card.type, value)}>${escapeHtml(value)}</option>`).join('')}
            </select>
          </label>
          <label>
            <span>Rarity</span>
            <select name="rarity">
              ${rarities.map((value) => `<option value="${value}"${selected(card.rarity, value)}>${escapeHtml(value)}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="admin-card-editor-grid admin-card-editor-stats">
          <label><span>POW</span><input name="pow" type="number" min="1" max="99" value="${escapeHtml(stats.pow ?? 1)}" required /></label>
          <label><span>DEF</span><input name="def" type="number" min="1" max="99" value="${escapeHtml(stats.def ?? 1)}" required /></label>
          <label><span>SPD</span><input name="spd" type="number" min="1" max="99" value="${escapeHtml(stats.spd ?? 1)}" required /></label>
        </div>

        <label>
          <span>Flavor Text</span>
          <textarea name="flavor_text" maxlength="500" rows="3">${escapeHtml(card.flavor || '')}</textarea>
        </label>
        <label>
          <span>Ability Text</span>
          <textarea name="ability_text" maxlength="500" rows="3">${escapeHtml(card.ability || '')}</textarea>
        </label>

        <div class="admin-card-editor-grid">
          <label>
            <span>Image Key</span>
            <input name="image_key" value="${escapeHtml(card.imageKey || '')}" placeholder="R2 object key" />
          </label>
          <label>
            <span>Replace Image</span>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
        </div>

        <div class="admin-card-editor-crop" data-admin-crop-controls>
          <label><span>Crop X</span><input name="crop_x" type="range" min="0" max="100" step="1" value="${escapeHtml(crop.x)}" /></label>
          <label><span>Crop Y</span><input name="crop_y" type="range" min="0" max="100" step="1" value="${escapeHtml(crop.y)}" /></label>
          <label><span>Zoom</span><input name="crop_zoom" type="range" min="1" max="3" step="0.01" value="${escapeHtml(crop.zoom)}" /></label>
        </div>

        <div class="admin-card-editor-actions">
          <button class="button button-primary" type="submit">Save Card</button>
          <span class="empty-note" data-admin-card-status>Ready.</span>
        </div>
      </form>
    </article>
  `;
}

async function loadAdminCards() {
  const routes = getApiRoutes();
  const response = await fetch(routes.adminCards, {
    headers: { accept: 'application/json' },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Card editor failed with ${response.status}`);
  }

  return payload;
}

export async function renderAdminCardEditor() {
  let payload;

  try {
    payload = await loadAdminCards();
  } catch (error) {
    return `
      <section class="hero-panel">
        <span class="section-kicker">Admin Cards</span>
        <h2 class="hero-title">Card editor unavailable.</h2>
        <p class="hero-copy">${escapeHtml(error.message)}</p>
        <div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a></div>
      </section>
    `;
  }

  return `
    <section class="hero-panel">
      <span class="section-kicker">Admin Cards</span>
      <h2 class="hero-title">Edit the Library.</h2>
      <p class="hero-copy">This page lists rows from the D1 cards table. You can change card text, stats, rarity, character, image key, replacement image, and crop values, or delete the row.</p>
      <div class="action-row">
        <a class="button button-secondary" href="#/admin">Admin Home</a>
        <a class="button button-secondary" href="#/admin/submissions">Submissions</a>
      </div>
    </section>

    <section data-admin-card-editor>
      <div class="section-heading">
        <div>
          <span class="section-kicker">Library Rows</span>
          <h2 class="section-title">${payload.cards.length} editable cards</h2>
        </div>
        <span class="status-pill">${escapeHtml(payload.source || 'D1 cards')}</span>
      </div>
      <div class="admin-card-editor-list">
        ${payload.cards.length ? payload.cards.map(renderCardEditor).join('') : '<div class="empty-note">No cards were found in the cards table.</div>'}
      </div>
    </section>
  `;
}

function updatePreview(row) {
  const preview = row.querySelector('[data-admin-card-preview]');
  const image = preview?.querySelector('img');

  if (!image) {
    return;
  }

  const x = row.querySelector('[name="crop_x"]')?.value || 50;
  const y = row.querySelector('[name="crop_y"]')?.value || 50;
  const zoom = row.querySelector('[name="crop_zoom"]')?.value || 1;

  image.style.objectPosition = `${x}% ${y}%`;
  image.style.transform = `scale(${zoom})`;
  image.style.transformOrigin = `${x}% ${y}%`;
}

function setStatus(row, message) {
  const status = row.querySelector('[data-admin-card-status]');

  if (status) {
    status.textContent = message;
  }
}

export function initAdminCardEditor(root) {
  const routes = getApiRoutes();

  root.querySelectorAll('[data-admin-card-row]').forEach((row) => {
    const form = row.querySelector('[data-admin-card-form]');
    const deleteButton = row.querySelector('[data-admin-delete-card]');
    const fileInput = row.querySelector('[name="image"]');

    row.querySelectorAll('[name="crop_x"], [name="crop_y"], [name="crop_zoom"]').forEach((input) => {
      input.addEventListener('input', () => updatePreview(row));
    });

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      const preview = row.querySelector('[data-admin-card-preview]');

      if (!file || !preview) {
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      if (preview.matches('.admin-card-editor-empty-art')) {
        preview.className = 'admin-card-editor-art';
        preview.innerHTML = `<img alt="" />`;
      }

      const image = preview.querySelector('img');

      if (image) {
        image.src = previewUrl;
        updatePreview(row);
      }
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus(row, 'Saving...');

      try {
        const response = await fetch(routes.adminCards, {
          method: 'POST',
          body: new FormData(form),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || `Save failed with ${response.status}`);
        }

        const name = form.querySelector('[name="name"]')?.value || payload.card?.name || 'Card';
        const heading = row.querySelector('.admin-card-editor-head h3');

        if (heading) {
          heading.textContent = name;
        }

        if (payload.card?.imageKey) {
          const imageKeyInput = form.querySelector('[name="image_key"]');

          if (imageKeyInput) {
            imageKeyInput.value = payload.card.imageKey;
          }
        }

        setStatus(row, 'Saved.');
      } catch (error) {
        setStatus(row, error.message);
      }
    });

    deleteButton?.addEventListener('click', async () => {
      const cardId = row.dataset.cardId || form?.querySelector('[name="id"]')?.value || '';
      const cardName = form?.querySelector('[name="name"]')?.value || cardId;

      if (!cardId || !window.confirm(`Delete ${cardName}? This removes the card row from the Library.`)) {
        return;
      }

      setStatus(row, 'Deleting...');

      try {
        const response = await fetch(`${routes.adminCards}?id=${encodeURIComponent(cardId)}`, {
          method: 'DELETE',
          headers: { accept: 'application/json' },
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || `Delete failed with ${response.status}`);
        }

        row.remove();
      } catch (error) {
        setStatus(row, error.message);
      }
    });
  });
}
