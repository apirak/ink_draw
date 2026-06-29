"use strict";

/* ───────────────────────── main loop ───────────────────────── */

let last = performance.now();
function loop(t) {
  requestAnimationFrame(loop);
  let dt = (t - last) / 16.667;                      // 1 = one 60fps frame
  last = t;
  if (dt > 3) dt = 3;                                // tab-switch clamp
  frame++;

  morph = Math.min(morph + .022 * dt, 1);

  update(t, dt);
  paintTrail();

  cx.clearRect(0, 0, W, H);
  drawRipples();

  // painter's order: far → near
  const order = agents.slice(0, M.count);
  if (mode === 'birds')      order.sort((a, b) => a.z - b.z);
  else if (mode === 'herd')  order.sort((a, b) => a.y - b.y);
  else                       order.sort((a, b) => a.size - b.size);

  const draw = mode === 'birds' ? drawBird : mode === 'koi' ? drawKoi : drawHerd;
  for (const a of order) draw(a, t);
}

/* ───────────────────────── go ───────────────────────── */

resize();
for (let i = 0; i < MAX; i++) agents.push(makeAgent(i));
reseed();
ptr.lastMove = -1e5;                                  // start in self-wander until the hand arrives
requestAnimationFrame(loop);
