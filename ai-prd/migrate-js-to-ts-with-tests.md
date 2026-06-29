---
name: Migrate JavaScript to TypeScript with Test Coverage
description: PRD for converting the ink-flock canvas simulation from global-script JS to modular TypeScript, adding tests for the physics and rendering logic.
type: project
---

## Problem Statement

The Ink Flock is currently a collection of global-script JavaScript files loaded with `<script>` tags. Global mutable state (`W`, `H`, `mode`, `M`, `agents`, canvas contexts, etc.) is shared across files, making it impossible to import individual modules in tests, reason about side effects, or refactor safely. TypeScript is already installed and `tsconfig.json` exists, but no source files use it yet, so type checking does not cover the actual code. There are no tests, so any migration risks silently breaking the flocking physics, rendering, or interaction behavior.

## Solution

Gradually migrate the codebase from global JavaScript to ES-module TypeScript, starting with the pure logic modules and ending with the DOM-heavy entry points. Introduce Vitest for unit tests and cover the deep modules that encode the most behavior. Keep the existing visual output identical and preserve the current runtime performance profile.

## User Stories

1. As a maintainer, I want the simulation logic to live in importable modules, so that I can reason about dependencies and test individual behaviors.
2. As a maintainer, I want TypeScript to type-check the whole application, so that refactors do not introduce silent runtime errors.
3. As a maintainer, I want automated tests for the flocking rules, so that physics changes are safe to make.
4. As a maintainer, I want tests for brush helpers and color utilities, so that rendering regressions are caught early.
5. As a maintainer, I want the migration to happen incrementally, so that the site keeps shipping while files are being converted.
6. As a maintainer, I want DOM-bound modules separated from pure logic, so that most code can be tested without a browser.
7. As a visitor, I want the birds/koi/herd visuals and interactions to stay the same, so that the migration is invisible.
8. As a visitor on a reduced-motion device, I want agent counts and motion behavior to remain unchanged, so that accessibility is preserved.
9. As a maintainer, I want the existing Vite build to keep working, so that deployment does not change.
10. As a maintainer, I want tests to run quickly on the CLI, so that they are useful during development.
11. As a maintainer, I want the mode/tuner math tested in isolation, so that slider conversions and defaults are verified.
12. As a maintainer, I want agent creation and reseeding tested, so that spawn state remains deterministic enough for tests.
13. As a maintainer, I want the pointer idle/wander target logic tested, so that cursor-following behavior is covered.
14. As a maintainer, I want the ripple and stamp lifecycle tested, so that effects behave predictably across frames.
15. As a maintainer, I want boundary containment forces tested, so that agents stay gently on screen.
16. As a maintainer, I want the renderer draw-order and mode dispatch tested at the orchestration level, so that the right renderer is called for each mode.
17. As a maintainer, I want TypeScript strict mode to remain enabled, so that type safety is maximized.
18. As a maintainer, I want dead code and unused exports flagged automatically, so that the codebase stays clean.
19. As a maintainer, I want test coverage reports, so that I know which untested areas remain.
20. As a maintainer, I want module boundaries that avoid circular dependencies, so that the build graph is simple.

## Implementation Decisions

- **Incremental migration strategy.** `tsconfig.json` will first accept both `.ts` and `.js` files (`allowJs: true`, `checkJs: false`) so files can be converted one at a time without breaking the build. Once everything is TypeScript, `allowJs` can be removed.
- **Module boundaries are redrawn around DOM dependency.** Global state will become explicit parameters and return values. Modules that touch `document`, `window`, or `requestAnimationFrame` are considered shallow/IO modules; modules that only manipulate numbers, objects, and arrays are deep modules.
- **Deep modules to extract and type.** These encapsulate the bulk of the behavior behind small interfaces:
  - **Mode configuration** — mode shape (`birds`, `koi`, `herd`), tuning defaults, FOV arc/cosine conversion helpers, color factories (`INK`, `SEPIA`, `RED`, `WATER_BLUE`, koi variety palette).
  - **Agent factory** — deterministic-by-seed creation of an agent, reseeding sizes and orbit radii, resetting koi spines.
  - **Flocking physics** — one `update(agents, mode, bounds, target, t, dt)` call that applies separation, alignment, cohesion, mouse orbit, mode-specific motion, soft edge containment, speed clamping, turn-rate limiting, and koi spine update.
  - **Target/pointer logic** — `targetPoint(pointer, bounds, t, now)` returning the blended cursor/wander point.
  - **Brush primitives** — `stroke(ctx, ...)` and `dab(ctx, ...)` helpers that depend only on a canvas context.
  - **Effects state machines** — `inkBurst`, `waterRipple`, and frame updates for `ripples`/`stamps`.
  - **Background painter** — `drawBackground(ctx, W, H, mode)`.
  - **Renderer dispatch** — mapping `mode` to `drawBird`, `drawKoi`, `drawHerd`.
- **Global variables are replaced with explicit exports/imports.** The few values that must remain global at runtime (the current mode, the active canvas contexts, the animation loop) are owned by the entry-point modules and passed downward.
- **Canvas contexts are injected.** Renderers, brush helpers, and background painters receive `CanvasRenderingContext2D` as an argument rather than closing over `cx`, `bg`, or `tr`.
- **Randomness is pluggable.** Where tests need determinism, the agent factory and effect spawners accept an optional random function; the runtime passes `Math.random`.
- **TypeScript `noImplicitAny`, `strict`, `noUnusedLocals`, `noUnusedParameters` stay enabled.** The migration is an opportunity to clean up implicit types, not to relax the compiler.
- **Vitest is used for tests.** It integrates cleanly with the existing Vite setup and supports `happy-dom` for the few tests that need DOM globals.
- **Coverage is collected with `@vitest/coverage-v8`.** Coverage reports guide which modules still need tests; 100% coverage is not a goal, but all deep modules should be covered.
- **Build command remains `tsc && vite build`.** The TypeScript compiler is the source of truth for type checking; Vite handles bundling.

## Testing Decisions

- **Good tests assert external behavior, not implementation details.** Physics tests assert that an agent moves away from a neighbor within separation radius, aligns with neighbors within alignment radius, and coheres toward the flock center. They do not assert the order of internal math steps.
- **Modules to test first (deep, deterministic, high value):**
  - Mode configuration and tuner conversion (`arcToCos`, `cosToArc`, default snapshots).
  - Agent factory (`makeAgent`, `reseed`) with a seeded random function.
  - Flocking physics (`update`) for separation, alignment, cohesion, speed clamping, edge containment, and koi spine formation.
  - Target/pointer blending (`targetPoint`) for idle-to-wander transition.
  - Brush primitives (`stroke`, `dab`) using a mocked 2D context.
  - Effects (`inkBurst`, `waterRipple`, ripple aging) using mocked agents and arrays.
- **Modules to test lightly or mock:**
  - Background painter and renderers are tested with a mocked canvas context to verify that the right paths/fills are issued; exact pixel output is not asserted.
  - Loop orchestration is tested only if it can be done without a real `requestAnimationFrame`; otherwise it is covered by integration smoke tests in `happy-dom`.
- **No tests for pure DOM event wiring.** `pointer.js`, `tuner.js`, and the entry-point `*-main.js` files primarily bind events; their behavior is exercised through manual smoke tests and browser-based visual verification.
- **Test files live next to source files** using the pattern `*.test.ts` so module imports are simple and tests are discoverable by Vitest.
- **Prior art:** There are currently no tests in the repository. The new test suite establishes the first convention.

## Out of Scope

- Adding new visual modes, new species, or new interaction features.
- Switching from Vite to another build tool.
- Bundling the app as a single-page application or changing the HTML entry pages.
- Runtime performance optimizations unless a test reveals a regression.
- End-to-end browser automation tests (e.g., Playwright).
- Rewriting rendering code to use WebGL or another graphics API.
- Removing or renaming the existing `ai-reference` folder.

## Further Notes

- The `herd` mode exists in shared code but is not exposed on any HTML page; it must continue to work so it can be enabled later without re-migrating.
- `reduced` motion preference currently lowers agent counts; this logic should move into the mode configuration module and remain covered by tests.
- The global variables `mode` and `M` are reassigned in the entry-point scripts (`bird-main.js`, `koi-main.js`). After migration, the entry point should be the only place that sets the active mode; the mode module itself remains read-only.
- During the migration, `tsconfig.json` will temporarily include `.js` files. The final cleanup commit should remove `allowJs` and `checkJs` and tighten `include` to `src/**/*.ts` only.
