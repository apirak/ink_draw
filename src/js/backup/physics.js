"use strict";

/* ───────────────────────── flock physics ───────────────────────── */

function steer(a, txv, tyv, weight) {
  const d = Math.hypot(txv, tyv);
  if (d < 1e-4) return;
  let sx = txv / d * M.maxSpeed - a.vx;
  let sy = tyv / d * M.maxSpeed - a.vy;
  const sd = Math.hypot(sx, sy);
  const mf = M.maxForce * weight;
  if (sd > mf) { sx = sx / sd * mf; sy = sy / sd * mf; }
  a.vx += sx; a.vy += sy;
}

function update(t, dt) {
  const N = M.count;
  const [tx, ty] = targetPoint(t);
  const sepR2 = M.sepR * M.sepR, aliR2 = M.aliR * M.aliR, cohR2 = M.cohR * M.cohR;

  for (let i = 0; i < N; i++) {
    const a = agents[i];
    const ovx = a.vx, ovy = a.vy;
    let sx = 0, sy = 0, sn = 0;   // separation
    let ax = 0, ay = 0, an = 0;   // alignment
    let cxx = 0, cyy = 0, cn = 0; // cohesion

    const mySepR2 = sepR2 * a.sepF * a.sepF;   // each agent keeps its own distance
    // field of view: heading unit vector; neighbours in the rear blind cone are
    // unseen for alignment & cohesion (separation stays omnidirectional — you
    // still feel a crowd pressing from behind)
    const hs = Math.hypot(a.vx, a.vy) || 1, hx = a.vx / hs, hy = a.vy / hs;
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const b = agents[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1e-6 && (d2 < cohR2 || d2 < aliR2)) {
        // dot(heading, dir toward b): dir toward b is (-dx,-dy)
        const dd = Math.sqrt(d2);
        const seen = (hx * -dx + hy * -dy) / dd > M.fov;
        if (seen) {
          if (d2 < cohR2) { cxx += b.x; cyy += b.y; cn++; }
          if (d2 < aliR2) { ax += b.vx; ay += b.vy; an++; }
        }
      }
      if (d2 < mySepR2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        sx += dx / d / d; sy += dy / d / d; sn++;
      }
    }
    if (sn) steer(a, sx, sy, M.sepW);
    if (an) steer(a, ax / an, ay / an, M.aliW);
    if (cn) steer(a, cxx / cn - a.x, cyy / cn - a.y, M.cohW);

    // follow the hand — but orbit it, never pile onto it; the orbit radius
    // breathes slowly so the school never settles into a fixed ring
    a.orbitA += a.orbitSpin * dt;
    const oR = a.orbitR * (.68 + .45 * Math.sin(t * a.rDrift + a.rPhase));
    const gx = tx + Math.cos(a.orbitA) * oR;
    const gy = ty + Math.sin(a.orbitA) * oR;
    steer(a, gx - a.x, gy - a.y, M.mouseW);

    // koi swim with a sinuous wiggle
    if (mode === 'koi') {
      a.phase += (.04 + Math.hypot(a.vx, a.vy) * .045) * dt;
      const vlen = Math.hypot(a.vx, a.vy) || 1;
      const w = Math.sin(a.phase) * .022;
      a.vx += -a.vy / vlen * w * dt; a.vy += a.vx / vlen * w * dt;
    } else {
      a.phase += (mode === 'birds' ? (.16 + Math.hypot(a.vx, a.vy) * .035) * a.flapSpeed
                                   : Math.hypot(a.vx, a.vy) * .11) * dt;
    }

    // soft containment — a one-sided restoring force near each edge, never a
    // teleport and never a centre-spring: in open water there is NO pull, so
    // the school freely follows the cursor. A term only engages when the agent
    // is within `m` of that edge, and keeps ramping *past* it (1 - pos/m goes
    // negative off-screen) so any flock may drift off-frame but is always
    // reeled back, arcing in smoothly with no position snap.
    const m = mode === 'koi' ? 120 : mode === 'birds' ? 90 : 70;
    const turn = mode === 'koi' ? .06 : mode === 'birds' ? .07 : .06;
    if (a.x < m)     a.vx += turn * (1 - a.x / m) * dt;
    if (a.x > W - m) a.vx -= turn * (1 - (W - a.x) / m) * dt;
    if (a.y < m)     a.vy += turn * (1 - a.y / m) * dt;
    if (a.y > H - m) a.vy -= turn * (1 - (H - a.y) / m) * dt;

    // clamp speed — to this agent's own pace, not the flock average
    const myMax = M.maxSpeed * a.spd;
    const sp = Math.hypot(a.vx, a.vy);
    const minSp = myMax * .28;
    if (sp > myMax) { a.vx = a.vx / sp * myMax; a.vy = a.vy / sp * myMax; }
    else if (sp < minSp && sp > 1e-4) { a.vx = a.vx / sp * minSp; a.vy = a.vy / sp * minSp; }

    // ground & water animals carve their turns — clamp how fast the heading
    // can swing, so even a scatter burst becomes an arc, not a pivot
    if (mode !== 'birds' && Math.hypot(ovx, ovy) > 1e-3) {
      const oldA = Math.atan2(ovy, ovx);
      const sp2 = Math.hypot(a.vx, a.vy);
      let dA = Math.atan2(a.vy, a.vx) - oldA;
      if (dA > Math.PI) dA -= 2 * Math.PI;
      if (dA < -Math.PI) dA += 2 * Math.PI;
      const maxT = (mode === 'koi' ? .05 : .04) * dt;
      if (Math.abs(dA) > maxT) {
        const ca = oldA + Math.sign(dA) * maxT;
        a.vx = Math.cos(ca) * sp2; a.vy = Math.sin(ca) * sp2;
      }
    }

    a.x += a.vx * dt * (mode === 'birds' ? a.z : 1);
    a.y += a.vy * dt * (mode === 'birds' ? a.z : 1);

    // every mode may now leave the frame — the soft containment force above
    // always reels them back, so there is no position clamp at all (a clamp
    // would snap a koi's head and jerk its trailing spine, and pin the others).

    // koi spine — follow-the-leader chain, updated every frame so the body
    // bends continuously (discrete anchor drops read as jerky popping)
    if (mode === 'koi') {
      const h = a.hist, segLen = a.size * .26;
      if (!h.length)
        for (let k = 1; k <= 12; k++)
          h.push({ x: a.x - a.vx * k * 3, y: a.y - a.vy * k * 3 });
      let px = a.x, py = a.y;
      const sp0 = Math.hypot(a.vx, a.vy) || 1;
      let pdx = -a.vx / sp0, pdy = -a.vy / sp0;   // direction the body trails
      const maxBend = .28;                        // per-joint, keeps the body a smooth curve
      for (const seg of h) {
        let dx = seg.x - px, dy = seg.y - py;
        const d = Math.hypot(dx, dy) || 1;
        dx /= d; dy /= d;
        const ang = Math.atan2(pdx * dy - pdy * dx, Math.max(-1, Math.min(1, pdx * dx + pdy * dy)));
        if (Math.abs(ang) > maxBend) {
          const c = Math.sign(ang) * maxBend, cr = Math.cos(c), sr = Math.sin(c);
          const ndx = pdx * cr - pdy * sr, ndy = pdx * sr + pdy * cr;
          dx = ndx; dy = ndy;
        }
        seg.x = px + dx * segLen;
        seg.y = py + dy * segLen;
        px = seg.x; py = seg.y;
        pdx = dx; pdy = dy;
      }
    }
  }
}
