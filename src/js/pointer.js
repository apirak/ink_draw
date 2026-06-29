"use strict";

/* ───────────────────────── pointer ───────────────────────── */

const ptr = { x: innerWidth / 2, y: innerHeight / 2, lastMove: 0, down: false };
let lastRippleAt = 0;

addEventListener('pointermove', e => {
  ptr.x = e.clientX; ptr.y = e.clientY; ptr.lastMove = performance.now();
  brushEl.style.left = e.clientX + 'px';
  brushEl.style.top  = e.clientY + 'px';
  if (mode === 'koi' && performance.now() - lastRippleAt > 300) {
    ripples.push({ x: e.clientX, y: e.clientY, r: 4, max: 70 + Math.random() * 50, a: .22, tint: WATER_BLUE });
    lastRippleAt = performance.now();
  }
}, { passive: true });

addEventListener('pointerdown', e => {
  ptr.down = true; brushEl.classList.add('down');
  inkBurst(e.clientX, e.clientY);
});
addEventListener('pointerup', () => { ptr.down = false; brushEl.classList.remove('down'); });

// when the hand rests, the flock wanders on its own
function targetPoint(t) {
  const idle = performance.now() - ptr.lastMove;
  const k = Math.min(Math.max((idle - 2600) / 1800, 0), 1);   // blend to wander
  const wx = W * (.5 + .32 * Math.sin(t * .00021 + 1.3));
  const wy = H * (.45 + .26 * Math.sin(t * .00033));
  const tx = ptr.x + (wx - ptr.x) * k;
  const ty = ptr.y + (wy - ptr.y) * k;
  return [tx, ty];
}
