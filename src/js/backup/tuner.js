"use strict";

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
  if (e.key === 't' || e.key === 'T') tuner.classList.toggle('hidden');
});
syncTuner();
