/* ============================================================================
   API Battle Inventory Endpoint
   Phase auth-current-user responsibility: read signed-in player's battle-ready
   cards using the shared battle normalizer.
   ============================================================================ */

import { getSessionUser } from '../_shared/auth.js';
import { errorResponse, jsonResponse } from '../_shared/json.js';
import { mockBattleEncounters, normalizeOwnedBattleCard } from '../_shared/battle-engine.js';

const squadSize = 3;
const candidateBattleTables = ['battle_history', 'battles', 'encounters', 'enemies', 'enemy_cards', 'battle_encounters', 'battle_rewards', 'user_squads', 'squads'];

function ownerWhere() { return `owner_user_id IS NOT NULL AND TRIM(CAST(owner_user_id AS TEXT)) != ''`; }
async function readOwnedRows(env, ownerUserId) { const result = await env.DB.prepare(`SELECT id, owner_user_id, character_id, card_json, created_at, updated_at FROM cards WHERE ${ownerWhere()} AND CAST(owner_user_id AS TEXT) = ? ORDER BY updated_at DESC, created_at DESC LIMIT 500`).bind(ownerUserId).all(); return result.results || []; }
async function readTableNames(env) { const result = await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name ASC`).all(); return (result.results || []).map((row) => String(row.name || '')).filter(Boolean); }
async function readTableCount(env, tableName) { if (!candidateBattleTables.includes(tableName)) return null; const result = await env.DB.prepare(`SELECT COUNT(*) AS rowCount FROM ${tableName}`).first(); return Number(result?.rowCount || 0); }
async function readExistingBattleTables(env) { const tableNames = await readTableNames(env); const existingNames = candidateBattleTables.filter((tableName) => tableNames.includes(tableName)); const tables = []; for (const tableName of existingNames) tables.push({ name: tableName, rowCount: await readTableCount(env, tableName) }); return { allTableNames: tableNames, candidateTableNames: candidateBattleTables, existingBattleTables: tables, missingBattleTables: candidateBattleTables.filter((tableName) => !tableNames.includes(tableName)) }; }
function buildReadiness({ battleEligibleCards, mockEncounterCount, existingBattleTables, ownerDisplayName }) { if (!battleEligibleCards.length) return { status: 'owned-cards-missing', summary: `No ${ownerDisplayName}-owned cards are currently battle-eligible.`, nextStep: 'Pull or seed at least one owned card before battle simulation.' }; if (!mockEncounterCount && !existingBattleTables.some((table) => ['encounters', 'enemies', 'enemy_cards', 'battle_encounters'].includes(table.name))) return { status: 'enemy-data-missing', summary: 'No mock encounters or backend enemy tables are available.', nextStep: 'Define encounter source data before battle simulation.' }; return { status: 'ready-for-phase-6-battle', summary: 'Owned cards and typed mock encounters are available. Battle simulation uses effective stats and type matchup modifiers.', nextStep: 'Run a battle and verify preview power matches settlement power.' }; }
function summarizeSquadRules(cards) { const sortedCards = [...cards].sort((a, b) => Number(b.baseBattlePower || b.battlePower || 0) - Number(a.baseBattlePower || a.battlePower || 0)); return { expectedSquadSize: squadSize, minimumSquadSize: 1, duplicateCardsAllowed: false, defaultSelectionRule: 'highest baseBattlePower cards first, capped at 3, until saved squads exist', proposedDefaultSquadCardIds: sortedCards.slice(0, squadSize).map((card) => card.id), proposedDefaultSquadPower: sortedCards.slice(0, squadSize).reduce((total, card) => total + Number(card.baseBattlePower || card.battlePower || 0), 0) }; }

export async function onRequestGet({ env, request }) {
  if (!env.DB) return errorResponse('D1 binding DB is not available.', 503);
  const url = new URL(request.url);
  const user = await getSessionUser(request, env);
  if (!user) return errorResponse('Sign in to read battle inventory.', 401);
  const ownerUserId = url.searchParams.get('ownerUserId') || user.id;
  const ownerDisplayName = ownerUserId === user.id ? user.displayName : ownerUserId;

  try {
    const [ownedRows, tableInventory] = await Promise.all([readOwnedRows(env, ownerUserId), readExistingBattleTables(env)]);
    const ownedCards = ownedRows.map(normalizeOwnedBattleCard);
    const battleEligibleCards = ownedCards.filter((card) => card.eligible);
    const ineligibleOwnedCards = ownedCards.filter((card) => !card.eligible);
    const readiness = buildReadiness({ battleEligibleCards, mockEncounterCount: mockBattleEncounters.length, existingBattleTables: tableInventory.existingBattleTables, ownerDisplayName });

    return jsonResponse({
      ok: true,
      phase: 'auth-current-user',
      readOnly: true,
      source: 'D1 cards plus shared battle normalizer',
      ownerUserId,
      ownerDisplayName,
      ownedCardsScanned: ownedCards.length,
      battleEligibleCount: battleEligibleCards.length,
      ineligibleOwnedCount: ineligibleOwnedCards.length,
      battleEligibleCards,
      ineligibleOwnedCards,
      squadValidation: summarizeSquadRules(battleEligibleCards),
      enemySources: [{ source: 'functions/_shared/battle-engine.js', type: 'shared-mock', status: 'present', recordCount: mockBattleEncounters.length, enemyStatModel: 'enemyPower plus enemyType for type matchups' }],
      encounterSources: [{ source: 'functions/_shared/battle-engine.js', status: 'active-shared-source', encounters: mockBattleEncounters }],
      tableInventory,
      proposedBattleInputContract: { futureEndpoint: 'POST /api/battles', noWriteSimulationEndpoint: 'POST /api/battle-simulate', inputs: { ownerUserId: 'defaults to signed-in player', encounterId: 'required string matching a known encounter', squadCardIds: 'array of 1 to 3 owned card row ids or normalized card ids' }, validates: ['owner owns every selected card', 'each selected card is battle-eligible', 'squad size is between 1 and 3', 'no duplicate card ids in one squad', 'encounter id resolves to an available encounter', 'future stamina or energy cost before write-enabled battle starts'], writes: [], deferredWrites: ['drop grants', 'stamina or energy debit'] },
      readiness,
    });
  } catch (error) {
    return errorResponse('Failed to read battle inventory.', 500, error.message);
  }
}
