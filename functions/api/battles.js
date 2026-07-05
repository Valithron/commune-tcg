/* ============================================================================
   API Battles Endpoint
   Battle Phase 3 responsibility: write battle_history only after validation.
   Rewards, XP, currency, stamina, Vault, card progression, and auth remain deferred.
   ============================================================================ */

import { errorResponse, jsonResponse } from '../_shared/json.js';
import {
  mockBattleEncounters,
  resolveBattleSimulation,
  temporaryBattleUserId,
  writeBattleHistory,
} from '../_shared/battle-engine.js';

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();

  return {
    ownerUserId: formData.get('ownerUserId'),
    encounterId: formData.get('encounterId'),
    squadCardIds: formData.get('squadCardIds'),
  };
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return errorResponse('D1 binding DB is not available.', 503);
  }

  try {
    const payload = await readPayload(request);
    const now = new Date().toISOString();
    const ownerUserId = payload.ownerUserId || temporaryBattleUserId;
    const encounterId = payload.encounterId || mockBattleEncounters[0].id;
    const squadCardIds = payload.squadCardIds || [];
    const simulationResult = await resolveBattleSimulation(env, {
      ownerUserId,
      encounterId,
      squadCardIds,
      createdAt: now,
    });

    if (!simulationResult.ok) {
      return jsonResponse({
        ...simulationResult,
        phase: 'battle-3',
        readOnly: false,
        writesPerformed: false,
        writes: [],
        error: simulationResult.error || 'Battle validation failed.',
        notes: [
          'Validation failed before any write was attempted.',
          'No battle_history, rewards, XP, currency, stamina, energy, or Vault writes occurred.',
        ],
      }, { status: simulationResult.status || 400 });
    }

    const written = await writeBattleHistory(env, simulationResult, { now });

    return jsonResponse({
      ok: true,
      phase: 'battle-3',
      source: 'D1 owned Vault cards + battle_history',
      readOnly: false,
      writesPerformed: true,
      writes: ['battle_history'],
      deferredWrites: ['rewards', 'XP', 'level-ups', 'currency', 'stamina', 'energy', 'Vault changes'],
      battleId: written.battleId,
      historyRow: written.historyRow,
      simulation: written.simulation,
      validation: simulationResult.validation,
      requested: simulationResult.requested,
      guardrails: [
        'Only battle_history was written.',
        'No rewards were written.',
        'No XP or levels were written.',
        'No currency was written.',
        'No stamina or energy was written.',
        'No Vault or card progression data was changed.',
        'Temporary Sterling owner remains in use until auth exists.',
      ],
      nextStep: 'Battle Phase 4 should define reward and XP contracts before any progression or currency writes.',
    });
  } catch (error) {
    return errorResponse('Failed to resolve battle.', 500, error.message);
  }
}
