/* ============================================================================
   Battle Engine Shared Utilities
   Battle Phase 3 responsibility: shared simulation and battle_history helpers.
   Reward, XP, currency, stamina, Vault, card progression, and auth writes are deferred.
   ============================================================================ */

export const temporaryBattleUserId = 'sterling';
export const temporaryBattleUserDisplayName = 'Sterling';
export const maxBattleSquadSize = 3;

export const mockBattleEncounters = [
  {
    id: 'training-yard-goblin',
    name: 'Training Yard Goblin',
    difficulty: 'Easy',
    element: 'Starter',
    enemyPower: 86,
    staminaCost: 4,
    rewardGold: 120,
    rewardXp: 35,
    description: 'A safe first fight tuned for a full starter squad under the current stat budget system.',
  },
  {
    id: 'calendar-hydra',
    name: 'Calendar Hydra',
    difficulty: 'Medium',
    element: 'Pressure',
    enemyPower: 132,
    staminaCost: 7,
    rewardGold: 260,
    rewardXp: 80,
    description: 'A mid-tier pressure fight tuned for upgraded commons, uncommons, or mixed-rarity squads.',
  },
  {
    id: 'storm-forge-wyrm',
    name: 'Storm Forge Wyrm',
    difficulty: 'Hard',
    element: 'Boss',
    enemyPower: 205,
    staminaCost: 10,
    rewardGold: 520,
    rewardXp: 150,
    description: 'A boss-style prototype tuned for rare-heavy squads under the current stat budget system.',
  },
];

const battleHistorySql = `
  CREATE TABLE IF NOT EXISTS battle_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    encounter_id TEXT NOT NULL,
    victory INTEGER NOT NULL,
    squad_power INTEGER NOT NULL,
    enemy_power INTEGER NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

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

function flattenCardPayload(row) {
  const parsed = safeParseJson(row.card_json);
  const payload = parsed?.card || parsed?.data || parsed || {};
  const stats = payload.stats || payload.statBlock || {};

  return {
    parsed,
    payload,
    stats,
    normalized: {
      id: String(payload.id || row.id),
      sourceRowId: String(row.id),
      ownerUserId: String(row.owner_user_id || ''),
      characterId: String(payload.character_id || payload.characterId || payload.character || row.character_id || ''),
      name: String(payload.name || payload.card_name || payload.title || 'Unnamed Card'),
      rarity: normalizeRarity(payload.rarity || payload.tier),
      category: String(payload.category || payload.card_type || payload.type || 'Vault'),
      type: String(payload.type || payload.card_type || payload.role || 'Type'),
      level: toNumber(payload.level ?? payload.card_level ?? payload.cardLevel, 1),
      xp: toNumber(payload.xp ?? payload.experience ?? payload.experience_points ?? payload.experiencePoints, 0),
      copies: toNumber(payload.copies ?? payload.copy_count ?? payload.copyCount ?? payload.quantity, 1),
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

export function normalizeOwnedBattleCard(row) {
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

  return {
    ...normalized,
    eligible: reasons.length === 0,
    reasons,
    explicitStatsMapped: parsed ? hasExplicitStat(payload, stats) : false,
    battlePower: normalized.stats.pow + normalized.stats.def + normalized.stats.spd + normalized.level,
  };
}

function ownerWhere() {
  return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`;
}

export async function readOwnedBattleRows(env, ownerUserId) {
  const result = await env.DB.prepare(`
    SELECT id, owner_user_id, character_id, card_json, created_at, updated_at
    FROM cards
    WHERE ${ownerWhere()} AND CAST(owner_user_id AS TEXT) = ?
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 500
  `).bind(ownerUserId).all();

  return result.results || [];
}

export function getBattleEncounterById(encounterId) {
  return mockBattleEncounters.find((encounter) => encounter.id === encounterId) || null;
}

export function parseSquadCardIds(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function buildCardLookup(cards) {
  return cards.reduce((lookup, card) => {
    lookup.set(card.id, card);
    lookup.set(card.sourceRowId, card);
    return lookup;
  }, new Map());
}

function selectDefaultSquad(cards) {
  return [...cards]
    .filter((card) => card.eligible)
    .sort((a, b) => b.battlePower - a.battlePower)
    .slice(0, maxBattleSquadSize);
}

function selectRequestedSquad(cards, requestedIds) {
  const lookup = buildCardLookup(cards);
  return requestedIds.map((cardId) => ({
    requestedId: cardId,
    card: lookup.get(cardId) || null,
  }));
}

function buildValidation({ encounter, requestedIds, selectedEntries, squad }) {
  const errors = [];
  const warnings = [];
  const duplicateIds = requestedIds.filter((id, index) => requestedIds.indexOf(id) !== index);
  const missingIds = selectedEntries.filter((entry) => !entry.card).map((entry) => entry.requestedId);
  const ineligibleCards = selectedEntries.filter((entry) => entry.card && !entry.card.eligible).map((entry) => ({
    requestedId: entry.requestedId,
    cardId: entry.card.id,
    reasons: entry.card.reasons,
  }));

  if (!encounter) {
    errors.push('encounter-not-found');
  }

  if (requestedIds.length > maxBattleSquadSize) {
    errors.push('squad-too-large');
  }

  if (duplicateIds.length) {
    errors.push('duplicate-card-ids');
  }

  if (missingIds.length) {
    errors.push('squad-card-not-owned-by-owner');
  }

  if (ineligibleCards.length) {
    errors.push('squad-card-ineligible');
  }

  if (!squad.length) {
    errors.push('empty-squad');
  }

  if (squad.length < maxBattleSquadSize) {
    warnings.push('squad-has-open-slots');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    duplicateIds,
    missingIds,
    ineligibleCards,
    expectedSquadSize: maxBattleSquadSize,
    selectedSquadSize: squad.length,
  };
}

function sanitizeForId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

function buildSimulationId(ownerUserId, encounterId, squad) {
  const squadKey = squad.map((card) => sanitizeForId(card.sourceRowId || card.id)).join('-') || 'no-squad';
  return `sim-${sanitizeForId(ownerUserId)}-${sanitizeForId(encounterId)}-${squadKey}`;
}

function buildId(prefix) {
  return prefix + '_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8);
}

function buildRewardPreview(encounter, victory, squad) {
  const gold = victory ? encounter.rewardGold : Math.floor(encounter.rewardGold * 0.25);
  const totalXp = victory ? encounter.rewardXp : Math.floor(encounter.rewardXp * 0.35);
  const xpPerCard = squad.length ? Math.floor(totalXp / squad.length) : 0;

  return {
    gold,
    totalXp,
    xpPerCard,
    pullTickets: 0,
    drops: [],
    rewardRule: victory ? 'full mock encounter reward preview' : 'partial mock encounter consolation preview',
    writes: [],
  };
}

function buildXpPreview(squad, xpPerCard) {
  return squad.map((card) => ({
    cardId: card.id,
    sourceRowId: card.sourceRowId,
    cardTitle: card.name,
    previousLevel: card.level,
    previousXp: card.xp,
    gainedXp: xpPerCard,
    nextXpPreview: card.xp + xpPerCard,
    nextLevelPreview: card.level,
    levelPreviewStatus: 'deferred-until-reward-xp-contract',
    writes: [],
  }));
}

function buildCombatLog({ encounter, squad, squadPower, enemyPower, victory, margin }) {
  const leader = squad[0]?.name || 'Selected squad';

  return [
    `${leader} leads ${squad.length} card(s) into ${encounter.name}.`,
    `Squad power resolves to ${squadPower}.`,
    `${encounter.name} answers with ${encounter.element} pressure at enemy power ${enemyPower}.`,
    victory
      ? `The squad wins the battle contract by ${margin} power.`
      : `The squad falls short in the battle contract by ${Math.abs(margin)} power.`,
    'Battle history may be written only by POST /api/battles. Rewards, XP, currency, stamina, and Vault data are not written.',
  ];
}

function buildSimulation({ ownerUserId, encounter, squad, createdAt }) {
  const squadPower = squad.reduce((total, card) => total + card.battlePower, 0);
  const enemyPower = encounter.enemyPower;
  const margin = squadPower - enemyPower;
  const victory = margin >= 0;
  const rewardPreview = buildRewardPreview(encounter, victory, squad);

  return {
    simulationId: buildSimulationId(ownerUserId, encounter.id, squad),
    ownerUserId,
    ownerDisplayName: ownerUserId === temporaryBattleUserId ? temporaryBattleUserDisplayName : ownerUserId,
    encounter,
    squad,
    squadPower,
    enemyPower,
    margin,
    victory,
    rewardPreview,
    xpPreview: buildXpPreview(squad, rewardPreview.xpPerCard),
    combatLog: buildCombatLog({ encounter, squad, squadPower, enemyPower, victory, margin }),
    resultRule: 'deterministic comparison of normalized squad battlePower against mock encounter enemyPower',
    createdAt,
    writes: [],
  };
}

export async function resolveBattleSimulation(env, {
  ownerUserId = temporaryBattleUserId,
  encounterId = mockBattleEncounters[0].id,
  squadCardIds = [],
  createdAt = new Date().toISOString(),
} = {}) {
  const requestedIds = parseSquadCardIds(squadCardIds);
  const rows = await readOwnedBattleRows(env, ownerUserId);
  const ownedCards = rows.map(normalizeOwnedBattleCard);
  const eligibleCards = ownedCards.filter((card) => card.eligible);
  const encounter = getBattleEncounterById(encounterId);
  const selectedEntries = requestedIds.length ? selectRequestedSquad(ownedCards, requestedIds) : [];
  const squad = requestedIds.length
    ? selectedEntries.map((entry) => entry.card).filter((card) => card?.eligible)
    : selectDefaultSquad(eligibleCards);
  const validation = buildValidation({ encounter, requestedIds, selectedEntries, squad });

  if (!validation.ok) {
    return {
      ok: false,
      status: 400,
      phase: 'battle-2',
      readOnly: true,
      error: 'Battle simulation validation failed.',
      ownerUserId,
      encounterId,
      requestedSquadCardIds: requestedIds,
      ownedCardsScanned: ownedCards.length,
      battleEligibleCount: eligibleCards.length,
      validation,
      writes: [],
      notes: [
        'This endpoint performs no writes even when validation fails.',
        'Use /api/battle-inventory to inspect eligible card ids before supplying squadCardIds.',
      ],
    };
  }

  return {
    ok: true,
    status: 200,
    phase: 'battle-2',
    readOnly: true,
    source: 'D1 owned Vault cards plus frontend mock encounter contract',
    requested: {
      ownerUserId,
      encounterId,
      squadCardIds: requestedIds,
    },
    ownedCardsScanned: ownedCards.length,
    battleEligibleCount: eligibleCards.length,
    defaultSquadUsed: requestedIds.length === 0,
    validation,
    simulation: buildSimulation({ ownerUserId, encounter, squad, createdAt }),
    availableEncounters: mockBattleEncounters.map((mockEncounter) => ({
      id: mockEncounter.id,
      name: mockEncounter.name,
      enemyPower: mockEncounter.enemyPower,
      difficulty: mockEncounter.difficulty,
    })),
    guardrails: [
      'No battle_history write in simulation mode.',
      'No reward write.',
      'No XP or level write.',
      'No currency write.',
      'No stamina or energy write.',
      'No Vault write.',
      'No auth change.',
    ],
    nextStep: 'POST /api/battles may write battle_history only after simulation validation passes.',
  };
}

async function tableExists(env, tableName) {
  const row = await env.DB.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = ?
    LIMIT 1
  `).bind(tableName).first();

  return Boolean(row);
}

export async function ensureBattleHistorySchema(env) {
  await env.DB.prepare(battleHistorySql).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_battle_history_user_created ON battle_history (user_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_battle_history_encounter_created ON battle_history (encounter_id, created_at)').run();
}

export async function writeBattleHistory(env, simulationResult, { now = new Date().toISOString() } = {}) {
  const battleId = buildId('battle');
  const simulation = {
    ...simulationResult.simulation,
    battleId,
    createdAt: now,
    writes: ['battle_history'],
  };
  const resultJson = JSON.stringify({
    battleId,
    phase: 'battle-3',
    ownerUserId: simulation.ownerUserId,
    ownerDisplayName: simulation.ownerDisplayName,
    encounterId: simulation.encounter.id,
    encounterName: simulation.encounter.name,
    victory: simulation.victory,
    squadPower: simulation.squadPower,
    enemyPower: simulation.enemyPower,
    margin: simulation.margin,
    squad: simulation.squad.map((card) => ({
      cardId: card.id,
      sourceRowId: card.sourceRowId,
      cardTitle: card.name,
      rarity: card.rarity,
      level: card.level,
      battlePower: card.battlePower,
      stats: card.stats,
    })),
    rewardPreview: simulation.rewardPreview,
    xpPreview: simulation.xpPreview,
    combatLog: simulation.combatLog,
    resultRule: simulation.resultRule,
    writes: ['battle_history'],
    deferredWrites: ['rewards', 'XP', 'level-ups', 'currency', 'stamina', 'energy', 'Vault changes'],
    createdAt: now,
  });

  await ensureBattleHistorySchema(env);
  await env.DB.prepare(`
    INSERT INTO battle_history (id, user_id, encounter_id, victory, squad_power, enemy_power, result_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    battleId,
    simulation.ownerUserId,
    simulation.encounter.id,
    simulation.victory ? 1 : 0,
    simulation.squadPower,
    simulation.enemyPower,
    resultJson,
    now
  ).run();

  return {
    battleId,
    historyRow: {
      id: battleId,
      userId: simulation.ownerUserId,
      encounterId: simulation.encounter.id,
      victory: simulation.victory,
      squadPower: simulation.squadPower,
      enemyPower: simulation.enemyPower,
      createdAt: now,
    },
    resultJson,
    simulation,
  };
}

export async function readBattleHistory(env, { ownerUserId = temporaryBattleUserId, limit = 20 } = {}) {
  const exists = await tableExists(env, 'battle_history');

  if (!exists) {
    return {
      tableExists: false,
      totalReturned: 0,
      battles: [],
    };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const result = await env.DB.prepare(`
    SELECT id, user_id AS userId, encounter_id AS encounterId, victory, squad_power AS squadPower, enemy_power AS enemyPower, result_json AS resultJson, created_at AS createdAt
    FROM battle_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(ownerUserId, safeLimit).all();

  const battles = (result.results || []).map((row) => {
    let parsedResult = null;

    try {
      parsedResult = JSON.parse(row.resultJson || 'null');
    } catch {
      parsedResult = null;
    }

    return {
      id: row.id,
      userId: row.userId,
      ownerUserId: row.userId,
      ownerDisplayName: row.userId === temporaryBattleUserId ? temporaryBattleUserDisplayName : row.userId,
      encounterId: row.encounterId,
      encounterName: parsedResult?.encounterName || row.encounterId,
      victory: Boolean(row.victory),
      squadPower: Number(row.squadPower),
      enemyPower: Number(row.enemyPower),
      margin: parsedResult?.margin ?? Number(row.squadPower) - Number(row.enemyPower),
      squad: parsedResult?.squad || [],
      rewardPreview: parsedResult?.rewardPreview || null,
      xpPreview: parsedResult?.xpPreview || [],
      combatLog: parsedResult?.combatLog || [],
      writes: parsedResult?.writes || ['battle_history'],
      deferredWrites: parsedResult?.deferredWrites || ['rewards', 'XP', 'level-ups', 'currency', 'stamina', 'energy', 'Vault changes'],
      createdAt: row.createdAt,
      resultHydrated: Boolean(parsedResult),
    };
  });

  return {
    tableExists: true,
    totalReturned: battles.length,
    battles,
  };
}
