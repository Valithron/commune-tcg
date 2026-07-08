/* ============================================================================
   Mock Battle Data
   Phase 3 responsibility: deterministic encounter, squad, and result data.
   Real battle math, persistence, rewards, and cooldowns belong to backend phases.
   ============================================================================ */

import { mockCards } from './mockCards.js';

export const mockEncounters = [
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

const defaultSquadIds = [
  'forgefather-sterling',
  'cydney-hearthwarden',
  'ashley-dragon-trainer',
];

export function getEncounterById(encounterId) {
  return mockEncounters.find((encounter) => encounter.id === encounterId) || mockEncounters[0];
}

export function getDefaultSquad() {
  return defaultSquadIds
    .map((cardId) => mockCards.find((card) => card.id === cardId))
    .filter(Boolean);
}

export function getSquadPower(cards) {
  return cards.reduce((total, card) => total + card.stats.pow + card.stats.def + card.stats.spd + card.level, 0);
}

export function getBattleOutcome(encounterId) {
  const encounter = getEncounterById(encounterId);
  const squad = getDefaultSquad();
  const squadPower = getSquadPower(squad);
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
      `${encounter.name} opens with ${encounter.element} pressure.`,
      victory ? 'The squad controls the tempo and wins decisively.' : 'The squad survives but fails to secure victory.',
    ],
  };
}
