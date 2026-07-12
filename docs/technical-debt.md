# Imago Core Technical Debt

Severity describes player or data risk. Effort is relative and assumes familiarity with the current repository.

| Priority | Debt | Severity | Risk | Effort | Recommended action |
|---|---|---|---|---|---|
| Closed in Phase 1 | Ownership-sensitive APIs could fall back to, or accept overrides for, another identity | High | Data could be exposed or attributed incorrectly | Completed | Active player mutations now require the player session; Vault and battle history ignore owner overrides; privileged diagnostics require admin; authenticated isolation tests cover corrected reads |
| P0 | Admin authorization is a slot allowlist, not a role model with audit identity | High | Shared PIN or slot compromise grants broad mutation access | Medium | Add role data, reviewer identity, audit rows, rate limiting, and optional Cloudflare Access enforcement |
| P1 | Runtime helpers create tables outside versioned migrations | High | Environment drift and hard-to-reproduce production schemas | Medium | Inventory live D1 schema and convert creation SQL into ordered, idempotent migrations |
| P1 reduced | Pull/economy regression coverage remains thinner than battle coverage | High | Live-binding and browser interruption regressions can affect player resources | Medium | Phase 1 added daily-boundary, Gold isolation, pull idempotency/concurrency, and Energy tests; add preview/browser and broader D1 failure-injection coverage |
| P1 | Canonical type presentation is repeated across CSS, server config, and battle config | Medium | A color or label update may drift between systems | Medium | Introduce an environment-neutral shared config consumed by Worker and browser builds |
| P2 | Protected diagnostics retain historical non-admin URL paths | Low | A future endpoint may be added without applying admin policy consistently | Small | Move routes under `/api/admin/diagnostics/*` with compatibility redirects and authorization tests |
| P2 | Route initialization and module-level state are coordinated manually in `src/main.js` | Medium | New routes can omit initialization or retain stale state | Medium | Introduce a route contract with `render`, `init`, `dispose`, and policy metadata |
| P2 | Error handling uses mock fallbacks in some live routes | Medium | Production failures can look like valid but stale data | Small | Make fallback state visibly non-live and capture structured operational errors |
| P2 | No dedicated lint or formatting command | Medium | Dead imports and syntax/style drift rely on build/test discovery | Small | Add ESLint only in a dedicated tooling change with a reviewed baseline |
| P2 | Card data accepts many historical aliases | Medium | Normalization hides schema inconsistency and complicates deletions | Large | Define a versioned card contract, migrate rows, then retire aliases gradually |
| P2 | Browser storage keys retain historical `commune-*` names | Low | Renaming without migration loses settings and in-progress playback | Small | Keep now; add dual-read/single-write migration only when a product-key namespace is needed |
| P2 | Cloudflare Worker name retains `commune-tcg-gacha` | Low | Infrastructure looks inconsistent with the product | Medium | Rename only through a planned Cloudflare migration that preserves bindings and domain routing |
| P3 | No checked-in app icons, favicon, or social preview | Low | Install and link previews lack finished identity | Small | Export assets from an approved Imago Core mark |
| P3 | Historical phase documentation is extensive and competes with current guides | Low | Future contributors may follow obsolete phase language | Small | Add a historical index and archive completed phase reports after the beta stabilizes |
| P3 | Some large route/style files remain dense | Low | Local changes require broad context and raise regression risk | Medium | Extract by stable domain boundary, beginning with pull reveal and admin mechanics |

## Silent failure and logging audit

- Best-effort logout cleanup intentionally suppresses failures after clearing local auth state.
- Pull reveal storage removes malformed JSON and returns no stale payload.
- Route-level API fallbacks remain visible debt where they can conceal a backend outage.
- The battle simulator's `console.log` calls are intentional command output.
- No temporary browser debug logging was found in active source.

## Naming consistency

| Preferred term | Historical alternatives | Decision |
|---|---|---|
| owned card | `playerCard`, `vaultCard` | Use “owned card” in data contracts; “Vault card” is acceptable UI language |
| Library template | `card`, `template`, `pool card` | Use “Library template” when distinguishing from an owned instance |
| ATK | internal `pow` | Keep `pow` in storage and adapters; render ATK to players |
| Power | `PWR`, aggregate stats | Use Power in prose and PWR only when space is constrained |
| Imago Core | Commune TCG, Gacha | Use Imago Core on active surfaces; retain old names only for history or compatibility |
| player slot ID | `ownerUserId`, `userId`, `characterId` | Prefer `userId` for authenticated ownership; do not confuse it with card character identity |

## Deferred modularization map

| Proposed module | Current locations | Public interface | Dependencies and risks |
|---|---|---|---|
| `app-shell/` | `src/main.js`, shell components | route registration and shell rendering | Must preserve hash URLs and scroll behavior |
| `auth/` | auth service, routes, `_shared/auth.js` | session user and policy checks | Cookie/session compatibility |
| `users/` | current-user helpers and D1 ownership columns | authenticated owner identity | Temporary fallback removal can reveal latent data assumptions |
| `cards/` | card APIs, adapters, mock data | versioned card/template/owned-card contract | Large alias surface |
| `card-rendering/` | `CardFrame.js`, card CSS, frame assets | card view model to HTML | Must remain one canonical renderer |
| `pull/` | pull routes, modal, engine/store | quote, resolve, reveal payload | Resource idempotency and browser recovery |
| `economy/` | pull resources/top-up and ticket shop | transactional resource operations | Mountain Time rules and concurrency |
| `vault/` | vault API/data/routes | owned-card list and grouping | Duplicate identity compatibility |
| `library/` | cards API/data/routes | template catalog and filters | Shared card normalization |
| `squads/` | squad service/route/API | ordered three-card squad | Owned-card authorization |
| `battle/` | `shared/battle`, APIs, routes, playback | create, replay, finalize | Never duplicate the engine in browser code |
| `rewards/` | reward contract and finalize code | exactly-once settlement | Production data safety |
| `admin/` | admin routes/APIs/shared review | authorized review and card mutation | Requires role/audit expansion |
| `state/` | module caches and browser storage | scoped cache lifecycle | Avoid a framework migration without evidence |
| `api/` | `worker.js`, services, handlers | typed request/response contracts | Worker/Pages compatibility |
| `shared/` | current shared folders and format utilities | environment-neutral rules | Must not import DOM or Cloudflare bindings |

Recommended extraction order: shared contracts, authorization policy, card normalization, economy transactions, route lifecycle, then presentation-sized modules.
