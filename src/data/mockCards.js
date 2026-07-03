/* ============================================================================
   Mock Card Data
   Phase 2 responsibility: seed starter views, detail screens, and mock pulls.
   Real cards should later come from the global Library and user Vault contracts.
   ============================================================================ */

export const mockCards = [
  {
    id: 'forgefather-sterling',
    name: 'Forgefather Sterling',
    category: 'Craft',
    rarity: 'legendary',
    symbol: '⚒',
    stats: { pow: 8, def: 7, spd: 4 },
    owned: true,
    level: 12,
    copies: 1,
    flavor: 'A steady hand at the anvil turns raw material into weapons, tools, and inheritance.',
  },
  {
    id: 'cydney-hearthwarden',
    name: 'Cydney Hearthwarden',
    category: 'Home',
    rarity: 'mythic',
    symbol: '✦',
    stats: { pow: 6, def: 9, spd: 5 },
    owned: true,
    level: 14,
    copies: 1,
    flavor: 'The hearth does not merely warm the house. It orders the whole kingdom inside it.',
  },
  {
    id: 'ryan-sky-rider',
    name: 'Ryan Sky Rider',
    category: 'Battle',
    rarity: 'rare',
    symbol: '◆',
    stats: { pow: 7, def: 5, spd: 8 },
    owned: true,
    level: 8,
    copies: 2,
    flavor: 'Speed, height, and nerve make a rider dangerous before the first strike lands.',
  },
  {
    id: 'gabi-threadkeeper',
    name: 'Gabi Threadkeeper',
    category: 'Support',
    rarity: 'uncommon',
    symbol: '✧',
    stats: { pow: 4, def: 6, spd: 7 },
    owned: true,
    level: 6,
    copies: 3,
    flavor: 'Small repairs prevent great unravelings.',
  },
  {
    id: 'cooper-arcane-aide',
    name: 'Cooper Arcane Aide',
    category: 'Magic',
    rarity: 'rare',
    symbol: '✹',
    stats: { pow: 6, def: 4, spd: 9 },
    owned: false,
    level: 1,
    copies: 0,
    flavor: 'The apprentice who keeps the books close often learns where the real doors are hidden.',
  },
  {
    id: 'kenly-potion-spark',
    name: 'Kenly Potion Spark',
    category: 'Alchemy',
    rarity: 'uncommon',
    symbol: '✺',
    stats: { pow: 5, def: 5, spd: 8 },
    owned: false,
    level: 1,
    copies: 0,
    flavor: 'A small bottle can carry a very large consequence.',
  },
  {
    id: 'ashley-dragon-trainer',
    name: 'Ashley Dragon Trainer',
    category: 'Training',
    rarity: 'legendary',
    symbol: '▲',
    stats: { pow: 9, def: 6, spd: 7 },
    owned: true,
    level: 10,
    copies: 1,
    flavor: 'A good trainer does not beg the dragon to obey. She convinces it winning is more fun together.',
  },
  {
    id: 'common-field-squire',
    name: 'Field Squire',
    category: 'Starter',
    rarity: 'common',
    symbol: '•',
    stats: { pow: 3, def: 3, spd: 3 },
    owned: true,
    level: 3,
    copies: 6,
    flavor: 'Every champion starts by carrying something heavier than expected.',
  },
];

export const ownedCards = mockCards.filter((card) => card.owned);
export const featuredCards = mockCards.filter((card) => ['legendary', 'mythic'].includes(card.rarity));

export function findCardById(cardId) {
  return mockCards.find((card) => card.id === cardId) || null;
}
