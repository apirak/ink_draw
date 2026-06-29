import { describe, expect, it } from 'vitest';
import {
  DEFAULTS,
  INK,
  KOI_BODY,
  KOI_GOLD,
  KOI_KINDS,
  KOI_ORANGE,
  KOI_SUMI,
  MODES,
  RED,
  SEPIA,
  WATER_BLUE,
  arcToCos,
  buildModes,
  cosToArc,
} from './modes';

describe('arcToCos / cosToArc', () => {
  it('maps a full 360° arc to fov = -1', () => {
    expect(arcToCos(360)).toBeCloseTo(-1, 6);
  });

  it('maps a 120° arc to fov = 0.5', () => {
    expect(arcToCos(120)).toBeCloseTo(0.5, 6);
  });

  it('maps a 180° arc to fov = 0', () => {
    expect(arcToCos(180)).toBeCloseTo(0, 6);
  });

  it('round-trips through cosToArc for 5° multiples', () => {
    for (const arc of [120, 180, 240, 300, 360]) {
      expect(cosToArc(arcToCos(arc))).toBe(arc);
    }
  });
});

describe('color factories', () => {
  it.each([
    ['INK', INK, 31, 34, 38],
    ['SEPIA', SEPIA, 58, 40, 24],
    ['RED', RED, 196, 58, 43],
    ['KOI_ORANGE', KOI_ORANGE, 225, 96, 28],
    ['KOI_GOLD', KOI_GOLD, 228, 160, 46],
    ['KOI_BODY', KOI_BODY, 247, 243, 235],
    ['KOI_SUMI', KOI_SUMI, 34, 30, 32],
    ['WATER_BLUE', WATER_BLUE, 108, 166, 196],
  ])('%s embeds alpha in rgba string', (_name, factory, r, g, b) => {
    expect(factory(0.5)).toBe(`rgba(${r},${g},${b},0.5)`);
  });
});

describe('MODES', () => {
  it('contains all three mode shapes', () => {
    expect(Object.keys(MODES).sort()).toEqual(['birds', 'herd', 'koi']);
  });

  it.each(Object.entries(MODES))('%s carries the expected tuning fields', (_name, mode) => {
    expect(mode.count).toBeGreaterThan(0);
    expect(mode.maxSpeed).toBeGreaterThan(0);
    expect(mode.maxForce).toBeGreaterThan(0);
    expect(mode.sepR).toBeGreaterThan(0);
    expect(mode.aliR).toBeGreaterThan(0);
    expect(mode.cohR).toBeGreaterThan(0);
    expect(typeof mode.sepW).toBe('number');
    expect(typeof mode.aliW).toBe('number');
    expect(typeof mode.cohW).toBe('number');
    expect(typeof mode.mouseW).toBe('number');
    expect(mode.orbit).toHaveLength(2);
    expect(typeof mode.fov).toBe('number');
    expect(typeof mode.trailFade).toBe('number');
    expect(typeof mode.stampA).toBe('number');
    expect(typeof mode.ink).toBe('function');
  });

  it('records default tunings for reset', () => {
    for (const name of Object.keys(MODES) as Array<keyof typeof MODES>) {
      expect(DEFAULTS[name]).toEqual({
        count: MODES[name].count,
        fov: MODES[name].fov,
        sepW: MODES[name].sepW,
        aliW: MODES[name].aliW,
        cohW: MODES[name].cohW,
      });
    }
  });

  it('uses full counts when reduced motion is off', () => {
    expect(MODES.birds.count).toBe(40);
    expect(MODES.koi.count).toBe(15);
    expect(MODES.herd.count).toBe(24);
  });
});

describe('reduced motion', () => {
  it('lowers agent counts', () => {
    const reduced = buildModes(true);
    expect(reduced.birds.count).toBe(24);
    expect(reduced.koi.count).toBe(10);
    expect(reduced.herd.count).toBe(14);
  });
});

describe('koi varieties', () => {
  it('has at least one variety', () => {
    expect(KOI_KINDS.length).toBeGreaterThan(0);
  });

  it.each(KOI_KINDS)('variety has body, patch, and sumi flag', (kind) => {
    expect(typeof kind.body).toBe('function');
    expect(typeof kind.patch).toBe('function');
    expect(typeof kind.sumi).toBe('boolean');
  });
});
