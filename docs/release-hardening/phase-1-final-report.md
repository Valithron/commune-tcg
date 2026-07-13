# Phase 1 Release-Hardening Report

> **Final recommendation: GO.** Phase 1 meets its applicable release-hardening gates and is recommended for merge when Sterling explicitly approves. Automated, authenticated technical, desktop, real-iPhone, persistence, and telemetry evidence reveal no P0 or P1 release blocker. The formal controlled-usability script was not completed and is not claimed. No merge is authorized by this recommendation alone.

## Current status

| Field | Value |
| --- | --- |
| Branch | `phase/release-hardening` |
| Baseline | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Current implementation commit | Branch HEAD; deployed application tree verified at `8ca094bbcb062e25bd606f37bba521c9fccac205` |
| Approximate completion | 100% of Phase 1 validation and approval-package work; merge remains separately approval-gated |
| Draft PR | [#5 Phase 1 release hardening](https://github.com/Valithron/commune-tcg/pull/5) |
| Preview URL | `https://phase-release-hardening.commune-tcg.pages.dev` |
| Automated result | Reconciled Phase 1 gate passed: 67 tests, 93-module production build, prior Worker dry run, 1,000-battle simulation, and whitespace validation |
| Human testing | Practical alpha gate passed in desktop Chrome, iPhone Safari, and iPhone Chrome; controlled usability study incomplete and not claimed |
| Telemetry | Design approved; minimal implementation, authenticated technical verification, human-session reconciliation, and transaction-integrity checks pass |

## Executive summary

Phase 1 established a reproducible baseline, mapped the active route/API surface, added high-value transaction tests, implemented the authorized Energy regeneration contract, and corrected verified ownership and administrator-boundary defects. Reviewed automation, schema, fixture, reset, and authenticated validation operations targeted only the isolated preview resources. The human report notes a brief main-account comparison but does not provide enough detail to classify it further. No Phase 2 work began.

## Findings by area

- **Reliability:** Baseline gate passed. Pull requests now have durable idempotency claims; Energy reconciliation is repeatable.
- **Playability:** The permanent Energy lockout is corrected in source, automated tests, authenticated preview validation, and human interval observation. The approved value is 1 Energy every 7 minutes, capped at 10, with a live top-bar countdown.
- **Clarity and visual cohesion:** Known route, Card Lab, Cydney color, type-color, and Energy documentation contradictions were corrected without redesign.
- **Economy:** Daily claim, Gold exchange, pull concurrency, battle settlement, and Energy cases have isolated SQLite evidence.
- **Security and ownership:** Vault and battle-history caller overrides, public Vault inventory, legacy submission-list exposure, non-session submission identity, and fixed reviewer identity were corrected.
- **Recovery:** Pull same-request retry, duplicate battle creation/finalization, second-session battle recovery, cross-owner denial, and surrender recovery passed deployed technical validation. Sterling also reported correct battle resume after a human browser interruption.
- **Telemetry:** The approved minimal event set is implemented with server-derived identity/time/release context, allowlisted fields, D1 retention/aggregation/deletion, administrator audit, rate limiting, and gameplay-failure isolation.
- **Technical debt:** Runtime schema creation and allowlist-only administrator roles remain; the active temporary-owner fallbacks were removed from player mutations.

## Changes

| Problem | Implementation | Risk | Test coverage | Preview result |
| --- | --- | --- | --- | --- |
| Energy never regenerated | Shared elapsed-time reconciler on reads and pre-battle debit plus live top-bar countdown; current approved interval 7 minutes | Low, additive behavior within approved contract and subsequent hotfix approval | Direct interval/cap/backfill/concurrency/debit and UI contract tests | Pass, including deployed 420,000 ms reconciliation, owner isolation, and human 7-minute return |
| Pull retry/concurrency could duplicate grants | Additive `pull_requests` claim and client request reuse | Medium, transaction path changed | Repeat and competing-request tests | Pass: retry returned committed result with one debit and one grant |
| Vault/history owner query override | Session-only owner queries | Low | Behavioral cross-owner tests | Pass across two authenticated accounts |
| Public ownership/submission diagnostics | Administrator policy | Low | Admin policy tests | Non-admin denial and authenticated administrator-policy tests passed; human submission review remains outside the disposable core-loop fixture set |
| Fixed submission reviewer | Persist authenticated admin slot | Low | Policy/full suite | Source and automated pass; human submission flow remains outside current disposable core-loop fixture set |
| Canonical documentation contradictions | Source-verified corrections | Low | Diff/build review | N/A |
| Missing release telemetry | Minimal authenticated ingestion, allowlisted schema, aggregate retention, audited administrator export/deletion, and non-blocking client instrumentation | Low to medium, additive writes | Telemetry backend and client contract tests | Pass for deployed capture, dedupe, privacy, authorization, deletion, audit, and gameplay isolation |

## Human gate result

Sterling completed a practical exploratory pass in desktop Chrome, iPhone Safari, and iPhone Chrome. Cydney attempted an uncoached exploratory session and completed a pull plus a battle completion or surrender, but the testing instructions confused her enough that the session is not valid controlled-usability-study data. The report found no technical blocker and recommends GO if telemetry shows no hidden defect.

Reported technical outcomes include correct login after preview credential reset, correct 7-minute Energy return, no observed duplicate ticket debit, pull, reward, or settlement, no observed account mixing, successful pulls for both testers, and correct battle interruption recovery. Human feedback about navigation, mobile density, pull presentation, battle readability/team management/balance, rewards, Vault/Library details, and onboarding is recorded as non-blocking Phase 2 carry-forward candidates. Phase 2 has not begun.

## Human-session telemetry reconciliation

Sterling executed the read-only `007_phase1_human_telemetry_verify.sql` statements against isolated preview D1 `com-tcg-db-preview`. The human period contains 228 events across 6 analytics sessions. It contains 0 displayed errors, 0 recorded pull/battle interruption events, 2 failure outcomes, 6 persisted pull requests with 6 matching pull-history rows, and 17 persisted battle attempts with 17 matching battle-history rows.

Every pull request matched exactly one history row. Every battle attempt matched exactly one owner-correct history row. The completion-anomaly query returned zero rows. The two failure outcomes were expected insufficient-resource responses for Sterling's daily ticket claim and ticket exchange. They did not produce a resource, pull, reward, or settlement inconsistency.

Vault follow-through was recorded three times, all successful and phone-based:

| Player | Browser | Related pull | Occurred at |
| --- | --- | --- | --- |
| Sterling | Safari | `pull_1783885641585_f9d3974153ce4d67becfdd487b0599ab` | `2026-07-12T19:47:30.154Z` |
| Cydney | Other | `pull_1783889088331_62173cbf24d742d3bc4d84e2dc4aaedc` | `2026-07-12T20:44:58.329Z` |
| Cydney | Other | `pull_1783889157504_af104408b0894a4dab0a769907f3837c` | `2026-07-12T20:46:39.415Z` |

Telemetry therefore corroborates mobile pull-to-Vault follow-through and persisted transaction integrity. The absence of a recorded interruption event does not contradict the human battle-resume observation: a page refresh or navigation can terminate the client before it emits the optional interruption signal. Persisted attempt/history parity and the zero-anomaly result are the authoritative integrity evidence.

## Decision required

The only remaining decision is Sterling's explicit merge approval or instruction to hold the draft PR. No merge will occur automatically.

## Remaining blockers and risks

- Preview bindings, resource identifiers, schema, fixtures, reviewed reset, authenticated harness, and post-validation row inventory passed and are recorded.
- Human interruption and true-phone browser behavior passed at a practical alpha level, but phone model, viewport, orientation, display zoom, text scaling, formal slow/offline coverage, and the complete scripted prompts were not recorded.
- The human report notes brief use of Cydney's main account for comparison or context. No credentials were recorded, but the report does not specify enough detail to make a broader environment claim.
- The practical alpha findings are not a substitute for a later controlled usability study.
- Telemetry recorded no explicit interruption event even though human recovery succeeded. This is an observability limitation rather than a persistence defect; 17 attempts reconciled one-to-one with 17 owner-correct history rows.
- The two expected insufficient-resource failures show that refusal paths were reached, but telemetry does not itself measure whether their user-facing copy was clear.
- Preview cleanup has not run. The reviewed owner-scoped cleanup procedure remains available and is not a production or merge-integrity blocker.

## Recommended next action

Keep PR #5 in draft until Sterling explicitly approves or rejects merge. Preserve the recorded telemetry results; run the reviewed preview cleanup only when the disposable test state is no longer needed. Do not begin Phase 2.
