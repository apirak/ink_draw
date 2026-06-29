"use strict";

/* ───────────────────────── koi view init ───────────────────────── */

mode = 'koi';
M = MODES.koi;
document.body.dataset.mode = 'koi';

resize();
for (let i = 0; i < MAX; i++) agents.push(makeAgent(i));
reseed();
ptr.lastMove = -1e5;                                  // start in self-wander until the hand arrives
requestAnimationFrame(loop);
