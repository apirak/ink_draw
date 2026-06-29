import { makeAgent as makeAgentTS, reseed as reseedTS } from '../agents.ts';

globalThis.MAX = MODES.birds.count;
globalThis.agents = [];
globalThis.makeAgent = (i) => makeAgentTS(i, mode, { w: W, h: H });
globalThis.reseed = () => reseedTS(agents, mode, M);
