# Handoff: runtime validation of each migrated TS module

## Current state

- Project: `/Users/apirak/workspace/bird`
- Existing handoff: `/Users/apirak/workspace/bird/ai-handoff/handoff-js-to-ts.md`
- PRD: `/Users/apirak/workspace/bird/ai-prd/migrate-js-to-ts-with-tests.md`

Migrated TypeScript modules (all with passing tests):

- `src/modes.ts` + `src/modes.test.ts` (26 tests)
- `src/agents.ts` + `src/agents.test.ts` (9 tests)
- `src/brush.ts` + `src/brush.test.ts` (4 tests)
- `src/effects.ts` + `src/effects.test.ts` (15 tests)
- `src/target.ts` + `src/target.test.ts` (5 tests)
- `src/physics.ts` + `src/physics.test.ts` (6 tests) — **new this session**
- `src/main.ts` — **new runtime bridge this session**

Checks passing:

```bash
pnpm test            # 65 tests
pnpm exec tsc --noEmit
pnpm exec vite build # succeeds; warns about non-module legacy scripts (pre-existing)
pnpm dev             # starts on localhost:5174
```

## What changed this session

1. **Converted `src/js/physics.js` → `src/physics.ts`.**
   - `update` now takes explicit parameters: `t, dt, mode, M, agents, bounds, pointer, now`.
   - Calls `targetPoint(pointer, bounds, t, now)` internally instead of relying on a global.
   - `steer` is a private helper that receives the current `ModeConfig`.
   - Preserves the original flocking, containment, speed clamp, turn-rate limit, and koi-spine logic exactly.

2. **Created the runtime bridge `src/main.ts`.**
   - Sets up canvases, contexts, `W`/`H`, `DPR`, `TR_SCALE`.
   - Reads mode from `document.body.dataset.mode` and picks the matching `ModeConfig` from `MODES`.
   - Creates `agents` and exposes globals: `mode`, `M`, `agents`, `MAX`, `bounds`, `ptr`, `frame`, `morph`, `stamps`, `ripples`, `cx`/`bg`/`tr`, `brushEl`, `reduced`.
   - Exports color factories and helpers from `src/modes.ts` and `src/brush.ts`: `INK`, `SEPIA`, `RED`, `KOI_SUMI`, `WATER_BLUE`, `KOI_KINDS`, `MODES`, `DEFAULTS`, `arcToCos`, `cosToArc`, `stroke`, `dab`.
   - Imports `update` from `src/physics.ts`, `inkBurst`/`drawRipples` from `src/effects.ts`, `makeAgent`/`reseed` from `src/agents.ts`.
   - Wires pointer events (move, down, up), starts `requestAnimationFrame(loop)`, and defers the first resize/agent creation so legacy deferred scripts are already loaded.

3. **Updated `bird.html` and `koi.html`.**
   - Load `src/main.ts` as a module first.
   - Load only the remaining legacy scripts as deferred classic scripts: `renderers.js`, `background.js`, `trail.js`, `tuner.js`.
   - Removed references to `setup.js`, `modes.js`, `agents.js`, `pointer.js`, `effects.js`, `brush.js`, `physics.js`, `loop.js`, and `bird-main.js`/`koi-main.js`.

## Validation notes

- `pnpm test` passes all 65 tests.
- `pnpm exec tsc --noEmit` is clean.
- `pnpm dev` starts successfully.
- `pnpm exec vite build` completes and emits the bundle, but logs the same warnings it always did for classic `<script>` tags without `type="module"`. The legacy scripts are not copied into `dist/` by Vite, so the production build would 404 for `src/js/*.js` unless those files are placed in `public/` or the build pipeline is updated later.

## Next steps

- Run the live app in a browser (`pnpm dev`, open `/bird.html` and `/koi.html`) and confirm the flocking visuals still work.
- Migrate the remaining legacy JS files one at a time: `renderers.js`, `background.js`, `trail.js`, `tuner.js`.
- After each migration, run `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm dev` to validate.
- Once all JS is migrated, remove the classic `<script>` tags from the HTML and delete the `src/js/` directory.

## Important constraints

- Keep visual output identical.
- Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Test files live next to source.
- Do not change build tools.
- Legacy JS files still exist on disk; only their inclusion in HTML changed.
