import {
  inkBurst as inkBurstTS,
  waterRipple as waterRippleTS,
  drawRipples as drawRipplesTS,
} from '../effects.ts';

globalThis.inkBurst = (x, y) => inkBurstTS(x, y, mode, agents, stamps, ripples);
globalThis.waterRipple = (x, y) => waterRippleTS(x, y, agents, ripples);
globalThis.drawRipples = () => drawRipplesTS(cx, ripples);
globalThis.ripples = [];
