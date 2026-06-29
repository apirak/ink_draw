import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULTS, MODES, type ModeConfig, type ModeName } from './modes';
import { initTuner } from './tuner';

function makeSlider(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'range';
  return el;
}

function makeValue(): HTMLElement {
  return document.createElement('span');
}

describe('initTuner', () => {
  let M: ModeConfig;

  beforeEach(() => {
    M = { ...MODES.birds };

    const tuner = document.createElement('aside');
    tuner.id = 'tuner';
    document.body.appendChild(tuner);

    const ids: Array<[string, HTMLElement]> = [
      ['tnMode', makeValue()],
      ['sCount', makeSlider()],
      ['vCount', makeValue()],
      ['sFov', makeSlider()],
      ['vFov', makeValue()],
      ['sSep', makeSlider()],
      ['vSep', makeValue()],
      ['sAli', makeSlider()],
      ['vAli', makeValue()],
      ['sCoh', makeSlider()],
      ['vCoh', makeValue()],
      ['tnReset', document.createElement('button')],
    ];
    for (const [id, el] of ids) {
      el.id = id;
      document.body.appendChild(el);
    }
  });

  it('syncs initial values from the mode config', () => {
    const { syncTuner } = initTuner('birds' as ModeName, M, 110);
    syncTuner();

    expect(document.getElementById('tnMode')!.textContent).toBe('birds');
    expect((document.getElementById('sCount') as HTMLInputElement).value).toBe(String(Math.min(M.count, 110)));
  });

  it('updates count when slider changes', () => {
    initTuner('birds' as ModeName, M, 110);
    const slider = document.getElementById('sCount') as HTMLInputElement;
    slider.value = '12';
    slider.dispatchEvent(new Event('input'));
    expect(M.count).toBe(12);
  });

  it('updates separation weight when slider changes', () => {
    initTuner('birds' as ModeName, M, 110);
    const slider = document.getElementById('sSep') as HTMLInputElement;
    slider.value = '2.5';
    slider.dispatchEvent(new Event('input'));
    expect(M.sepW).toBe(2.5);
  });

  it('resets to defaults when reset button is clicked', () => {
    initTuner('birds' as ModeName, M, 110);
    M.count = 5;
    M.sepW = 0;
    document.getElementById('tnReset')!.dispatchEvent(new Event('click'));
    expect(M.count).toBe(Math.min(DEFAULTS.birds.count, 110));
    expect(M.sepW).toBe(DEFAULTS.birds.sepW);
  });

  it('toggles hidden class on tuner when T is pressed', () => {
    initTuner('birds' as ModeName, M, 110);
    const tuner = document.getElementById('tuner')!;
    expect(tuner.classList.contains('hidden')).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    expect(tuner.classList.contains('hidden')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'T' }));
    expect(tuner.classList.contains('hidden')).toBe(false);
  });
});
