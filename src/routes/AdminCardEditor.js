/* ============================================================================
   Admin Card Editor Route
   Desktop-first table manager for D1 Library cards with modal editing.
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
const knownUsers = characters;

const cardTypes = [
  ['flame', 'Flame'],
  ['tide', 'Tide'],
  ['bloom', 'Bloom'],
  ['volt', 'Volt'],
  ['shadow', 'Shadow'],
  ['radiant', 'Radiant'],
  ['neutral', 'Neutral'],
];
const rarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

let adminCardsCache = [];
let adminCardSort = { key: 'updatedAt', direction: 'desc' };
let activePreviewUrl = '';

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function selected(value, option) { return String(value || '').toLowerCase() === String(option || '').toLowerCase() ? ' selected' : ''; }
function safeDomId(value) { return String(value || 'card').replace(/[^a-zA-Z0-9_-]/g, '_'); }
function titleCase(value) { return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function normalizeType(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (cardTypes.some(([id]) => id === raw)) return raw;
  if (['support', 'magic', 'mystic', 'light', 'holy'].includes(raw)) return 'radiant';
  if (['battle', 'attack', 'fire'].includes(raw)) return 'flame';
  if (['defense', 'nature', 'plant'].includes(raw)) return 'bloom';
  if (['training', 'speed', 'electric'].includes(raw)) return 'volt';
  if (['craft', 'alchemy', 'utility', 'balanced'].includes(raw)) return 'neutral';
  if (['water', 'aqua'].includes(raw)) return 'tide';
  if (['dark'].includes(raw)) return 'shadow';
  return 'neutral';
}
function typeLabel(value) { return cardTypes.find(([id]) => id === normalizeType(value))?.[1] || titleCase(value || 'neutral'); }

function normalizeCrop(card) {
  const crop = card?.crop || {};
  return { x: Number.isFinite(Number(crop.x)) ? Number(crop.x) : 50, y: Number.isFinite(Number(crop.y)) ? Number(crop.y) : 50, zoom: Number.isFinite(Number(crop.zoom)) ? Number(crop.zoom) : 1 };
}

function imagePreviewHtml(card, className = 'admin-card-art-thumb') {
  const crop = normalizeCrop(card);
  const imageUrl = card?.imageUrl || '';
  const style = `object-position:${crop.x}% ${crop.y}%;transform:scale(${crop.zoom});transform-origin:${crop.x}% ${crop.y}%;`;
  if (!imageUrl) return `<div class="${className} admin-card-art-empty" data-admin-card-preview>◆</div>`;
  return `<div class="${className}" data-admin-card-preview><img src="${escapeHtml(imageUrl)}" alt="" style="${escapeHtml(style)}" /></div>`;
}

function cardStat(card, key) { return Number(card?.stats?.[key] ?? 0) || 0; }
function cardPower(card) { return cardStat(card, 'pow') + cardStat(card, 'def') + cardStat(card, 'spd'); }
function knownUserName(userId) { return knownUsers.find(([id]) => id === String(userId || '').toLowerCase())?.[1] || ''; }
function creatorName(card) { return card.creatorDisplayName || knownUserName(card.creatorUserId) || 'Unknown'; }
function sortValue(card, key) { if (key === 'power') return cardPower(card); if (key === 'pow') return cardStat(card, 'pow'); if (key === 'def') return cardStat(card, 'def'); if (key === 'spd') return cardStat(card, 'spd'); if (key === 'creatorDisplayName') return creatorName(card).toLowerCase(); if (key === 'createdAt' || key === 'updatedAt') return new Date(card?.[key] || 0).getTime() || 0; if (key === 'type') return typeLabel(card?.[key]).toLowerCase(); return String(card?.[key] ?? '').toLowerCase(); }
function sortedCards() { const direction = adminCardSort.direction === 'asc' ? 1 : -1; return [...adminCardsCache].sort((a, b) => { const left = sortValue(a, adminCardSort.key); const right = sortValue(b, adminCardSort.key); if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction; return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction; }); }
function sortIndicator(key) { if (adminCardSort.key !== key) return ''; return adminCardSort.direction === 'asc' ? ' ↑' : ' ↓'; }
function renderSortButton(label, key) { return `<button type="button" data-admin-sort="${escapeHtml(key)}">${escapeHtml(label)}${sortIndicator(key)}</button>`; }
function formatDate(value) { if (!value) return '—'; const date = new Date(value); if (Number.isNaN(date.getTime())) return String(value); return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
function shortText(value, fallback = '—') { const text = String(value || '').trim(); return text || fallback; }

function renderTableRow(card) {
  const normalizedType = normalizeType(card.type || card.cardType);
  return `
    <tr data-admin-card-row data-card-id="${escapeHtml(card.id)}" tabindex="0">
      <td class="admin-card-table-art">${imagePreviewHtml(card)}</td>
      <td><strong>${escapeHtml(card.name || 'Unnamed Card')}</strong><span>${escapeHtml(card.id)}</span></td>
      <td>${escapeHtml(shortText(card.characterId || card.character))}</td>
      <td><span class="status-pill" data-card-type="${escapeHtml(normalizedType)}">${escapeHtml(typeLabel(normalizedType))}</span></td>
      <td><span class="status-pill admin-rarity-pill">${escapeHtml(shortText(card.rarity))}</span></td>
      <td class="admin-number-cell">${escapeHtml(cardStat(card, 'pow'))}</td>
      <td class="admin-number-cell">${escapeHtml(cardStat(card, 'def'))}</td>
      <td class="admin-number-cell">${escapeHtml(cardStat(card, 'spd'))}</td>
      <td class="admin-number-cell"><strong>${escapeHtml(cardPower(card))}</strong></td>
      <td class="admin-card-creator-cell">${escapeHtml(creatorName(card))}</td>
      <td>${escapeHtml(formatDate(card.updatedAt))}</td>
      <td class="admin-card-actions-cell"><button class="button button-secondary" type="button" data-admin-edit-card>Edit</button><button class="button button-secondary admin-danger-button" type="button" data-admin-remove-card>Remove</button></td>
    </tr>
  `;
}
function renderTableRows() { return sortedCards().map(renderTableRow).join(''); }
function renderTableHeader() { return `<tr><th>Art</th><th>${renderSortButton('Name', 'name')}</th><th>${renderSortButton('Character', 'characterId')}</th><th>${renderSortButton('Type', 'type')}</th><th>${renderSortButton('Rarity', 'rarity')}</th><th>${renderSortButton('ATK', 'pow')}</th><th>${renderSortButton('DEF', 'def')}</th><th>${renderSortButton('SPD', 'spd')}</th><th>${renderSortButton('Power', 'power')}</th><th>${renderSortButton('Creator', 'creatorDisplayName')}</th><th>${renderSortButton('Updated', 'updatedAt')}</th><th>Actions</th></tr>`; }
function renderTable() { return `<div class="glass-panel admin-card-table-panel"><div class="admin-card-table-toolbar"><div><span class="section-kicker">Library Rows</span><h2 class="section-title">${adminCardsCache.length} editable cards</h2></div><span class="empty-note">Click any row to edit. Click a column header to sort.</span></div><div class="admin-card-table-scroll"><table class="admin-card-table" data-admin-card-table><thead>${renderTableHeader()}</thead><tbody data-admin-card-table-body>${renderTableRows() || '<tr><td colspan="12" class="empty-note">No cards were found in the cards table.</td></tr>'}</tbody></table></div></div>`; }

async function loadAdminCards() { const routes = getApiRoutes(); const response = await fetch(routes.adminCards, { headers: { accept: 'application/json' } }); const payload = await response.json().catch(() => null); if (!response.ok || !payload?.ok) throw new Error(payload?.error || `Card editor failed with ${response.status}`); return payload; }

export async function renderAdminCardEditor() {
  let payload;
  try { payload = await loadAdminCards(); adminCardsCache = payload.cards || []; } catch (error) { adminCardsCache = []; return `<section class="hero-panel admin-card-manager-hero"><span class="section-kicker">Admin Cards</span><h2 class="hero-title">Card editor unavailable.</h2><p class="hero-copy">${escapeHtml(error.message)}</p><div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a></div></section>`; }
  return `<section class="hero-panel admin-card-manager-hero"><span class="section-kicker">Admin Cards</span><h2 class="hero-title">Manage the Library.</h2><p class="hero-copy">A desktop-first card manager for scanning, sorting, editing, replacing art, adjusting crop, and deleting D1 Library card rows. Card type editing uses the seven Imago Core types.</p><div class="action-row"><a class="button button-secondary" href="#/admin">Admin Home</a><a class="button button-secondary" href="#/admin/submissions">Submissions</a><span class="status-pill">${escapeHtml(payload.source || 'D1 cards')}</span></div></section><section class="admin-card-manager" data-admin-card-editor>${renderTable()}<div class="admin-card-modal" data-admin-card-modal aria-hidden="true"></div></section>`;
}

function findCard(cardId) { return adminCardsCache.find((card) => String(card.id) === String(cardId)); }
function optionList(options, value) { return options.map((option) => { if (Array.isArray(option)) return `<option value="${escapeHtml(option[0])}"${selected(value, option[0])}>${escapeHtml(option[1])}</option>`; return `<option value="${escapeHtml(option)}"${selected(value, option)}>${escapeHtml(option)}</option>`; }).join(''); }
function creatorOptionList(card) { return optionList([['', 'Unknown / Unassigned'], ...knownUsers], card.creatorUserId || ''); }
function metadataValue(value) { return escapeHtml(shortText(value)); }

function renderModal(card) {
  const crop = normalizeCrop(card);
  const stats = card.stats || {};
  const formId = `admin-card-form-${safeDomId(card.id)}`;
  const normalizedType = normalizeType(card.type || card.cardType);
  return `
    <div class="admin-card-modal-backdrop" data-admin-close-modal></div>
    <div class="glass-panel admin-card-modal-panel" role="dialog" aria-modal="true" aria-label="Edit ${escapeHtml(card.name || 'card')}">
      <div class="admin-card-modal-header"><div><span class="section-kicker">Editing Card</span><h2 class="section-title">${escapeHtml(card.name || 'Unnamed Card')}</h2><p>${escapeHtml(card.id)}</p></div><button class="button button-secondary" type="button" data-admin-close-modal>Close</button></div>
      <div class="admin-card-modal-layout">
        <form class="admin-card-editor-form" id="${escapeHtml(formId)}" data-admin-card-form>
          <input type="hidden" name="id" value="${escapeHtml(card.id)}" />
          <div class="admin-card-editor-section"><span class="section-kicker">Identity</span><div class="admin-card-editor-grid"><label><span>Card Name</span><input name="name" maxlength="60" value="${escapeHtml(card.name || '')}" required /></label><label><span>Creator</span><select name="creator_user_id">${creatorOptionList(card)}</select></label><label><span>Character</span><select name="character_id">${optionList(characters, card.characterId || card.character)}</select></label><label><span>Card Type</span><select name="card_type">${optionList(cardTypes, normalizedType)}</select></label><label><span>Rarity</span><select name="rarity">${optionList(rarities, card.rarity)}</select></label></div></div>
          <div class="admin-card-editor-section"><span class="section-kicker">Battle Stats</span><div class="admin-card-editor-grid admin-card-editor-stats"><label><span>ATK</span><input name="pow" type="number" min="1" max="99" value="${escapeHtml(stats.pow ?? 1)}" required /></label><label><span>DEF</span><input name="def" type="number" min="1" max="99" value="${escapeHtml(stats.def ?? 1)}" required /></label><label><span>SPD</span><input name="spd" type="number" min="1" max="99" value="${escapeHtml(stats.spd ?? 1)}" required /></label></div></div>
          <div class="admin-card-editor-section"><span class="section-kicker">Text</span><label><span>Flavor Text</span><textarea name="flavor_text" maxlength="500" rows="4">${escapeHtml(card.flavor || '')}</textarea></label><label><span>Ability Text</span><textarea name="ability_text" maxlength="500" rows="4">${escapeHtml(card.ability || '')}</textarea></label></div>
          <div class="admin-card-editor-actions"><button class="button button-primary" type="submit">Save Card</button><button class="button button-secondary admin-danger-button" type="button" data-admin-modal-remove>Remove Card</button><span class="empty-note" data-admin-card-status>Ready.</span></div>
        </form>
        <aside class="admin-card-preview-column"><div class="admin-card-preview-shell">${imagePreviewHtml(card, 'admin-card-modal-art')}<div class="admin-card-editor-section admin-card-preview-crop-panel"><span class="section-kicker">Crop</span><div class="admin-card-editor-crop" data-admin-crop-controls><label><span>Crop X</span><input form="${escapeHtml(formId)}" name="crop_x" type="range" min="0" max="100" step="1" value="${escapeHtml(crop.x)}" /></label><label><span>Crop Y</span><input form="${escapeHtml(formId)}" name="crop_y" type="range" min="0" max="100" step="1" value="${escapeHtml(crop.y)}" /></label><label><span>Zoom</span><input form="${escapeHtml(formId)}" name="crop_zoom" type="range" min="1" max="3" step="0.01" value="${escapeHtml(crop.zoom)}" /></label></div></div><div class="admin-card-editor-section admin-card-preview-upload-panel"><span class="section-kicker">Replace Art</span><label><span>Image Upload</span><input form="${escapeHtml(formId)}" name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label><p class="empty-note">Image key is generated by storage and is not editable here.</p></div><div class="admin-card-preview-caption"><strong data-preview-name>${escapeHtml(card.name || 'Unnamed Card')}</strong><span data-preview-meta>${escapeHtml(card.rarity || 'common')} · ${escapeHtml(typeLabel(normalizedType))} · ${escapeHtml(card.characterId || card.character || 'unknown')}</span><div class="admin-card-preview-stats"><span>ATK <b data-preview-pow>${escapeHtml(stats.pow ?? 1)}</b></span><span>DEF <b data-preview-def>${escapeHtml(stats.def ?? 1)}</b></span><span>SPD <b data-preview-spd>${escapeHtml(stats.spd ?? 1)}</b></span><span>PWR <b data-preview-power>${escapeHtml(cardPower(card))}</b></span></div></div></div><div class="admin-card-meta-panel"><span class="section-kicker">Metadata</span><div class="detail-list"><div class="detail-row"><span>ID</span><strong>${metadataValue(card.id)}</strong></div><div class="detail-row"><span>Row ID</span><strong>${metadataValue(card.rowId || card.id)}</strong></div><div class="detail-row"><span>Owner</span><strong>${metadataValue(card.ownerUserId || 'Library pool')}</strong></div><div class="detail-row"><span>Creator</span><strong>${metadataValue(creatorName(card))}</strong></div><div class="detail-row"><span>Creator ID</span><strong>${metadataValue(card.creatorUserId || 'Unknown')}</strong></div><div class="detail-row"><span>Type</span><strong>${metadataValue(typeLabel(normalizedType))}</strong></div><div class="detail-row"><span>Image Key</span><strong>${metadataValue(card.imageKey)}</strong></div><div class="detail-row"><span>Created</span><strong>${metadataValue(card.createdAt)}</strong></div><div class="detail-row"><span>Updated</span><strong>${metadataValue(card.updatedAt)}</strong></div></div></div></aside>
      </div>
    </div>
  `;
}

function setStatus(root, message) { const status = root.querySelector('[data-admin-card-status]'); if (status) status.textContent = message; }
function updatePreview(modal) {
  const form = modal.querySelector('[data-admin-card-form]');
  const preview = modal.querySelector('[data-admin-card-preview]');
  const image = preview?.querySelector('img');
  if (image) { const x = modal.querySelector('[name="crop_x"]')?.value || 50; const y = modal.querySelector('[name="crop_y"]')?.value || 50; const zoom = modal.querySelector('[name="crop_zoom"]')?.value || 1; image.style.objectPosition = `${x}% ${y}%`; image.style.transform = `scale(${zoom})`; image.style.transformOrigin = `${x}% ${y}%`; }
  const previewName = modal.querySelector('[data-preview-name]');
  const previewMeta = modal.querySelector('[data-preview-meta]');
  const pow = modal.querySelector('[data-preview-pow]');
  const def = modal.querySelector('[data-preview-def]');
  const spd = modal.querySelector('[data-preview-spd]');
  const power = modal.querySelector('[data-preview-power]');
  if (previewName) previewName.textContent = form.querySelector('[name="name"]')?.value || 'Unnamed Card';
  if (previewMeta) previewMeta.textContent = `${form.querySelector('[name="rarity"]')?.value || 'common'} · ${typeLabel(form.querySelector('[name="card_type"]')?.value || 'neutral')} · ${form.querySelector('[name="character_id"]')?.value || 'unknown'}`;
  if (pow) pow.textContent = form.querySelector('[name="pow"]')?.value || '1';
  if (def) def.textContent = form.querySelector('[name="def"]')?.value || '1';
  if (spd) spd.textContent = form.querySelector('[name="spd"]')?.value || '1';
  if (power) {
    const attackValue = Number(form.querySelector('[name="pow"]')?.value || 0);
    const defenseValue = Number(form.querySelector('[name="def"]')?.value || 0);
    const speedValue = Number(form.querySelector('[name="spd"]')?.value || 0);
    power.textContent = String(attackValue + defenseValue + speedValue);
  }
}
function renderRowsInto(root) { const tableBody = root.querySelector('[data-admin-card-table-body]'); const tableHead = root.querySelector('[data-admin-card-table] thead'); if (tableBody) tableBody.innerHTML = renderTableRows() || '<tr><td colspan="12" class="empty-note">No cards were found in the cards table.</td></tr>'; if (tableHead) tableHead.innerHTML = renderTableHeader(); }
function openModal(root, cardId) { const card = findCard(cardId); const modal = root.querySelector('[data-admin-card-modal]'); if (!card || !modal) return; if (activePreviewUrl) { URL.revokeObjectURL(activePreviewUrl); activePreviewUrl = ''; } modal.innerHTML = renderModal(card); modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('admin-modal-open'); }
function closeModal(root) { const modal = root.querySelector('[data-admin-card-modal]'); if (!modal) return; if (activePreviewUrl) { URL.revokeObjectURL(activePreviewUrl); activePreviewUrl = ''; } modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); modal.innerHTML = ''; document.body.classList.remove('admin-modal-open'); }
async function saveModal(root, modal, form) { const routes = getApiRoutes(); setStatus(modal, 'Saving...'); try { const response = await fetch(routes.adminCards, { method: 'POST', body: new FormData(form) }); const payload = await response.json().catch(() => null); if (!response.ok || !payload?.ok) throw new Error(payload?.error || `Save failed with ${response.status}`); const updatedCard = payload.card; adminCardsCache = adminCardsCache.map((card) => String(card.id) === String(updatedCard.id) ? updatedCard : card); renderRowsInto(root); setStatus(modal, `Saved. Creator: ${creatorName(updatedCard)}. Type: ${typeLabel(updatedCard.type)}.`); updatePreview(modal); } catch (error) { setStatus(modal, error.message); } }
async function removeCard(root, cardId, cardName) { const routes = getApiRoutes(); if (!cardId || !window.confirm(`Remove ${cardName || cardId}? This removes the card row from the Library.`)) return; try { const response = await fetch(`${routes.adminCards}?id=${encodeURIComponent(cardId)}`, { method: 'DE' + 'LETE', headers: { accept: 'application/json' } }); const payload = await response.json().catch(() => null); if (!response.ok || !payload?.ok) throw new Error(payload?.error || `Remove failed with ${response.status}`); adminCardsCache = adminCardsCache.filter((card) => String(card.id) !== String(cardId)); renderRowsInto(root); closeModal(root); } catch (error) { const modal = root.querySelector('[data-admin-card-modal].is-open'); if (modal) setStatus(modal, error.message); else window.alert(error.message); } }

export function initAdminCardEditor(root) {
  const manager = root.querySelector('[data-admin-card-editor]');
  if (!manager) return;
  manager.addEventListener('click', (event) => {
    const sortButton = event.target.closest('[data-admin-sort]');
    if (sortButton) { const key = sortButton.dataset.adminSort; adminCardSort = { key, direction: adminCardSort.key === key && adminCardSort.direction === 'asc' ? 'desc' : 'asc' }; renderRowsInto(root); return; }
    const closeButton = event.target.closest('[data-admin-close-modal]'); if (closeButton) { closeModal(root); return; }
    const removeButton = event.target.closest('[data-admin-remove-card]'); if (removeButton) { const row = removeButton.closest('[data-admin-card-row]'); const card = findCard(row?.dataset.cardId); removeCard(root, card?.id, card?.name); return; }
    const modalRemoveButton = event.target.closest('[data-admin-modal-remove]'); if (modalRemoveButton) { const form = modalRemoveButton.closest('[data-admin-card-form]'); const cardId = form?.querySelector('[name="id"]')?.value || ''; const cardName = form?.querySelector('[name="name"]')?.value || cardId; removeCard(root, cardId, cardName); return; }
    const editButton = event.target.closest('[data-admin-edit-card]'); if (editButton) { const row = editButton.closest('[data-admin-card-row]'); openModal(root, row?.dataset.cardId); return; }
    const row = event.target.closest('[data-admin-card-row]'); if (row && !event.target.closest('button, a, input, select, textarea')) openModal(root, row.dataset.cardId);
  });
  manager.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeModal(root); return; } if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-admin-card-row]')) { event.preventDefault(); openModal(root, event.target.dataset.cardId); } });
  manager.addEventListener('input', (event) => { const modal = event.target.closest('[data-admin-card-modal].is-open'); if (!modal) return; updatePreview(modal); });
  manager.addEventListener('change', (event) => {
    const modal = event.target.closest('[data-admin-card-modal].is-open');
    if (!modal) return;
    if (event.target.matches('[name="image"]')) { const file = event.target.files?.[0]; const preview = modal.querySelector('[data-admin-card-preview]'); if (!file || !preview) return; if (activePreviewUrl) URL.revokeObjectURL(activePreviewUrl); activePreviewUrl = URL.createObjectURL(file); if (preview.matches('.admin-card-art-empty')) { preview.classList.remove('admin-card-art-empty'); preview.innerHTML = '<img alt="" />'; } const image = preview.querySelector('img'); if (image) image.src = activePreviewUrl; }
    updatePreview(modal);
  });
  manager.addEventListener('submit', (event) => { const form = event.target.closest('[data-admin-card-form]'); const modal = event.target.closest('[data-admin-card-modal].is-open'); if (!form || !modal) return; event.preventDefault(); saveModal(root, modal, form); });
}
