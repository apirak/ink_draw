import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

function fire(type: string, payload?: Partial<PointerEventInit>) {
  const ev = new PointerEvent(type, payload);
  window.dispatchEvent(ev);
}

describe('landing-pointer', () => {
  let brushEl: HTMLElement;

  beforeEach(async () => {
    vi.resetModules();
    brushEl = document.createElement('div');
    brushEl.id = 'brush';
    document.body.appendChild(brushEl);
    await import('./landing-pointer');
  });

  afterEach(() => {
    brushEl.remove();
  });

  it('moves the brush cursor on pointermove', () => {
    fire('pointermove', { clientX: 123, clientY: 456 });
    expect(brushEl.style.left).toBe('123px');
    expect(brushEl.style.top).toBe('456px');
  });

  it('adds the down class on pointerdown', () => {
    fire('pointerdown');
    expect(brushEl.classList.contains('down')).toBe(true);
  });

  it('removes the down class on pointerup', () => {
    brushEl.classList.add('down');
    fire('pointerup');
    expect(brushEl.classList.contains('down')).toBe(false);
  });
});
