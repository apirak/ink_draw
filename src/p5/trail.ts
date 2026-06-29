import { dab } from './brush';
import { INK, SEPIA, type ColorFactory, type ModeConfig, type ModeName } from '../modes';
import type { Agent } from '../agents';

export interface TrailStamp {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  a0: number;
  age: number;
  life: number;
  tint?: ColorFactory;
  sepia?: boolean;
}

let frame = 0;
let g: any = null;
export const stamps: TrailStamp[] = [];

export function paintTrail(
  p: any,
  W: number,
  H: number,
  M: ModeConfig,
  agents: Agent[],
  mode: ModeName,
  ink: ColorFactory = INK,
  sepia: ColorFactory = SEPIA,
): void {
  frame++;

  const sw = W;
  const sh = H;
  if (!g || g.width !== sw || g.height !== sh) {
    g = p.createGraphics(sw, sh);
  }

  for (let i = 0; i < M.count; i++) {
    const a = agents[i];
    if (!a) continue;

    if (mode === 'birds') {
      if ((i + frame) % 3) continue;
      stamps.push({
        x: a.x,
        y: a.y,
        rx: a.size * a.z * 0.5,
        ry: a.size * a.z * 0.3,
        rot: Math.atan2(a.vy, a.vx),
        a0: M.stampA * a.density,
        age: 0,
        life: 20,
      });
    } else if (mode === 'koi') {
      if ((i + frame) % 3) continue;
      stamps.push({
        x: a.x,
        y: a.y,
        rx: a.size * 0.4,
        ry: a.size * 0.28,
        rot: Math.atan2(a.vy, a.vx),
        a0: M.stampA * a.density,
        age: 0,
        life: 100,
        tint: a.koiKind.patch as ColorFactory,
      });
    } else {
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > 1.6 && (i + frame) % 3 === 0) {
        stamps.push({
          x: a.x - a.vx * 6,
          y: a.y - a.vy * 6,
          rx: a.size * 0.5,
          ry: a.size * 0.22,
          rot: Math.atan2(a.vy, a.vx),
          a0: 0.07,
          age: 0,
          life: 46,
          sepia: true,
        });
      }
    }
  }

  g.clear();
  g.noStroke();
  for (let i = stamps.length - 1; i >= 0; i--) {
    const s = stamps[i];
    s.age++;
    const f = 1 - s.age / s.life;
    if (f <= 0) {
      stamps.splice(i, 1);
      continue;
    }
    const col = s.tint ? s.tint : s.sepia ? sepia : ink;
    g.fill(col(s.a0 * f * (s.tint ? 0.7 : 1)));
    dab(g, s.x, s.y, s.rx, s.ry, s.rot);
  }

  p.image(g, 0, 0, W, H);
}
