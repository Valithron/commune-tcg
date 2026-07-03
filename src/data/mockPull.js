/* ============================================================================
   Mock Pull Data
   Phase 2 responsibility: deterministic pull confirmation and results content.
   Real odds, pity, inventory writes, and duplicate conversion come later.
   ============================================================================ */

import { mockCards } from './mockCards.js';

export const pullOptions = {
  1: {
    count: 1,
    ticketCost: 1,
    label: '1-Pull',
    description: 'Reveal one card from the current Library pool.',
  },
  5: {
    count: 5,
    ticketCost: 5,
    label: '5-Pull',
    description: 'Reveal five cards in a single batch. Phase 2 uses deterministic mock results.',
  },
};

export const rarityOdds = [
  { rarity: 'Common', odds: '55%' },
  { rarity: 'Uncommon', odds: '25%' },
  { rarity: 'Rare', odds: '14%' },
  { rarity: 'Legendary', odds: '5%' },
  { rarity: 'Mythic', odds: '1%' },
];

export function getMockPullResults(count) {
  const resultIds = count === 5
    ? ['common-field-squire', 'gabi-threadkeeper', 'kenly-potion-spark', 'ryan-sky-rider', 'cydney-hearthwarden']
    : ['ashley-dragon-trainer'];

  return resultIds.map((id) => mockCards.find((card) => card.id === id)).filter(Boolean);
}
