import { KOI_KINDS, type ModeConfig, type ModeName } from './modes';

export interface Point {
  x: number;
  y: number;
}

export interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; // depth (birds)
  size: number;
  phase: number;
  flapSpeed: number;
  density: number;
  hasRed: boolean;
  koiKind: { body: (a: number) => string; patch: (a: number) => string; sumi: boolean };
  koiSpots: number;
  face: number;
  sepF: number;
  spd: number;
  rDrift: number;
  rPhase: number;
  orbitA: number;
  orbitR: number;
  orbitSpin: number;
  laneY: number;
  hist: Point[];
}

export type RandomFn = () => number;

export interface Bounds {
  w: number;
  h: number;
}

export function makeAgent(
  _i: number,
  _mode: ModeName,
  bounds: Bounds,
  rand: RandomFn = Math.random,
): Agent {
  const a = rand() * Math.PI * 2;
  return {
    x: rand() * bounds.w,
    y: rand() * bounds.h,
    vx: Math.cos(a),
    vy: Math.sin(a),
    z: 0.55 + rand() * 0.85, // depth (birds)
    size: 0,
    phase: rand() * Math.PI * 2,
    flapSpeed: 0.8 + rand() * 0.5,
    density: 0.45 + rand() * 0.45, // ink load on the brush
    hasRed: rand() < 0.42, // koi accent patch
    koiKind: KOI_KINDS[Math.floor(rand() * KOI_KINDS.length)], // koi variety
    koiSpots: rand(), // how mottled the markings are
    face: 1, // herd facing, flips with hysteresis
    sepF: 0.55 + rand() * 0.9, // personal-space tolerance — clumps & loners
    spd: 0.72 + rand() * 0.5, // cruise speed personality
    rDrift: 0.00012 + rand() * 0.00022,
    rPhase: rand() * Math.PI * 2,
    orbitA: rand() * Math.PI * 2,
    orbitR: 0,
    orbitSpin: (rand() < 0.5 ? -1 : 1) * (0.004 + rand() * 0.01),
    laneY: 0, // herd ground lane
    hist: [], // koi spine
  };
}

export function reseed(
  agents: Agent[],
  mode: ModeName,
  M: ModeConfig,
  rand: RandomFn = Math.random,
): void {
  for (const a of agents) {
    if (mode === 'birds') a.size = 5.5 + rand() * 5;
    if (mode === 'koi') {
      a.size = 17 + rand() * 14;
      a.hist.length = 0;
    }
    if (mode === 'herd') a.size = 14 + rand() * 7;
    a.orbitR = M.orbit[0] + rand() * (M.orbit[1] - M.orbit[0]);
  }
}
