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
  { key: 'bodyWidth', type: 'range', min: 0.5, max: 1.5, step: 0.02 },
  { key: 'dabStroke', type: 'checkbox' },
  { key: 'patchSolid', type: 'checkbox' },
];

const DEFAULTS = {
  bodyA: 0.92, patchA: 0.9, sumiA: 0.55, tailA: 0.9, crownA: 0.85, eyeA: 0.5,
  contourA: 0.1, contourW: 1, patchScale: 0.8, noseScale: 1, crownScale: 1, eyeScale: 0.5, bodyWidth: 1.2,
  dabStroke: false, patchSolid: false,
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

  document.getElementById('koi-copy')!.addEventListener('click', async () => {
    const out: Record<string, number | boolean> = {};
    for (const f of FIELDS) out[f.key] = VIS[f.key] as number | boolean;
    const text = JSON.stringify(out, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('koi-copy')!;
      const old = btn.textContent;
      btn.textContent = 'copied!';
      setTimeout(() => { btn.textContent = old; }, 1200);
    } catch {
      console.log(text);
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'k' || e.key === 'K') panel.classList.toggle('hidden');
  });
}
