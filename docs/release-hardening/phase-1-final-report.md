# Phase 1 Release-Hardening Report

> **Current recommendation: NO-GO pending the human approval gate.** Automated and authenticated technical preview validation pass, but Sterling and Cydney human release-confidence sessions remain incomplete. This status is procedural and does not indicate a known production outage.

## Current status

| Field | Value |
| --- | --- |
| Branch | `phase/release-hardening` |
| Baseline | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Current implementation commit | Branch HEAD; deployed application tree verified at `8ca094bbcb062e25bd606f37bba521c9fccac205` |
| Approximate completion | 96% |
| Draft PR | [#5 Phase 1 release hardening](https://github.com/Valithron/commune-tcg/pull/5) |
| Preview URL | `https://phase-release-hardening.commune-tcg.pages.dev` |
| Automated result | Reconciled Phase 1 gate passed: 67 tests, 93-module production build, prior Worker dry run, 1,000-battle simulation, and whitespace validation |
| Human testing | Public desktop setup and claimed-account login states verified; authenticated technical core loop passed; Sterling, Cydney, and true mobile passes pending |
| Telemetry | Design approved; minimal implementation, deployed authenticated behavior, and exact post-run row inventory passed |

## Executive summary

Phase 1 established a reproducible baseline, mapped the active route/API surface, added high-value transaction tests, implemented the authorized Energy regeneration contract, and corrected verified ownership and administrator-boundary defects. No production data was mutated and no Phase 2 work began.

## Findings by area

- **Reliability:** Baseline gate passed. Pull requests now have durable idempotency claims; Energy reconciliation is repeatable.
- **Playability:** The permanent Energy lockout is corrected in source, automated tests, and authenticated preview validation. The approved value is 1 Energy every 7 minutes, capped at 10, with a live top-bar countdown. Human countdown observation remains required.
- **Clarity and visual cohesion:** Known route, Card Lab, Cydney color, type-color, and Energy documentation contradictions were corrected without redesign.
- **Economy:** Daily claim, Gold exchange, pull concurrency, battle settlement, and Energy cases have isolated SQLite evidence.
- **Security and ownership:** Vault and battle-history caller overrides, public Vault inventory, legacy submission-list exposure, non-session submission identity, and fixed reviewer identity were corrected.
- **Recovery:** Pull same-request retry, duplicate battle creation/finalization, second-session battle recovery, cross-owner denial, and surrender recovery passed deployed technical validation. Human browser interruption timing remains.
- **Telemetry:** The approved minimal event set is implemented with server-derived identity/time/release context, allowlisted fields, D1 retention/aggregation/deletion, administrator audit, rate limiting, and gameplay-failure isolation.
- **Technical debt:** Runtime schema creation and allowlist-only administrator roles remain; the active temporary-owner fallbacks were removed from player mutations.

## Changes

| Problem | Implementation | Risk | Test coverage | Preview result |
| --- | --- | --- | --- | --- |
| Energy never regenerated | Shared elapsed-time reconciler on reads and pre-battle debit plus live top-bar countdown; current approved interval 7 minutes | Low, additive behavior within approved contract and subsequent hotfix approval | Direct interval/cap/backfill/concurrency/debit and UI contract tests | Pass, including deployed 420,000 ms reconciliation and owner isolation |
| Pull retry/concurrency could duplicate grants | Additive `pull_requests` claim and client request reuse | Medium, transaction path changed | Repeat and competing-request tests | Pass: retry returned committed result with one debit and one grant |
| Vault/history owner query override | Session-only owner queries | Low | Behavioral cross-owner tests | Pass across two authenticated accounts |
| Public ownership/submission diagnostics | Administrator policy | Low | Admin policy tests | Non-admin telemetry diagnostic denial passed; remaining human admin review pending |
| Fixed submission reviewer | Persist authenticated admin slot | Low | Policy/full suite | Source and automated pass; human submission flow remains outside current disposable core-loop fixture set |
| Canonical documentation contradictions | Source-verified corrections | Low | Diff/build review | N/A |
| Missing release telemetry | Minimal authenticated ingestion, allowlisted schema, aggregate retention, audited administrator export/deletion, and non-blocking client instrumentation | Low to medium, additive writes | Telemetry backend and client contract tests | Pass for deployed capture, dedupe, privacy, authorization, deletion, audit, and gameplay isolation |

## Decisions required before completion

1. Complete Sterling and Cydney human tests, including a true mobile-browser pass.
2. At the end, explicitly approve or reject merge. No merge will occur automatically.

## Remaining blockers and risks

- Preview bindings, resource identifiers, schema, fixtures, reviewed reset, authenticated harness, and post-validation row inventory passed and are recorded.
- Human browser slow/offline/interruption and common iPhone widths remain unverified.
- Telemetry deployed behavior and final row counts passed. Human comprehension and trust observations remain pending.
- Human evidence is pending.

## Recommended next action

Execute the Sterling and Cydney human core-loop gate with a true mobile-browser pass, record observations separately, then prepare the final merge recommendation. Do not merge and do not begin Phase 2.
