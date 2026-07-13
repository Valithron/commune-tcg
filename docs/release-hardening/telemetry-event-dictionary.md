# Phase 1 Telemetry Event Dictionary

> **Status: Approved by Sterling and implemented in Phase 1 on 2026-07-11.** Preview sample verification remains pending.

## Naming and envelope

Event names use lowercase dot-separated domain actions, such as `pull.completed`. The browser telemetry service creates an opaque deduplication ID; the server validates it and derives the timestamp, authenticated player, release commit, and environment. Client-provided fields are restricted to the documented envelope.

Required envelope:

| Field | Purpose |
| --- | --- |
| `eventId` | Opaque browser-generated deduplication identifier, validated and stored once by the server |
| `eventName` | Allowlisted event name |
| `occurredAt` | Server receipt time; optional bounded client time may be separate |
| `releaseCommit` | Identify the tested release |
| `environment` | Production or named preview |
| `playerId` | Authenticated player slot ID, never caller-selected |
| `sessionId` | Random analytics-session ID distinct from auth tokens |
| `route` | Allowlisted route identifier, not arbitrary URL text |
| `deviceCategory` | Desktop, phone, or tablet |
| `browserCategory` | Coarse browser family |
| `outcome` | Allowlisted success/failure/interrupted value |
| `durationMs` | Optional bounded duration where meaningful |
| `errorCategory` | Coarse category, never raw stack/error body |
| `relatedId` | Optional validated pull, attempt, or transaction ID |

## Proposed core events

| Event | Trigger | Why it matters | Optional fields |
| --- | --- | --- | --- |
| `session.started` | Authenticated app session begins | Establish session funnel | returning flag |
| `auth.login_completed` | Login succeeds or fails | Find authentication friction | outcome, errorCategory |
| `route.viewed` | Stable route render completes | Reconstruct navigation | route, durationMs |
| `ticket.daily_claim_completed` | Claim response resolves | Verify return loop and failures | outcome, relatedId |
| `ticket.exchange_completed` | Gold exchange resolves | Identify economy friction | outcome, offer ID |
| `pull.started` | Confirmed request begins | Funnel entry | pull count, relatedId |
| `pull.completed` | Server result is available | Verify completion and duration | pull count, outcome, relatedId |
| `pull.interrupted` | Pending request survives navigation/network failure | Quantify recovery need | stage, relatedId |
| `vault.viewed_after_pull` | Vault viewed with recent pull context | Measure collection follow-through | relatedId |
| `squad.saved` | Formation save succeeds/fails | Identify squad friction | outcome, encounter ID |
| `battle.created` | Pending attempt created | Battle funnel entry | encounter ID, relatedId |
| `battle.playback_started` | Arena starts stored log | Separate creation from viewing | relatedId |
| `battle.interrupted` | Playback exits before terminal UI | Diagnose known interruption | stage, relatedId |
| `battle.surrendered` | Surrender settles | Understand exits | relatedId |
| `battle.completed` | Stored playback reaches results | Core-loop completion | outcome, durationMs, relatedId |
| `reward.finalized` | Settlement response succeeds/fails | Verify reward reliability | outcome, relatedId |
| `error.displayed` | Categorized actionable error shown | Locate failure states | errorCategory, route |
| `retry.attempted` | User retries a recoverable transaction | Validate recovery design | related event, relatedId |

## Validation and failure isolation

- Server derives player, timestamp, environment, and release.
- Unknown event names and fields are rejected.
- String lengths, duration ranges, and enum values are bounded.
- One event ID is accepted once.
- Per-session and per-player rate bounds prevent loops from flooding storage.
- Collection is asynchronous and non-blocking.
- Telemetry failure is swallowed only after operational logging; it never changes gameplay success or settlement.
- Rerenders must not emit duplicate completion events.

## Proposed inspection

The smallest useful presentation is an administrator-only CSV/JSON export with date, environment, player, session, event, route, outcome, duration, error category, and related ID filters. A dashboard is not required for Phase 1.

## Implemented path

- Player collection endpoint: `POST /api/telemetry`
- Administrator export: `GET /api/admin/telemetry`
- Player/date-range deletion: `DELETE /api/admin/telemetry`
- Storage and validation: `functions/_shared/telemetry.js`
- Browser client: `src/services/telemetry.js`
- Additive schema: `migrations/003_telemetry.sql`
- Per-session rate bound: 200 accepted events per rolling hour
- Per-player rate bound: 1,000 accepted events per rolling hour across analytics sessions
- Deduplication: unique server-stored client event ID
- Admin accountability: export and deletion actions are recorded in `telemetry_admin_audit`
- Retention execution: daily scheduled Worker maintenance, with administrator export also running maintenance defensively

Implemented instrumentation covers session start, successful login, route view, daily claim, ticket exchange, pull start/completion/interruption, Vault after pull, squad save, battle creation/playback/interruption/surrender/completion, reward finalization, displayed route errors, and retries.
