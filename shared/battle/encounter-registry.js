/* Canonical encounter source for browser previews and authoritative adapters. */

export const ENCOUNTER_REGISTRY_VERSION = 'encounters-1.0.0';

const crossroadsEnemies = Object.freeze({
  left: Object.freeze({ id: 'crossroads-flame-scout', name: 'Ember Scout', symbol: '✹', rarity: 'common', type: 'flame', level: 1, stats: Object.freeze({ atk: 16, def: 7, spd: 9 }), artTreatment: 'ember-scout' }),
  center: Object.freeze({ id: 'crossroads-neutral-warden', name: 'Crossroads Warden', symbol: '⚔', rarity: 'uncommon', type: 'neutral', level: 1, stats: Object.freeze({ atk: 15, def: 15, spd: 14 }), artTreatment: 'crossroads-warden' }),
  right: Object.freeze({ id: 'crossroads-shadow-guard', name: 'Dusk Guard', symbol: '◆', rarity: 'common', type: 'shadow', level: 1, stats: Object.freeze({ atk: 9, def: 15, spd: 7 }), artTreatment: 'dusk-guard' }),
});

export const ENCOUNTERS = Object.freeze([
  Object.freeze({
    id: 'crossroads-patrol',
    version: 'crossroads-patrol-1.0.0',
    registryVersion: ENCOUNTER_REGISTRY_VERSION,
    mode: 'daily-skirmish',
    name: 'Crossroads Patrol',
    difficulty: 'Easy',
    recommendedPowerRange: Object.freeze({ min: 90, max: 110 }),
    energyCost: 1,
    background: Object.freeze({ id: 'crossroads-night', className: 'battle-arena-crossroads', accent: '#789461' }),
    rulesText: 'First lane winners reinforce adjacent lanes on their next turn.',
    enemies: crossroadsEnemies,
    rewards: Object.freeze({
      victory: Object.freeze({ gold: 20, xpPerCard: 18 }),
      defeat: Object.freeze({ gold: 0, xpMultiplier: 0.25 }),
      firstDailyVictory: Object.freeze({ gold: 40, xpPerCard: 12 }),
    }),
    repeatable: true,
    dailyResetTimeZone: 'America/Denver',
  }),
]);

export function getEncounterById(encounterId) {
  return ENCOUNTERS.find((encounter) => encounter.id === encounterId) || null;
}

export function getDefaultEncounter() { return ENCOUNTERS[0]; }

export function encounterEnemyFormation(encounter) {
  if (!encounter) return [];
  return ['left', 'center', 'right'].map((lane) => ({ ...encounter.enemies[lane], lane }));
}

export function getEncounterSquadPower(encounter) {
  return encounterEnemyFormation(encounter).reduce((total, card) => total + card.stats.atk + card.stats.def + card.stats.spd, 0);
}
