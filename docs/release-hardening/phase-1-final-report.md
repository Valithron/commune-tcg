# Phase 1 Release-Hardening Report

> **Current recommendation: NO-GO while Phase 1 is in progress.** Preview binding verification, preview testing, and Cydney's human release-confidence session remain incomplete. This status is procedural and does not indicate a known production outage.

## Current status

| Field | Value |
| --- | --- |
| Branch | `phase/release-hardening` |
| Baseline | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Current implementation commit | Branch HEAD includes the approved telemetry implementation |
| Approximate completion | 72% |
| Draft PR | Prepared, not yet opened |
| Preview URL | Not available |
| Automated result | Full telemetry-inclusive working-tree gate passed: 61 tests, production build, Worker dry run, 1,000-battle simulation, and whitespace validation |
| Human testing | Not started |
| Telemetry | Design approved and minimal Phase 1 implementation complete on the branch; preview evidence pending |

## Executive summary

Phase 1 established a reproducible baseline, mapped the active route/API surface, added high-value transaction tests, implemented the authorized Energy regeneration contract, and corrected verified ownership and administrator-boundary defects. No production data was mutated and no Phase 2 work began.

## Findings by area

- **Reliability:** Baseline gate passed. Pull requests now have durable idempotency claims; Energy reconciliation is repeatable.
- **Playability:** The permanent Energy lockout is corrected in source and tests. Device/browser preview remains required.
- **Clarity and visual cohesion:** Known route, Card Lab, Cydney color, type-color, and Energy documentation contradictions were corrected without redesign.
- **Economy:** Daily claim, Gold exchange, pull concurrency, battle settlement, and Energy cases have isolated SQLite evidence.
- **Security and ownership:** Vault and battle-history caller overrides, public Vault inventory, legacy submission-list exposure, non-session submission identity, and fixed reviewer identity were corrected.
- **Recovery:** Pull and battle retry contracts are documented; browser interruption testing remains.
- **Telemetry:** The approved minimal event set is implemented with server-derived identity/time/release context, allowlisted fields, D1 retention/aggregation/deletion, administrator audit, rate limiting, and gameplay-failure isolation.
- **Technical debt:** Runtime schema creation and allowlist-only administrator roles remain; the active temporary-owner fallbacks were removed from player mutations.

## Changes

| Problem | Implementation | Risk | Test coverage | Preview result |
| --- | --- | --- | --- | --- |
| Energy never regenerated | Shared elapsed-time reconciler on reads and pre-battle debit | Low, additive behavior within approved contract | Direct interval/cap/backfill/concurrency/debit tests | Pending |
| Pull retry/concurrency could duplicate grants | Additive `pull_requests` claim and client request reuse | Medium, transaction path changed | Repeat and competing-request tests | Pending |
| Vault/history owner query override | Session-only owner queries | Low | Behavioral cross-owner tests | Pending |
| Public ownership/submission diagnostics | Administrator policy | Low | Admin policy tests | Pending |
| Fixed submission reviewer | Persist authenticated admin slot | Low | Policy/full suite; behavior preview pending | Pending |
| Canonical documentation contradictions | Source-verified corrections | Low | Diff/build review | N/A |
| Missing release telemetry | Minimal authenticated ingestion, allowlisted schema, aggregate retention, audited administrator export/deletion, and non-blocking client instrumentation | Low to medium, additive writes | Telemetry backend and client contract tests | Pending |

## Decisions required before completion

1. Provide or verify Cloudflare production/preview SHA, URLs, and binding behavior through the managed deployment environment.
2. After preview readiness, complete Sterling and Cydney human tests.
3. At the end, explicitly approve or reject merge. No merge will occur automatically.

## Remaining blockers and risks

- Exact production SHA is unknown from source.
- Preview may share production D1/R2; mutation testing is blocked until known.
- Branch publication and preview verification remain.
- Browser slow/offline/interruption and common iPhone widths remain unverified.
- Telemetry live D1 and failure-isolation evidence remains pending preview binding verification.
- Human evidence is pending.

## Recommended next action

Publish the coherent Phase 1 branch and draft PR when the coding platform publication window is available, verify preview bindings, deploy preview, and execute the human test plan. Do not merge and do not begin Phase 2.
