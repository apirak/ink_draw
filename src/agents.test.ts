import { describe, expect, it } from 'vitest';
import type { Agent } from './agents';
import { makeAgent, reseed } from './agents';
import { MODES } from './modes';

function seeded(seq: number[]) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

describe('makeAgent', () => {
  it('places an agent inside bounds and gives it unit velocity', () => {
    const rand = seeded([0.5, 0.25, 0.75, 0.1, 0.9, 0.6, 0.4, 0.8, 0.2, 0.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const a = makeAgent(0, 'birds', { w: 800, h: 600 }, rand);
    expect(a.x).toBeGreaterThanOrEqual(0);
    expect(a.x).toBeLessThanOrEqual(800);
    expect(a.y).toBeGreaterThanOrEqual(0);
    expect(a.y).toBeLessThanOrEqual(600);
    expect(Math.hypot(a.vx, a.vy)).toBeCloseTo(1, 6);
  });

  it('uses seeded random deterministically', () => {
    const rand = seeded([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.0]);
    const a = makeAgent(0, 'birds', { w: 1000, h: 500 }, rand);
    expect(a.x).toBe(200);
    expect(a.y).toBe(150);
    expect(a.z).toBeCloseTo(0.55 + 0.4 * 0.85, 6);
  });

  it('selects a koi variety from the palette', () => {
    const rand = seeded([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    const a = makeAgent(0, 'koi', { w: 800, h: 600 }, rand);
    expect(a.koiKind).toBeDefined();
    expect(typeof a.koiKind.body).toBe('function');
    expect(typeof a.koiKind.patch).toBe('function');
  });

  it('starts with an empty spine history', () => {
    const a = makeAgent(0, 'koi', { w: 800, h: 600 }, () => 0.5);
    expect(a.hist).toEqual([]);
  });

  it('keeps orbit spin sign deterministic', () => {
    const a = makeAgent(0, 'birds', { w: 800, h: 600 }, seeded([0.0, 0.0]));
    expect(a.orbitSpin).toBeLessThan(0);
  });
});

describe('reseed', () => {
  it('sets bird size from the correct range', () => {
    const rand = seeded([0.0, 0.0, 0.0, 0.0, 0.0]);
    const a = makeAgent(0, 'birds', { w: 800, h: 600 }, () => 0.5) as Agent;
    reseed([a], 'birds', MODES.birds, rand);
    expect(a.size).toBe(5.5);
  });

  it('sets koi size and clears history', () => {
    const rand = seeded([0.0, 0.0, 0.0, 0.0, 0.0]);
    const a = makeAgent(0, 'koi', { w: 800, h: 600 }, () => 0.5) as Agent;
    a.hist.push({ x: 1, y: 2 });
    reseed([a], 'koi', MODES.koi, rand);
    expect(a.size).toBe(17);
    expect(a.hist).toEqual([]);
  });

  it('sets herd size from the correct range', () => {
    const rand = seeded([0.0, 0.0, 0.0, 0.0, 0.0]);
    const a = makeAgent(0, 'herd', { w: 800, h: 600 }, () => 0.5) as Agent;
    reseed([a], 'herd', MODES.herd, rand);
    expect(a.size).toBe(14);
  });

  it('assigns orbit radius inside mode orbit range', () => {
    const rand = () => 0;
    const a = makeAgent(0, 'birds', { w: 800, h: 600 }, () => 0.5) as Agent;
    reseed([a], 'birds', MODES.birds, rand);
    expect(a.orbitR).toBe(MODES.birds.orbit[0]);
  });
});
