"use strict";

/* ───────────────────────── brush helpers ───────────────────────── */

// tapered sliver: wide at root, vanishing at the tip — one brush stroke
function stroke(ctx, x1, y1, cpx, cpy, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len * w, ny = dx / len * w;
  ctx.beginPath();
  ctx.moveTo(x1 - nx, y1 - ny);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.quadraticCurveTo(cpx + nx * .35, cpy + ny * .35, x1 + nx, y1 + ny);
  ctx.closePath(); ctx.fill();
}
function dab(ctx, x, y, rx, ry, rot) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, 7); ctx.fill();
}
