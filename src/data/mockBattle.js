/* ============================================================================
   Mock Battle Data
   Phase 6 responsibility: deterministic typed encounters for frontend battle
   previews. Backend settlement remains authoritative.
   ============================================================================ */

import { mockCards } from './mockCards.js';
import { applyTypeMatchups } from '../services/typeMatchups.js';

export const mockEncounters = [
  {
    id: 'training-yard-goblin',
    name: 'Training Yard Goblin',
    difficulty: 'Easy',
    element: 'Starter',
    enemyType: 'neutral',
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
    enemyType: 'shadow',
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
    enemyType: 'flame',
    enemyPower: 205,
    staminaCost: 10,
    rewardGold: 520,
    rewardXp: 150,
    description: 'A boss-style prototype tuned for rare-heavy squads under the current stat budget system.',
  },
];

const defaultSquadIds = ['forgefather-sterling', 'cydney-hearthwarden', 'ashley-dragon-trainer'];

export function getEncounterById(encounterId) {
  return mockEncounters.find((encounter) => encounter.id === encounterId) || mockEncounters[0];
}

export function getDefaultSquad() {
  return defaultSquadIds.map((cardId) => mockCards.find((card) => card.id === cardId)).filter(Boolean);
}

export function getSquadPower(cards, encounter = {}) {
  return applyTypeMatchups(cards, encounter).reduce((total, card) => total + Number(card.battlePower || 0), 0);
}

export function getBattleOutcome(encounterId) {
  const encounter = getEncounterById(encounterId);
  const squad = applyTypeMatchups(getDefaultSquad(), encounter);
  const squadPower = getSquadPower(squad, encounter);
  const victory = squadPower >= encounter.enemyPower;

  return {
    victory,
    encounter,
    squad,
    squadPower,
    rewards: {
      gold: victory ? encounter.rewardGold : Math.floor(encounter.rewardGold * 0.25),
      xp: victory ? encounter.rewardXp : Math.floor(encounter.rewardXp * 0.35),
    },
    log: [
      'Squad enters formation.',
      `${encounter.name} opens with ${encounter.enemyType} pressure.`,
      victory ? 'The squad controls the tempo and wins decisively.' : 'The squad survives but fails to secure victory.',
    ],
  };
}
