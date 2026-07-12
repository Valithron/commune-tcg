# Phase 1 Release-Hardening Report

> **Current recommendation: NO-GO while Phase 1 is in progress.** Stateful preview testing and Cydney's human release-confidence session remain incomplete. This status is procedural and does not indicate a known production outage.

## Current status

| Field | Value |
| --- | --- |
| Branch | `phase/release-hardening` |
| Baseline | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Current implementation commit | Branch HEAD; deployed application tree verified at `8ca094bbcb062e25bd606f37bba521c9fccac205` |
| Approximate completion | 88% |
| Draft PR | [#5 Phase 1 release hardening](https://github.com/Valithron/commune-tcg/pull/5) |
| Preview URL | `https://phase-release-hardening.commune-tcg.pages.dev` |
| Automated result | Reconciled Phase 1 gate passed: 66 tests, 93-module production build, prior Worker dry run, 1,000-battle simulation, and whitespace validation |
| Human testing | Public desktop setup screen verified; authenticated core loop pending dashboard execution of the reviewed preview package |
| Telemetry | Design approved and minimal Phase 1 implementation complete on the branch; live event evidence pending |

## Executive summary

Phase 1 established a reproducible baseline, mapped the active route/API surface, added high-value transaction tests, implemented the authorized Energy regeneration contract, and corrected verified ownership and administrator-boundary defects. No production data was mutated and no Phase 2 work began.

## Findings by area

- **Reliability:** Baseline gate passed. Pull requests now have durable idempotency claims; Energy reconciliation is repeatable.
- **Playability:** The permanent Energy lockout is corrected in source and tests. The current explicitly approved production value is 1 Energy every 7 minutes, capped at 10, with a live top-bar countdown. Device/browser preview remains required.
- **Clarity and visual cohesion:** Known route, Card Lab, Cydney color, type-color, and Energy documentation contradictions were corrected without redesign.
- **Economy:** Daily claim, Gold exchange, pull concurrency, battle settlement, and Energy cases have isolated SQLite evidence.
- **Security and ownership:** Vault and battle-history caller overrides, public Vault inventory, legacy submission-list exposure, non-session submission identity, and fixed reviewer identity were corrected.
- **Recovery:** Pull and battle retry contracts are documented; browser interruption testing remains.
- **Telemetry:** The approved minimal event set is implemented with server-derived identity/time/release context, allowlisted fields, D1 retention/aggregation/deletion, administrator audit, rate limiting, and gameplay-failure isolation.
- **Technical debt:** Runtime schema creation and allowlist-only administrator roles remain; the active temporary-owner fallbacks were removed from player mutations.

## Changes

| Problem | Implementation | Risk | Test coverage | Preview result |
| --- | --- | --- | --- | --- |
| Energy never regenerated | Shared elapsed-time reconciler on reads and pre-battle debit plus live top-bar countdown; current approved interval 7 minutes | Low, additive behavior within approved contract and subsequent hotfix approval | Direct interval/cap/backfill/concurrency/debit and UI contract tests | Exact source deployed; authenticated preview pending |
| Pull retry/concurrency could duplicate grants | Additive `pull_requests` claim and client request reuse | Medium, transaction path changed | Repeat and competing-request tests | Pending |
| Vault/history owner query override | Session-only owner queries | Low | Behavioral cross-owner tests | Pending |
| Public ownership/submission diagnostics | Administrator policy | Low | Admin policy tests | Pending |
| Fixed submission reviewer | Persist authenticated admin slot | Low | Policy/full suite; behavior preview pending | Pending |
| Canonical documentation contradictions | Source-verified corrections | Low | Diff/build review | N/A |
| Missing release telemetry | Minimal authenticated ingestion, allowlisted schema, aggregate retention, audited administrator export/deletion, and non-blocking client instrumentation | Low to medium, additive writes | Telemetry backend and client contract tests | Pending |

## Decisions required before completion

1. Execute the reviewed schema, fixtures, and verification queries through the Cloudflare dashboard only against D1 `com-tcg-db-preview` UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38`.
2. After stateful preview readiness, complete Sterling and Cydney human tests.
3. At the end, explicitly approve or reject merge. No merge will occur automatically.

## Remaining blockers and risks

- Preview bindings and exact resource identifiers are recorded. The auth bootstrap succeeded, and the reviewed gameplay schema and disposable fixture package awaits dashboard execution.
- Browser slow/offline/interruption and common iPhone widths remain unverified.
- Telemetry live D1 and failure-isolation evidence remains pending the gameplay schema and disposable accounts.
- Human evidence is pending.

## Recommended next action

Execute the reviewed preview D1 package through the Cloudflare dashboard, preserve the verification output, then run stateful preview and human-test preparation. Do not merge and do not begin Phase 2.
