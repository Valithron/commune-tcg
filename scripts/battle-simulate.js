import { writeFile } from 'node:fs/promises';
import { getDefaultEncounter, encounterEnemyFormation } from '../shared/battle/encounter-registry.js';
import { formationPermutations, runBattleBatch, battlesPerLevel } from '../shared/battle/battle-simulator.js';

const iterations = Number(process.argv.find((argument) => argument.startsWith('--iterations='))?.split('=')[1] || 1000);
const encounter = getDefaultEncounter();
const enemy = encounterEnemyFormation(encounter);

const makeCard = (id, stats, type = 'neutral', level = 1) => ({ id, name: id, stats, type, level });
const scenarios = {
  balanced: [makeCard('Balanced A', { atk: 11, def: 10, spd: 10 }, 'tide'), makeCard('Balanced B', { atk: 15, def: 15, spd: 14 }), makeCard('Balanced C', { atk: 10, def: 12, spd: 9 }, 'radiant')],
  aceSupports: [makeCard('Ace', { atk: 32, def: 22, spd: 17 }, 'tide'), makeCard('Support A', { atk: 6, def: 7, spd: 7 }, 'bloom'), makeCard('Support B', { atk: 6, def: 7, spd: 7 }, 'radiant')],
  threeMedium: [makeCard('Medium A', { atk: 13, def: 12, spd: 11 }, 'tide'), makeCard('Medium B', { atk: 13, def: 12, spd: 11 }), makeCard('Medium C', { atk: 13, def: 12, spd: 11 }, 'radiant')],
  atkHeavy: [makeCard('ATK A', { atk: 21, def: 6, spd: 5 }, 'tide'), makeCard('ATK B', { atk: 25, def: 10, spd: 9 }), makeCard('ATK C', { atk: 20, def: 6, spd: 5 }, 'radiant')],
  defHeavy: [makeCard('DEF A', { atk: 7, def: 20, spd: 5 }, 'tide'), makeCard('DEF B', { atk: 10, def: 25, spd: 9 }), makeCard('DEF C', { atk: 7, def: 19, spd: 5 }, 'radiant')],
  spdSpecialists: [makeCard('SPD A', { atk: 8, def: 7, spd: 17 }, 'volt'), makeCard('SPD B', { atk: 11, def: 10, spd: 23 }, 'volt'), makeCard('SPD C', { atk: 8, def: 7, spd: 16 }, 'volt')],
  mixedLevelRarity: [makeCard('Veteran Common', { atk: 19, def: 17, spd: 14 }, 'tide', 12), makeCard('New Legendary', { atk: 27, def: 24, spd: 20 }, 'radiant', 1), makeCard('Growing Rare', { atk: 22, def: 19, spd: 18 }, 'volt', 6)],
  equalSpeed: [makeCard('Tie A', { atk: 11, def: 10, spd: 14 }, 'tide'), makeCard('Tie B', { atk: 15, def: 15, spd: 14 }), makeCard('Tie C', { atk: 10, def: 12, spd: 14 }, 'radiant')],
};

const report = { generatedBy: 'scripts/battle-simulate.js', iterationsPerRun: iterations, encounter: { id: encounter.id, version: encounter.version }, crossLane: {}, formations: {}, xpCurve: [] };
for (const multiplier of [1, 0.85, 0.70]) {
  report.crossLane[multiplier] = {};
  for (const [name, cards] of Object.entries(scenarios)) {
    const player = cards.map((card, index) => ({ ...card, lane: ['left', 'center', 'right'][index] }));
    report.crossLane[multiplier][name] = runBattleBatch({ playerCards: player, enemyCards: enemy, iterations, seedPrefix: `${name}:${multiplier}`, rules: { crossLaneMultiplier: multiplier } });
  }
}

for (const [name, cards] of Object.entries({ balanced: scenarios.balanced, aceSupports: scenarios.aceSupports })) {
  report.formations[name] = formationPermutations(cards).map((playerCards, index) => ({
    order: playerCards.map((card) => card.name),
    metrics: runBattleBatch({ playerCards, enemyCards: enemy, iterations, seedPrefix: `${name}:formation:${index}` }),
  }));
}

report.xpCurve = [1, 5, 10, 20, 30, 40, 50, 60, 69].map((level) => battlesPerLevel({ level }));

const outputPath = new URL('../docs/battle-simulator-results.json', import.meta.url);
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outputPath.pathname}`);
console.log(JSON.stringify({
  iterations,
  productionMultiplier: 1,
  balanced: report.crossLane[1].balanced,
  aceSupports: report.crossLane[1].aceSupports,
  crossLaneWinRates: Object.fromEntries([1, 0.85, 0.70].map((value) => [value, report.crossLane[value].aceSupports.winRate])),
  xpCurve: report.xpCurve,
}, null, 2));
