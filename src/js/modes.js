"use strict";

/* ───────────────────────── modes ───────────────────────── */

const INK  = (a) => `rgba(31,34,38,${a})`;
const SEPIA= (a) => `rgba(58,40,24,${a})`;
const RED  = (a) => `rgba(196,58,43,${a})`;

// ── koi colours: warm vermilion-orange & golden washes over a pale body ──
const KOI_ORANGE = (a) => `rgba(225,96,28,${a})`;   // hi — the classic red-orange
const KOI_GOLD   = (a) => `rgba(228,160,46,${a})`;  // yamabuki / gold sheen
const KOI_BODY   = (a) => `rgba(247,243,235,${a})`; // shiro — warm pearl-white flesh
const KOI_SUMI   = (a) => `rgba(34,30,32,${a})`;    // sumi — the deep black markings
const WATER_BLUE = (a) => `rgba(108,166,196,${a})`; // soft pond-water ripple blue

// koi varieties — assigned once per fish; [bodyTint, primaryPatch, hasSumi]
const KOI_KINDS = [
  { body: KOI_BODY,   patch: KOI_ORANGE, sumi: true  },  // kohaku-ish (white + red)
  { body: KOI_BODY,   patch: KOI_ORANGE, sumi: true  },
  { body: KOI_BODY,   patch: KOI_GOLD,   sumi: true  },  // white + gold
  { body: KOI_GOLD,   patch: KOI_ORANGE, sumi: false },  // yamabuki gold
  { body: KOI_ORANGE, patch: KOI_GOLD,   sumi: true  },  // mostly orange
  { body: KOI_SUMI,   patch: KOI_ORANGE, sumi: false },  // karasu / dark
];

const MODES = {
  birds: {
    count: reduced ? 60 : 110,
    maxSpeed: 3.6, maxForce: .085,
    sepR: 24, aliR: 50, cohR: 66,
    sepW: 1.5, aliW: .9, cohW: .55, mouseW: .85,
    orbit: [26, 130],            // swirl radius around cursor
    fov: -.35,                   // wide bird vision; ignore only a narrow rear cone
    trailFade: .065, stampA: .045,
    ink: INK
  },
  koi: {
    count: reduced ? 16 : 26,
    maxSpeed: 2.5, maxForce: .055,
    sepR: 76, aliR: 110, cohR: 150,
    sepW: 2.0, aliW: .6, cohW: .35, mouseW: .68,
    orbit: [70, 240],
    fov: -.5,                    // side-mounted eyes — very wide, small blind spot
    trailFade: .016, stampA: .035,
    ink: INK
  },
  herd: {
    count: reduced ? 14 : 24,
    maxSpeed: 2.9, maxForce: .07,
    sepR: 52, aliR: 96, cohR: 130,
    sepW: 1.6, aliW: 1.0, cohW: .55, mouseW: .8,
    orbit: [40, 170],
    fov: -.15,                   // lateral grazer vision but a real rear blind spot
    trailFade: .03, stampA: .06,
    ink: SEPIA
  }
};
let mode = 'birds';
let M = MODES.birds;
let morph = 1;                   // 0→1 ghost-fade during mode switch
