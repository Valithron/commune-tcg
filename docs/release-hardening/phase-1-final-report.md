# Phase 1 Release-Hardening Report

> **Current recommendation: CONDITIONAL GO pending human-session telemetry reconciliation.** Automated, authenticated technical, desktop, and real-iPhone practical alpha checks pass with no identified Phase 1 blocker. The formal controlled-usability script was not completed and is not claimed. No merge is authorized yet.

## Current status

| Field | Value |
| --- | --- |
| Branch | `phase/release-hardening` |
| Baseline | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Current implementation commit | Branch HEAD; deployed application tree verified at `8ca094bbcb062e25bd606f37bba521c9fccac205` |
| Approximate completion | 98% |
| Draft PR | [#5 Phase 1 release hardening](https://github.com/Valithron/commune-tcg/pull/5) |
| Preview URL | `https://phase-release-hardening.commune-tcg.pages.dev` |
| Automated result | Reconciled Phase 1 gate passed: 67 tests, 93-module production build, prior Worker dry run, 1,000-battle simulation, and whitespace validation |
| Human testing | Practical alpha gate passed in desktop Chrome, iPhone Safari, and iPhone Chrome; controlled usability study incomplete and not claimed |
| Telemetry | Design approved; minimal implementation and authenticated technical verification pass; final human-session read-only reconciliation pending |

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
| Public ownership/submission diagnostics | Administrator policy | Low | Admin policy tests | Non-admin telemetry diagnostic denial passed; remaining human admin review pending |
| Fixed submission reviewer | Persist authenticated admin slot | Low | Policy/full suite | Source and automated pass; human submission flow remains outside current disposable core-loop fixture set |
| Canonical documentation contradictions | Source-verified corrections | Low | Diff/build review | N/A |
| Missing release telemetry | Minimal authenticated ingestion, allowlisted schema, aggregate retention, audited administrator export/deletion, and non-blocking client instrumentation | Low to medium, additive writes | Telemetry backend and client contract tests | Pass for deployed capture, dedupe, privacy, authorization, deletion, audit, and gameplay isolation |

## Human gate result

Sterling completed a practical exploratory pass in desktop Chrome, iPhone Safari, and iPhone Chrome. Cydney attempted an uncoached exploratory session and completed a pull plus a battle completion or surrender, but the testing instructions confused her enough that the session is not valid controlled-usability-study data. The report found no technical blocker and recommends GO if telemetry shows no hidden defect.

Reported technical outcomes include correct login after preview credential reset, correct 7-minute Energy return, no observed duplicate ticket debit, pull, reward, or settlement, no observed account mixing, successful pulls for both testers, and correct battle interruption recovery. Human feedback about navigation, mobile density, pull presentation, battle readability/team management/balance, rewards, Vault/Library details, and onboarding is recorded as non-blocking Phase 2 carry-forward candidates. Phase 2 has not begun.

## Decisions required before completion

1. Run and review the read-only `007_phase1_human_telemetry_verify.sql` result sets.
2. If telemetry reveals no blocking defect, issue the final GO/NO-GO recommendation.
3. At the end, Sterling must explicitly approve or reject merge. No merge will occur automatically.

## Remaining blockers and risks

- Preview bindings, resource identifiers, schema, fixtures, reviewed reset, authenticated harness, and post-validation row inventory passed and are recorded.
- Human interruption and true-phone browser behavior passed at a practical alpha level, but phone model, viewport, orientation, display zoom, text scaling, formal slow/offline coverage, and the complete scripted prompts were not recorded.
- The final human-session telemetry rows have not yet been inventoried. Until they are reviewed, hidden client errors or funnel gaps remain possible.
- The human report notes brief use of Cydney's main account for comparison or context. No credentials were recorded, but the report does not specify enough detail to make a broader environment claim.
- The practical alpha findings are not a substitute for a later controlled usability study.

## Recommended next action

Execute each read-only statement in `007_phase1_human_telemetry_verify.sql` against `com-tcg-db-preview`, return the result sets, and reconcile them with the human report. Do not run cleanup first. Do not merge and do not begin Phase 2.
