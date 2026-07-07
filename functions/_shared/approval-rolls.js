const rollTable = [
  { rarity: 'common', weight: 55, min: 2, max: 5 },
  { rarity: 'uncommon', weight: 25, min: 3, max: 6 },
  { rarity: 'rare', weight: 13, min: 4, max: 8 },
  { rarity: 'legendary', weight: 5, min: 5, max: 9 },
  { rarity: 'mythic', weight: 2, min: 6, max: 10 },
];

function unit() {
  try {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] / 4294967296;
  } catch {
    return Math.random();
  }
}

function integer(min, max) {
  return Math.floor(unit() * (max - min + 1)) + min;
}

export function rollApprovalProfile() {
  let roll = unit() * rollTable.reduce((sum, item) => sum + item.weight, 0);
  const selected = rollTable.find((item) => {
    roll -= item.weight;
    return roll <= 0;
  }) || rollTable[0];

  return {
    rarity: selected.rarity,
    stats: {
      pow: integer(selected.min, selected.max),
      def: integer(selected.min, selected.max),
      spd: integer(selected.min, selected.max),
    },
  };
}
