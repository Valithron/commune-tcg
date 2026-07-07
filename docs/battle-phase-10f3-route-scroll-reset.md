# Battle Phase 10F.3: Route Scroll Reset

## Purpose

Phase 10F.3 fixes a navigation polish issue where the app could remain scrolled down after moving from Squad Builder to Battle Results.

Plain-English rule:

```text
When a new route opens, the player should start at the top of that screen.
```

## What changed

File:

```text
src/main.js
```

## Implementation

A route-level helper was added:

```text
scrollRouteToTop()
```

It runs after the new route shell is mounted.

It resets:

```text
document scrolling element
body scroll position
#app scroll position
#main-content scroll position
window scroll position
```

It also repeats the window scroll reset on the next animation frame to avoid browser scroll restoration leaving the user partway down the new screen.

## Why this is route-level

This is not tied to the Start Battle button.

The same fix applies to route transitions such as:

```text
Squad Builder -> Battle Results
Battle Results -> Battle Again
Encounter Select -> Squad Builder
any player/admin route render
```

## Mechanics unchanged

Phase 10F.3 does not change:

```text
battle selection
reward settlement
reward reveal
XP application
gold application
card rendering
route matching
hash routing
```

## Verification checklist

1. Scroll down on `#/battle/squad`.
2. Click Start Battle.
3. Confirm Battle Results opens at the top of the page.
4. Confirm the Victory/Defeat header is visible immediately.
5. Scroll down on Battle Results.
6. Click Battle Again.
7. Confirm the new Battle Results route opens at the top.
8. Confirm reward settlement and reveal still work normally.
