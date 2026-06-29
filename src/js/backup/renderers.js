"use strict";

/* ───────────────────────── renderers ───────────────────────── */

function drawBird(a, t) {
  const s = a.size * a.z, ang = Math.atan2(a.vy, a.vx);
  const alpha = a.density * (.55 + a.z * .35) * morph;
  const flap = Math.sin(a.phase);
  cx.save(); cx.translate(a.x, a.y); cx.rotate(ang);
  // far wing — drier ink
  cx.fillStyle = INK(alpha * .5);
  stroke(cx, 0, 0, -s * .55, s * (.55 + flap * .55), -s * 1.45, s * (.35 + flap * .95), s * .22);
  // body
  cx.fillStyle = INK(alpha);
  dab(cx, 0, 0, s * .62, s * .26, 0);
  dab(cx, s * .55, -s * .07, s * .2, s * .15, 0);                  // head
  stroke(cx, -s * .4, 0, -s * .95, s * .06, -s * 1.25, s * .14, s * .14); // tail
  // near wing — the signature stroke
  stroke(cx, 0, -s * .05, -s * .5, -s * (.7 + flap * .6), -s * 1.6, -s * (.5 + flap * 1.15), s * .3);
  cx.restore();
}

// half-width of the body at each spine point: rounded nose, bulge, long taper
const KOI_PROFILE = [.5, .82, .98, 1, .94, .85, .74, .62, .5, .38, .27, .17, .08];

function drawKoi(a, t) {
  // live position leads the spine so the nose never lags the physics
  const h = [{ x: a.x, y: a.y }, ...a.hist];
  if (h.length < 4) return;
  const s = a.size, alpha = (.6 + a.density * .4) * morph;
  const kind = a.koiKind;
  const n = Math.min(h.length, 13);
  const grow = Math.min(n / 13, 1);              // newborn spines start small
  // body: one continuous filled outline around the spine — a single brush pull
  const Lx = [], Ly = [], Rx = [], Ry = [];
  for (let i = 0; i < n; i++) {
    const p = h[i], o = h[Math.max(i - 1, 0)], q = h[Math.min(i + 1, n - 1)];
    let dx = o.x - q.x, dy = o.y - q.y;
    const d = Math.hypot(dx, dy) || 1;
    const w = s * .3 * KOI_PROFILE[i] * grow;
    Lx.push(p.x - dy / d * w); Ly.push(p.y + dx / d * w);
    Rx.push(p.x + dy / d * w); Ry.push(p.y - dx / d * w);
  }
  // the body itself — a pale pearl (or gold/dark) wash, the koi's base colour
  const bodyPath = () => {
    cx.beginPath();
    cx.moveTo(Lx[0], Ly[0]);
    for (let i = 1; i < n; i++) cx.lineTo(Lx[i], Ly[i]);
    for (let i = n - 1; i >= 0; i--) cx.lineTo(Rx[i], Ry[i]);
    cx.closePath();
  };
  cx.fillStyle = kind.body(alpha * .92);
  bodyPath(); cx.fill();

  // colour markings (hi) painted ONLY over the body — clipped so the dabs
  // can't bleed past the silhouette, the way pigment sits inside the scales
  cx.save();
  bodyPath(); cx.clip();
  cx.fillStyle = kind.patch(alpha * .9);
  // a few irregular blotches down the back — head, shoulder, mid-body
  for (const [idx, scale, jit] of [[1, 1.05, .1], [3, .95, -.18], [5, .8, .22], [8, .55, -.1]]) {
    const p = h[Math.min(idx, n - 1)]; if (!p) continue;
    if ((a.koiSpots + idx * .17) % 1 > .72) continue;   // some fish skip a blotch
    dab(cx, p.x, p.y, s * .34 * scale, s * .26 * scale, idx + jit);
  }
  // sumi — black accent specks for the patterned varieties
  if (kind.sumi) {
    cx.fillStyle = KOI_SUMI(alpha * .55);
    for (const [idx, sc] of [[2, .18], [4, .15], [6, .13]]) {
      const p = h[Math.min(idx, n - 1)]; if (!p) continue;
      if ((a.koiSpots + idx * .31) % 1 > .55) continue;
      dab(cx, p.x, p.y, s * sc, s * sc * .9, idx);
    }
  }
  cx.restore();

  // a thin ink contour keeps the soft body legible over busy water
  cx.strokeStyle = INK(alpha * .28); cx.lineWidth = 1;
  bodyPath(); cx.stroke();

  // rounded nose cap, tinted to match the body
  cx.fillStyle = kind.body(alpha * .92);
  dab(cx, h[0].x, h[0].y, s * .15 * grow, s * .15 * grow, 0);
  const head = h[0], neck = h[2] || head, tail = h[n - 1], tail2 = h[n - 2] || tail;
  // tail fin: two flared strokes — translucent like wet rice-paper
  const ta = Math.atan2(tail.y - tail2.y, tail.x - tail2.x);
  cx.fillStyle = kind.body(alpha * .4);
  cx.save(); cx.translate(tail.x, tail.y); cx.rotate(ta);
  stroke(cx, 0, 0, s * .45, -s * .3, s * .85, -s * .52, s * .12);
  stroke(cx, 0, 0, s * .45,  s * .3, s * .85,  s * .52, s * .12);
  cx.restore();
  // pectoral fins
  const na = Math.atan2(head.y - neck.y, head.x - neck.x);
  cx.save(); cx.translate(neck.x, neck.y); cx.rotate(na);
  stroke(cx, 0, 0, -s * .25, -s * .42, -s * .5, -s * .6, s * .1);
  stroke(cx, 0, 0, -s * .25,  s * .42, -s * .5,  s * .6, s * .1);
  cx.restore();
  // crown patch on the head — the signature dab of hi between the eyes
  if (a.hasRed) {
    cx.fillStyle = kind.patch(alpha * .85);
    const p = h[1] || head;
    dab(cx, p.x, p.y, s * .3, s * .22, na);
  }
  // eye-side head dab, darker
  cx.fillStyle = KOI_SUMI(alpha * .8);
  dab(cx, head.x, head.y, s * .2, s * .16, na);
}

// low afternoon sun: every shadow falls the same way (unit ray + its perpendicular)
const SHD = { x: -.38, y: -.925 }, SHP = { x: .925, y: -.38 }, SHK = 1.15;

// side-view gazelle in local coords (+x facing, feet at y = +.8s) — in top
// view this is what the SHADOW shows, galloping legs and all
function gazelleSide(ctx2, s, g, lift, color) {
  ctx2.fillStyle = color;
  for (const [oxN, ph] of [[-.62, 0], [-.5, 2.2], [.42, Math.PI], [.55, Math.PI + 2.2]]) {
    const ox = oxN * s, sw = Math.sin(g + ph) * .55 * lift;
    stroke(ctx2, ox, s * .1, ox + sw * s * .4, s * .45, ox + sw * s * .75, s * .8, s * .085);
  }
  dab(ctx2, 0, 0, s * .95, s * .38, -.06);
  stroke(ctx2, s * .7, -s * .1, s * 1.05, -s * .55, s * 1.18, -s * .72, s * .2);
  dab(ctx2, s * 1.28, -s * .78, s * .26, s * .14, .35);
  stroke(ctx2, s * 1.3, -s * .88, s * 1.18, -s * 1.12, s * 1.08, -s * 1.28, s * .045);
  stroke(ctx2, s * 1.4, -s * .88, s * 1.35, -s * 1.14, s * 1.3, -s * 1.3, s * .045);
  stroke(ctx2, -s * .9, -s * .12, -s * 1.15, s * .05 + Math.sin(g * .7) * s * .12, -s * 1.3, s * .18, s * .06);
}

function drawHerd(a, t) {
  const s = a.size;
  const alpha = a.density * .9 * morph;
  const g = a.phase;
  const speed = Math.hypot(a.vx, a.vy);
  const lift = Math.min(speed / 2.5, 1);
  // the shadow profile follows the run's component ACROSS the sun ray:
  // sideways run = full side profile, running along the ray = the sun sees
  // the animal end-on, so the silhouette foreshortens
  const lat = speed > 1e-3 ? (a.vx * SHP.x + a.vy * SHP.y) / speed : a.face;
  if (lat > .15) a.face = 1; else if (lat < -.15) a.face = -1;
  const fore = Math.max(Math.abs(lat), .35);

  // — cast shadow: the side profile projected along the sun ray, feet anchored —
  cx.save();
  cx.transform(SHP.x * a.face * fore, SHP.y * a.face * fore,
               -SHD.x * SHK, -SHD.y * SHK,
               a.x + SHD.x * SHK * s * .8, a.y + SHD.y * SHK * s * .8);
  gazelleSide(cx, s, g, lift, SEPIA(alpha * .3));
  cx.restore();

  // — the animal from above —
  cx.save();
  cx.translate(a.x, a.y);
  cx.rotate(Math.atan2(a.vy, a.vx));
  const str = 1 + Math.sin(g) * .08 * lift;       // body stretches with the gallop
  cx.fillStyle = SEPIA(alpha);
  dab(cx, -s * .15, 0, s * .48 * str, s * .24, 0);   // hindquarters
  dab(cx, s * .28, 0, s * .34, s * .2, 0);           // shoulders
  dab(cx, s * .62, 0, s * .17, s * .11, 0);          // neck
  dab(cx, s * .85, 0, s * .13, s * .1, 0);           // head
  // horns sweep back, seen from above
  cx.fillStyle = SEPIA(alpha * .85);
  stroke(cx, s * .88, -s * .04, s * .76, -s * .13, s * .6, -s * .2, s * .03);
  stroke(cx, s * .88, s * .04, s * .76, s * .13, s * .6, s * .2, s * .03);
  // legs splay out at full stretch
  const ext = Math.sin(g) * .5 + .5;
  cx.fillStyle = SEPIA(alpha * .9);
  dab(cx, s * (.42 + ext * .25), -s * .14, s * .14, s * .05, -.25);
  dab(cx, s * (.42 + ext * .25), s * .14, s * .14, s * .05, .25);
  dab(cx, -s * (.5 + (1 - ext) * .25), -s * .14, s * .15, s * .05, .25);
  dab(cx, -s * (.5 + (1 - ext) * .25), s * .14, s * .15, s * .05, -.25);
  // tail
  cx.fillStyle = SEPIA(alpha * .8);
  stroke(cx, -s * .6, 0, -s * .78, Math.sin(g * .7) * s * .08, -s * .9, Math.sin(g * .7) * s * .14, s * .04);
  cx.restore();
}
