import {
  arcToCos,
  cosToArc,
  DEFAULTS,
  type ModeConfig,
  type ModeName,
} from './modes';

export interface TunerElements {
  mode: HTMLElement;
  count: HTMLInputElement;
  vCount: HTMLElement;
  fov: HTMLInputElement;
  vFov: HTMLElement;
  sep: HTMLInputElement;
  vSep: HTMLElement;
  ali: HTMLInputElement;
  vAli: HTMLElement;
  coh: HTMLInputElement;
  vCoh: HTMLElement;
}

export function initTuner(
  mode: ModeName,
  M: ModeConfig,
  maxCount: number,
) {
  const tuner = document.getElementById('tuner')!;
  const els: TunerElements = {
    mode: document.getElementById('tnMode')!,
    count: document.getElementById('sCount') as HTMLInputElement,
    vCount: document.getElementById('vCount')!,
    fov: document.getElementById('sFov') as HTMLInputElement,
    vFov: document.getElementById('vFov')!,
    sep: document.getElementById('sSep') as HTMLInputElement,
    vSep: document.getElementById('vSep')!,
    ali: document.getElementById('sAli') as HTMLInputElement,
    vAli: document.getElementById('vAli')!,
    coh: document.getElementById('sCoh') as HTMLInputElement,
    vCoh: document.getElementById('vCoh')!,
  };

  els.count.max = String(maxCount);

  function syncTuner() {
    els.mode.textContent = mode;
    els.count.value = String(Math.min(M.count, maxCount));
    els.vCount.textContent = els.count.value;
    els.fov.value = String(cosToArc(M.fov));
    els.vFov.textContent = els.fov.value + '°';
    els.sep.value = String(M.sepW);
    els.vSep.textContent = M.sepW.toFixed(2);
    els.ali.value = String(M.aliW);
    els.vAli.textContent = M.aliW.toFixed(2);
    els.coh.value = String(M.cohW);
    els.vCoh.textContent = M.cohW.toFixed(2);
  }

  els.count.addEventListener('input', () => {
    M.count = Math.min(maxCount, Math.max(1, +els.count.value));
    els.vCount.textContent = String(M.count);
  });
  els.fov.addEventListener('input', () => {
    M.fov = arcToCos(+els.fov.value);
    els.vFov.textContent = els.fov.value + '°';
  });
  els.sep.addEventListener('input', () => {
    M.sepW = +els.sep.value;
    els.vSep.textContent = M.sepW.toFixed(2);
  });
  els.ali.addEventListener('input', () => {
    M.aliW = +els.ali.value;
    els.vAli.textContent = M.aliW.toFixed(2);
  });
  els.coh.addEventListener('input', () => {
    M.cohW = +els.coh.value;
    els.vCoh.textContent = M.cohW.toFixed(2);
  });

  document.getElementById('tnReset')!.addEventListener('click', () => {
    Object.assign(M, DEFAULTS[mode]);
    M.count = Math.min(maxCount, M.count);
    syncTuner();
  });

  addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') tuner.classList.toggle('hidden');
  });

  syncTuner();
  return { syncTuner };
}
