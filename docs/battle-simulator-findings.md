# Battle Simulator Findings

Reproducible command:

```bash
npm run battle:simulate -- --iterations=1000
```

The full machine-readable output is stored in `docs/battle-simulator-results.json`. Each listed scenario ran 1,000 seeds at each 100%, 85%, and 70% cross-lane multiplier. The tool also ran all six lane permutations for balanced and ace-plus-support squads, isolated-lane forecast inputs, equal-SPD cases, mixed levels and rarities, ATK-heavy, DEF-heavy, SPD-specialist, and type-varied squads.

## Production cross-lane selection

Production remains at **100% cross-lane damage**.

- Balanced-vs-encounter win rate was 69.7% at 100%, 59.5% at 85%, and 58.4% at 70%.
- The extreme ace-plus-two-weak-supports scenario won 100% at all three values. Lowering cross-lane damage lengthened those battles but did not solve the concentrated-ace outcome.
- A hidden penalty is forbidden, and the tested penalties materially hurt ordinary balanced squads without correcting the extreme case.

The ace case remains a balance risk to watch with live card distributions. The evidence does not support taxing every reinforcement attack in the first release.

## Pacing

- Balanced battles averaged 7.25 rounds and 34.57 estimated seconds at 1×.
- The extreme ace squad averaged 6.02 rounds and 28.03 seconds.
- The representative scenarios stayed within roughly 24 to 39.5 estimated seconds at 1×.
- Balanced first knockout averaged round 5.63.

These results meet the ordinary 7-to-8-round and 30-to-60-second targets for the central scenario.

## Formation

All six balanced formations produced win rates from 35.0% to 83.7% against the same encounter. Formation therefore changes outcomes materially and is not cosmetic. Ace placement changed average battle length and produced a small win-rate reduction in the two weakest orders, but the deliberately extreme ace remained dominant.

## Stat profiles and Double-Strike

Under equal or near-equal total budgets, the current first-test formula strongly favors ATK concentration in this specific encounter. The ATK-heavy scenario won 99.5%, while DEF-heavy won 0.3% and SPD-specialist won 0.2%. SPD specialists did trigger Double-Strike an average 4.64 times per battle, so the system works mechanically, but the 30% strikes did not compensate for low ATK.

No approved formula was silently changed. This is recorded as a significant balance risk for broader encounter/card-distribution testing.

## MVP

Balanced victories distributed MVP across all three cards: center 355, left 128, and right 214 among 697 victories. The extreme ace earned every MVP, which matches its actual contribution rather than Power alone. Useful damage excludes overkill.

## XP curve

With 18 XP per victory and +12 XP on the first daily victory:

| Current level | XP to next | Ordinary victories | First daily then ordinary |
|---:|---:|---:|---:|
| 1 | 55 | 4 | 3 |
| 5 | 115 | 7 | 6 |
| 10 | 190 | 11 | 10 |
| 20 | 340 | 19 | 19 |
| 30 | 490 | 28 | 27 |
| 50 | 790 | 44 | 44 |
| 69 | 1,075 | 60 | 60 |

Defeat/retreat grants 5 XP after rounding 25% of 18. The approved values are unchanged. Early progression is meaningful; high-level progression is intentionally long and should be evaluated alongside future non-battle XP sources.

