/* ============================================================================
   API Battle Inventory Endpoint
   Battle Phase 10F.1 responsibility: read-only battle diagnostics plus normalized
   card image fields for player-facing battle selection UI. Performs no writes.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';

const defaultOwnerUserId = 'sterling';
const defaultOwnerDisplayName = 'Sterling';
const squadSize = 3;

const imageColumns = ['image_key', 'imageKey', 'image_path', 'image', 'image_url', 'art_url', 'art_key', 'object_key', 'r2_key'];

const candidateBattleTables = [
  'battle_history',
  'battles',
  'encounters',
  'enemies',
  'enemy_cards',
  'battle_encounters',
  'battle_rewards',
  'user_squads',
  'squads',
];

const mockEncounters = [
  {
    id: 'training-yard-goblin',
    name: 'Training Yard Goblin',
    difficulty: 'Easy',
    element: 'Starter',
    enemyPower: 18,
    staminaCost: 4,
    rewardGold: 120,
    rewardXp: 35,
    description: 'A safe first fight used to test squad readiness and reward pacing.',
  },
  {
    id: 'calendar-hydra',
    name: 'Calendar Hydra',
    difficulty: 'Medium',
    element: 'Pressure',
    enemyPower: 28,
    staminaCost: 7,
    rewardGold: 260,
    rewardXp: 80,
    description: 'A many-headed scheduling beast. Good for testing higher reward framing.',
  },
  {
    id: 'storm-forge-wyrm',
    name: 'Storm Forge Wyrm',
    difficulty: 'Hard',
    element: 'Boss',
    enemyPower: 42,
    staminaCost: 10,
    rewardGold: 520,
    rewardXp: 150,
    description: 'A boss-style prototype encounter for future animation and loot tables.',
  },
];

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

function readValue(row, candidates, fallback = '') {
  for (const key of candidates) {
    if (key && row?.[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }

  return fallback;
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
  const imageValue = String(readValue(payload, imageColumns, ''));

  return {
    parsed,
    payload,
    stats,
    normalized: {
      id: String(payload.id || row.id),
      sourceRowId: row.id,
      ownerUserId: String(row.owner_user_id || ''),
      characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
      name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'),
      rarity: normalizeRarity(payload.rarity || payload.tier),
      category: String(payload.category || payload.card_type || payload.type || 'Vault'),
      type: String(payload.type || payload.card_type || payload.role || 'Type'),
      level: toNumber(payload.level ?? payload.card_level ?? payload.cardLevel, 1),
      xp: toNumber(payload.xp ?? payload.experience ?? payload.experience_points ?? payload.experiencePoints, 0),
      copies: toNumber(payload.copies ?? payload.copy_count ?? payload.copyCount ?? payload.quantity, 1),
      imageKey: isLikelyUrl(imageValue) ? '' : imageValue,
      imageUrl: imageUrlFromValue(imageValue),
      stats: {
        pow: toNumber(payload.pow ?? stats.pow ?? stats.power ?? stats.attack ?? stats.atk ?? stats.strength, 1),
        def: toNumber(payload.def ?? stats.def ?? stats.defense ?? stats.health ?? stats.hp, 1),
        spd: toNumber(payload.spd ?? stats.spd ?? stats.speed ?? stats.agility, 1),
      },
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    },
  };
}

function hasExplicitStat(payload, stats) {
  return [
    payload.pow,
    payload.power,
    payload.attack,
    payload.atk,
    payload.strength,
    payload.def,
    payload.defense,
    payload.health,
    payload.hp,
    payload.spd,
    payload.speed,
    payload.agility,
    stats.pow,
    stats.power,
    stats.attack,
    stats.atk,
    stats.strength,
    stats.def,
    stats.defense,
    stats.health,
    stats.hp,
    stats.spd,
    stats.speed,
    stats.agility,
  ].some((value) => value !== undefined && value !== null && value !== '');
}

function normalizeOwnedBattleCard(row) {
  const { parsed, payload, stats, normalized } = flattenCardPayload(row);
  const reasons = [];

  if (!parsed) {
    reasons.push('invalid-card-json');
  }

  const disabled = payload.canBattle === false || payload.battleEligible === false || payload.disabled === true;
  if (disabled) {
    reasons.push('explicitly-disabled');
  }

  const statValues = Object.values(normalized.stats);
  if (!statValues.every(Number.isFinite)) {
    reasons.push('invalid-normalized-stats');
  }

  const explicitStatsMapped = parsed ? hasExplicitStat(payload, stats) : false;
  const eligible = reasons.length === 0;

  return {
    ...normalized,
    eligible,
    reasons,
    explicitStatsMapped,
    battlePower: normalized.stats.pow + normalized.stats.def + normalized.stats.spd + normalized.level,
    eligibilityRule: 'owned by ownerUserId, parseable card_json, finite normalized POW/DEF/SPD, not explicitly disabled',
  };
}

function ownerWhere() {
  return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`;
}

async function readOwnedRows(env, ownerUserId) {
  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
    FROM cards
    WHERE ${ownerWhere()} AND CAST(owner_user_id AS TEXT) = ?
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 500
  `).bind(ownerUserId).all();

  return result.results || [];
}

async function readTableNames(env) {
  const result = await env.DB.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name ASC
  `).all();

  return (result.results || []).map((row) => String(row.name || '')).filter(Boolean);
}

async function readTableCount(env, tableName) {
  if (!candidateBattleTables.includes(tableName)) {
    return null;
  }

  const result = await env.DB.prepare(`SELECT COUNT(*) AS rowCount FROM ${tableName}`).first();
  return Number(result?.rowCount || 0);
}

async function readExistingBattleTables(env) {
  const tableNames = await readTableNames(env);
  const existingNames = candidateBattleTables.filter((tableName) => tableNames.includes(tableName));
  const tables = [];

  for (const tableName of existingNames) {
    tables.push({
      name: tableName,
      rowCount: await readTableCount(env, tableName),
    });
  }

  return {
    allTableNames: tableNames,
    candidateTableNames: candidateBattleTables,
    existingBattleTables: tables,
    missingBattleTables: candidateBattleTables.filter((tableName) => !tableNames.includes(tableName)),
  };
}

function buildReadiness({ battleEligibleCards, mockEncounterCount, existingBattleTables }) {
  if (!battleEligibleCards.length) {
    return {
      status: 'owned-cards-missing',
      summary: 'No Sterling-owned cards are currently battle-eligible.',
      nextStep: 'Pull or seed at least one owned card before battle simulation.',
    };
  }

  if (!mockEncounterCount && !existingBattleTables.some((table) => ['encounters', 'enemies', 'enemy_cards', 'battle_encounters'].includes(table.name))) {
    return {
      status: 'enemy-data-missing',
      summary: 'No mock encounters or backend enemy tables are available.',
      nextStep: 'Define encounter source data before battle simulation.',
    };
  }

  if (!existingBattleTables.some((table) => table.name === 'battle_history')) {
    return {
      status: 'ready-for-battle-simulation',
      summary: 'Owned cards and mock encounters are available. Write tables are not required until the real battle phase.',
      nextStep: 'Build a no-write battle simulation endpoint before creating battle_history or reward writes.',
    };
  }

  return {
    status: 'battle-contract-needs-decision',
    summary: 'Owned cards, encounter sources, and battle_history table signals are present, but write behavior is still intentionally deferred.',
    nextStep: 'Confirm the battle input/result/reward contracts before any write-enabled endpoint.',
  };
}

function summarizeSquadRules(cards) {
  const sortedCards = [...cards].sort((a, b) => b.battlePower - a.battlePower);

  return {
    expectedSquadSize: squadSize,
    minimumSquadSize: 1,
    duplicateCardsAllowed: false,
    defaultSelectionRule: 'highest battlePower cards first, capped at 3, until saved squads exist',
    proposedDefaultSquadCardIds: sortedCards.slice(0, squadSize).map((card) => card.id),
    proposedDefaultSquadPower: sortedCards.slice(0, squadSize).reduce((total, card) => total + card.battlePower, 0),
  };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || defaultOwnerUserId;

  try {
    const [ownedRows, tableInventory] = await Promise.all([
      readOwnedRows(env, ownerUserId),
      readExistingBattleTables(env),
    ]);

    const ownedCards = ownedRows.map(normalizeOwnedBattleCard);
    const battleEligibleCards = ownedCards.filter((card) => card.eligible);
    const ineligibleOwnedCards = ownedCards.filter((card) => !card.eligible);
    const readiness = buildReadiness({
      battleEligibleCards,
      mockEncounterCount: mockEncounters.length,
      existingBattleTables: tableInventory.existingBattleTables,
    });

    return jsonResponse({
      ok: true,
      phase: 'battle-1',
      readOnly: true,
      source: 'D1 cards plus frontend mock battle inventory',
      ownerUserId,
      ownerDisplayName: ownerUserId === defaultOwnerUserId ? defaultOwnerDisplayName : ownerUserId,
      ownedCardsScanned: ownedCards.length,
      battleEligibleCount: battleEligibleCards.length,
      ineligibleOwnedCount: ineligibleOwnedCards.length,
      battleEligibleCards,
      ineligibleOwnedCards,
      squadValidation: summarizeSquadRules(battleEligibleCards),
      enemySources: [
        {
          source: 'src/data/mockBattle.js',
          type: 'frontend-mock',
          status: 'present',
          recordCount: mockEncounters.length,
          enemyStatModel: 'single enemyPower value, not full enemy card stats',
        },
        {
          source: 'D1 backend battle/enemy tables',
          type: 'database',
          status: tableInventory.existingBattleTables.some((table) => ['encounters', 'enemies', 'enemy_cards', 'battle_encounters'].includes(table.name)) ? 'present' : 'not-created-yet',
          tables: tableInventory.existingBattleTables.filter((table) => ['encounters', 'enemies', 'enemy_cards', 'battle_encounters'].includes(table.name)),
        },
      ],
      encounterSources: [
        {
          source: 'src/data/mockBattle.js',
          status: 'active-frontend-source',
          encounters: mockEncounters,
        },
      ],
      currentMockBattleRoutes: [
        { route: '#/battle', file: 'src/routes/BattleHub.js', behavior: 'static entry point and mock readiness cards' },
        { route: '#/battle/encounters', file: 'src/routes/EncounterSelect.js', behavior: 'static mock encounter selection' },
        { route: '#/battle/squad', file: 'src/routes/SquadBuilder.js', behavior: 'locked mock squad review' },
        { route: '#/battle/results', file: 'src/routes/BattleResults.js', behavior: 'deterministic mock outcome and reward preview' },
      ],
      tableInventory,
      proposedBattleInputContract: {
        futureEndpoint: 'POST /api/battles',
        noWriteSimulationEndpoint: 'GET /api/battle-simulate or POST /api/battle-simulate',
        inputs: {
          ownerUserId: 'temporary until auth exists; defaults to sterling in diagnostics',
          encounterId: 'required string matching a known encounter',
          squadCardIds: 'array of 1 to 3 owned card row ids or normalized card ids',
        },
        validates: [
          'owner owns every selected card',
          'each selected card is battle-eligible',
          'squad size is between 1 and 3',
          'no duplicate card ids in one squad',
          'encounter id resolves to an available encounter',
          'future stamina or energy cost before write-enabled battle starts',
        ],
        writes: [],
        deferredWrites: ['battle_history', 'gold rewards', 'XP progression', 'level-ups', 'drop grants', 'stamina or energy debit'],
      },
      proposedBattleResultContract: {
        mode: 'read-only until Battle Phase 3',
        fields: [
          'battleId or simulationId',
          'ownerUserId',
          'encounter',
          'squad',
          'squadPower',
          'enemyPower',
          'victory',
          'combatLog',
          'rewardPreview',
          'xpPreview',
          'createdAt',
        ],
        deterministicPhase2Rule: 'compare normalized squad battlePower against encounter enemyPower before adding richer combat math',
      },
      proposedRewardContract: {
        writePhase: 'Battle Phase 5',
        rewardPreviewFields: ['gold', 'xpPerCard', 'totalXp', 'pullTickets', 'drops'],
        cardProgressionPreviewFields: ['cardId', 'previousXp', 'gainedXp', 'nextXp', 'previousLevel', 'nextLevel'],
        deferredTablesOrRows: ['user_resources.gold', 'cards.card_json xp/level fields', 'battle_history.result_json'],
      },
      readiness,
      notes: [
        'This endpoint performs no writes.',
        'Battle eligibility currently uses Sterling-owned Vault cards from cards.owner_user_id.',
        'Enemy and encounter data are still frontend mock data unless D1 battle/enemy tables are created later.',
        'No rewards, XP, level-ups, battle_history, currency, stamina, Vault, auth, or animation changes are performed by this endpoint.',
      ],
    });
  } catch (error) {
    return errorResponse('Failed to read battle inventory.', 500, error.message);
  }
}
