# Gacha Admin Containment

## Purpose

Phase 4.5 separates the player game from builder and diagnostic tools.

Rule:

```text
Player pages show the game.
Admin pages show the tools.
```

## Player routes

Player routes render through:

```text
src/components/AppShell.js
```

These routes keep the normal player top bar and bottom nav.

Current player areas:

```text
Home
Pull
Vault
Library
Shop
Battle
Submit Card
```

Player pages should not link to admin pages.

## Admin routes

Admin routes render through:

```text
src/components/AdminShell.js
```

Admin routes use this prefix:

```text
#/admin
```

Current admin areas:

```text
#/admin
#/admin/submissions
#/admin/submission/:submissionId
#/admin/backend
#/admin/inventory
#/admin/card-lab
```

AdminShell only links to admin routes.

## Redirects

Older diagnostic hashes redirect into the admin area:

```text
#/backend -> #/admin/backend
#/inventory -> #/admin/inventory
#/card-lab -> #/admin/card-lab
```

## Player cleanup

Removed player links to admin tools from:

```text
src/routes/Home.js
src/routes/Library.js
src/routes/SubmitCard.js
```

Moved Card Lab access to:

```text
#/admin/card-lab
```

## No gameplay writes changed

This containment step does not add reward, XP, level, currency, stamina, energy, Vault, or card progression writes.

Battle write behavior remains:

```text
POST /api/battles writes battle_history only
```

## Next step

After this boundary is verified, the next recommended phase is:

```text
Battle Phase 5: reward and XP writes with atomic failure handling
```
