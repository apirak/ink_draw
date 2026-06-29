"use strict";

/* ───────────────────────── mode switching ───────────────────────── */

function setMode(next) {
  if (next === mode) return;
  mode = next; M = MODES[next];
  document.body.dataset.mode = next;
  morph = 0;                                         // ghost in
  reseed();
  // the old world's ink dries fast so the new one starts on clean paper
  for (const s of stamps) s.life = Math.min(s.life, s.age + 24);
  ripples.length = 0;
  bgC.style.opacity = 0;
  setTimeout(() => { drawBackground(); bgC.style.opacity = 1; }, 380);
  for (const b of document.querySelectorAll('.mode'))
    b.setAttribute('aria-pressed', String(b.dataset.set === next));
  syncTuner();
}
for (const b of document.querySelectorAll('.mode'))
  b.addEventListener('click', () => setMode(b.dataset.set));

/* ───────────────────────── flock tuner ───────────────────────── */

// snapshot the researched defaults so "reset mode" can restore them
const DEFAULTS = {};
for (const k in MODES) DEFAULTS[k] = { fov: MODES[k].fov, sepW: MODES[k].sepW, aliW: MODES[k].aliW, cohW: MODES[k].cohW };

const tuner = document.getElementById('tuner');
const els = {
  mode: document.getElementById('tnMode'),
  fov: document.getElementById('sFov'), vFov: document.getElementById('vFov'),
  sep: document.getElementById('sSep'), vSep: document.getElementById('vSep'),
  ali: document.getElementById('sAli'), vAli: document.getElementById('vAli'),
  coh: document.getElementById('sCoh'), vCoh: document.getElementById('vCoh'),
};
// fov stored as a cosine; the slider speaks degrees of visible arc.
// visible when cos(angle) > fov, so the cone half-angle is arc/2 → fov = cos(arc/2)
const arcToCos = (deg) => Math.cos(deg / 2 * Math.PI / 180);
const cosToArc = (c) => Math.round(Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI * 2 / 5) * 5;

function syncTuner() {
  els.mode.textContent = mode;
  els.fov.value = cosToArc(M.fov); els.vFov.textContent = els.fov.value + '°';
  els.sep.value = M.sepW; els.vSep.textContent = M.sepW.toFixed(2);
  els.ali.value = M.aliW; els.vAli.textContent = M.aliW.toFixed(2);
  els.coh.value = M.cohW; els.vCoh.textContent = M.cohW.toFixed(2);
}
// mutating M (a live reference into MODES) is picked up next frame for free
els.fov.addEventListener('input', () => { M.fov = arcToCos(+els.fov.value); els.vFov.textContent = els.fov.value + '°'; });
els.sep.addEventListener('input', () => { M.sepW = +els.sep.value; els.vSep.textContent = M.sepW.toFixed(2); });
els.ali.addEventListener('input', () => { M.aliW = +els.ali.value; els.vAli.textContent = M.aliW.toFixed(2); });
els.coh.addEventListener('input', () => { M.cohW = +els.coh.value; els.vCoh.textContent = M.cohW.toFixed(2); });
document.getElementById('tnReset').addEventListener('click', () => { Object.assign(M, DEFAULTS[mode]); syncTuner(); });

addEventListener('keydown', e => {
  if (e.key === '1') setMode('birds');
  if (e.key === 't' || e.key === 'T') tuner.classList.toggle('hidden');
});
syncTuner();
