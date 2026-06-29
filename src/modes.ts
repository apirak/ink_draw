export type ColorFactory = (alpha: number) => string;

export type ModeName = 'birds' | 'koi' | 'herd';

export interface ModeConfig {
  count: number;
  maxSpeed: number;
  maxForce: number;
  sepR: number;
  aliR: number;
  cohR: number;
  sepW: number;
  aliW: number;
  cohW: number;
  mouseW: number;
  orbit: [number, number];
  fov: number;
  trailFade: number;
  stampA: number;
  ink: ColorFactory;
}

export interface KoiVariety {
  body: ColorFactory;
  patch: ColorFactory;
  sumi: boolean;
}

export const INK: ColorFactory = (a) => `rgba(31,34,38,${a})`;
export const SEPIA: ColorFactory = (a) => `rgba(58,40,24,${a})`;
export const RED: ColorFactory = (a) => `rgba(196,58,43,${a})`;

export const KOI_ORANGE: ColorFactory = (a) => `rgba(225,96,28,${a})`;
export const KOI_GOLD: ColorFactory = (a) => `rgba(228,160,46,${a})`;
export const KOI_BODY: ColorFactory = (a) => `rgba(247,243,235,${a})`;
export const KOI_SUMI: ColorFactory = (a) => `rgba(34,30,32,${a})`;
export const WATER_BLUE: ColorFactory = (a) => `rgba(108,166,196,${a})`;

export const KOI_KINDS: KoiVariety[] = [
  { body: KOI_BODY, patch: KOI_ORANGE, sumi: true },
  { body: KOI_BODY, patch: KOI_ORANGE, sumi: true },
  { body: KOI_BODY, patch: KOI_GOLD, sumi: true },
  { body: KOI_GOLD, patch: KOI_ORANGE, sumi: false },
  { body: KOI_ORANGE, patch: KOI_GOLD, sumi: true },
  { body: KOI_SUMI, patch: KOI_ORANGE, sumi: false },
];

export const arcToCos = (deg: number): number =>
  Math.cos((deg / 2) * (Math.PI / 180));

export const cosToArc = (c: number): number => Math.round(Math.acos(Math.max(-1, Math.min(1, c))) * (180 / Math.PI) * (2 / 5)) * 5;

export function buildModes(reduced: boolean): Record<ModeName, ModeConfig> {
  return {
    birds: {
      count: reduced ? 24 : 40,
      maxSpeed: 3.6,
      maxForce: 0.085,
      sepR: 24,
      aliR: 50,
      cohR: 66,
      sepW: 1.5,
      aliW: 0.9,
      cohW: 0.55,
      mouseW: 0.85,
      orbit: [26, 130],
      fov: -0.35,
      trailFade: 0.065,
      stampA: 0.1,
      ink: INK,
    },
    koi: {
      count: reduced ? 10 : 15,
      maxSpeed: 2.5,
      maxForce: 0.055,
      sepR: 76,
      aliR: 110,
      cohR: 150,
      sepW: 2.0,
      aliW: 0.6,
      cohW: 0.35,
      mouseW: 0.68,
      orbit: [70, 240],
      fov: -0.5,
      trailFade: 0.016,
      stampA: 0.035,
      ink: INK,
    },
    herd: {
      count: reduced ? 14 : 24,
      maxSpeed: 2.9,
      maxForce: 0.07,
      sepR: 52,
      aliR: 96,
      cohR: 130,
      sepW: 1.6,
      aliW: 1.0,
      cohW: 0.55,
      mouseW: 0.8,
      orbit: [40, 170],
      fov: -0.15,
      trailFade: 0.03,
      stampA: 0.06,
      ink: SEPIA,
    },
  };
}

const reduced =
  typeof globalThis.matchMedia !== 'undefined' &&
  globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const MODES = buildModes(reduced);

export type DefaultTunings = Pick<ModeConfig, 'count' | 'fov' | 'sepW' | 'aliW' | 'cohW'>;

export const DEFAULTS: Record<ModeName, DefaultTunings> = {
  birds: { count: MODES.birds.count, fov: MODES.birds.fov, sepW: MODES.birds.sepW, aliW: MODES.birds.aliW, cohW: MODES.birds.cohW },
  koi: { count: MODES.koi.count, fov: MODES.koi.fov, sepW: MODES.koi.sepW, aliW: MODES.koi.aliW, cohW: MODES.koi.cohW },
  herd: { count: MODES.herd.count, fov: MODES.herd.fov, sepW: MODES.herd.sepW, aliW: MODES.herd.aliW, cohW: MODES.herd.cohW },
};
