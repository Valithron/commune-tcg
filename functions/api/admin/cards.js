import { errorResponse, jsonResponse } from '../../_shared/json.js';

const allowedMimeTypes = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']]);
const allowedRarities = new Set(['common', 'uncommon', 'rare', 'legendary', 'mythic']);
const allowedCharacters = new Set(['sterling', 'cydney', 'ryan', 'gabi', 'cooper', 'kenly', 'ashley']);
const allowedTypes = new Set(['support', 'battle', 'craft', 'magic', 'alchemy', 'training', 'defense', 'utility']);
const knownCreators = [['sterling', 'Sterling'], ['cydney', 'Cydney'], ['ryan', 'Ryan'], ['gabi', 'Gabi'], ['cooper', 'Cooper'], ['kenly', 'Kenly'], ['ashley', 'Ashley']];
const knownCreatorIds = new Set(knownCreators.map(([id]) => id));
const flavorColumns = ['flavor', 'flavour', 'flavor_text', 'flavour_text', 'flavorText', 'flavourText', 'card_flavor', 'cardFlavor', 'card_flavor_text', 'cardFlavorText', 'description', 'desc', 'summary', 'lore', 'story', 'backstory', 'flavorCopy', 'flavourCopy', 'effect', 'effect_text', 'effectText', 'fx'];
const nestedFlavorContainers = ['card_json', 'card', 'data', 'payload', 'copy', 'text', 'content', 'details', 'metadata', 'meta'];
const nestedTextKeys = ['text', 'value', 'content', 'copy', 'body', 'html', 'markdown', ...flavorColumns];

function cleanText(value, maxLength = 500) { return String(value || '').trim().slice(0, maxLength); }
function normalizeChoice(value, allowed, fallback) { const cleaned = String(value || '').trim().toLowerCase(); return allowed.has(cleaned) ? cleaned : fallback; }
function creatorNameFromId(value) { return knownCreators.find(([id]) => id === String(value || '').trim().toLowerCase())?.[1] || ''; }
function creatorIdFromName(value) { const cleaned = String(value || '').trim().toLowerCase(); return knownCreators.find(([id, name]) => id === cleaned || name.toLowerCase() === cleaned)?.[0] || ''; }
function normalizeCreatorUserId(value, fallback = '') { const cleaned = String(value || '').trim().toLowerCase(); const fallbackCleaned = String(fallback || '').trim().toLowerCase(); if (knownCreatorIds.has(cleaned)) return cleaned; return knownCreatorIds.has(fallbackCleaned) ? fallbackCleaned : ''; }
function resolveCreator(payload) {
  const displayName = cleanText(payload.creatorDisplayName || payload.creator_display_name || payload.creator_name || payload.creator || payload.submitterDisplayName || payload.submitter_display_name || '', 120);
  const rawUserId = payload.creatorUserId || payload.creator_user_id || payload.submitterUserId || payload.submitter_user_id || '';
  const creatorUserId = normalizeCreatorUserId(rawUserId, creatorIdFromName(displayName));
  return { creatorUserId, creatorDisplayName: creatorNameFromId(creatorUserId) || displayName || 'Unknown' };
}
function toStat(value, fallback = 1) { const parsed = Number(value); return Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), 1), 99) : fallback; }
function toCropNumber(value, fallback, min, max) { const parsed = Number(value); return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback; }
function titleCase(value) { return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function safeParseJson(value) { if (!value) return null; if (typeof value === 'object') return value; try { return JSON.parse(value); } catch { return null; } }
function cleanTextValue(value, depth = 0) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (Array.isArray(value)) return value.map((item) => cleanTextValue(item, depth + 1)).filter(Boolean).join(' ').trim();
  if (typeof value === 'object' && depth < 4) {
    for (const key of nestedTextKeys) {
      const text = cleanTextValue(value[key], depth + 1);
      if (text) return text;
    }
  }
  return '';
}
function sourceObject(value) { const parsed = safeParseJson(value); if (parsed && typeof parsed === 'object') return parsed; if (value && typeof value === 'object') return value; return null; }
function readTextValue(row, candidates) {
  const keys = Array.isArray(candidates) ? candidates : [candidates];
  for (const key of keys) {
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const text = cleanTextValue(row[key]);
      if (text) return text;
    }
  }
  return '';
}
function resolveFlavorTextFromSource(source, depth = 0) {
  if (depth > 4) return '';
  const object = sourceObject(source);
  if (!object) return '';
  const direct = readTextValue(object, flavorColumns);
  if (direct) return direct;
  for (const key of nestedFlavorContainers) {
    const nested = object[key];
    if (nested === undefined || nested === null || nested === '') continue;
    const text = resolveFlavorTextFromSource(nested, depth + 1);
    if (text) return text;
  }
  return '';
}
function resolveFlavorText(...sources) { for (const source of sources) { const text = resolveFlavorTextFromSource(source); if (text) return text; } return ''; }
function isLikelyUrl(value) { return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/'); }
function imageUrlFromValue(value) { const imageValue = String(value || '').trim(); if (!imageValue) return ''; if (isLikelyUrl(imageValue)) return imageValue; return `/api/card-image?key=${encodeURIComponent(imageValue)}`; }
function normalizeCrop(value) { const parsed = safeParseJson(value); const crop = parsed?.crop || parsed?.imageCrop || parsed || {}; return { x: toCropNumber(crop.x ?? crop.left ?? 50, 50, 0, 100), y: toCropNumber(crop.y ?? crop.top ?? 50, 50, 0, 100), zoom: toCropNumber(crop.zoom ?? crop.z ?? crop.scale ?? 1, 1, 1, 3) }; }
function getImageExtension(file) { const fromMime = allowedMimeTypes.get(file.type); if (fromMime) return fromMime; const extension = String(file.name || '').toLowerCase().split('.').pop(); if (extension === 'png') return 'png'; if (extension === 'jpg' || extension === 'jpeg') return 'jpg'; if (extension === 'webp') return 'webp'; return ''; }

function normalizeCardRow(row) {
  const payload = safeParseJson(row.card_json) || {};
  const stats = payload.stats || {};
  const imageKey = payload.image_key || payload.imageKey || payload.image || '';
  const crop = normalizeCrop(payload.crop || payload.crop_json || payload.cropJson || payload.image_crop || payload.imageCrop || {});
  const creator = resolveCreator(payload);
  return {
    id: String(row.id || payload.id || ''),
    rowId: String(row.id || ''),
    ownerUserId: row.owner_user_id || '',
    characterId: row.character_id || payload.character_id || payload.character || '',
    name: payload.name || payload.card_name || payload.title || 'Unnamed Card',
    type: payload.type || payload.card_type || payload.cardType || 'support',
    category: payload.category || titleCase(payload.type || payload.card_type || 'support'),
    rarity: normalizeChoice(payload.rarity, allowedRarities, 'common'),
    stats: { pow: toStat(payload.pow ?? stats.pow, 1), def: toStat(payload.def ?? stats.def, 1), spd: toStat(payload.spd ?? stats.spd, 1) },
    flavor: resolveFlavorText(payload, row),
    ability: payload.ability || payload.ability_text || payload.abilityText || payload.mechanic || '',
    abilityIcon: payload.abilityIcon || payload.ability_icon || '✦',
    creatorUserId: creator.creatorUserId,
    creatorDisplayName: creator.creatorDisplayName,
    imageKey: isLikelyUrl(imageKey) ? '' : String(imageKey || ''),
    imageUrl: imageUrlFromValue(imageKey),
    crop,
    rawCardJson: JSON.stringify(payload, null, 2),
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function buildCardJson(existingPayload, fields) {
  return JSON.stringify({
    ...existingPayload,
    id: fields.id,
    name: fields.name,
    title: fields.name,
    character: fields.characterId,
    character_id: fields.characterId,
    cid: fields.characterId,
    type: fields.cardType,
    card_type: fields.cardType,
    category: titleCase(fields.cardType),
    rarity: fields.rarity,
    stats: fields.stats,
    pow: fields.stats.pow,
    def: fields.stats.def,
    spd: fields.stats.spd,
    creator: fields.creatorDisplayName,
    creator_name: fields.creatorDisplayName,
    creatorDisplayName: fields.creatorDisplayName,
    creator_display_name: fields.creatorDisplayName,
    creatorUserId: fields.creatorUserId,
    creator_user_id: fields.creatorUserId,
    flavor: fields.flavorText,
    flavor_text: fields.flavorText,
    flavorText: fields.flavorText,
    effect: fields.flavorText,
    ability: fields.abilityText,
    ability_text: fields.abilityText,
    abilityIcon: existingPayload.abilityIcon || existingPayload.ability_icon || '✦',
    image_key: fields.imageKey,
    imageKey: fields.imageKey,
    crop: fields.crop,
    crop_json: fields.crop,
  });
}

async function ensureCardsTable(env) { await env.DB.prepare('CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL DEFAULT \'\', character_id TEXT NOT NULL DEFAULT \'\', card_json TEXT NOT NULL DEFAULT \'{}\', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)').run(); }
async function getCardRow(env, id) { return env.DB.prepare('SELECT * FROM cards WHERE id = ? LIMIT 1').bind(String(id || '')).first(); }
async function readPayload(request) { const contentType = request.headers.get('content-type') || ''; if (contentType.includes('application/json')) return { type: 'json', payload: await request.json(), imageFile: null }; const formData = await request.formData(); return { type: 'form', payload: Object.fromEntries(formData.entries()), imageFile: formData.get('image') }; }

async function maybeStoreImage(env, cardId, imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== 'function' || imageFile.size === 0) return '';
  if (!env.CARD_IMAGES) throw new Error('R2 binding CARD_IMAGES is not available for image replacement.');
  const extension = getImageExtension(imageFile);
  if (!extension) throw new Error('Replacement image must be PNG, JPG, or WEBP.');
  if (imageFile.size > 8 * 1024 * 1024) throw new Error('Replacement image must be 8 MB or smaller.');
  const imageKey = `admin-cards/${String(cardId).replace(/[^a-zA-Z0-9_-]/g, '_')}/${Date.now()}.${extension}`;
  await env.CARD_IMAGES.put(imageKey, await imageFile.arrayBuffer(), { httpMetadata: { contentType: imageFile.type || `image/${extension}` }, customMetadata: { cardId: String(cardId), originalName: cleanText(imageFile.name, 160) } });
  return imageKey;
}

function fieldsFromPayload(payload, existingCard, storedImageKey = '') {
  const id = cleanText(payload.id || payload.card_id || existingCard.id, 120);
  const characterId = normalizeChoice(payload.character_id || payload.characterId || existingCard.characterId, allowedCharacters, 'sterling');
  const cardType = normalizeChoice(payload.card_type || payload.cardType || payload.type || existingCard.type, allowedTypes, 'support');
  const rarity = normalizeChoice(payload.rarity || existingCard.rarity, allowedRarities, 'common');
  const creatorUserId = normalizeCreatorUserId(Object.prototype.hasOwnProperty.call(payload, 'creator_user_id') ? payload.creator_user_id : existingCard.creatorUserId, existingCard.creatorUserId);
  const creatorDisplayName = creatorNameFromId(creatorUserId) || 'Unknown';
  const imageKey = cleanText(storedImageKey || payload.image_key || payload.imageKey || existingCard.imageKey, 500);
  return {
    id,
    name: cleanText(payload.name || payload.title || existingCard.name, 60) || 'Unnamed Card',
    characterId,
    cardType,
    rarity,
    creatorUserId,
    creatorDisplayName,
    stats: { pow: toStat(payload.pow ?? existingCard.stats.pow, 1), def: toStat(payload.def ?? existingCard.stats.def, 1), spd: toStat(payload.spd ?? existingCard.stats.spd, 1) },
    flavorText: cleanText(resolveFlavorText(payload, existingCard), 500),
    abilityText: cleanText(payload.ability_text || payload.ability || existingCard.ability, 500),
    imageKey,
    crop: { x: toCropNumber(payload.crop_x ?? payload.x ?? existingCard.crop.x, existingCard.crop.x, 0, 100), y: toCropNumber(payload.crop_y ?? payload.y ?? existingCard.crop.y, existingCard.crop.y, 0, 100), zoom: toCropNumber(payload.crop_zoom ?? payload.zoom ?? existingCard.crop.zoom, existingCard.crop.zoom, 1, 3) },
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  await ensureCardsTable(env);
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 500, 1), 1000);
  const result = await env.DB.prepare('SELECT * FROM cards ORDER BY updated_at DESC, created_at DESC LIMIT ?').bind(limit).all();
  const cards = (result.results || []).map(normalizeCardRow);
  return jsonResponse({ ok: true, source: 'D1 cards', editable: true, cards, totalReturned: cards.length, warnings: ['Admin card editor can edit or delete rows in the cards table.'] });
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    await ensureCardsTable(env);
    const { payload, imageFile } = await readPayload(request);
    const id = cleanText(payload.id || payload.card_id, 120);
    if (!id) return errorResponse('Card id is required.', 400);
    const row = await getCardRow(env, id);
    if (!row) return errorResponse('Card was not found.', 404);
    const existingPayload = safeParseJson(row.card_json) || {};
    const existingCard = normalizeCardRow(row);
    const storedImageKey = await maybeStoreImage(env, id, imageFile);
    const fields = fieldsFromPayload(payload, existingCard, storedImageKey);
    const nextJson = buildCardJson(existingPayload, fields);
    const now = new Date().toISOString();
    await env.DB.prepare('UPDATE cards SET character_id = ?, card_json = ?, updated_at = ? WHERE id = ?').bind(fields.characterId, nextJson, now, id).run();
    const updatedRow = await getCardRow(env, id);
    return jsonResponse({ ok: true, source: 'D1 cards', action: 'update', card: normalizeCardRow(updatedRow), warnings: storedImageKey ? ['Replacement image was stored in R2; old image cleanup is not automatic.'] : [] });
  } catch (error) {
    return errorResponse('Failed to update card.', 500, error.message);
  }
}

export async function onRequestDelete({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  try {
    await ensureCardsTable(env);
    const url = new URL(request.url);
    const id = cleanText(url.searchParams.get('id'), 120);
    if (!id) return errorResponse('Card id is required.', 400);
    const row = await getCardRow(env, id);
    if (!row) return errorResponse('Card was not found.', 404);
    const card = normalizeCardRow(row);
    await env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(id).run();
    return jsonResponse({ ok: true, source: 'D1 cards', action: 'delete', deletedCardId: id, deletedImageKey: '', warnings: card.imageKey ? ['Card row deleted. R2 image was left in place to avoid deleting art that may be shared by submissions or other rows.'] : [] });
  } catch (error) {
    return errorResponse('Failed to delete card.', 500, error.message);
  }
}
