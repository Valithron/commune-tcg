import { errorResponse, jsonResponse } from '../_shared/json.js';

const nameColumns = ['name', 'card_name', 'title'];
const characterColumns = ['character', 'character_id', 'characterId', 'cid', 'person', 'commune_member'];
const typeColumns = ['type', 'card_type', 'cardType', 'role', 'battle_role', 'battleRole', 'faction', 'class'];
const categoryColumns = ['category', 'class', 'faction'];
const creatorDisplayColumns = ['creatorDisplayName', 'creator_display_name', 'creatorName', 'creator_name', 'creator', 'createdBy', 'created_by', 'submitterDisplayName', 'submitter_display_name', 'artistName', 'artist_name', 'artist', 'author'];
const creatorUserColumns = ['creatorUserId', 'creator_user_id', 'submitterUserId', 'submitter_user_id', 'userId', 'user_id'];
const abilityColumns = ['ability', 'ability_text', 'abilityText', 'mechanic'];
const abilityIconColumns = ['ability_icon', 'abilityIcon', 'icon', 'symbol'];
const rarityColumns = ['rarity', 'tier'];
const powColumns = ['pow', 'power', 'attack', 'atk', 'strength'];
const defColumns = ['def', 'defense', 'health', 'hp'];
const spdColumns = ['spd', 'speed', 'agility'];
const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];
const levelColumns = ['level', 'card_level', 'cardLevel'];
const xpColumns = ['xp', 'experience', 'experience_points', 'experiencePoints'];
const copiesColumns = ['copies', 'copy_count', 'copyCount', 'quantity'];
const flavorColumns = ['flavor', 'flavour', 'flavor_text', 'flavour_text', 'flavorText', 'flavourText', 'description', 'desc', 'summary', 'lore', 'story', 'backstory', 'effect', 'effect_text', 'effectText'];
const nestedTextKeys = ['text', 'value', 'content', 'copy', 'body', 'html', 'markdown', ...flavorColumns];
const nestedFlavorContainers = ['card_json', 'card', 'data', 'payload', 'copy', 'text', 'content', 'details', 'metadata', 'meta'];

function safeParseJson(value) { if (!value) return null; if (typeof value === 'object') return value; if (typeof value !== 'string') return null; try { return JSON.parse(value); } catch { return null; } }
function readValue(row, candidates, fallback = '') { for (const key of candidates) if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') return row[key]; return fallback; }
function toNumber(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function slugify(value) { return String(value || 'card').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card'; }
function isLikelyUrl(value) { return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/'); }
function imageUrlFromValue(value) { const imageValue = String(value || '').trim(); if (!imageValue) return ''; if (isLikelyUrl(imageValue)) return imageValue; return `/api/card-image?key=${encodeURIComponent(imageValue)}`; }
function normalizeRarity(value) { const rarity = String(value || 'common').trim().toLowerCase(); if (['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(rarity)) return rarity; if (rarity.includes('myth')) return 'mythic'; if (rarity.includes('legend')) return 'legendary'; if (rarity.includes('uncommon')) return 'uncommon'; if (rarity.includes('rare')) return 'rare'; return 'common'; }

function cleanTextValue(value, depth = 0) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (Array.isArray(value)) return value.map((item) => cleanTextValue(item, depth + 1)).filter(Boolean).join(' ').trim();
  if (typeof value === 'object' && depth < 4) {
    for (const key of nestedTextKeys) { const text = cleanTextValue(value[key], depth + 1); if (text) return text; }
  }
  return '';
}
function readTextValue(row, candidates) { for (const key of candidates) { if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') { const text = cleanTextValue(row[key]); if (text) return text; } } return ''; }
function sourceObject(value) { const parsed = safeParseJson(value); if (parsed && typeof parsed === 'object') return parsed; if (value && typeof value === 'object') return value; return null; }
function resolveFlavorTextFromSource(source, depth = 0) {
  if (depth > 4) return '';
  const object = sourceObject(source);
  if (!object) return '';
  const direct = readTextValue(object, flavorColumns);
  if (direct) return direct;
  for (const key of nestedFlavorContainers) { const nested = object[key]; if (nested !== undefined && nested !== null && nested !== '') { const text = resolveFlavorTextFromSource(nested, depth + 1); if (text) return text; } }
  return '';
}
function resolveFlavorText(...sources) { for (const source of sources) { const text = resolveFlavorTextFromSource(source); if (text) return text; } return ''; }

function flattenCardPayload(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};
  const flavor = resolveFlavorText(payload, parsed, row);
  return {
    ...row,
    ...payload,
    pow: payload.pow ?? payload.power ?? payload.attack ?? payload.atk ?? payload.strength ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength,
    def: payload.def ?? payload.defense ?? payload.health ?? payload.hp ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp,
    spd: payload.spd ?? payload.speed ?? payload.agility ?? stats.spd ?? stats.speed ?? stats.agility,
    image_key: payload.image_key ?? payload.imageKey ?? payload.image_path ?? payload.image ?? payload.image_url ?? payload.art_url ?? payload.art_key ?? payload.object_key ?? payload.r2_key,
    flavor,
    character: payload.character ?? payload.character_id ?? payload.characterId ?? payload.cid ?? row.character_id,
    type: payload.type ?? payload.card_type ?? payload.cardType ?? payload.role ?? payload.battle_role ?? payload.battleRole ?? payload.faction ?? payload.class,
    creatorDisplayName: payload.creatorDisplayName ?? payload.creator_display_name ?? payload.creatorName ?? payload.creator_name ?? payload.creator ?? payload.createdBy ?? payload.created_by ?? payload.submitterDisplayName ?? payload.submitter_display_name ?? payload.artistName ?? payload.artist_name ?? payload.artist ?? payload.author,
    creatorUserId: payload.creatorUserId ?? payload.creator_user_id ?? payload.submitterUserId ?? payload.submitter_user_id ?? payload.userId ?? payload.user_id,
    ability: payload.ability ?? payload.ability_text ?? payload.abilityText ?? payload.mechanic,
    abilityIcon: payload.abilityIcon ?? payload.ability_icon ?? payload.icon,
    level: payload.level ?? payload.card_level ?? payload.cardLevel,
    xp: payload.xp ?? payload.experience ?? payload.experience_points ?? payload.experiencePoints,
    copies: payload.copies ?? payload.copy_count ?? payload.copyCount ?? payload.quantity,
  };
}

function normalizeOwnedRow(row) {
  const data = flattenCardPayload(row);
  const name = String(readValue(data, nameColumns, 'Unnamed Card'));
  const imageValue = String(readValue(data, imageColumns, ''));
  const levelValue = readValue(data, levelColumns, null);
  const xpValue = readValue(data, xpColumns, null);
  const copiesValue = readValue(data, copiesColumns, null);
  const flavor = resolveFlavorText(data, row) || 'No flavor text has been mapped for this card yet.';
  const creatorDisplayName = String(readValue(data, creatorDisplayColumns, ''));
  const creatorUserId = String(readValue(data, creatorUserColumns, ''));

  return {
    id: String(row.id ?? slugify(name)),
    sourceRowId: row.id ?? null,
    sourceTable: 'cards',
    ownerUserId: String(row.owner_user_id ?? ''),
    characterId: row.character_id ?? null,
    name,
    character: String(readValue(data, characterColumns, '')),
    type: String(readValue(data, typeColumns, 'Type')),
    creator: creatorDisplayName,
    creatorDisplayName,
    creatorUserId,
    ability: String(readValue(data, abilityColumns, '')),
    abilityIcon: String(readValue(data, abilityIconColumns, '✦')),
    category: String(readValue(data, categoryColumns, 'Vault')),
    rarity: normalizeRarity(readValue(data, rarityColumns, 'common')),
    symbol: String(readValue(data, ['symbol', 'icon'], '◆')),
    stats: { pow: toNumber(readValue(data, powColumns, 1), 1), def: toNumber(readValue(data, defColumns, 1), 1), spd: toNumber(readValue(data, spdColumns, 1), 1) },
    owned: true,
    level: toNumber(levelValue, 1),
    xp: toNumber(xpValue, 0),
    copies: toNumber(copiesValue, 1),
    progressionMapped: levelValue !== null || xpValue !== null || copiesValue !== null,
    flavor,
    imageKey: isLikelyUrl(imageValue) ? '' : imageValue,
    imageUrl: imageUrlFromValue(imageValue),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function ownerWhere() { return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`; }
async function readOwnerCounts(env) { const result = await env.DB.prepare(`SELECT owner_user_id AS ownerUserId, COUNT(*) AS cardCount FROM cards WHERE ${ownerWhere()} GROUP BY owner_user_id ORDER BY cardCount DESC LIMIT 50`).all(); return result.results || []; }
async function readOwnedRows(env, ownerUserId) {
  if (ownerUserId) {
    const result = await env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE ${ownerWhere()} AND CAST(owner_user_id AS TEXT) = ? ORDER BY updated_at DESC, created_at DESC LIMIT 500`).bind(String(ownerUserId)).all();
    return result.results || [];
  }
  const result = await env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE ${ownerWhere()} ORDER BY owner_user_id ASC, updated_at DESC, created_at DESC LIMIT 500`).all();
  return result.results || [];
}
function groupCardsByOwner(cards) { return cards.reduce((groups, card) => { const owner = card.ownerUserId || 'unknown'; if (!groups[owner]) groups[owner] = []; groups[owner].push(card); return groups; }, {}); }

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || '';
  try {
    const ownerCounts = await readOwnerCounts(env);
    const rows = await readOwnedRows(env, ownerUserId);
    const cards = rows.map(normalizeOwnedRow);
    const ownerUserIds = ownerCounts.map((owner) => String(owner.ownerUserId));
    const invalidCardJsonCount = rows.filter((row) => !safeParseJson(row.card_json)).length;
    return jsonResponse({
      ok: true,
      source: 'D1',
      phase: '10F.5',
      readOnly: true,
      table: 'cards',
      selectedOwnerUserId: ownerUserId || null,
      ownerUserIds,
      ownerCounts,
      totalReturned: cards.length,
      cards,
      cardsByOwner: ownerUserId ? null : groupCardsByOwner(cards),
      warnings: [
        'No authentication is applied yet; this endpoint is a read-only mapping endpoint, not a current-user Vault contract.',
        ...(ownerUserId ? [] : ['No ownerUserId filter was supplied, so up to 500 owned cards across owners were returned.']),
        ...(invalidCardJsonCount > 0 ? [`${invalidCardJsonCount} returned row(s) had invalid card_json.`] : []),
        ...(cards.some((card) => !card.progressionMapped) ? ['Some rows do not contain level/xp/copy fields; safe placeholders were applied.'] : []),
      ],
      nextStep: 'Wire the Vault route to a real current-user contract when authentication lands.',
    });
  } catch (error) {
    return errorResponse('Failed to read Vault cards.', 500, error.message);
  }
}
