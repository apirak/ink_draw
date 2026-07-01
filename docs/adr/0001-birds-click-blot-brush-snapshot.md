# Birds-mode click blot rendered as a brush snapshot, not per-frame ellipse

## Status

Accepted

## Context

In `birds` mode, clicking the canvas emits a **burst**: one large central **blot**, twelve small scattered **specks**, a **ripple**, and radial agent pushback (see `CONTEXT.md`). The blot was a flat p5 ellipse redrawn every frame into the P2D trail buffer — visually flat, doesn't read as ink soaking into the painted watercolor background.

We wanted the blot to look painted, like the mountains and sun in `background.ts`, which use `p5.brush`'s watercolor fill.

## Decision

Render the **blot only** as a `p5.brush` watercolor circle (`brush.fill` + `brush.fillTexture` + `brush.circle`), painted **once** into a small (~60×60) offscreen WEBGL `p5.Graphics` per click, then composited each frame via `p.tint(255, alpha)` with linear fade over `life=460` frames. A **pre-warmed pool of 5 WEBGL buffers** is allocated at `setup()` time; each click round-robins a slot (clear + repaint) rather than calling `createGraphics()` on click — the latter was a 50–200ms main-thread hitch noticeable as "stutter before the ink lands". Buffers return to the pool on age-out and are never `remove()`d.

**Specks stay as native ellipses** in the existing `stamps[]` trail pipeline. At `rx ≈ 0.8–4`, brush texture is invisible — converting them would add cost for no perceptual gain.

## Considered Options

- **Per-frame brush redraw into the trail buffer.** Rejected: trail buffer is P2D (brush needs WEBGL); switching it to WEBGL and re-running watercolor diffusion ~13×60fps is expensive and the bleed texture would shimmer frame-to-frame.
- **Permanent blot baked into `bgLayer`.** Rejected: user explicitly wants the blot to fade like the current stamps do.
- **Both blot and specks as brush.** Rejected: specks are too small for brush texture to read; pure overhead.
- **Single full-screen accumulation buffer with global fade.** Rejected: merges independent click lifetimes; rapid clicks visually muddy.

## Consequences

- Two pipelines render a click in `birds` mode: the WEBGL `bursts[]` snapshot for the blot, the P2D `stamps[]` for specks. `main.ts` pointerdown handler and `effects.ts:inkBurst` are the seam.
- `initBurstPool(p)` is called once in `setup()` for `birds` mode. Subsequent clicks pay only `clear + repaint + push`, no GL context creation.
- A new `drawBursts(p)` step slots between `paintTrail` and `drawRipples` in the draw loop.
- Slot recycling: if a 6th click lands within the 460-frame life of an earlier burst that shares its pool slot, the earlier burst is replaced (its slot is cleared + repainted). With 5 slots this needs ≥5 active bursts (~38s of burst overlap) to be noticeable — rare in practice.
- `herd` and `koi` modes are untouched — herd still uses ellipse stamps, koi still uses ripples only.
- Memory: 5 persistent WEBGL contexts (~150KB each at bbox size) ≈ 750KB. Well under budget. Cost shifted from per-click (jank) to setup (one-time).
