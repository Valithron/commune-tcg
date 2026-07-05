# Phase 10.6: Pull History Semantics

## Purpose

Phase 10.6 makes pull history useful without adding visual polish.

The pull history should clearly show:

```text
who pulled
which card title was pulled
which rarity was pulled
```

## Backend changes

Updated:

```text
functions/_shared/pull-engine.js
```

Future `pull_history.result_json` entries now include:

```text
ownerUserId
ownerDisplayName
cardTitle
actualRarity
selectedRarity
characterId
sourceCardId
sourceRowId
ownedCardId
```

## Backward compatibility

Older pull history rows only stored ids and rarity data.

`readPullHistory` now hydrates older rows from `ownedCardId` when the owned card row still exists in `cards`.

Hydrated fallback fields include:

```text
ownerUserId
ownerDisplayName
cardTitle
actualRarity
characterId
```

## UI changes

Updated:

```text
#/pull/history
```

Rows now render like:

```text
Sterling pulled 5 cards
Rare · Card Title, Common · Card Title
```

This is semantic polish only.

## Guardrails

- No thumbnails.
- No timeline redesign.
- No filters.
- No sorting controls.
- No Battle changes.
- No reward changes.
- No auth changes.
- No card visual changes.

## Verification checklist

After Cloudflare deploys:

1. Open `#/pull/history`.
2. Confirm existing rows show `Sterling pulled...`.
3. Confirm card titles appear where owned card rows can be hydrated.
4. Confirm rarity appears beside each title.
5. Run a new pull.
6. Confirm the new history row shows owner, title, and rarity without needing hydration fallback.
7. Confirm Vault, Battle, and rewards are unchanged.

## Next phase

Recommended next step is Phase 11.1:

```text
Battle engine inventory and read-only battle diagnostics
```

Do not write battle results until owned-card eligibility and reward contracts are mapped.
