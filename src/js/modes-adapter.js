import * as modes from '../modes.ts';

Object.assign(globalThis, modes);

globalThis.mode = 'birds';
globalThis.M = modes.MODES.birds;
globalThis.morph = 1;
