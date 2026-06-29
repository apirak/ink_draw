# Handoff: JS runtime restored, TS modules preserved on disk

## Project

`/Users/apirak/workspace/bird`

## What the user wants

1. The canvas app was migrated from global-script JS to modular TypeScript.
2. After switching HTML pages to load `src/main.ts`, agents rendered as long streaks/lines instead of birds/koi.
3. The user wants to roll back to the working JS runtime **while keeping the migrated TS source files on disk** so the next session can migrate one module at a time and find which one causes the bug.

## Current state

- `bird.html` and `koi.html` load the original `src/js/*.js` scripts. The JS runtime works and renders correctly.
- The migrated TypeScript files exist in `src/*.ts` alongside the legacy `src/js/*.js` files, but the HTML does **not** load them.
- `src/main.ts` has been removed. Do not recreate it until each individual TS module is validated in the browser.
- All TS files have passing tests and pass `tsc --noEmit`.

## Files present

JS runtime (loaded by HTML):

- `src/js/setup.js`
- `src/js/modes.js`
- `src/js/agents.js`
- `src/js/pointer.js`
- `src/js/effects.js`
- `src/js/brush.js`
- `src/js/renderers.js`
- `src/js/background.js`
- `src/js/physics.js`
- `src/js/trail.js`
- `src/js/tuner.js`
- `src/js/loop.js`
- `src/js/bird-main.js`
- `src/js/koi-main.js`

Migrated TypeScript (not loaded by HTML):

- `src/modes.ts` + `src/modes.test.ts`
- `src/brush.ts` + `src/brush.test.ts`
- `src/effects.ts` + `src/effects.test.ts`
- `src/agents.ts` + `src/agents.test.ts`
- `src/target.ts` + `src/target.test.ts`
- `src/physics.ts` + `src/physics.test.ts`

## Tooling state

- `package.json` build script is `"tsc && vite build"`.
- `tsconfig.json` and `vitest.config.ts` remain in place.
- Vitest dependencies installed.

## Verification

```bash
pnpm test              # 65 tests passing
pnpm exec tsc --noEmit # type check passes
```

Browser sanity check:

```bash
pnpm dev
# open bird.html and koi.html; confirm birds/fish render as shapes, not streaks
```

## Next session workflow

Migrate **one module at a time** and verify rendering after each step. Do not build a new `src/main.ts` until every module is proven correct.

Suggested order:

1. `src/js/modes.js` → `src/modes.ts`
2. `src/js/brush.js` → `src/brush.ts`
3. `src/js/effects.js` → `src/effects.ts`
4. `src/js/target.js` → `src/target.ts` (split from pointer.js)
5. `src/js/agents.js` → `src/agents.ts`
6. `src/js/physics.js` → `src/physics.ts`
7. Only after all modules pass in the browser, create a new `src/main.ts` runtime bridge and switch HTML to load it.

For each module:

- Replace the `<script src="src/js/xxx.js">` tag with a temporary adapter that loads the compiled TS output or exposes the TS module's exports on `globalThis`.
- Run the browser and confirm birds/fish still render correctly.
- If rendering breaks, that module is the source of the bug. Fix it before moving on.
- If rendering is fine, keep the change and move to the next module.

## Previous bug hints

If streaks reappear, investigate:

- Angle math or division changes in physics/agents.
- `KOI_PROFILE` indexing or koi spine history handling.
- Canvas `save`/`restore` transform state when calling TS brush functions.
- Global initialization order (`morph`, `frame`, canvas contexts).
- Differences in how the new bridge exposes globals vs. the legacy scripts.

## Relevant background docs

- `/Users/apirak/workspace/bird/ai-handoff/handoff-js-to-ts.md`
- `/Users/apirak/workspace/bird/ai-handoff/handoff-runtime-bridge.md`
- `/Users/apirak/workspace/bird/ai-prd/migrate-js-to-ts-with-tests.md`

## Skills to use next

- `tdd` for tests while migrating modules.
- `diagnose` if the rendering bug reappears.
- `handoff` before ending the next session.
