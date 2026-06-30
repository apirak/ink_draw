import { VIS } from './renderers';

// ponytail: minimal panel bind — input id matches VIS field name
const FIELDS: Array<{ key: keyof typeof VIS; type: 'range' | 'checkbox'; min?: number; max?: number; step?: number }> = [
  { key: 'bodyA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'patchA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'sumiA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'tailA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'crownA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'eyeA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'contourA', type: 'range', min: 0, max: 1, step: 0.01 },
  { key: 'contourW', type: 'range', min: 0, max: 4, step: 0.1 },
  { key: 'patchScale', type: 'range', min: 0.3, max: 2, step: 0.05 },
  { key: 'noseScale', type: 'range', min: 0.3, max: 2, step: 0.05 },
  { key: 'crownScale', type: 'range', min: 0.3, max: 2, step: 0.05 },
  { key: 'eyeScale', type: 'range', min: 0.3, max: 2, step: 0.05 },
  { key: 'dabStroke', type: 'checkbox' },
];

const DEFAULTS = {
  bodyA: 0.92, patchA: 0.9, sumiA: 0.55, tailA: 0.4, crownA: 0.85, eyeA: 0.8,
  contourA: 0.28, contourW: 1, patchScale: 1, noseScale: 1, crownScale: 1, eyeScale: 1,
  dabStroke: false,
};

export function initKoiTuner(): void {
  const panel = document.getElementById('koi-panel');
  if (!panel) return;

  for (const f of FIELDS) {
    const input = document.getElementById('k-' + f.key) as HTMLInputElement | null;
    const valEl = document.getElementById('k-' + f.key + '-v');
    if (!input) continue;

    const sync = () => {
      if (f.type === 'checkbox') {
        (VIS[f.key] as unknown as boolean) = input.checked;
        if (valEl) valEl.textContent = input.checked ? 'on' : 'off';
      } else {
        const v = +input.value;
        (VIS[f.key] as unknown as number) = v;
        if (valEl) valEl.textContent = v.toFixed(2);
      }
    };

    if (f.type === 'checkbox') {
      input.checked = VIS[f.key] as unknown as boolean;
    } else {
      input.value = String(VIS[f.key]);
    }
    input.addEventListener('input', sync);
    sync();
  }

  document.getElementById('koi-reset')!.addEventListener('click', () => {
    Object.assign(VIS, DEFAULTS);
    for (const f of FIELDS) {
      const input = document.getElementById('k-' + f.key) as HTMLInputElement | null;
      const valEl = document.getElementById('k-' + f.key + '-v');
      if (!input) continue;
      const d = DEFAULTS[f.key as keyof typeof DEFAULTS];
      if (f.type === 'checkbox') input.checked = d as boolean;
      else input.value = String(d);
      if (valEl) valEl.textContent = f.type === 'checkbox' ? (d ? 'on' : 'off') : (+d).toFixed(2);
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'k' || e.key === 'K') panel.classList.toggle('hidden');
  });
}
