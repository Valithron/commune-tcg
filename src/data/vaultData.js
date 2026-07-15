/* ============================================================================
   Vault Data Source
   Phase auth-current-user responsibility: centralize signed-in Vault loading for
   list and detail routes, with mock fallback only when backend read fails.
   ============================================================================ */

import { ownedCards } from './mockCards.js';
import { getCachedAuthUser } from '../services/authClient.js';
import { fetchJson, getApiRoutes } from '../services/apiClient.js';

export const temporaryVaultOwner = 'sterling';

let vaultCache = null;
let vaultCacheOwner = '';

function currentOwner() {
  const user = getCachedAuthUser();
  return {
    id: user?.id || temporaryVaultOwner,
    displayName: user?.displayName || user?.username || 'User',
  };
}

function slugify(value) {
  return String(value || 'card')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'card';
}

function normalizeBool(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'on'].includes(text);
}

function readCardImageIdentity(card) {
  return card?.imageKey
    || card?.image_key
    || card?.imageUrl
    || card?.image_url
    || card?.image_path
    || card?.image
    || card?.art_key
    || card?.object_key
    || card?.r2_key
    || '';
}

function resolveDuplicateGroupKey(card) {
  return card?.duplicateGroupKey
    || card?.duplicate_group_key
    || (card?.templateId ? `template:${slugify(card.templateId)}` : '')
    || (card?.template_id ? `template:${slugify(card.template_id)}` : '')
    || (card?.sourceCardId ? `source-card:${slugify(card.sourceCardId)}` : '')
    || (card?.source_card_id ? `source-card:${slugify(card.source_card_id)}` : '')
    || (card?.sourcePoolCardId ? `source-pool:${slugify(card.sourcePoolCardId)}` : '')
    || (card?.source_pool_card_id ? `source-pool:${slugify(card.source_pool_card_id)}` : '')
    || (card?.sourceSubmissionId ? `submission:${slugify(card.sourceSubmissionId)}` : '')
    || (card?.source_submission_id ? `submission:${slugify(card.source_submission_id)}` : '')
    || `fingerprint:${slugify(card?.character || card?.characterId || card?.character_id)}:${slugify(card?.name || card?.title)}:${slugify(card?.rarity)}:${slugify(readCardImageIdentity(card))}`;
}

function isSpecialDuplicateCopy(card) {
  const copyTraits = card?.copyTraits || card?.copy_traits || {};
  const progression = card?.progression || {};
  const specialValues = [
    card?.locked,
    card?.isLocked,
    card?.is_locked,
    card?.favorite,
    card?.favorited,
    card?.isFavorite,
    card?.is_favorite,
    card?.foil,
    card?.holo,
    card?.holographic,
    card?.mint,
    card?.specialTreatment,
    card?.special_treatment,
    copyTraits?.locked,
    copyTraits?.favorite,
    copyTraits?.favorited,
    copyTraits?.foil,
    copyTraits?.holo,
    copyTraits?.holographic,
    copyTraits?.mint,
    progression?.locked,
    progression?.favorite,
    progression?.favorited,
  ];

  return Number(card?.level || 1) > 1 || Number(card?.xp || 0) > 0 || specialValues.some(normalizeBool);
}

function groupVaultDuplicateCopies(cards = []) {
  const groups = new Map();

  cards.forEach((card, index) => {
    const ownerId = card?.ownerUserId || card?.owner_user_id || currentOwner().id || 'unknown';
    const duplicateGroupKey = resolveDuplicateGroupKey(card);
    const groupKey = `${ownerId}::${duplicateGroupKey}`;

    if (!groups.has(groupKey)) groups.set(groupKey, { firstIndex: index, cards: [] });
    groups.get(groupKey).cards.push({ ...card, duplicateGroupKey, duplicateSpecial: card?.duplicateSpecial ?? isSpecialDuplicateCopy(card), __vaultOriginalIndex: index });
  });

  return Array.from(groups.values())
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .flatMap((group) => group.cards
      .sort((a, b) => {
        const specialDelta = Number(a.duplicateSpecial) - Number(b.duplicateSpecial);
        if (specialDelta) return specialDelta;
        return a.__vaultOriginalIndex - b.__vaultOriginalIndex;
      })
      .map((card, index) => {
        const { __vaultOriginalIndex, ...cleanCard } = card;
        return {
          ...cleanCard,
          duplicateGroupCount: group.cards.length,
          duplicateGroupIndex: index + 1,
        };
      }));
}

function mockVault(errorMessage = '') {
  const owner = currentOwner();
  return {
    cards: groupVaultDuplicateCopies(ownedCards),
    source: 'mock',
    selectedOwnerUserId: owner.id,
    ownerDisplayName: owner.displayName,
    warnings: errorMessage ? [errorMessage] : ['Using local mock owned cards.'],
  };
}

function getCardLookupKeys(card) {
  return [
    card?.id,
    card?.ownedCardId,
    card?.owned_card_id,
    card?.sourceRowId,
    card?.source_row_id,
  ].filter((value) => value !== undefined && value !== null && value !== '').map(String);
}

function mergeAuthoritativeBattleStats(vaultCards = [], battleInventory = null) {
  const battleCards = Array.isArray(battleInventory?.battleEligibleCards)
    ? battleInventory.battleEligibleCards
    : [];
  if (!battleCards.length) return vaultCards;

  const battleLookup = new Map();
  for (const battleCard of battleCards) {
    for (const key of getCardLookupKeys(battleCard)) battleLookup.set(key, battleCard);
  }

  return vaultCards.map((vaultCard) => {
    const battleCard = getCardLookupKeys(vaultCard)
      .map((key) => battleLookup.get(key))
      .find(Boolean);
    if (!battleCard) return vaultCard;

    const effectiveStats = battleCard.effectiveStats
      || battleCard.effective_stats
      || battleCard.stats;
    if (!effectiveStats) return vaultCard;

    return {
      ...vaultCard,
      stats: {
        pow: Number(effectiveStats.pow ?? effectiveStats.atk ?? vaultCard.stats?.pow ?? 0),
        def: Number(effectiveStats.def ?? vaultCard.stats?.def ?? 0),
        spd: Number(effectiveStats.spd ?? vaultCard.stats?.spd ?? 0),
      },
      effectiveStats,
      effective_stats: effectiveStats,
      battlePower: Number(battleCard.battlePower || 0),
      battlePowerSource: battleCard.battlePowerSource || 'effective_stats',
      level: Number(battleCard.level ?? vaultCard.level ?? 1),
      xp: Number(battleCard.xp ?? vaultCard.xp ?? 0),
      copies: Number(battleCard.copies ?? vaultCard.copies ?? 1),
    };
  });
}

export function clearVaultCache() {
  vaultCache = null;
  vaultCacheOwner = '';
}

export function getVaultSourceLabel(vault) {
  return vault.source === 'backend' ? 'Live Vault · ' + (vault.ownerDisplayName || vault.selectedOwnerUserId || 'User') : 'Mock Vault fallback';
}

export async function loadVaultCards({ force = false } = {}) {
  const owner = currentOwner();
  if (vaultCache && !force && vaultCacheOwner === owner.id) {
    return vaultCache;
  }

  try {
    const routes = getApiRoutes();
    const [payload, battleInventory] = await Promise.all([
      fetchJson(routes.vault, { cache: 'no-store' }),
      fetchJson(`${routes.battleInventory}?_=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
    ]);

    if (!payload?.ok || !Array.isArray(payload.cards)) {
      vaultCache = mockVault(payload?.warnings?.join(' ') || 'No backend Vault cards were returned.');
      vaultCacheOwner = owner.id;
      return vaultCache;
    }

    const cardsWithAuthoritativeStats = mergeAuthoritativeBattleStats(payload.cards, battleInventory);
    vaultCache = {
      cards: groupVaultDuplicateCopies(cardsWithAuthoritativeStats),
      source: 'backend',
      selectedOwnerUserId: payload.selectedOwnerUserId || owner.id,
      ownerDisplayName: payload.ownerDisplayName || owner.displayName,
      ownerUserIds: payload.ownerUserIds || [],
      duplicateGrouping: payload.duplicateGrouping || { enabled: true },
      duplicateGroups: payload.duplicateGroups || [],
      warnings: payload.warnings || [],
    };
    vaultCacheOwner = owner.id;

    return vaultCache;
  } catch (error) {
    vaultCache = mockVault(error.message);
    vaultCacheOwner = owner.id;
    return vaultCache;
  }
}

export async function findVaultCardById(cardId, { force = true } = {}) {
  const vault = await loadVaultCards({ force });
  const lookupId = String(cardId || '');
  const card = vault.cards.find((candidate) => getCardLookupKeys(candidate).includes(lookupId)) || null;

  return {
    ...vault,
    card,
  };
}
