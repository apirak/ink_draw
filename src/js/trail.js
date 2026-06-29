"use strict";

/* ───────────────────────── trail (ink wash) ───────────────────────── */

let frame = 0;
const stamps = [];

function paintTrail() {
  // lay down fresh ink behind the flock
  for (let i = 0; i < M.count; i++) {
    const a = agents[i];
    if (mode === 'birds') {
      if ((i + frame) % 3) continue;
      stamps.push({ x: a.x, y: a.y, rx: a.size * a.z * .5, ry: a.size * a.z * .3,
                    rot: Math.atan2(a.vy, a.vx), a0: M.stampA * a.density, age: 0, life: 20 });
    } else if (mode === 'koi') {
      if ((i + frame) % 3) continue;
      stamps.push({ x: a.x, y: a.y, rx: a.size * .4, ry: a.size * .28,
                    rot: Math.atan2(a.vy, a.vx), a0: M.stampA * a.density, age: 0, life: 100,
                    tint: a.koiKind.patch });   // wake tinted by the fish that made it
    } else {
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > 1.6 && (i + frame) % 3 === 0) {
        stamps.push({ x: a.x - a.vx * 6, y: a.y - a.vy * 6, rx: a.size * .5, ry: a.size * .22,
                      rot: Math.atan2(a.vy, a.vx), a0: .07, age: 0, life: 46, sepia: true });
      }
    }
  }
  // replay: age, draw, retire
  tr.clearRect(0, 0, W, H);
  for (let i = stamps.length - 1; i >= 0; i--) {
    const s = stamps[i];
    s.age++;
    const f = 1 - s.age / s.life;
    if (f <= 0) { stamps.splice(i, 1); continue; }
    const col = s.tint ? s.tint : s.sepia ? SEPIA : INK;
    tr.fillStyle = col(s.a0 * f * (s.tint ? .7 : 1));   // colour wakes sit lighter
    dab(tr, s.x, s.y, s.rx, s.ry, s.rot);
  }
}
