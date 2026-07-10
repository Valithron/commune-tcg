# ATK / Power Migration Workflow Failure

```text
> python3 scripts/atk_power_migration.py
Changed files:
 - README.md
 - docs/atk-power-terminology-migration.md
 - docs/battle-design.md
 - docs/battle-phase-1-inventory.md
 - docs/battle-phase-10f1-squad-card-thumbnails.md
 - docs/battle-phase-2-no-write-simulation.md
 - docs/card-mechanics-contract.md
 - docs/game-design.md
 - docs/phase-4-flow.md
 - docs/phase-7-5-card-lab.md
 - docs/phase-9-1-submission-pipeline.md
 - docs/phase-9-2-submission-write-pipeline.md
 - docs/phase-9-3-submission-review-detail.md
 - functions/api/battles.js
 - src/components/CardFrame.js
 - src/routes/AdminCardEditor.js
 - src/routes/AdminCardMechanics.js
 - src/routes/BattleHub.js
 - src/routes/BattleResults.js
 - src/routes/CardLab.js
 - src/routes/EncounterSelect.js
 - src/routes/Home.js
 - src/routes/SquadBuilder.js
 - src/routes/SubmitCard.js
> npm install --no-package-lock --no-audit --no-fund
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'wrangler@4.110.0',
npm warn EBADENGINE   required: { node: '>=22.0.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: '@cloudflare/kv-asset-handler@0.5.0',
npm warn EBADENGINE   required: { node: '>=22.0.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'miniflare@4.20260708.1',
npm warn EBADENGINE   required: { node: '>=22.0.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
npm warn EBADENGINE }

added 51 packages in 8s
> npm run build

> commune-tcg-gacha@0.1.0 build
> vite build

[36mvite v8.1.4 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 87 modules transformed.
[31m✗[39m Build failed in 73ms
[31merror during build:
[31mBuild failed with 1 error:

[31m[PARSE_ERROR] [0mExpected a semicolon or an implicit semicolon after a statement, but found none
     [38;5;246m╭[0m[38;5;246m─[0m[38;5;246m[[0m src/routes/AdminCardMechanics.js:188:178 [38;5;246m][0m
     [38;5;246m│[0m
 [38;5;246m188 │[0m [38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m [0m[38;5;249m<[0m[38;5;249md[0m[38;5;249mi[0m[38;5;249mv[0m[38;5;249m>[0m[38;5;249mR[0m[38;5;249ma[0m[38;5;249mn[0m[38;5;249md[0m[38;5;249mo[0m[38;5;249mm[0m[38;5;249mi[0m[38;5;249mz[0m[38;5;249me[0m[38;5;249m [0m[38;5;249ma[0m[38;5;249mn[0m[38;5;249md[0m[38;5;249m [0m[38;5;249ma[0m[38;5;249mp[0m[38;5;249mp[0m[38;5;249ml[0m[38;5;249my[0m[38;5;249m [0m[38;5;249mw[0m[38;5;249mi[0m[38;5;249ml[0m[38;5;249ml[0m[38;5;249m [0m[38;5;249mp[0m[38;5;249mi[0m[38;5;249mc[0m[38;5;249mk[0m[38;5;249m [0m[38;5;249mc[0m[38;5;249ma[0m[38;5;249mr[0m[38;5;249md[0m[38;5;249ms[0m[38;5;249m [0m[38;5;249mr[0m[38;5;249ma[0m[38;5;249mn[0m[38;5;249md[0m[38;5;249mo[0m[38;5;249mm[0m[38;5;249ml[0m[38;5;249my[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249ma[0m[38;5;249ms[0m[38;5;249ms[0m[38;5;249mi[0m[38;5;249mg[0m[38;5;249mn[0m[38;5;249m [0m[38;5;249me[0m[38;5;249mx[0m[38;5;249ma[0m[38;5;249mc[0m[38;5;249mt[0m[38;5;249m [0m[38;5;249mt[0m[38;5;249ma[0m[38;5;249mr[0m[38;5;249mg[0m[38;5;249me[0m[38;5;249mt[0m[38;5;249m [0m[38;5;249mc[0m[38;5;249mo[0m[38;5;249mu[0m[38;5;249mn[0m[38;5;249mt[0m[38;5;249ms[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249mt[0m[38;5;249mh[0m[38;5;249me[0m[38;5;249mn[0m[38;5;249m [0m[38;5;249mr[0m[38;5;249me[0m[38;5;249mc[0m[38;5;249mo[0m[38;5;249mm[0m[38;5;249mp[0m[38;5;249mu[0m[38;5;249mt[0m[38;5;249me[0m[38;5;249m [0m[38;5;249mr[0m[38;5;249ma[0m[38;5;249mr[0m[38;5;249mi[0m[38;5;249mt[0m[38;5;249my[0m[38;5;249m [0m[38;5;249mb[0m[38;5;249mu[0m[38;5;249md[0m[38;5;249mg[0m[38;5;249me[0m[38;5;249mt[0m[38;5;249ms[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249mp[0m[38;5;249mu[0m[38;5;249ml[0m[38;5;249ml[0m[38;5;249m [0m[38;5;249mr[0m[38;5;249ma[0m[38;5;249mn[0m[38;5;249mg[0m[38;5;249me[0m[38;5;249ms[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249ml[0m[38;5;249me[0m[38;5;249mv[0m[38;5;249me[0m[38;5;249ml[0m[38;5;249m [0m[38;5;249mc[0m[38;5;249ma[0m[38;5;249mp[0m[38;5;249ms[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249mg[0m[38;5;249mr[0m[38;5;249mo[0m[38;5;249mw[0m[38;5;249mt[0m[38;5;249mh[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249mo[0m[38;5;249mr[0m[38;5;249mi[0m[38;5;249mg[0m[38;5;249mi[0m[38;5;249mn[0m[38;5;249m [0m[38;5;249mb[0m[38;5;249mo[0m[38;5;249mn[0m[38;5;249mu[0m[38;5;249ms[0m[38;5;249m,[0m[38;5;249m [0m[38;5;249ma[0m[38;5;249mn[0m[38;5;249md[0m[38;5;249m [0m[38;5;249ml[0m[38;5;249me[0m[38;5;249mg[0m[38;5;249ma[0m[38;5;249mc[0m[38;5;249my[0m[38;5;249m [0m[38;5;249m`[0m[38;5;249mp[0m[38;5;249mo[0m[38;5;249mw[0m[38;5;249m`[0m[38;5;249m/[0m[38;5;249m`[0m[38;5;249md[0m[38;5;249me[0m[38;5;249mf[0m[38;5;249m`[0m[38;5;249m/[0m[38;5;249m`[0m[38;5;249ms[0m[38;5;249mp[0m[38;5;249md[0m[38;5;249m`[0m[38;5;249m [0m[38;5;249mf[0m[38;5;249mi[0m[38;5;249me[0m[38;5;249ml[0m[38;5;249md[0m[38;5;249ms[0m[38;5;249m.[0m[38;5;249m<[0m[38;5;249m/[0m[38;5;249md[0m[38;5;249mi[0m[38;5;249mv[0m[38;5;249m>[0m
 [38;5;240m    │[0m                                                                                                                                                                                  │ 
 [38;5;240m    │[0m                                                                                                                                                                                  ╰─ 
 [38;5;240m    │[0m 
 [38;5;240m    │[0m [38;5;115mHelp[0m: Try inserting a semicolon here
[38;5;246m─────╯[0m
[31m
    at aggregateBindingErrorsIntoJsError (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/rolldown/dist/shared/error-BHRSI0R7.mjs:48:18)
    at unwrapBindingResult (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/rolldown/dist/shared/error-BHRSI0R7.mjs:18:128)
    at #build (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/rolldown/dist/shared/rolldown-build-CtPvmZgJ.mjs:3276:34)
    at async buildEnvironment (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/vite/dist/node/chunks/node.js:33011:66)
    at async Object.build (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/vite/dist/node/chunks/node.js:33433:19)
    at async Object.buildApp (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/vite/dist/node/chunks/node.js:33430:153)
    at async CAC.<anonymous> (file:///home/runner/work/commune-tcg/commune-tcg/node_modules/vite/dist/node/cli.js:776:3) {
  errors: [Getter/Setter]
}[39m
Command failed with exit code 1: npm run build
```
