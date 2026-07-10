/* Backend adapter: D1-owned card rows and canonical encounters enter the pure
   engine here. Authentication, persistence, and rewards stay outside combat. */

import { BATTLE_RULES_VERSION, LANES } from '../../shared/battle/battle-config.js';
import { createFormation, runBattle } from '../../shared/battle/battle-engine.js';
import { encounterEnemyFormation, getEncounterById, getEncounterSquadPower } from '../../shared/battle/encounter-registry.js';
import { normalizeOwnedBattleCard, readOwnedBattleRows } from './battle-card-store.js';

export function validateAttemptId(value) {
  const attemptId = String(value || '').trim().slice(0, 120);
  if (!attemptId) return { attemptId, error: 'battle-attempt-required' };
  if (!/^[a-zA-Z0-9_-]{8,120}$/.test(attemptId)) return { attemptId, error: 'battle-attempt-invalid-format' };
  return { attemptId, error: null };
}

export async function loadOwnedFormation(env, { ownerUserId, orderedCardIds }) {
  const ids = Array.isArray(orderedCardIds) ? orderedCardIds.map(String).map((id) => id.trim()).filter(Boolean) : String(orderedCardIds || '').split(',').map((id) => id.trim()).filter(Boolean);
  const errors = [];
  if (ids.length !== 3) errors.push('formation-requires-exactly-three-cards');
  if (new Set(ids).size !== ids.length) errors.push('formation-card-ids-must-be-distinct');
  const rows = await readOwnedBattleRows(env, ownerUserId);
  const normalized = rows.map(normalizeOwnedBattleCard);
  const lookup = new Map();
  for (const card of normalized) { lookup.set(String(card.id), card); lookup.set(String(card.sourceRowId), card); }
  const selected = ids.map((id) => lookup.get(id) || null);
  const missing = ids.filter((_, index) => !selected[index]);
  const ineligible = selected.filter((card) => card && !card.eligible);
  if (missing.length) errors.push('formation-card-not-owned');
  if (ineligible.length) errors.push('formation-card-ineligible');
  if (errors.length) return { ok: false, status: 400, errors, missing, ineligible: ineligible.map((card) => ({ id: card.sourceRowId, reasons: card.reasons })), orderedCardIds: ids };
  const cards = createFormation(selected.map((card, index) => ({
    ...card,
    instanceId: card.sourceRowId || card.id,
    templateId: card.characterId || card.id,
    ownerId: ownerUserId,
    lane: LANES[index],
    stats: { atk: Number(card.stats?.pow ?? card.stats?.atk ?? 0), def: Number(card.stats?.def ?? 0), spd: Number(card.stats?.spd ?? 0) },
  })));
  return { ok: true, cards, orderedCardIds: cards.map((card) => card.sourceRowId || card.instanceId) };
}

export async function createAuthoritativeBattleResult(env, { ownerUserId, ownerDisplayName, encounterId, orderedCardIds, seed }) {
  const encounter = getEncounterById(encounterId);
  if (!encounter) return { ok: false, status: 404, errors: ['encounter-not-found'] };
  const formation = await loadOwnedFormation(env, { ownerUserId, orderedCardIds });
  if (!formation.ok) return formation;
  const enemies = encounterEnemyFormation(encounter);
  const combat = runBattle({ player: formation.cards, enemy: enemies }, { seed, rulesVersion: BATTLE_RULES_VERSION });
  return {
    ok: true,
    ownerUserId,
    ownerDisplayName,
    encounter,
    orderedCardIds: formation.orderedCardIds,
    playerSnapshot: formation.cards,
    enemySnapshot: enemies,
    squadPower: formation.cards.reduce((sum, card) => sum + Number(card.battlePower ?? card.power ?? card.stats.atk + card.stats.def + card.stats.spd), 0),
    enemyPower: getEncounterSquadPower(encounter),
    combat,
  };
}
