"use strict";

/* ───────────────────────── background painting ───────────────────────── */

function washShape(ctx, pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2, yc = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
  }
  ctx.closePath(); ctx.fill();
}

function drawBackground() {
  bg.clearRect(0, 0, W, H);
  if (mode === 'birds') {
    // distant mountain washes
    washShape(bg, [[-.1*W, H], [.1*W, .72*H], [.3*W, .86*H], [.5*W, .7*H], [.72*W, .88*H], [1.1*W, .8*H], [1.1*W, H*1.2], [-.1*W, H*1.2]], INK(.06));
    washShape(bg, [[-.1*W, H], [.18*W, .82*H], [.42*W, .92*H], [.78*W, .84*H], [1.1*W, .94*H], [1.1*W, H*1.2], [-.1*W, H*1.2]], INK(.05));
    // rising sun
    bg.fillStyle = RED(.78);
    bg.beginPath(); bg.arc(W * .82, H * .2, Math.min(W, H) * .05, 0, 7); bg.fill();
  }
  if (mode === 'koi') {
    // still-water ripple arcs
    bg.strokeStyle = INK(.07); bg.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x = W * (.15 + Math.sin(i * 4.7) * .07 + i * .17), y = H * (.2 + (i % 3) * .28);
      for (let r = 24; r < 90; r += 22) {
        bg.beginPath(); bg.ellipse(x, y, r, r * .55, 0, 0, 7); bg.stroke();
      }
    }
    // lily pads, top-left cluster
    bg.fillStyle = INK(.13);
    for (const [x, y, r] of [[.1, .12, .055], [.17, .19, .04], [.07, .24, .032]]) {
      bg.beginPath();
      bg.ellipse(W * x, H * y, W * r, W * r * .62, .3, .45, 6.1);
      bg.lineTo(W * x, H * y); bg.closePath(); bg.fill();
    }
    // one drifting maple leaf of colour
    bg.fillStyle = RED(.5);
    bg.beginPath(); bg.ellipse(W * .88, H * .76, 7, 4.5, .8, 0, 7); bg.fill();
  }
  if (mode === 'herd') {
    // ── seen from directly above: open plain, every shadow falls the same way ──
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // waterhole, lower left — irregular ink pool with drying rings
    const wx = W * .2, wy = H * .7, wr = Math.min(W, H) * .085;
    const pool = [];
    for (let i = 0; i < 9; i++) {
      const ang = i / 9 * Math.PI * 2, r = wr * (.7 + rnd() * .5);
      pool.push([wx + Math.cos(ang) * r * 1.25, wy + Math.sin(ang) * r * .8]);
    }
    washShape(bg, pool, INK(.11));
    bg.strokeStyle = INK(.06); bg.lineWidth = 1.2;
    for (const k of [1.25, 1.45]) {
      bg.beginPath(); bg.ellipse(wx, wy, wr * 1.25 * k, wr * .8 * k, 0, 0, 7); bg.stroke();
    }
    // acacias from above: canopy blob + the side-view tree as its cast shadow
    const sideTree = (ts) => {
      bg.fillStyle = SEPIA(.22);
      stroke(bg, 0, 0, ts * .06, -ts * .5, -ts * .12, -ts * .82, ts * .035);
      dab(bg, -ts * .05, -ts * .92, ts * .52, ts * .13, -.04);
      dab(bg, ts * .28, -ts * .84, ts * .3, ts * .09, .05);
    };
    const trees = [[.72 * W, .28 * H, Math.min(W, H) * .14], [.42 * W, .82 * H, Math.min(W, H) * .1]];
    for (const [tx, ty, ts] of trees) {
      bg.save();
      bg.transform(SHP.x, SHP.y, -SHD.x * SHK, -SHD.y * SHK, tx, ty);
      sideTree(ts);
      bg.restore();
      bg.fillStyle = SEPIA(.5);
      dab(bg, tx - ts * .08, ty - ts * .03, ts * .3, ts * .22, .3);
      dab(bg, tx + ts * .1, ty + ts * .05, ts * .24, ts * .18, -.2);
      dab(bg, tx + ts * .02, ty - ts * .1, ts * .2, ts * .15, .1);
      bg.fillStyle = SEPIA(.75);
      dab(bg, tx, ty, ts * .045, ts * .045, 0);     // trunk, seen end-on
    }
    // grass tufts scattered across the whole plain
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * H, l = 4 + rnd() * 8;
      bg.fillStyle = SEPIA(.13 + rnd() * .1);
      stroke(bg, x, y, x - 2, y - l * .6, x - 3 - rnd() * 3, y - l, 1.1);
      stroke(bg, x, y, x + 1, y - l * .5, x + 2 + rnd() * 3, y - l * .85, 1);
      stroke(bg, x, y, x - .5, y - l * .4, x + (rnd() - .5) * 2, y - l * 1.15, .9);
    }
  }
}
