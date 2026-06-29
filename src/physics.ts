import { type Agent } from './agents';
import { type ModeConfig, type ModeName } from './modes';
import { targetPoint, type Bounds, type PointerState } from './target';

function steer(
  a: Agent,
  txv: number,
  tyv: number,
  weight: number,
  M: ModeConfig,
): void {
  const d = Math.hypot(txv, tyv);
  if (d < 1e-4) return;
  let sx = (txv / d) * M.maxSpeed - a.vx;
  let sy = (tyv / d) * M.maxSpeed - a.vy;
  const sd = Math.hypot(sx, sy);
  const mf = M.maxForce * weight;
  if (sd > mf) {
    sx = (sx / sd) * mf;
    sy = (sy / sd) * mf;
  }
  a.vx += sx;
  a.vy += sy;
}

export function update(
  t: number,
  dt: number,
  mode: ModeName,
  M: ModeConfig,
  agents: Agent[],
  bounds: Bounds,
  pointer: PointerState,
  now: number,
): void {
  const N = M.count;
  const [tx, ty] = targetPoint(pointer, bounds, t, now);
  const sepR2 = M.sepR * M.sepR;
  const aliR2 = M.aliR * M.aliR;
  const cohR2 = M.cohR * M.cohR;
  const W = bounds.w;
  const H = bounds.h;

  for (let i = 0; i < N; i++) {
    const a = agents[i];
    const ovx = a.vx;
    const ovy = a.vy;
    let sx = 0,
      sy = 0,
      sn = 0;
    let ax = 0,
      ay = 0,
      an = 0;
    let cxx = 0,
      cyy = 0,
      cn = 0;

    const mySepR2 = sepR2 * a.sepF * a.sepF;
    const hs = Math.hypot(a.vx, a.vy) || 1;
    const hx = a.vx / hs;
    const hy = a.vy / hs;

    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const b = agents[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1e-6 && (d2 < cohR2 || d2 < aliR2)) {
        const dd = Math.sqrt(d2);
        const seen = (hx * -dx + hy * -dy) / dd > M.fov;
        if (seen) {
          if (d2 < cohR2) {
            cxx += b.x;
            cyy += b.y;
            cn++;
          }
          if (d2 < aliR2) {
            ax += b.vx;
            ay += b.vy;
            an++;
          }
        }
      }
      if (d2 < mySepR2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        sx += dx / d / d;
        sy += dy / d / d;
        sn++;
      }
    }

    if (sn) steer(a, sx, sy, M.sepW, M);
    if (an) steer(a, ax / an, ay / an, M.aliW, M);
    if (cn) steer(a, cxx / cn - a.x, cyy / cn - a.y, M.cohW, M);

    a.orbitA += a.orbitSpin * dt;
    const oR = a.orbitR * (0.68 + 0.45 * Math.sin(t * a.rDrift + a.rPhase));
    const gx = tx + Math.cos(a.orbitA) * oR;
    const gy = ty + Math.sin(a.orbitA) * oR;
    steer(a, gx - a.x, gy - a.y, M.mouseW, M);

    if (mode === 'koi') {
      a.phase += (0.04 + Math.hypot(a.vx, a.vy) * 0.045) * dt;
      const vlen = Math.hypot(a.vx, a.vy) || 1;
      const w = Math.sin(a.phase) * 0.022;
      a.vx += (-a.vy / vlen) * w * dt;
      a.vy += (a.vx / vlen) * w * dt;
    } else {
      a.phase +=
        (mode === 'birds'
          ? (0.16 + Math.hypot(a.vx, a.vy) * 0.035) * a.flapSpeed
          : Math.hypot(a.vx, a.vy) * 0.11) * dt;
    }

    const m = mode === 'koi' ? 120 : mode === 'birds' ? 90 : 70;
    const turn = mode === 'koi' ? 0.06 : mode === 'birds' ? 0.07 : 0.06;
    if (a.x < m) a.vx += turn * (1 - a.x / m) * dt;
    if (a.x > W - m) a.vx -= turn * (1 - (W - a.x) / m) * dt;
    if (a.y < m) a.vy += turn * (1 - a.y / m) * dt;
    if (a.y > H - m) a.vy -= turn * (1 - (H - a.y) / m) * dt;

    const myMax = M.maxSpeed * a.spd;
    const sp = Math.hypot(a.vx, a.vy);
    const minSp = myMax * 0.28;
    if (sp > myMax) {
      a.vx = (a.vx / sp) * myMax;
      a.vy = (a.vy / sp) * myMax;
    } else if (sp < minSp && sp > 1e-4) {
      a.vx = (a.vx / sp) * minSp;
      a.vy = (a.vy / sp) * minSp;
    }

    if (mode !== 'birds' && Math.hypot(ovx, ovy) > 1e-3) {
      const oldA = Math.atan2(ovy, ovx);
      const sp2 = Math.hypot(a.vx, a.vy);
      let dA = Math.atan2(a.vy, a.vx) - oldA;
      if (dA > Math.PI) dA -= 2 * Math.PI;
      if (dA < -Math.PI) dA += 2 * Math.PI;
      const maxT = (mode === 'koi' ? 0.05 : 0.04) * dt;
      if (Math.abs(dA) > maxT) {
        const ca = oldA + Math.sign(dA) * maxT;
        a.vx = Math.cos(ca) * sp2;
        a.vy = Math.sin(ca) * sp2;
      }
    }

    a.x += a.vx * dt * (mode === 'birds' ? a.z : 1);
    a.y += a.vy * dt * (mode === 'birds' ? a.z : 1);

    if (mode === 'koi') {
      const h = a.hist;
      const segLen = a.size * 0.26;
      if (!h.length) {
        for (let k = 1; k <= 12; k++) {
          h.push({ x: a.x - a.vx * k * 3, y: a.y - a.vy * k * 3 });
        }
      }
      let px = a.x;
      let py = a.y;
      const sp0 = Math.hypot(a.vx, a.vy) || 1;
      let pdx = -a.vx / sp0;
      let pdy = -a.vy / sp0;
      const maxBend = 0.28;
      for (const seg of h) {
        let dx = seg.x - px;
        let dy = seg.y - py;
        const d = Math.hypot(dx, dy) || 1;
        dx /= d;
        dy /= d;
        const ang = Math.atan2(
          pdx * dy - pdy * dx,
          Math.max(-1, Math.min(1, pdx * dx + pdy * dy)),
        );
        if (Math.abs(ang) > maxBend) {
          const c = Math.sign(ang) * maxBend;
          const cr = Math.cos(c);
          const sr = Math.sin(c);
          const ndx = pdx * cr - pdy * sr;
          const ndy = pdx * sr + pdy * cr;
          dx = ndx;
          dy = ndy;
        }
        seg.x = px + dx * segLen;
        seg.y = py + dy * segLen;
        px = seg.x;
        py = seg.y;
        pdx = dx;
        pdy = dy;
      }
    }
  }
}
