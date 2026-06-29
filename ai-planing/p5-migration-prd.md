# PRD: Canvas → p5 migration

## Goal
Migrate rendering from plain 2D canvas to p5.js for performance headroom and future flexibility (shaders, generative brush, WebGL). Keep physics/agents untouched.

## Strategy
Create parallel entry `bird_p5.html` + `src/p5/main.ts`. Do not modify `bird.html` or `src/main.ts` until parity reached.

## Current state
- Dependencies: `p5` ^2.3.0 and `@types/p5` already installed.
- Three canvas layers: `bg`, `trail`, `main`.
- Draw functions: `drawBackground`, `paintTrail`, `drawBird`/`drawKoi`/`drawHerd`, `drawRipples`.
- Brushes: `dab` (ellipse) and `stroke` (quadratic bezier shape).
- Physics in `agents.ts`/`physics.ts`; modes in `modes.ts`.

## Phase plan

### Phase 0: bootstrap p5 entry
- `bird_p5.html`: same markup, single canvas container for p5, script src `src/p5/main.ts`.
- `src/p5/main.ts`: p5 instance mode; `setup` creates canvas; `windowResized` handles resize.
- Keep `mode`, `M`, `agents`, `ripples`, `bounds`, `ptr`, `morph` same as current.
- Wire pointer events; reuse `initTuner` from `src/tuner.ts`.

### Phase 1: background
- Implement `src/p5/background.ts`: `drawBackground(p, W, H, mode)`.
- Map:
  - `paperBase` → p5 `background()`, `fill()`, `rect()`.
  - radial gradient → `p.drawingContext.createRadialGradient` or `lerpColor` fallback.
  - `paperFiber` → `p.line()`.
  - `mountainLayer` → `beginShape()` / `curveVertex()`.
  - `drawSun` → `p.circle()`.
- Cache to `p.createGraphics(W, H)` if background rarely changes.

### Phase 2: trail buffer
- `src/p5/trail.ts`: `paintTrail(p, W, H, M, agents, mode)`.
- Use `createGraphics(W * TR_SCALE, H * TR_SCALE)` as trail layer.
- Convert `dab()` to p5 `ellipse()` with rotation via `push()` / `rotate()`.
- Fade: `clear()` each frame, re-stamp active stamps.

### Phase 3: agent renderers
- `src/p5/renderers.ts`: `drawBird(p, a, t, morph)`, `drawKoi`, `drawHerd`.
- Replace `ctx.save/restore` with `push()` / `pop()`, `translate()` / `rotate()`.
- `dab()` → p5 `ellipse()`.
- `stroke()` → custom helper using `beginShape()` / `quadraticVertex()` or `bezierVertex()`.
- Koi body: same polygon logic, use `beginShape()` / `vertex()`.

### Phase 4: effects
- `src/p5/effects.ts`: `drawRipples`, `inkBurst`, `waterRipple` unchanged logic; rendering uses p5 ellipse/stroke.

### Phase 5: brush helper
- `src/p5/brush.ts`: `dab(p, x, y, rx, ry, rot)`, `stroke(p, x1, y1, cpx, cpy, x2, y2, w)`.
- p5 native; no `p5.brush` yet.

### Phase 6: parity test & switch
- Open `bird_p5.html`, compare three modes side-by-side with `bird.html`.
- Acceptance:
  - 60 fps on same machine.
  - Visual output matches within subjective tolerance.
  - Tuner works.
- Then rename: `bird.html` → `bird_legacy.html`, `bird_p5.html` → `bird.html`, `src/p5/main.ts` → `src/main.ts` (adjust imports). Delete legacy.

## File mapping

| old | new | note |
|---|---|---|
| `bird.html` | `bird_p5.html` | parallel entry |
| `src/main.ts` | `src/p5/main.ts` | p5 instance mode |
| `src/background.ts` | `src/p5/background.ts` | p5 shapes |
| `src/trail.ts` | `src/p5/trail.ts` | graphics buffer |
| `src/renderers.ts` | `src/p5/renderers.ts` | push/pop transforms |
| `src/effects.ts` | `src/p5/effects.ts` | rendering only |
| `src/brush.ts` | `src/p5/brush.ts` | dab/stroke helpers |
| `src/agents.ts` | reuse | no change |
| `src/physics.ts` | reuse | no change |
| `src/modes.ts` | reuse | no change |
| `src/tuner.ts` | reuse | bind to same IDs |

## Decisions
- Skip `p5.brush` initially. It forces WEBGL and flips coordinate system; adds weight. Add later only when needed.
- Renderer: start with `P2D` (default). Use `WEBGL` only if future shader/brush requires it.
- Multiple canvases: collapse to one p5 canvas + `createGraphics` layers (bg, trail).

## Risks & mitigations
- p5 coordinate system differs in WEBGL. Stay P2D to keep top-left origin.
- p5 `ellipse()` rotation: use `push/rotate/ellipse/pop`.
- Performance: p5 default has overhead; if fps drops, cache background to graphics, reduce trail resolution.

## Success criteria
- `bird_p5.html` renders birds/koi/herd indistinguishable from `bird.html`.
- All modes + tuner + pointer interactions functional.
- No regression in `bird.html` until explicit swap.
