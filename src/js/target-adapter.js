import { targetPoint as targetPointTS } from '../target.ts';

globalThis.targetPoint = (t) => targetPointTS(ptr, { w: W, h: H }, t, performance.now());
