"use strict";

/* ───────────────────────── agents ───────────────────────── */

const MAX = MODES.birds.count;
const agents = [];

function makeAgent(i) {
  const a = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * W, y: Math.random() * H,
    vx: Math.cos(a), vy: Math.sin(a),
    z: .55 + Math.random() * .85,          // depth (birds)
    size: 0, phase: Math.random() * Math.PI * 2,
    flapSpeed: .8 + Math.random() * .5,
    density: .45 + Math.random() * .45,    // ink load on the brush
    hasRed: Math.random() < .42,           // koi accent patch
    koiKind: KOI_KINDS[Math.floor(Math.random() * KOI_KINDS.length)], // koi variety
    koiSpots: Math.random(),               // how mottled the markings are
    face: 1,                               // herd facing, flips with hysteresis
    sepF: .55 + Math.random() * .9,        // personal-space tolerance — clumps & loners
    spd: .72 + Math.random() * .5,         // cruise speed personality
    rDrift: .00012 + Math.random() * .00022,
    rPhase: Math.random() * Math.PI * 2,
    orbitA: Math.random() * Math.PI * 2,
    orbitR: 0, orbitSpin: (Math.random() < .5 ? -1 : 1) * (.004 + Math.random() * .01),
    laneY: 0,                              // herd ground lane
    hist: []                               // koi spine
  };
}

function reseed() {
  for (const a of agents) {
    if (mode === 'birds') a.size = 5.5 + Math.random() * 5;
    if (mode === 'koi')   { a.size = 17 + Math.random() * 14; a.hist.length = 0; }
    if (mode === 'herd')  a.size = 14 + Math.random() * 7;
    a.orbitR = M.orbit[0] + Math.random() * (M.orbit[1] - M.orbit[0]);
  }
}
