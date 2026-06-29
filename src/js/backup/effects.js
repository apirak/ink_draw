"use strict";

/* ───────────────────────── ink burst (click) ───────────────────────── */

function inkBurst(x, y) {
  // koi mode is water: a tap is a pebble, not a splatter — concentric rings
  // radiate out and the fish are nudged gently by the wavefront, not blasted
  if (mode === 'koi') { waterRipple(x, y); return; }

  // scatter the flock
  for (const a of agents) {
    const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy);
    if (d < 280 && d > .01) {
      const f = (1 - d / 280) * 9;
      a.vx += dx / d * f; a.vy += dy / d * f;
    }
  }
  // splat onto the wash layer — a ragged blob plus flung droplets
  stamps.push({ x, y, rx: 16 + Math.random() * 9, ry: 13 + Math.random() * 8,
                rot: Math.random() * 3, a0: .3, age: 0, life: 460, sepia: mode === 'herd' });
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 22 + Math.random() * 75;
    stamps.push({ x: x + Math.cos(ang) * d, y: y + Math.sin(ang) * d,
                  rx: .8 + Math.random() * 3.2, ry: .8 + Math.random() * 3,
                  rot: 0, a0: .1 + Math.random() * .2, age: 0, life: 380 + Math.random() * 160,
                  sepia: mode === 'herd' });
  }
  ripples.push({ x, y, r: 6, max: 180, a: .3 });
}

// a pebble in the pond: a family of concentric rings, staggered so they
// chase one another outward; nearby koi feel the wavefront pass and scatter softly
function waterRipple(x, y) {
  const N = 4;
  for (let i = 0; i < N; i++) {
    ripples.push({
      x, y,
      r: 4,
      delay: i * 16,                         // each ring is born a beat later
      max: 130 + i * 60,                     // outer rings travel farther
      speed: .9 - i * .07,                   // unhurried, like calm pond water
      a: .34 - i * .05,                      // outer rings start fainter
      lw: 1.5 - i * .22,                     // and thinner
      wob: .55 + Math.random() * .12,        // gentle out-of-round so it reads hand-made
      tint: WATER_BLUE                       // light-blue pond water
    });
  }
  // dimple at the impact point — a quick bright dot that collapses
  ripples.push({ x, y, r: 2, delay: 0, max: 22, speed: .55, a: .4, lw: 2.4, wob: .62, tint: WATER_BLUE });
  // push the fish along the expanding front rather than blasting them away
  for (const a of agents) {
    const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy);
    if (d < 230 && d > .01) {
      const f = (1 - d / 230) * 3.4;
      a.vx += dx / d * f; a.vy += dy / d * f;
    }
  }
}

/* ───────────────────────── ripples ───────────────────────── */

const ripples = [];
function drawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const R = ripples[i];
    if (R.delay > 0) { R.delay--; continue; }   // staggered birth
    R.r += R.speed || 1.15;
    const fade = 1 - R.r / R.max;
    if (fade <= 0) { ripples.splice(i, 1); continue; }
    // rings fade in fast then ebb out — a wavefront crest, not a flat line
    const crest = Math.min(R.r / 12, 1);
    cx.strokeStyle = (R.tint || INK)((R.a || .3) * fade * crest);
    cx.lineWidth = R.lw || 1.1;
    cx.beginPath();
    cx.ellipse(R.x, R.y, R.r, R.r * (R.wob || .62), 0, 0, 7);
    cx.stroke();
  }
}
