"use strict";

/* ───────────────────────── bird view init ───────────────────────── */

mode = 'birds';
M = MODES.birds;
document.body.dataset.mode = 'birds';

resize();
for (let i = 0; i < MAX; i++) agents.push(makeAgent(i));
reseed();
ptr.lastMove = -1e5;                                  // start in self-wander until the hand arrives
requestAnimationFrame(loop);
