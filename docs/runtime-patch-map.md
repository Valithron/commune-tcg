# Runtime Patch Map

Current inventory-only map of the Commune TCG browser patch load order. This file documents the current runtime surface and does not define a new architecture.

Last inventory pass: Card Rendering Stabilization, inventory-only branch `inventory/card-rendering-map`.

## Direct scripts loaded by index.html

1. `app.js`
2. `character-color-sync.js`
3. `ux-refresh-guard.js`
4. `crop-touch.js`
5. `title-limit.js`
6. `battle-end.js`
7. `mint-upload-enhance.js`
8. `mint-flavor.js`
9. `mint-success-redirect.js`
10. `ai-battle-squad.js`
11. `mobile-collection-fix.js`
12. `vaults.js`
13. `card-polish-fix.js`
14. `card-face-redesign.js`
15. `card-title-stability.js`
16. `card-badge-compact.js`
17. `no-sidebar-pages.js`
18. `ascension-failsafe.js`
19. `home-page.js`
20. `home-data.js`
21. `home-tuning.js`
22. `no-mobile-home.js`
23. `battle-color-clarity.js`

## Dynamic scripts injected by mobile-collection-fix.js

`mobile-collection-fix.js` injects these scripts at runtime:

- `ai-enemy-type.js`
- `market-sparklines.js`
- `market-smooth-refresh.js`
- `battle-history.js`
- `card-xp.js`
- `ascension-ceremony.js`
- `ascension-mobile-click-fix.js`
- `ascension-failsafe.js`
- `battle-rules.js`
- `battle-flow.js`
- `battle-setup-fix.js`
- `battle-results-polish.js`
- `battle-fullscreen.js`
- `battle-speed.js`
- `battle-ko-fix.js`
- `battle-no-flavor.js`

## Removed dormant legacy patches

These files were removed from the build allowlist and deleted from the repository:

- `battle-team-fix.js`
- `card-title-fit-final.js`

## Current winning files for high-risk globals

This records the current outermost or last runtime owner visible from the load map. Wrapped functions may still call earlier implementations internally.

- `render`: `no-mobile-home.js` in the direct script chain after `no-sidebar-pages.js`, `card-title-stability.js`, `card-face-redesign.js`, `card-polish-fix.js`, `vaults.js`, and `ux-refresh-guard.js` have already wrapped or guarded it. Battle dynamic patches can add more bind/render-triggered behavior after `mobile-collection-fix.js` loads the battle chain.
- `bind`: `battle-fullscreen.js` after the battle dynamic patch chain loads. Direct wrappers before it include `title-limit.js`, `mobile-collection-fix.js`, `vaults.js`, and `no-mobile-home.js`.
- `cardHtml`: `card-title-stability.js` in the direct script chain. `title-limit.js` and `card-polish-fix.js` wrap it earlier, while dynamic `card-xp.js` can also wrap it after `mobile-collection-fix.js` loads the XP/ascension chain. This is timing-sensitive because `card-xp.js` loads dynamically before some direct card patches may finish their post-render passes.
- `collection`: `mobile-collection-fix.js` wraps collection after `title-limit.js` changes the all-character collection path.
- `battle`: `battle-flow.js` replaces the battle page once the dynamic chain loads.
- `shell`: `vaults.js` is the later direct wrapper after `title-limit.js` also adds a Vaults tab.
- `mintCard`: `mint-success-redirect.js` as the single mint patch owner; `mint-flavor.js` no longer overrides `mintCard`.

## Ascension ownership

- `card-xp.js`: owns XP calculation, XP badge rendering, and rendering `[data-ascend-card]` buttons; it no longer defines or binds `ascendCard`.
- `ascension-ceremony.js`: owns the main `ascendCard` flow, the server ascend call for normal card-button activation, and `ascShowCeremony`.
- `ascension-mobile-click-fix.js`: owns mobile/touch hit handling and calls the main `ascendCard` function.
- `ascension-failsafe.js`: owns the backup bottom bar and fallback confirmation sheet; it no longer binds real card buttons directly.

# Card Rendering Stabilization Inventory

Scope: inventory only. No observer reductions, no helper extraction, no render contract changes, and no behavior changes were made in this pass.

## Card Rendering Ownership Map

| Surface | Current owner / wrapper | What it touches | Evidence | Risk |
| --- | --- | --- | --- | --- |
| Base card HTML | `app.js` `cardHtml(c,big)` | Emits `.card`, `.art`, `.ctop strong`, `.badge`, `.eq`, `.stats`, `.fx`, `.cbot`, `data-card-id`; truncates title before patches restore full title. | Base function is the only original card factory. | High, because every later card patch assumes this structure. |
| Base collection render | `app.js` `collection()`, `section()`, `grp()` | Collection page, rarity groups, card grids. | Calls `cardHtml(x)` for every owned card in visible character sections. | High, because large card counts multiply all post-render passes. |
| Base battle render | `app.js` `battle()` | Old/simple battle page card list. | Calls `filteredCards().map(c=>cardHtml(c))`. | Medium, mostly superseded by `battle-flow.js`. |
| Title limits and rarity class | `title-limit.js` | Wraps `cardHtml`; adds rarity class; replaces collection all-character view; defines `scheduleTitleFit`; defines old battle stage rendering using full card faces. | `cardHtml = function...`, `collection = function...`, `battle = function...`, `bind = function...`. | High, because later patches still call `scheduleTitleFit` and assume its classes/styles exist. |
| Mobile filter and dynamic loader | `mobile-collection-fix.js` | Wraps `collection` and `bind`; injects mobile character filter; dynamically loads `card-xp.js`, ascension, market, and battle patches. | Script loader functions plus `collection=function...`, `bind=function...`. | High, because it is both a layout patch and the dynamic patch chain root. |
| Vault rendering | `vaults.js` | Defines read-only `vaultsReadOnlyCardHtml`; wraps `shell`, `render`, and `bind`; uses card-like markup but intentionally hides interactive controls. | Own card factory, modal render path, `render=function...`. | Medium-high, because card polish/title patches see vault card DOM but `card-face-redesign.js` intentionally excludes vault cards. |
| Card polish | `card-polish-fix.js` | Normalizes rarity classes, frame CSS variables, and title sizing; wraps `cardHtml` and `render`; starts broad body observer. | `cardHtml=function...`, `render=function...`, `MutationObserver(document.body,{childList:true,subtree:true})`. | High observer noise risk. |
| Card face redesign | `card-face-redesign.js` | Adds collectible face redesign class, character initials, level badge, vertical XP rail, detail modal override; wraps `render`; starts broad body observer. | `render=function...`, `showCardDetail=function...`, `MutationObserver(document.body,{childList:true,subtree:true})`. | High observer noise risk and high visual ownership. |
| Title stability | `card-title-stability.js` | Restores full titles, sets `data-card-title`, wraps `cardHtml`, wraps `scheduleTitleFit`, wraps `render`; starts broad body observer. | `cardHtml=function...`, `scheduleTitleFit=function...`, `render=function...`, `MutationObserver(document.body,{childList:true,subtree:true})`. | High, protects long titles but duplicates title-fit work. |
| Compact badges | `card-badge-compact.js` | Final compact card face sizing pass; exposes `window.fitCommuneCardTitles`; listens to resize; starts broad document observer including text changes. | `MutationObserver(document.documentElement,{childList:true,subtree:true,characterData:true})`, resize listener. | Very high observer noise risk. |
| XP and ascend card controls | `card-xp.js` | Defines XP thresholds/progress, injects hidden/legacy XP badge, appends `cardAscendBtn`/hint into card HTML, triggers render after load. | `cardHtml=function...`, `setTimeout(()=>{if(user)render()},0)`. | High because it mutates the card factory dynamically after load. |
| Ascension ceremony | `ascension-ceremony.js` | Normal card-button ascend flow; mutates returned card into state after animation; calls `loadState()` and `render()` on close. | `ascShowCeremony`, `ascendCard`, click capture on `[data-ascend-card]`. | Medium-high, because completion paths cause full state refresh/render. |
| Ascension failsafe | `ascension-failsafe.js` | Scans visible `[data-ascend-card]` controls, shows bottom fallback bar, runs fallback ascend flow, polls and observes DOM. | `setInterval(refresh,700)`, `MutationObserver(document.body,{childList:true,subtree:true,attributes:true,...})`. | High if ready buttons exist; it observes attributes and polls regardless of page. |
| Battle flow | `battle-flow.js` | Replaces `battle`; renders setup views, team picker cards as lightweight pick rows, and playback/results navigation. | `battle=battleFlowPage`, `bind=function...`, `render()` in flow transitions. | Medium-high, because battle setup rerenders on every selection. |
| Battle fullscreen | `battle-fullscreen.js` | Owns fullscreen battle playback DOM, lightweight fighter rows, HP/damage updates. Wraps `bind`. | DOM-specific updates like `battleFsSetHp`, `battleFsDamagePop`, `playBattleReplay`; no full card faces in fullscreen. | Medium, hot during battle but mostly narrow DOM mutation. |
| Battle results | `battle-results-polish.js` | Results page, XP rows, ascend-ready buttons in result rows. Wraps `bind`. | `battleResultXpRow`, `data-ascend-card`, `bind=function...`. | Medium, interacts with ascension click handling and failsafe scanner. |
| UX refresh guard | `ux-refresh-guard.js` | Wraps `loadState`, `render`, and `bind`; defers or quiet-loads while modals/editors/battle fullscreen are active. | `loadState=async function...`, `render=function...`, `bind=function...`, `setInterval(tryFlush,1000)`. | Medium, stabilizing patch but another render gate. |
| No-sidebar pages | `no-sidebar-pages.js` | Wraps `shell` and `render`; marks market/tokens/battle full-width. | `shell=function...`, `render=function...`, delayed layout marks. | Low-medium. |
| No-mobile-home | `no-mobile-home.js` | Last direct render wrapper; redirects mobile home to collection and adjusts brand/home nav behavior. | `render=function...`, `bind=function...`. | Low-medium, but currently the outer direct render owner. |

## Observer Map

| File | Observer / recurring trigger | Target and options | Callback work | Current guard | Noise assessment |
| --- | --- | --- | --- | --- | --- |
| `card-polish-fix.js` | `MutationObserver` | `document.body`, `{childList:true,subtree:true}` | After 30 ms, runs `applyCardPolish(document)`, scans all `.card`, then schedules title fitting via RAF and timeout. | Ignores while `window.isAscensionCeremonyActive`; only checks for added nodes. | Broad. Every added node anywhere can rescan all cards. |
| `card-face-redesign.js` | `MutationObserver` | `document.body`, `{childList:true,subtree:true}` | After 35 ms, runs `installDetailOverride()` and `apply(document)`, scanning all `.card[data-card-id]`; then may call title polish. | None beyond internal card eligibility checks and style singleton. | Broad. Duplicates post-render work already done by render wrapper and startup timers. |
| `card-title-stability.js` | `MutationObserver` | `document.body`, `{childList:true,subtree:true}` | After 35 ms, runs `scheduleStable(document)`, which performs RAF plus 60/180/420 ms title fits and font-ready fit. | None. | Broad and multiplicative with its own delayed schedule. Important for long-title stability. |
| `card-badge-compact.js` | `MutationObserver` | `document.documentElement`, `{childList:true,subtree:true,characterData:true}` | After 40 ms, runs `refresh()`, reinstalls style, RAF title fit, timeout fits, and may call `scheduleTitleFit`. | None. | Broadest card observer. Character data changes can retrigger title fitting even without new card nodes. |
| `ascension-failsafe.js` | `setInterval` | Every 700 ms | Calls `refresh()`/`showBar()`, queries visible `[data-ascend-card]`, updates or removes fallback bar. | Suspends during ceremony/fallback busy state. | Persistent polling across pages once installed. |
| `ascension-failsafe.js` | `MutationObserver` | `document.body`, `{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','disabled']}` | After 40 ms, calls `refresh()`/`showBar()`. | Same suspend flags. | Broad and attribute-sensitive. Class/style changes from battle/card animation can retrigger it. |
| `ux-refresh-guard.js` | Document event listeners | `pointerdown`, `touchstart`, `mousedown`, `keydown`, `input`, `change`, etc. | Marks explicit user interaction to decide render/load behavior. | Filters target to interactive/editor/modal regions. | Intentional, not card-specific observer noise. |
| `ux-refresh-guard.js` | `setInterval` | Every 1000 ms | Attempts to flush deferred load/render. | Checks modal/editor/battle state first. | Stabilizing background loop, not card-specific. |
| `character-color-sync.js` | `setInterval` | 250 ms, max 21 runs | Syncs character/account colors during boot. | Stops after `tries > 20`. | Low, finite startup-only. |
| `battle-speed.js` | `setInterval` | 50 ms, max 81 tries | Waits for battle fullscreen functions, then patches pause/log functions. | Clears on success or max tries. | Low, finite startup/install probe. |

## Hot Path Ranking

This ranking is based on source-observable evidence from the inventory. No browser performance trace was captured in this pass, so timing and callback counts are not asserted as measured runtime numbers yet. The strongest evidence here is render frequency, observer breadth, callback work volume, and repeated full-document scans.

| Rank | Path | Evidence | Why it is hot | Notes for future measurement |
| --- | --- | --- | --- | --- |
| 1 | Collection card grid render and post-render card observers | Collection groups call `cardHtml()` for every visible card. After render, `card-polish-fix.js`, `card-face-redesign.js`, `card-title-stability.js`, and `card-badge-compact.js` can all scan the document/card set. | Largest card count surface and most layered post-processing. | Add temporary counters around each observer callback and count `.card` nodes processed per render. |
| 2 | Broad title/compact observer stack | Three title/card display observers schedule delayed fits. `card-badge-compact.js` also observes `characterData`. | Title fitting reads layout (`scrollWidth`, `clientWidth`, bounding boxes), which can be expensive when repeated across many cards. | Count callback invocations per page change and per battle result render. |
| 3 | Ascension ready/failsafe detection | `ascension-failsafe.js` polls every 700 ms and also observes body child/attribute changes. It queries `[data-ascend-card]` and computes visibility. | Persistent across app once installed; can be retriggered by class/style changes. | Track refresh count per minute on collection, battle setup, and battle results. |
| 4 | Battle setup team picker | `battle-flow.js` rerenders on every pick/remove/auto/clear/enemy selection. Pick cards are lightweight rows, but each `render()` still triggers global render wrappers and card observers. | High interaction frequency while selecting squad. | Count renders during one manual three-card squad selection. |
| 5 | Battle playback | Fullscreen uses narrow DOM updates (`battleFsSetHp`, class toggles, log rows) rather than full card faces. | Mutates DOM frequently during replay, but not usually `.card` nodes. Attribute/class mutation can still wake broad observers and ascension failsafe. | Confirm whether card observers fire during fullscreen playback. |
| 6 | Battle results XP/ascend rows | Results page emits `[data-ascend-card]` rows and then can trigger ascension handling/failsafe. | Smaller DOM than collection, but important because it bridges battle result XP and ascension. | Track failsafe refreshes after results render. |
| 7 | Vaults | Read-only card-like markup, modal card display, and title fitting. `card-face-redesign.js` excludes vaults, but other card/title polish can still see vault cards. | Medium card volume; lower interaction frequency. | Verify read-only card title/badge stability on desktop/mobile. |
| 8 | Mint preview | Preview rewrites only `.preview` on flavor text input and calls `scheduleTitleFit(preview)`. | Small DOM, frequent while typing. | Keep scoped; avoid global observers doing full document work on preview-only updates. |

## Low-risk Improvement Candidates

No candidate was implemented in this pass. These are ranked for Grok review before any code change.

### Safe candidates for later review

1. Add temporary opt-in counters around card observer callbacks in development only.
   - Goal: measure callback count, processed card count, and average elapsed time.
   - Risk: low if gated behind a flag and removed after diagnosis.

2. Add a shared debounce guard to repeated full-document card post-processing.
   - Goal: collapse multiple observer callbacks into one scheduled pass per frame or short window.
   - Risk: low-medium because title stability is sensitive.

3. Narrow `card-face-redesign.js` observer callback to mutation roots that contain or add `.card[data-card-id]`.
   - Goal: avoid rescanning all cards for unrelated DOM changes.
   - Risk: medium; must not miss card detail modal or delayed dynamic card insertion.

4. Narrow `card-polish-fix.js` to process added subtrees instead of `document` where possible.
   - Goal: keep rarity and title polish scoped to new card DOM.
   - Risk: medium; root-scoped title fitting must still handle full rerenders.

5. Limit `card-badge-compact.js` observer away from `characterData` unless evidence proves it is needed.
   - Goal: reduce repeated title fitting from text changes unrelated to cards.
   - Risk: medium-high; this file currently protects title/badge regressions.

6. Make `ascension-failsafe.js` page/context aware before polling/observing heavy work.
   - Goal: do not scan ascend controls on pages with no possible ascend buttons.
   - Risk: medium; battle results can include ascend buttons, not just collection.

7. Document and then eventually consolidate title fit ownership.
   - Goal: decide whether `scheduleTitleFit`, `card-title-stability.js`, or `card-badge-compact.js` owns final title fitting.
   - Risk: high if done too early. Defer until after measurement.

### Candidates to defer

- Rewriting card rendering around a new canonical helper.
- Deleting any patch file.
- Removing observers without callback-count evidence.
- Changing card markup classes or visual layout.
- Changing XP, ascension, battle, or vault data behavior.

## Verification Checklist

Run this before and after any future card-rendering change.

### Collection desktop

- All-character collection renders all rarity groups.
- Individual character filter renders only that character.
- Long card titles do not overlap the rarity badge.
- Rarity badge is right-justified and visible inside the card face.
- `ST` appears for Sterling cards.
- Equipped card shows only the intended equipped marker; duplicated bottom messaging stays removed.
- Unequipped card has no equipped marker.
- Cards with no earned XP show no vertical XP rail.
- Cards with earned XP show the vertical XP rail with a plausible fill amount.
- Level badge appears left of stats and above flavor text on owned eligible cards.
- Ascension-ready cards show their ascend control when level/XP/tokens permit.
- Ascension-not-ready cards do not show an ascend control.
- Compact badges remain legible for common, uncommon, rare, and legendary.

### Collection mobile

- Mobile character filter appears and scrolls horizontally.
- Cards are not clamped or squeezed by sidebar/layout assumptions.
- Long titles remain inside card bounds.
- Rarity badges remain right-aligned and readable.
- XP rail, level badge, equipped marker, and ascend controls remain tap-safe.
- Failsafe ascension bar appears only when a ready ascend button exists and does not cover critical card content unexpectedly.

### Mint preview

- Title input respects limit and preview updates without full-page visual jitter.
- Flavor text updates preview copy.
- Crop/zoom changes update the preview image.
- Long preview title fits the big card.
- Rarity frame and badge still appear correctly.

### Battle setup

- Team picker opens without delay.
- Search, character filter, and rarity filter update visible pick rows without full card-face clutter.
- Picking/removing three cards does not progressively slow down interaction.
- Selected squad state persists when navigating team/enemy steps.
- Mobile battle setup layout remains usable.

### Battle playback

- Battle starts from setup and enters fullscreen playback.
- HP bars update.
- Damage popups and active/target/KO classes render correctly.
- Skip to results works.
- Observer noise does not visibly slow replay after several battles.

### Battle results

- Result page shows reward, MVP, report, XP rows, and squad report.
- XP rows show level/progress correctly.
- Ascension-ready result rows show `Ascend Ready` when eligible.
- Ascension-needed rows show token need instead of button.
- Normal ascension button click works from results.
- Failsafe bar does not duplicate or fight the normal result-row button.

### Ascension

- Normal card ascend button opens confirmation and ceremony.
- Failsafe bar opens fallback confirmation only when needed.
- Ceremony is fast and does not generate console spam.
- Closing ceremony reloads state and returns to prior page/view/filter.
- Ascended card rarity, level, XP, stats, and token cost reflect server state afterward.

### Vaults

- Vaults tab appears once.
- Vault read-only cards render without equip/ascend controls.
- Vault card modal opens and closes.
- Long read-only titles remain stable.
- Desktop and mobile vault grids remain usable.

### Regression checks

- Browser console has no repeated `[ascension]` logs or timeout spam.
- No runaway `MutationObserver` behavior is visible during idle collection view.
- No increasing delay after several battle runs.
- No title truncation regression on known long-title cards.
- No card badge overlap on small mobile widths.
