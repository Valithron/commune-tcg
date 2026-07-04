/* ============================================================================
   Pull Config
   Phase 10.1 responsibility: centralize read-only pull odds and pull option
   contract before any ticket spend or Vault grant exists.
   ============================================================================ */

export const pullOptions = {
  1: {
    count: 1,
    ticketCost: 1,
    label: '1-Pull',
  },
  5: {
    count: 5,
    ticketCost: 5,
    label: '5-Pull',
  },
};

export const rarityOdds = [
  { rarity: 'common', label: 'Common', weight: 55 },
  { rarity: 'uncommon', label: 'Uncommon', weight: 25 },
  { rarity: 'rare', label: 'Rare', weight: 14 },
  { rarity: 'legendary', label: 'Legendary', weight: 5 },
  { rarity: 'mythic', label: 'Mythic', weight: 1 },
];

export function getTotalWeight() {
  return rarityOdds.reduce((total, entry) => total + entry.weight, 0);
}

export function getRarityOddsPercentages() {
  const totalWeight = getTotalWeight();

  return rarityOdds.map((entry) => ({
    ...entry,
    percentage: totalWeight ? Number(((entry.weight / totalWeight) * 100).toFixed(2)) : 0,
  }));
}
