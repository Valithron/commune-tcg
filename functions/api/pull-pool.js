/* ============================================================================
   API Pull Pool Endpoint
   Phase 10.1 responsibility: read-only diagnostics for pull-eligible Library
   cards. Performs no ticket spend, card grant, or pull history write.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { getRarityOddsPercentages, pullOptions } from '../_shared/pull-config.js';

const allowedRarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

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

function normalizeRarity(value) {
  const rarity = String(value || 'common').trim().toLowerCase();

  if (allowedRarities.includes(rarity)) {
    return rarity;
  }

  if (rarity.includes('myth')) return 'mythic';
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('uncommon')) return 'uncommon';
  if (rarity.includes('rare')) return 'rare';

  return 'common';
}

function imageUrlFromKey(key) {
  const imageKey = String(key || '').trim();

  if (!imageKey) {
    return '';
  }

  if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith('/')) {
    return imageKey;
  }

  return `/api/card-image?key=${encodeURIComponent(imageKey)}`;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCardRow(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};
  const imageKey = payload.image_key || payload.imageKey || payload.image_path || payload.art_key || payload.object_key || '';

  return {
    id: String(payload.id || row.id),
    sourceRowId: row.id,
    name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'),
    character: String(payload.character || payload.character_id || row.character_id || ''),
    characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
    type: String(payload.type || payload.card_type || payload.role || 'Type'),
    category: String(payload.category || payload.card_type || payload.type || 'Library'),
    rarity: normalizeRarity(payload.rarity || payload.tier),
    symbol: String(payload.symbol || payload.icon || '◆'),
    ability: String(payload.ability || payload.ability_text || payload.effect || ''),
    abilityIcon: String(payload.abilityIcon || payload.ability_icon || payload.icon || '✦'),
    stats: {
      pow: toNumber(payload.pow ?? stats.pow ?? stats.power ?? stats.attack, 1),
      def: toNumber(payload.def ?? stats.def ?? stats.defense ?? stats.health, 1),
      spd: toNumber(payload.spd ?? stats.spd ?? stats.speed ?? stats.agility, 1),
    },
    flavor: String(payload.flavor || payload.flavor_text || payload.description || 'A pull-eligible Library card.'),
    imageKey,
    imageUrl: imageUrlFromKey(imageKey),
    ownerUserId: row.owner_user_id || '',
    cardJsonValid: Boolean(parsed),
    source: payload.source || 'cards',
    sourceSubmissionId: payload.source_submission_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isPullEligibleRow(row) {
  return !String(row.owner_user_id || '').trim();
}

function summarizeByRarity(cards) {
  return allowedRarities.reduce((summary, rarity) => {
    summary[rarity] = cards.filter((card) => card.rarity === rarity).length;
    return summary;
  }, {});
}

function buildReadiness(cards, byRarity) {
  if (!cards.length) {
    return {
      status: 'no-pull-pool-cards',
      summary: 'No unowned Library cards are currently eligible for pulls.',
      nextStep: 'Approve at least one submission or seed unowned Library cards before pull simulation.',
    };
  }

  const missingRarities = allowedRarities.filter((rarity) => byRarity[rarity] === 0);

  if (missingRarities.length) {
    return {
      status: 'pool-ready-with-rarity-gaps',
      summary: 'Pull pool has cards, but one or more rarity buckets are empty.',
      nextStep: 'Phase 10.2 can simulate pulls with fallback behavior, or seed missing rarity buckets first.',
      missingRarities,
    };
  }

  return {
    status: 'ready-for-pull-simulation',
    summary: 'Pull pool has unowned Library cards across all configured rarity buckets.',
    nextStep: 'Build Phase 10.2 pull simulation without ticket spend or Vault grants.',
  };
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const result = await env.DB.prepare(`
      SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
      FROM cards
      LIMIT 500
    `).all();

    const rows = result.results || [];
    const allCards = rows.map(normalizeCardRow);
    const pullEligibleCards = rows
      .filter(isPullEligibleRow)
      .map(normalizeCardRow)
      .filter((card) => card.cardJsonValid);
    const ownedRowsExcluded = rows.length - rows.filter(isPullEligibleRow).length;
    const invalidRowsExcluded = rows.filter(isPullEligibleRow).map(normalizeCardRow).filter((card) => !card.cardJsonValid).length;
    const byRarity = summarizeByRarity(pullEligibleCards);

    return jsonResponse({
      ok: true,
      source: 'D1 cards read-only pull pool',
      phase: '10.1',
      readOnly: true,
      pullOptions,
      rarityOdds: getRarityOddsPercentages(),
      totalCardsScanned: rows.length,
      eligibleCount: pullEligibleCards.length,
      ownedRowsExcluded,
      invalidRowsExcluded,
      approvedSubmissionCount: pullEligibleCards.filter((card) => card.source === 'card_submissions').length,
      byRarity,
      cards: pullEligibleCards,
      sampleExcludedOwnedCards: allCards.filter((card) => card.ownerUserId).slice(0, 10),
      readiness: buildReadiness(pullEligibleCards, byRarity),
      pullResultContract: {
        mode: 'future-write-enabled',
        inputs: ['count', 'activeUserId'],
        validates: ['ticket balance', 'pull count', 'eligible pool', 'rarity odds'],
        writes: ['ticket debit', 'owned card grant', 'pull_history row'],
        deferredUntil: 'Phase 10.3',
      },
      notes: [
        'This endpoint performs no writes.',
        'Pull eligibility currently means cards.owner_user_id is empty and card_json parses cleanly.',
        'Approved submissions are included after approval inserts an unowned cards row.',
        'Owned Vault cards are excluded from the pull pool.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read pull pool.', 500, error.message);
  }
}
