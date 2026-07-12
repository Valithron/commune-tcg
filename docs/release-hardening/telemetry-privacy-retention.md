# Phase 1 Telemetry Privacy and Retention Proposal

> **Status: Approved by Sterling and implemented in Phase 1 on 2026-07-11.** Preview verification remains pending.

## Collection boundary

Collect only coarse operational events needed to reconstruct whether a player could log in, navigate, pull, inspect the Vault, save a squad, create/play/finish a battle, receive rewards, see an error, and retry.

Never collect:

- PINs or PIN hashes
- auth tokens, session cookies, or request authorization headers
- raw request or response bodies
- raw form text, card flavor text, review notes, or chat/message content
- full database rows or R2 objects
- exact IP addresses
- precise geolocation
- device advertising identifiers or fingerprints
- unrestricted URLs or query strings
- stack traces or raw SQL in player telemetry
- image content or filenames

## Storage proposal

Use a dedicated additive D1 telemetry table, separate from economy and gameplay transaction tables. Store server-derived player slot ID because this is a seven-person private alpha and account-level reconstruction is required. Do not store display names; join only in an authenticated administrator export when needed.

Telemetry writes must not share the atomic gameplay batch. A telemetry outage must not block authentication, pulling, battle creation, settlement, or navigation.

## Retention proposal

- Raw event retention: 30 days.
- Aggregated counts and durations: 180 days, with player ID removed after aggregation.
- Failed validation records: operational counts only, no rejected payload bodies.
- Manual deletion: administrator can delete one player's raw events by player ID and date range.
- Automatic cleanup: bounded daily deletion, not on a player-critical request path.

## Access and export

- Administrator session required.
- Export records the requesting administrator and date.
- No public endpoint.
- CSV/JSON export is sufficient initially.
- Exports should be treated as sensitive and not committed to the repository.

## Decision requested from Sterling

Sterling approved the event model, player identifier, exclusions, D1 storage, 30-day raw retention, 180-day anonymous aggregation, deletion policy, rate bounds, and administrator-only export as written.

## Implemented retention behavior

A daily scheduled Worker task runs bounded maintenance outside player-critical requests; administrator export also runs it defensively. Raw events older than 30 days are grouped by day, event, environment, route, and outcome without player identity, then deleted. Anonymous aggregate rows older than 180 days are deleted. Player/date-range raw deletion is available only through the authenticated administrator endpoint.
