import { update as updateTS } from '../physics.ts';

globalThis.update = (t, dt) =>
  updateTS(t, dt, mode, M, agents, { w: W, h: H }, ptr, performance.now());
