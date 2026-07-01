# Runtime Patch Map

Current inventory-only map of the Commune TCG browser patch load order. This file documents the current runtime surface and does not define a new architecture.

Last inventory pass: Card Rendering Stabilization, deeper ownership/hot-path/observer pass on branch `inventory/card-rendering-map`.

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

## Admin scripts loaded by admin/index.html

1. `admin/admin.js`
2. `admin/admin-ux-fix.js`
3. `admin/admin-crop.js`
4. `admin/prestige-current.js`
5. `admin/prestige.js`, dynamically appended by `admin/admin.js`

## Removed dormant legacy patches

These files were removed from the build allowlist and deleted from the repository:

- `battle-team-fix.js`
- `card-title-fit-final.js`

## Inventory search notes

The current build allowlist and admin bundle were scanned for `cardHtml`, `window.cardHtml`, `renderCards`, `renderCollection`, `renderBattle`, battle/card render factories, ascension refresh hooks, `MutationObserver`, and polling timers.

- No `window.cardHtml` assignment was found in the scanned runtime files. The card factory is a global `cardHtml` function/variable, not a `window.cardHtml` property assignment.
- No functions literally named `renderCards`, `renderCollection`, or `renderBattle` were found in the scanned runtime/admin files. The app uses `collection()`, `battle()`, `battleStageHtml()`, `battleFlow*()` functions, admin `cards()`, and direct `render()` wrappers instead.
- The practical render ownership question is therefore `cardHtml`, `collection`, `battle`, `battleStageHtml`, `render`, `bind`, admin `cards/enemies`, and ascension refresh/return paths.

## Current winning files for high-risk globals

This records the current outermost or last runtime owner visible from the load map. Wrapped functions may still call earlier implementations internally.

- `render`: `no-mobile-home.js` in the direct script chain after `no-sidebar-pages.js`, `card-title-stability.js`, `card-face-redesign.js`, `card-polish-fix.js`, `vaults.js`, and `ux-refresh-guard.js` have already wrapped or guarded it. Battle dynamic patches can add more bind/render-triggered behavior after `mobile-collection-fix.js` loads the battle chain.
- `bind`: `battle-fullscreen.js` after the battle dynamic patch chain loads. Direct wrappers before it include `title-limit.js`, `ai-battle-squad.js`, `mobile-collection-fix.js`, `vaults.js`, and `no-mobile-home.js`.
- `cardHtml`: `card-title-stability.js` in the direct script chain. `title-limit.js` and `card-polish-fix.js` wrap it earlier, while dynamic `card-xp.js` can also wrap it after `mobile-collection-fix.js` loads the XP/ascension chain. This is timing-sensitive because `card-xp.js` loads dynamically and forces a render after it wraps.
- `collection`: `mobile-collection-fix.js` wraps collection after `title-limit.js` changes the all-character collection path.
- `battle`: `battle-flow.js` replaces the battle page once the dynamic chain loads. Earlier direct patches (`title-limit.js`, `battle-end.js`, `ai-battle-squad.js`) also assign `battle` for the legacy/auto-battle view before `battle-flow.js` wins.
- `battleStageHtml`: `battle-fullscreen.js` owns fullscreen playback HTML; older `title-limit.js` and `battle-end.js` define/replace legacy battle stage HTML before dynamic battle flow/fullscreen wins.
- `shell`: `vaults.js` is the later direct wrapper after `title-limit.js` also adds a Vaults tab. `no-sidebar-pages.js` also wraps `shell` to mark full-width pages.
- `mintCard`: `mint-success-redirect.js` as the single mint patch owner; `mint-flavor.js` no longer overrides `mintCard`.
- Admin `render`: `admin/prestige.js` wraps admin `render` after `admin/admin-ux-fix.js`; `admin/prestige-current.js` conditionally replaces `prestige()` once available.
- Admin `bind`: `admin/admin-crop.js` wraps admin `bind` after `admin/admin-ux-fix.js`.

## Ascension ownership

- `card-xp.js`: owns XP calculation, XP badge rendering, and rendering `[data-ascend-card]` buttons; it no longer defines or binds `ascendCard`.
- `ascension-ceremony.js`: owns the main `ascendCard` flow, the server ascend call for normal card-button activation, and `ascShowCeremony`.
- `ascension-mobile-click-fix.js`: owns mobile/touch hit handling and calls the main `ascendCard` function.
- `ascension-failsafe.js`: owns the backup bottom bar and fallback confirmation sheet; it no longer binds real card buttons directly.

# Card Rendering Stabilization Inventory

Scope: inventory only. No observer reductions, no helper extraction, no render contract changes, and no behavior changes were made in this pass.

## Card Rendering Ownership Map

| Surface | Current owner / wrapper | Call sites / trigger sites | What it touches | Patch layering notes | Risk |
| --- | --- | --- | --- | --- | --- |
| Base card factory | `app.js` `cardHtml(c,big)` | Collection `grp()`, mint preview, base battle, later patch wrappers, older battle helpers. | Emits `.card`, `.art`, `.ctop strong`, `.badge`, `.eq`, `.stats`, `.fx`, `.cbot`, `data-card-id`; slices title to 25/34 before title-stability restores full title. | All card-face patches assume this DOM skeleton. It is not assigned as `window.cardHtml`. | High |
| Base full render | `app.js` `render()` | `loadState()`, navigation, equip/mint/battle/market actions, 30-second background refresh. | Replaces `#app.innerHTML`, then calls `bind()`. | Many patches wrap `render` to add post-render passes or defer/quiet-load behavior. | High |
| Background state refresh | `app.js` `setInterval(()=>{if(user)loadState()},30000)` | Every 30 seconds while logged in. | Can lead to full render unless guarded by `ux-refresh-guard.js`. | Important recurring render source; UX guard attempts to quiet-load or defer during editing/modals/battle. | Medium-high |
| Base collection | `app.js` `collection()`, `section()`, `grp()` | `render()` when `state.page==='collection'`. | Renders rarity groups and calls `cardHtml(x)` for all visible owned cards. | Later wrapped by `title-limit.js` and `mobile-collection-fix.js`. | High |
| All-character collection replacement | `title-limit.js` `collection=function...` | Collection when `state.sel==='all'`. | Groups all visible cards by rarity and sorts by character/score. | This is the first major collection override. Later `mobile-collection-fix.js` wraps it to inject mobile filter. | High |
| Mobile collection wrapper | `mobile-collection-fix.js` `collection=function...` | Collection render output only. | Prepends `.mobileCollectionFilter`; also injects desktop/mobile layout CSS. | This file is also the dynamic loader root for XP, ascension, market, and battle patches. | High |
| Base battle list | `app.js` `battle()` | Original battle page before patches. | Calls `filteredCards().map(c=>cardHtml(c))`. | Mostly superseded by `title-limit.js`, `battle-end.js`, `ai-battle-squad.js`, then dynamic `battle-flow.js`. | Medium |
| Legacy auto-battle stage | `title-limit.js` `battleStageHtml()`, `fighterHtml()` | Old/auto battle stage and replay. | Uses full `cardHtml(c)` inside `.battleFighter`. | `battle-end.js` wraps `battleStageHtml`; later `battle-flow.js` and `battle-fullscreen.js` make this mostly legacy. | Medium |
| Battle end/report wrapper | `battle-end.js` | Wraps `battleStageHtml`, `playBattleReplay`, `bind`; assigns `battle`. | Full card faces in old `.battleAuto` team grids; battle title fitting. | Adds the narrowest actual `MutationObserver` found: only schedules battle title fit when added nodes contain `.battleAuto .card`. | Medium |
| Direct AI squad picker | `ai-battle-squad.js` | Direct script before dynamic battle flow. | Uses `cardHtml(c)` in AI squad slots and picker modal `.aiPick`; assigns `battle`; wraps `runAiBotBattle` and `bind`. | Can be superseded by dynamic `battle-flow.js`, but still represents a full-card hero/squad-selection path. | Medium-high |
| Dynamic battle flow router | `battle-flow.js` | Loaded by `mobile-collection-fix.js`; replaces `battle` with `battleFlowPage`. | Team picker, enemy selection, playback, results routing. Team picker uses lightweight rows, not full card faces. | Current winning battle owner. Rerenders on setup selections. | Medium-high |
| Dynamic battle setup fix | `battle-setup-fix.js` | Wraps `bindBattleFlow`; global capture click listener for setup controls. | Styling and persistence for setup selections. | Does not render card faces itself; adds queueMeta persistence after setup interactions. | Low-medium |
| Dynamic fullscreen battle | `battle-fullscreen.js` | Replaces playback stage, wraps `bind`, overrides `beginBattleFlow`, defines `playBattleReplay`. | Uses lightweight `.battleFsFighter` rows with portraits, HP, captions, and damage popups. | Does not call `cardHtml`; hot updates are narrow DOM/class/HP mutations. | Medium |
| Battle KO fix | `battle-ko-fix.js` | Wraps `battleFsFind`, `battleFsSetCaption`, `battleFsSetHp`, `battleFsPlayEvent`, `battleFsFinalHp`, `playBattleReplay`. | Repeatedly enforces KO visual state over `.battleFsFighter`. | Starts a 90ms guard interval when installed; this is battle-visual polling, not card factory rendering. | Medium-high |
| Battle results page | `battle-results-polish.js` | Replaces `battleFlowResults()` definition used by `battle-flow.js`. | XP rows, MVP/report/squad report, `[data-ascend-card]` result buttons. | Bridges battle XP to ascension. Does not use `cardHtml`, but emits ascension controls consumed by ascension patches/failsafe. | Medium |
| Battle no-flavor | `battle-no-flavor.js` | Dynamic style patch. | Hides `.fx` and `.cbot` in battle contexts. | Visual CSS-only card-context owner; no render/observer. | Low |
| Battle color clarity | `battle-color-clarity.js` | Direct style patch. | Fullscreen battle active/target/strong/weak/crit visual classes. | CSS-only, no card render ownership. | Low |
| XP/ascend card factory wrapper | `card-xp.js` | Dynamic load after `mobile-collection-fix.js`. | Wraps `cardHtml`, appends `.cardXpBadge` and `[data-ascend-card]`/hint to eligible owned cards, then forces one render. | `card-face-redesign.js` hides the horizontal XP badge and derives vertical XP rail from state. `[data-ascend-card]` remains the activation contract. | High |
| Rarity/title polish wrapper | `card-polish-fix.js` | Wraps `cardHtml`, `render`, exports `applyCardPolish`, starts observer. | Rarity classes/frame vars, title fitting for all `.card`. | Runs before face redesign/title-stability/badge-compact in direct load order. | High |
| Card face redesign | `card-face-redesign.js` | Wraps `render`, overrides `showCardDetail`, observer. | Adds `.ctcgFaceRedesign`, `.cardFaceCharacter`, `.cardFaceLevel`, `.cardXpRailV`; excludes vault/enemy/preview cards. | Calls `scheduleTitleFit` and `applyCardPolish` after decorating. Later title/badge patches refine sizing. | High |
| Title stability | `card-title-stability.js` | Wraps `cardHtml`, `scheduleTitleFit`, `render`, observer. | Restores full title into DOM and `data-card-title`; schedules multiple title-fit passes. | Protects long titles but duplicates title work with polish/badge compact. | High |
| Compact badge/title final pass | `card-badge-compact.js` | Startup, font-ready, resize, observer, `window.fitCommuneCardTitles`. | Final title/badge sizing for `.card.ctcgFaceRedesign`. | Runs after title-stability; broadest observer because it watches `document.documentElement` and `characterData`. | Very high |
| Ascension normal click flow | `ascension-ceremony.js` | Capturing document click on `[data-ascend-card]`; `ascendCard()`. | Server ascend, ceremony overlay, state patch after animation, state reload/render on close. | Completion path is a hot render trigger: `loadState()` plus `render()` after ceremony close. | Medium-high |
| Ascension mobile/touch flow | `ascension-mobile-click-fix.js` | Capturing `touchend`, `pointerup`, `click` on document. | Hit-target resolution for `[data-ascend-card]`, calls `ascendCard`. | Does not render cards; can query all ascend buttons when resolving a point. | Medium |
| Ascension failsafe | `ascension-failsafe.js` | 700ms poll plus MutationObserver. | Scans visible `[data-ascend-card]`, shows fallback bottom bar and modal, fallback ascend flow. | Loaded both directly and dynamically but guarded by `window.__ctcgAscFailsafe`. | High |
| Vault read-only cards | `vaults.js` `vaultsReadOnlyCardHtml`, `vaultsPage`, `showVaultCard` | Vault page render and modal open. | Card-like read-only markup, uses `.card`, `.ctop`, `.badge`, stats, `.vaultReadOnlyCard`. | `card-face-redesign.js` excludes vault contexts; title/polish observers may still see vault cards. | Medium-high |
| Mint preview | `app.js` `mint()`, `previewCard()`, bind flavor preview update | Mint page and flavor/crop/title input. | Big `cardHtml(previewCard(),true)`; preview area is rerendered on flavor input. | Preview card is excluded from face redesign by id `preview`; title-fit still runs. | Medium |
| Admin card registry | `admin/admin.js` `cards()`, `cardRowMini()`, `cardModal()` | Admin Cards tab, overview recently minted, modal create/edit. | Table rows, image thumbs, edit/create card modal. Does not use player `cardHtml`. | `admin/admin-ux-fix.js` wraps `cards()` to preserve query/filter without full rerender per keystroke. | Medium |
| Admin enemy registry | `admin/admin.js` `enemies()`, `enemyModal()` | Admin Enemies tab and modal. | Table rows, image thumbs, enemy create/edit modal. | Similar admin UX/crop wrappers as cards. | Medium |
| Admin UX sorting/filtering | `admin/admin-ux-fix.js` | Wraps admin `cards`, `enemies`, `render`, and `bind`. | DOM filters/sorts card/enemy table rows; preserves active input across render. | No MutationObserver; directly mutates table row order/display on input/click. | Medium |
| Admin crop tools | `admin/admin-crop.js` | Wraps `imageField`, `cardPayload`, `enemyPayload`, and `bind`. | Image crop preview and crop payload for player/enemy cards. | No MutationObserver; bind wrapper attaches input/file listeners and updates preview only. | Low-medium |
| Admin prestige | `admin/prestige.js`, `admin/prestige-current.js` | Dynamic admin Prestige tab. | Top-card summaries in prestige cards. | Does not use `cardHtml`; wraps admin `shell`/`render` and replaces `prestige()` copy. | Low-medium |
| UX refresh guard | `ux-refresh-guard.js` | Wraps `loadState`, `render`, and `bind`; periodic flush. | Defers full render/load during modals/editors/fullscreen battle and quiet-loads mobile background refreshes. | Stabilizing owner, but it changes when card renders happen. | Medium |
| No-sidebar pages | `no-sidebar-pages.js` | Wraps `shell` and `render`. | Battle/market/tokens layout class. | Indirect card layout owner for battle page width. | Low-medium |
| No-mobile-home | `no-mobile-home.js` | Last direct `render`/`bind` wrapper. | Redirects mobile Home to Collection. | Indirect mobile card path owner because it forces collection instead of home on mobile. | Low-medium |

## Observer and Polling Map

| File | Owner purpose | Target / cadence | Options | Trigger conditions | Work performed | Guards / debounce | Risk level | Cross-reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `card-polish-fix.js` | Rarity normalization and title polish safety net. | `document.body` MutationObserver. | `{childList:true, subtree:true}` | Any added node anywhere in body. Callback checks if any mutation has `addedNodes`. | After 30ms, runs `applyCardPolish(document)`, scans all `.card`, normalizes rarity classes, then schedules RAF and 120ms title fits. | Guard: exits while `window.isAscensionCeremonyActive`. No debounce beyond per-callback timeout; no root narrowing. | Broad / high | Inline comment documents full-document card polish cost. |
| `card-face-redesign.js` | Owned-card redesign decoration safety net. | `document.body` MutationObserver. | `{childList:true, subtree:true}` | Any body subtree insertion. | After 35ms, installs detail override and runs `apply(document)`, scanning all `.card[data-card-id]`; may schedule `scheduleTitleFit(root)` and `applyCardPolish(root)`. | Internal eligibility excludes preview/vault/enemy cards. No mutation-root narrowing or debounce. | Broad / high | Inline comment documents cards inserted outside render path. |
| `card-title-stability.js` | Full-title restoration and repeated title fit. | `document.body` MutationObserver. | `{childList:true, subtree:true}` | Any body subtree insertion. | After 35ms, runs `scheduleStable(document)`, which does RAF plus 60/180/420ms title fits and font-ready fit. | No guard or debounce beyond fixed delayed passes. | Broad / high | Inline comment documents multiple delayed title-fit passes. |
| `card-badge-compact.js` | Final compact badge/title sizing. | `document.documentElement` MutationObserver. | `{childList:true, subtree:true, characterData:true}` | Any document subtree insertion/removal or text-node change. | After 40ms, `refresh()` removes/readds compact style, RAF fits all `.card.ctcgFaceRedesign`, schedules 40/160ms fits, and calls `scheduleTitleFit(document)` when available. | No guard or debounce. Resize listener also calls `refresh()`. | Broadest / very high | Inline comment documents characterData sensitivity. |
| `battle-end.js` | Legacy battle card title fitting. | `document.body` MutationObserver. | `{childList:true, subtree:true}` | Only when added nodes are `.battleAuto .card` or contain `.battleAuto .card`. | Schedules battle title fitting over `.battleAuto .card .ctop strong`. | Narrow predicate on added node subtree. Also resize listener calls title fit. | Narrow / medium | This is the best current example of an observer with a scoped trigger. |
| `ascension-failsafe.js` | Backup ascend bar visibility. | `setInterval(refresh,700)`. | Polling. | Lifetime of app after install. | Calls `showBar()`, scans visible `[data-ascend-card]`, updates/removes fallback bar and body padding class. | Guards: `suspendRefresh`, `#ascCeremony`, busy timers. No page/context skip. | Persistent / high | Inline comment documents visible ascend-control scan. |
| `ascension-failsafe.js` | Backup ascend bar mutation response. | `document.body` MutationObserver. | `{childList:true, subtree:true, attributes:true, attributeFilter:['style','class','disabled']}` | Added/removed nodes or style/class/disabled attribute changes anywhere in body. | After 40ms, calls `refresh()`/`showBar()` and may query visible `[data-ascend-card]`. | Same suspend/ceremony guards. No debounced single shared timer; every callback schedules timeout. | Broad attribute-sensitive / high | Inline comment documents class/style changes from other patches can wake it. |
| `battle-ko-fix.js` | Fullscreen KO/caption visual guard. | `setInterval(guardVisuals,90)` via `startGuard()`. | Polling. | Starts at install if battle fullscreen functions exist; also during replay. | Scans all `.battleFsFighter`, enforces KO HP/classes, and restores locked caption text. | Uses `visual.guard` to prevent duplicate intervals. `stopGuardSoon()` can clear after replay, but install starts the guard immediately. | Persistent battle-visual polling / medium-high | Candidate for later context-aware guard review, but not touched here. |
| `battle-speed.js` | Waits for battle fullscreen functions to exist. | `setInterval(...,50)` max 81 tries. | Polling. | Until `battleFsPause` and `battleFsLogEvent` can be patched, or tries exceed 80. | Patches battle pause scaling and caps battle log rows. | Finite install probe; clears on success or max tries. | Low | Not card-rendering hot after install. |
| `character-color-sync.js` | Startup color sync. | `setInterval(...,250)` max 21 tries. | Polling. | Startup only. | Syncs character/account/user colors. | Finite; clears after tries. | Low | Indirect card color input only. |
| `ux-refresh-guard.js` | Deferred load/render flush. | `setInterval(tryFlush,1000)`. | Polling. | Lifetime after install. | Flushes pending load/render when modals/editors/fullscreen are no longer active. | Checks `shouldDeferLoad()` and `shouldDeferRender()` before work. | Medium but stabilizing | Not card-specific, but affects render timing. |
| `admin/admin-ux-fix.js` | Admin table filter/sort. | No MutationObserver. | Event-driven. | Search input, clear buttons, sortable headers, render wrapper. | Filters row `display`, sorts table rows, restores active input. | Dataset flags prevent duplicate bindings. | Medium / event-driven | Admin card list hot path, no observer. |
| `admin/admin-crop.js` | Admin image crop preview. | No MutationObserver. | Event-driven. | File input/range input/reset. | Updates crop preview image style/readout and payload crop fields. | Dataset flags prevent duplicate bindings. | Low / event-driven | Admin modal path only. |
| `ascension-mobile-click-fix.js` | Touch/click hit-target resolver. | No MutationObserver or polling. | Capturing `touchend`, `pointerup`, `click`. | Any touch/click document event. | Resolves nearest or point-over `[data-ascend-card]`; may query all ascend buttons as fallback; calls `ascendCard`. | `lastTap` 850ms guard; ignores disabled and ceremony buttons. | Medium / event-driven | Important mobile ascension interaction owner. |

## Hot Render Path Ranking

This ranking is based on source-observable evidence from render frequency, observer breadth, callback work volume, full-document scan volume, and card count amplification. No browser performance trace was captured in this pass, so timing numbers are not asserted yet.

| Rank | Path / context | Frequency | Why hot | Card/update type | Main owners involved | Measurement target for next phase |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Collection page, all-character view | Common primary page; every nav/filter/loadState render. | Renders every visible owned card by rarity. Then multiple card observers can rescan all cards and schedule multiple title fits. | Full `cardHtml` cards plus XP/level/equipped/ascension decorations. | `app.js`, `title-limit.js`, `mobile-collection-fix.js`, `card-xp.js`, `card-polish-fix.js`, `card-face-redesign.js`, `card-title-stability.js`, `card-badge-compact.js`. | Count render calls, card count, observer callbacks, and title-fit passes per collection render. |
| 2 | Collection page, individual character view | Common; every mobile/desktop character filter click. | Smaller than all-character view but still full card faces plus same observer stack. | Full `cardHtml` cards. | Same as rank 1. | Compare all-character vs single-character card counts and observer work. |
| 3 | Broad card title/compact observer stack | Fires after many unrelated DOM insertions/text changes. | `card-badge-compact.js`, `card-title-stability.js`, `card-face-redesign.js`, and `card-polish-fix.js` can each trigger full-document scans or multi-delay title fits. | Layout reads/writes over card titles and badge/card elements. | Four card display patch files. | Add temporary counters around each observer and count processed `.card`/`.ctcgFaceRedesign` nodes. |
| 4 | Ascension ready/failsafe scanning | Every 700ms plus mutation wakeups while app is loaded. | Repeatedly queries visible `[data-ascend-card]`; attribute-sensitive observer can wake on class/style changes from unrelated patches. | Ascension controls and fallback bar, not full card render. | `card-xp.js`, `ascension-ceremony.js`, `ascension-mobile-click-fix.js`, `ascension-failsafe.js`, `battle-results-polish.js`. | Count `refresh()` calls by page and whether any ascend buttons exist. |
| 5 | Battle setup, current `battle-flow.js` team/enemy views | Every setup nav/pick/remove/filter/enemy selection can render. | Team picker uses lightweight rows, but each full `render()` still passes through global render wrappers and broad card observers. | Mostly lightweight battle rows, not full card faces. | `battle-flow.js`, `battle-setup-fix.js`, global render/card observer stack. | Count renders during a manual three-card selection and observer callbacks caused by those renders. |
| 6 | Legacy/direct hero selection via `ai-battle-squad.js` | Direct script path; may be superseded by dynamic battle flow. | Uses full `cardHtml(c)` inside squad slots and picker modal. If this path is active before battle-flow takeover, it is card-heavy. | Full card faces in modal picker and squad slots. | `ai-battle-squad.js`, `cardHtml` wrapper chain, title/card observers. | Verify whether this path is still user-reachable after `battle-flow.js` loads. If not, mark legacy. |
| 7 | Battle results XP/ascension view | After every completed battle. | Smaller DOM, but it emits `[data-ascend-card]`, triggers failsafe scanning, and often precedes ascension ceremony. | XP rows and ascend controls, not full card faces. | `battle-results-polish.js`, `ascension-*`, `card-xp.js`. | Count failsafe refreshes after results render and ascension button activation path. |
| 8 | Ascension completion return path | Per ascension. | `ascShowCeremony` closes with `loadState()` then `render()`, restoring page/view/filter. This creates a full render after a ceremony. | State refresh plus full page render; then card observer stack. | `ascension-ceremony.js`, `ascension-failsafe.js`, `ux-refresh-guard.js`, card observers. | Count render/observer burst after closing ceremony. |
| 9 | Battle fullscreen playback | Per battle; many event updates. | Uses narrow DOM class/HP updates, but `battle-ko-fix.js` runs 90ms guard and broad card/failsafe observers may wake on body/class mutations if present. | Lightweight `.battleFsFighter` rows, not `cardHtml`. | `battle-fullscreen.js`, `battle-ko-fix.js`, `battle-speed.js`, `battle-color-clarity.js`, `ascension-failsafe.js`. | Verify whether card observers/failsafe fire during playback. |
| 10 | Vault page and vault modal | Less frequent but can contain many cards. | Uses card-like read-only markup, so title/polish observers still see `.card`; face redesign excludes vaults. | Read-only card faces and detail modal. | `vaults.js`, `card-polish-fix.js`, `card-title-stability.js`, `card-badge-compact.js`. | Count card observer work on vault page render. |
| 11 | Mint preview | Frequent while typing/cropping, but one card. | Preview rerenders one big card on flavor input and crop/title changes; broad observers can still turn a scoped preview update into full-document card work. | Preview `cardHtml(previewCard(),true)` excluded from face redesign. | `app.js`, `title-limit.js`, `card-title-stability.js`, `card-badge-compact.js`. | Verify whether preview-only updates trigger full document title fitting. |
| 12 | Admin card/enemy registry | Admin-only, table-heavy. | Search/filter/sort mutates table rows often; modals update image crop preview. Does not use front-end `cardHtml`. | Tables/thumbs/modal fields, not player card face. | `admin/admin.js`, `admin/admin-ux-fix.js`, `admin/admin-crop.js`. | Keep separate from player card face work; verify admin responsiveness after card changes. |
| 13 | Admin prestige | Admin-only, low frequency. | Lists top-card summaries in prestige cards; no full card faces. | Text summaries and bars. | `admin/prestige.js`, `admin/prestige-current.js`. | Low priority unless admin tab becomes slow with large top-card lists. |

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

7. Review `battle-ko-fix.js` guard interval lifecycle.
   - Goal: avoid 90ms KO visual polling outside active fullscreen battle playback.
   - Risk: medium; this patch protects against KO visual resets during replay.

8. Document and then eventually consolidate title fit ownership.
   - Goal: decide whether `scheduleTitleFit`, `card-title-stability.js`, or `card-badge-compact.js` owns final title fitting.
   - Risk: high if done too early. Defer until after measurement.

### Candidates to defer

- Rewriting card rendering around a new canonical helper.
- Deleting any patch file.
- Removing observers without callback-count evidence.
- Changing card markup classes or visual layout.
- Changing XP, ascension, battle, admin, or vault data behavior.

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

### Admin

- Cards tab search filters without losing focus.
- Cards table sort works for title, owner, type, rarity, stats, passive, and equipped state.
- Create/edit player card modal opens and saves.
- Admin image crop/zoom preview updates and saves crop values.
- Enemies tab search/sort works and enemy create/edit modal saves.
- Prestige tab loads top-card summaries without affecting player card rendering.

### Regression checks

- Browser console has no repeated `[ascension]` logs or timeout spam.
- No runaway `MutationObserver` behavior is visible during idle collection view.
- No increasing delay after several battle runs.
- No title truncation regression on known long-title cards.
- No card badge overlap on small mobile widths.
