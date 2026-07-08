/* ============================================================================
   API Battle Inventory Endpoint
   Phase 6 responsibility: read-only battle diagnostics using the shared battle
   card normalizer so inventory, simulation, and reward writes agree on effective
   stats and base battle power.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, normalizeOwnedBattleCard } from '../_shared/battle-engine.js';

const defaultOwnerUserId = 'sterling';
const defaultOwnerDisplayName = 'Sterling';
const squadSize = 3;

const candidateBattleTables = ['battle_history', 'battles', 'encounters', 'enemies', 'enemy_cards', 'battle_encounters', 'battle_rewards', 'user_squads', 'squads'];

function ownerWhere() { return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`; }

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
  const result = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name ASC`).all();
  return (result.results || []).map((row) => String(row.name || '')).filter(Boolean);
}

async function readTableCount(env, tableName) {
  if (!candidateBattleTables.includes(tableName)) return null;
  const result = await env.DB.prepare(`SELECT COUNT(*) AS rowCount FROM ${tableName}`).first();
  return Number(result?.rowCount || 0);
}

async function readExistingBattleTables(env) {
  const tableNames = await readTableNames(env);
  const existingNames = candidateBattleTables.filter((tableName) => tableNames.includes(tableName));
  const tables = [];
  for (const tableName of existingNames) tables.push({ name: tableName, rowCount: await readTableCount(env, tableName) });
  return { allTableNames: tableNames, candidateTableNames: candidateBattleTables, existingBattleTables: tables, missingBattleTables: candidateBattleTables.filter((tableName) => !tableNames.includes(tableName)) };
}

function buildReadiness({ battleEligibleCards, mockEncounterCount, existingBattleTables }) {
  if (!battleEligibleCards.length) return { status: 'owned-cards-missing', summary: 'No Sterling-owned cards are currently battle-eligible.', nextStep: 'Pull or seed at least one owned card before battle simulation.' };
  if (!mockEncounterCount && !existingBattleTables.some((table) => ['encounters', 'enemies', 'enemy_cards', 'battle_encounters'].includes(table.name))) return { status: 'enemy-data-missing', summary: 'No mock encounters or backend enemy tables are available.', nextStep: 'Define encounter source data before battle simulation.' };
  return { status: 'ready-for-phase-6-battle', summary: 'Owned cards and typed mock encounters are available. Battle simulation uses effective stats and type matchup modifiers.', nextStep: 'Run a battle and verify preview power matches settlement power.' };
}

function summarizeSquadRules(cards) {
  const sortedCards = [...cards].sort((a, b) => Number(b.baseBattlePower || b.battlePower || 0) - Number(a.baseBattlePower || a.battlePower || 0));
  return { expectedSquadSize: squadSize, minimumSquadSize: 1, duplicateCardsAllowed: false, defaultSelectionRule: 'highest baseBattlePower cards first, capped at 3, until saved squads exist', proposedDefaultSquadCardIds: sortedCards.slice(0, squadSize).map((card) => card.id), proposedDefaultSquadPower: sortedCards.slice(0, squadSize).reduce((total, card) => total + Number(card.baseBattlePower || card.battlePower || 0), 0) };
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const url = new URL(request.url);
  const ownerUserId = url.searchParams.get('ownerUserId') || defaultOwnerUserId;

  try {
    const [ownedRows, tableInventory] = await Promise.all([readOwnedRows(env, ownerUserId), readExistingBattleTables(env)]);
    const ownedCards = ownedRows.map(normalizeOwnedBattleCard);
    const battleEligibleCards = ownedCards.filter((card) => card.eligible);
    const ineligibleOwnedCards = ownedCards.filter((card) => !card.eligible);
    const readiness = buildReadiness({ battleEligibleCards, mockEncounterCount: mockBattleEncounters.length, existingBattleTables: tableInventory.existingBattleTables });

    return jsonResponse({
      ok: true,
      phase: 'battle-6',
      readOnly: true,
      source: 'D1 cards plus shared Phase 6 battle normalizer',
      ownerUserId,
      ownerDisplayName: ownerUserId === defaultOwnerUserId ? defaultOwnerDisplayName : ownerUserId,
      ownedCardsScanned: ownedCards.length,
      battleEligibleCount: battleEligibleCards.length,
      ineligibleOwnedCount: ineligibleOwnedCards.length,
      battleEligibleCards,
      ineligibleOwnedCards,
      squadValidation: summarizeSquadRules(battleEligibleCards),
      enemySources: [{ source: 'functions/_shared/battle-engine.js', type: 'shared-mock', status: 'present', recordCount: mockBattleEncounters.length, enemyStatModel: 'enemyPower plus enemyType for Phase 6 type matchups' }],
      encounterSources: [{ source: 'functions/_shared/battle-engine.js', status: 'active-shared-source', encounters: mockBattleEncounters }],
      currentMockBattleRoutes: [
        { route: '#/battle', file: 'src/routes/BattleHub.js', behavior: 'static entry point and mock readiness cards' },
        { route: '#/battle/encounters', file: 'src/routes/EncounterSelect.js', behavior: 'typed mock encounter selection' },
        { route: '#/battle/squad', file: 'src/routes/SquadBuilder.js', behavior: 'backend-owned squad review' },
        { route: '#/battle/results', file: 'src/routes/BattleResults.js', behavior: 'Phase 6 effective stat and matchup preview plus reward reveal' },
      ],
      tableInventory,
      proposedBattleInputContract: {
        futureEndpoint: 'POST /api/battles',
        noWriteSimulationEndpoint: 'POST /api/battle-simulate',
        inputs: { ownerUserId: 'temporary until auth exists; defaults to sterling in diagnostics', encounterId: 'required string matching a known encounter', squadCardIds: 'array of 1 to 3 owned card row ids or normalized card ids' },
        validates: ['owner owns every selected card', 'each selected card is battle-eligible', 'squad size is between 1 and 3', 'no duplicate card ids in one squad', 'encounter id resolves to an available encounter', 'future stamina or energy cost before write-enabled battle starts'],
        writes: [],
        deferredWrites: ['drop grants', 'stamina or energy debit'],
      },
      proposedBattleResultContract: { mode: 'Phase 6 preview plus Phase 8 reward write', fields: ['battleId or simulationId', 'ownerUserId', 'encounter', 'squad', 'effectiveStats', 'baseBattlePower', 'type matchup', 'adjusted battlePower', 'enemyType', 'squadPower', 'enemyPower', 'victory', 'combatLog', 'rewardPreview', 'xpPreview', 'createdAt'], deterministicPhase6Rule: 'sum effective card power after type matchup modifiers, then compare against encounter enemyPower' },
      readiness,
    });
  } catch (error) {
    return errorResponse('Failed to read battle inventory.', 500, error.message);
  }
}
