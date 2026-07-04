# Phase 8.4: Vault Data Source Cleanup

## Purpose

Phase 8.4 removes duplicated Vault loading logic from the Vault list and Vault detail routes.

It preserves the Phase 8.3 behavior exactly:

```text
#/vault -> /api/vault?ownerUserId=sterling
#/vault/card/:cardId -> same Vault data source, then detail panel
```

## New shared module

```text
src/data/vaultData.js
```

Exports:

```text
temporaryVaultOwner
loadVaultCards()
findVaultCardById()
getVaultSourceLabel()
```

## Guardrails

- No visual changes.
- No CardFrame changes.
- No endpoint changes.
- No D1 writes.
- No auth claims.
- No pull, reward, battle, or submission changes.
- Mock fallback remains.

## Verification checklist

After Cloudflare deploys:

1. Open `#/vault`.
2. Confirm `Source: Live Vault · sterling`.
3. Confirm the owned count remains 15.
4. Tap a card.
5. Confirm detail opens and still stacks correctly.
6. Confirm the card visuals are unchanged.

## Next step

Phase 8 can be considered stable after this cleanup. The next major phase is Phase 9: Submission upload pipeline.
