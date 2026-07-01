# Ink Flock

A p5.js sketch with three modes — birds, koi, herd — sharing a single click-effect vocabulary. This glossary defines the marks the user sees and the buffers that render them, so "stamp", "burst", and "blot" don't collide.

## Language

**Mode**:
One of `birds`, `koi`, `herd`. Set on `<body data-mode>`; selects renderer, agent tuning, palette, and which click effects apply.
_Avoid_: scene, page, view

**Agent**:
A single moving entity in the flock (bird / koi / herd beast). Has position, velocity, size, z-depth. Not a "particle" — agents steer, they don't just drift.

**Stamp**:
A short-lived ink mark drawn into the per-frame trail buffer (`stamps[]` in `trail.ts`). Used for two purposes: (1) faint per-frame trail behind moving agents, (2) the small scattered specks emitted by a click. Rendered as a flat ellipse via `dab()`.
_Avoid_: dot, mark (too generic)

**Burst**:
The full click effect on the canvas: one **blot** + twelve **specks** + one **ripple** + radial **agent pushback**. The word refers to the whole event, not any single mark.
_Avoid_: splash, click-effect

**Blot**:
The single large central ink mark of a **burst**. In `birds` mode it is painted once with a watercolor brush into an offscreen WEBGL buffer and tint-faded over `life` frames. In `herd` mode it is a plain ellipse **stamp**.
_Avoid_: blob, inkdrop

**Speck**:
Any of the twelve small **stamps** scattered around a click point (`rx ≈ 0.8–4`, distance 22–97px from center). Always native ellipses, even in `birds` mode.
_Avoid_: dot (prefer the speck/dab split)

**Ripple**:
The expanding ring drawn around a click (`ripples[]` in `effects.ts`). Native p5 stroke ellipse, animated per-frame. In `koi` mode the burst is ripple-only — no blot, no specks (water, not ink).
_Avoid_: wave, ring

**dab**:
The `brush.ts:dab()` helper — draws an ellipse with translate+rotate. Mechanism, not a domain mark.

**Wash**:
A p5.brush flat solid fill (`brush.wash()`), used for herd background pool. Distinct from **blot**, which uses watercolor `brush.fill()` + `brush.fillTexture()`.

## Relationships

- A **Burst** produces exactly one **Blot**, twelve **Specks**, one **Ripple**, and an **agent pushback** — except in `koi` mode, where it produces only ripples.
- **Specks** are **Stamps** (same buffer, same `dab()` path).
- A **Blot** is *not* a **Stamp**: in `birds` mode it lives in a separate offscreen WEBGL buffer (`bursts[]` in `effects.ts`) and is composited via tint-fade, not redrawn per-frame.
- **Stamp** fade and **Blot** fade are independent lifetimes.

## Example dialogue

> **Dev:** "When the user clicks in birds mode, do the **specks** render through the **blot** buffer?"
> **Domain expert:** "No — the **blot** gets its own WEBGL snapshot buffer because watercolor has to paint once. The **specks** stay in the trail buffer with the agent **stamps**; they're just tiny ellipses."

> **Dev:** "Why doesn't koi have a **blot**?"
> **Domain expert:** "Koi is water — a **burst** there is just **ripples**. **Blots** and **specks** are ink, and ink doesn't belong on water."

## Flagged ambiguities

- "ink mark" was used loosely to mean **Stamp**, **Blot**, or **Speck** — resolved: avoid "ink mark"; use the specific term.
- "splash" informally meant the whole **Burst** — resolved: **Burst** is canonical; "splash" is dropped.
