"use strict";

/* ───────────────────────── setup ───────────────────────── */

const bgC    = document.getElementById('bg');
const trailC = document.getElementById('trail');
const mainC  = document.getElementById('main');
const bg = bgC.getContext('2d');
const tr = trailC.getContext('2d');
const cx = mainC.getContext('2d');
const brushEl = document.getElementById('brush');

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TR_SCALE = 0.5;            // trail canvas at half res → softer bleed, cheaper
let W = 0, H = 0;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  W = innerWidth; H = innerHeight;
  for (const [c, ctx, s] of [[mainC, cx, DPR], [bgC, bg, DPR], [trailC, tr, DPR * TR_SCALE]]) {
    c.width = W * s; c.height = H * s;
    ctx.setTransform(s, 0, 0, s, 0, 0);
  }
  drawBackground();
}
addEventListener('resize', resize);
