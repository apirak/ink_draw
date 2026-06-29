# Handoff: Ink Flock JS → TS migration

## Context
Project: `/Users/apirak/workspace/bird`
PRD: `/Users/apirak/workspace/bird/ai-prd/migrate-js-to-ts-with-tests.md`
Goal: incrementally migrate the Ink Flock canvas simulation from global-script JS to modular TypeScript with Vitest tests.

## What is done

### Tooling
- Installed `vitest@^2.1.9`, `happy-dom`, `@vitest/coverage-v8@^2.1.9` (Vitest 4 requires Vite 6; current project uses Vite 5).
- Added npm scripts: `test`, `test:watch`, `coverage`.
- Added `vitest.config.ts` using `happy-dom`.
- Added `.gitignore`.

### Migrated modules
1. `src/modes.ts` (+ `src/modes.test.ts`, 26 tests passing)
   - Color factories, `KOI_KINDS`, `ModeConfig`, `buildModes(reduced)`, `MODES`, `DEFAULTS`, `arcToCos`, `cosToArc`.
   - Reduced-motion agent counts now live in mode config.
3. `src/brush.ts` (+ `src/brush.test.ts`, 4 tests passing)
   - `stroke(ctx, ...)`, `dab(ctx, ...)`.
   - Pure canvas helpers; mocked 2D context in tests.
4. `src/effects.ts` (+ `src/effects.test.ts`, 15 tests passing)
   - `inkBurst`, `waterRipple`, `drawRipples` with explicit parameters and pluggable randomness.
   - `Stamp` and `Ripple` types exported for later renderers/trail module.

### Verification
- `pnpm test` passes (54 tests).
- `pnpm exec tsc --noEmit` passes.
- Old JS files in `src/js/` remain untouched; HTML pages still load them with `<script>` tags.

## Next step (from user)
Continue the next vertical slice. The obvious candidates, in dependency order:
1. **Target/pointer logic** (`src/js/pointer.js` → `src/target.ts`). Extract `targetPoint` to be deterministic.
2. **Physics** (`src/js/physics.js` → `src/physics.ts`). Largest and highest-value module to test.
3. **Background / renderers** after target and physics are in place.

## Suggested skills for next session
- `/tdd` — workflow is tracer bullets, one test → one implementation.
- `/ponytail` — user prefers minimal, stdlib-first code (already active in prior session).
- `/caveman` — user prefers terse output (already active in prior session).

## Important constraints from PRD
- Keep existing visual output identical.
- Preserve strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Test files live next to source (`*.test.ts`).
- Modules that touch `document`/`window`/`requestAnimationFrame` stay shallow; pure logic goes deep.
- No new visual modes or build-tool changes.

## Files to read before continuing
- `/Users/apirak/workspace/bird/ai-prd/migrate-js-to-ts-with-tests.md`
- `/Users/apirak/workspace/bird/src/js/brush.js`
- `/Users/apirak/workspace/bird/src/js/effects.js`
- `/Users/apirak/workspace/bird/src/js/pointer.js`
- `/Users/apirak/workspace/bird/src/js/physics.js`
- `/Users/apirak/workspace/bird/src/modes.ts`
- `/Users/apirak/workspace/bird/src/agents.ts`

## Running checks
```bash
pnpm test
pnpm exec tsc --noEmit
```
