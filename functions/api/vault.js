/* ============================================================================
   API Vault Endpoint
   Phase 8.2 responsibility: read owned card rows from cards.owner_user_id and
   normalize them for the future Vault route. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const nameColumns = ['name', 'card_name', 'title'];
const characterColumns = ['character', 'character_id', 'characterId', 'cid', 'person', 'commune_member'];
const typeColumns = ['type', 'card_type', 'cardType', 'role', 'battle_role', 'battleRole', 'faction', 'class'];
const categoryColumns = ['category', 'class', 'faction'];
const abilityColumns = ['ability', 'ability_text', 'abilityText', 'effect', 'mechanic'];
const abilityIconColumns = ['ability_icon', 'abilityIcon', 'icon', 'symbol'];
const rarityColumns = ['rarity', 'tier'];
const powColumns = ['pow', 'power', 'attack', 'atk', 'strength'];
const defColumns = ['def', 'defense', 'health', 'hp'];
const spdColumns = ['spd', 'speed', 'agility'];
const flavorColumns = ['flavor', 'flavor_text', 'description', 'lore'];
const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];
const levelColumns = ['level', 'card_level', 'cardLevel'];
const xpColumns = ['xp', 'experience', 'experience_points', 'experiencePoints'];
const copiesColumns = ['copies', 'copy_count', 'copyCount', 'quantity'];

function safeParseJson(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readValue(row, candidates, fallback = '') {
  for (const key of candidates) {
    if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }

  return fallback;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRarity(value) {
  const rarity = String(value || 'common').trim().toLowerCase();

  if (['common', 'uncommon', 'rare', 'legendary', 'mythic'].includes(rarity)) {
    return rarity;
  }

  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';

  return 'common';
}

function slugify(value) {
  return String(value || 'card')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'card';
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test(String(value || '')) || String(value || '').startsWith('/');
}

function imageUrlFromValue(value) {
  const imageValue = String(value || '').trim();

  if (!imageValue) {
    return '';
  }

  if (isLikelyUrl(imageValue)) {
    return imageValue;
  }

  return `/api/card-image?key=${encodeURIComponent(imageValue)}`;
}

function flattenCardPayload(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};

  return {
    ...row,
    ...payload,
    pow: payload.pow ?? payload.power ?? payload.attack ?? payload.atk ?? payload.strength ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength,
    def: payload.def ?? payload.defense ?? payload.health ?? payload.hp ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp,
    spd: payload.spd ?? payload.speed ?? payload.agility ?? stats.spd ?? stats.speed ?? stats.agility,
    image_key: payload.image_key ?? payload.imageKey ?? payload.image_path ?? payload.image ?? payload.image_url ?? payload.art_url ?? payload.art_key ?? payload.object_key ?? payload.r2_key,
    flavor: payload.flavor ?? payload.flavor_text ?? payload.description ?? payload.lore,
    character: payload.character ?? payload.character_id ?? payload.characterId ?? payload.cid ?? row.character_id,
    type: payload.type ?? payload.card_type ?? payload.cardType ?? payload.role ?? payload.battle_role ?? payload.battleRole ?? payload.faction ?? payload.class,
    ability: payload.ability ?? payload.ability_text ?? payload.abilityText ?? payload.effect ?? payload.mechanic,
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

  return {
    id: String(row.id ?? slugify(name)),
    sourceRowId: row.id ?? null,
    sourceTable: 'cards',
    ownerUserId: String(row.owner_user_id ?? ''),
    characterId: row.character_id ?? null,
    name,
    character: String(readValue(data, characterColumns, '')),
    type: String(readValue(data, typeColumns, 'Type')),
    ability: String(readValue(data, abilityColumns, '')),
    abilityIcon: String(readValue(data, abilityIconColumns, '✦')),
    category: String(readValue(data, categoryColumns, 'Vault')),
    rarity: normalizeRarity(readValue(data, rarityColumns, 'common')),
    symbol: String(readValue(data, ['symbol', 'icon'], '◆')),
    stats: {
      pow: toNumber(readValue(data, powColumns, 1), 1),
      def: toNumber(readValue(data, defColumns, 1), 1),
      spd: toNumber(readValue(data, spdColumns, 1), 1),
    },
    owned: true,
    level: toNumber(levelValue, 1),
    xp: toNumber(xpValue, 0),
    copies: toNumber(copiesValue, 1),
    progressionMapped: levelValue !== null || xpValue !== null || copiesValue !== null,
    flavor: String(readValue(data, flavorColumns, 'An owned Vault card from the connected database.')),
    imageKey: isLikelyUrl(imageValue) ? '' : imageValue,
    imageUrl: imageUrlFromValue(imageValue),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function ownerWhere() {
  return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`;
}

async function readOwnerCounts(env) {
  const result = await env.DB.prepare(`
    SELECT owner_user_id AS ownerUserId, COUNT(*) AS cardCount
    FROM cards
    WHERE ${ownerWhere()}
    GROUP BY owner_user_id
    ORDER BY cardCount DESC
    LIMIT 50
  `).all();

  return result.results || [];
}

async function readOwnedRows(env, ownerUserId) {
  if (ownerUserId) {
    const result = await env.DB.prepare(`
      SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
      FROM cards
      WHERE ${ownerWhere()} AND CAST(owner_user_id AS TEXT) = ?
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 500
    `).bind(String(ownerUserId)).all();

    return result.results || [];
  }

  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
    FROM cards
    WHERE ${ownerWhere()}
    ORDER BY owner_user_id ASC, updated_at DESC, created_at DESC
    LIMIT 500
  `).all();

  return result.results || [];
}

function groupCardsByOwner(cards) {
  return cards.reduce((groups, card) => {
    const owner = card.ownerUserId || 'unknown';

    if (!groups[owner]) {
      groups[owner] = [];
    }

    groups[owner].push(card);
    return groups;
  }, {});
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

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
      phase: '8.2',
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
      nextStep: 'Wire the Vault route to this endpoint only after choosing an owner strategy/auth boundary.',
    });
  } catch (error) {
    return errorResponse('Failed to read Vault cards.', 500, error.message);
  }
}
