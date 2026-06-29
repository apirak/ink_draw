import { describe, expect, it } from 'vitest';
import { makeAgent, type Agent } from './agents';
import { MODES } from './modes';
import { update } from './physics';
import { type PointerState } from './target';

function pointer(x = 100, y = 100): PointerState {
  return { x, y, lastMove: 0, down: false };
}

describe('update', () => {
  function modeFor(agents: Agent[]) {
    return { ...MODES.birds, count: agents.length };
  }

  it('moves agents forward', () => {
    const agents: Agent[] = [makeAgent(0, 'birds', { w: 1000, h: 800 })];
    agents[0].x = 500;
    agents[0].y = 400;
    agents[0].vx = 1;
    agents[0].vy = 0;
    agents[0].z = 1;
    const before = agents[0].x;
    update(0, 1, 'birds', modeFor(agents), agents, { w: 1000, h: 800 }, pointer(), 0);
    expect(agents[0].x).toBeGreaterThan(before);
  });

  it('keeps speed within agent limits', () => {
    const agents: Agent[] = [makeAgent(0, 'birds', { w: 1000, h: 800 })];
    agents[0].vx = 100;
    agents[0].vy = 0;
    update(0, 1, 'birds', modeFor(agents), agents, { w: 1000, h: 800 }, pointer(), 0);
    const sp = Math.hypot(agents[0].vx, agents[0].vy);
    expect(sp).toBeLessThanOrEqual(MODES.birds.maxSpeed * agents[0].spd + 1e-4);
  });

  it('initializes koi spine on first update', () => {
    const agents: Agent[] = [makeAgent(0, 'koi', { w: 1000, h: 800 })];
    agents[0].x = 500;
    agents[0].y = 400;
    agents[0].vx = 1;
    agents[0].size = 20;
    expect(agents[0].hist).toHaveLength(0);
    update(0, 1, 'koi', { ...MODES.koi, count: 1 }, agents, { w: 1000, h: 800 }, pointer(), 0);
    expect(agents[0].hist.length).toBeGreaterThan(0);
  });

  it('updates target toward pointer when active', () => {
    const agents: Agent[] = [makeAgent(0, 'birds', { w: 1000, h: 800 })];
    agents[0].x = 100;
    agents[0].y = 100;
    agents[0].vx = 0;
    agents[0].vy = 0;
    const p = pointer(900, 700);
    p.lastMove = 10_000;
    update(10_000, 5, 'birds', modeFor(agents), agents, { w: 1000, h: 800 }, p, 10_000);
    expect(agents[0].x).toBeGreaterThan(100);
    expect(agents[0].y).toBeGreaterThan(100);
  });

  it('does not mutate agents beyond active count', () => {
    const agents: Agent[] = [
      makeAgent(0, 'birds', { w: 1000, h: 800 }),
      makeAgent(1, 'birds', { w: 1000, h: 800 }),
    ];
    agents[0].x = 500;
    agents[0].y = 400;
    agents[1].x = 500;
    agents[1].y = 400;
    const M = { ...MODES.birds, count: 1 };
    update(0, 1, 'birds', M, agents, { w: 1000, h: 800 }, pointer(), 0);
    expect(agents[1].x).toBe(500);
    expect(agents[1].y).toBe(400);
  });

  it('limits turn rate for koi and herd', () => {
    const agents: Agent[] = [makeAgent(0, 'koi', { w: 1000, h: 800 })];
    agents[0].x = 500;
    agents[0].y = 400;
    agents[0].vx = 2;
    agents[0].vy = 0;
    agents[0].size = 20;
    const before = Math.atan2(agents[0].vy, agents[0].vx);
    update(0, 1, 'koi', { ...MODES.koi, count: 1 }, agents, { w: 1000, h: 800 }, pointer(500, 100), 0);
    const after = Math.atan2(agents[0].vy, agents[0].vx);
    const delta = Math.abs(after - before);
    expect(delta).toBeLessThanOrEqual(Math.PI);
  });
});
