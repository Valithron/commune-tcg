# Commune TCG Battle Rules

This document is the canonical working source for the battle system rules. Keep it aligned with the live battle code as the system changes.

## Status

Draft rules document. The live game already has battle, XP, ascension, battle history, and prestige systems. This file will be expanded and checked against implementation details before rules are finalized for players.

## Battle Overview

Battles are automated fights between a player squad and an AI enemy squad. The server resolves the fight and returns the full battle result, including fighters, rounds, combat events, rewards, XP gains, and history summary data.

## Squad Size

A battle squad can contain up to three player cards. The game can auto-pick a squad or use a manually selected squad.

## Enemy Types

Current enemy pools:

- Random Encounter
- Household Chaos
- Yard Project
- Rival Commune
- Boss Fight

Enemy type affects enemy theme, character pool, names, and stat bias.

## Turn Order

Turn order is based primarily on SPD with a small random factor. Faster fighters are more likely to act earlier in each round.

## Damage

Damage uses attacker POW, defender DEF, random variance, and character matchup modifiers. Damage has a minimum floor so every hit matters.

## Matchups

Hits can be strong, weak, or neutral depending on character matchup. The battle log currently reports matchup flags such as WEAK or STRONG.

## Critical Hits and Glancing Hits

Critical hits increase damage. Higher SPD improves critical hit chance. Glancing hits reduce damage and are more likely when the defender is faster than the attacker.

## Victory and Defeat

A battle ends when one side is defeated or when the round limit is reached. If the round limit is reached, remaining HP determines the winner.

## Rewards

Battles pay character tokens. The MVP determines which character token is awarded.

## Card XP

Cards used in battle earn XP. XP can come from participation, winning, surviving, MVP, damage, and critical hits.

## Leveling

Cards gain levels from XP within their current rarity stage.

## Ascension

Cards can ascend when they reach the required level and XP for their current rarity. Ascension burns same-character tokens, upgrades rarity, improves stats, improves passive income, and preserves the card identity.

## Prestige and Market Influence

Card strength, XP, owner diversity, wins, MVPs, and activity contribute to character prestige. Prestige currently affects each token's market anchor, which influences market drift.

## UI Notes

Planned battle UX flow:

1. Battle Home
2. Team Selection
3. Enemy Selection
4. Full-screen Battle Playback
5. Results
6. History
7. Rules popup

Rules shown in-game should be checked against this document as it matures.
