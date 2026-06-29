export {};

const brushEl = document.getElementById('brush')!;

addEventListener(
  'pointermove',
  (e) => {
    brushEl.style.left = e.clientX + 'px';
    brushEl.style.top = e.clientY + 'px';
  },
  { passive: true },
);

addEventListener('pointerdown', () => brushEl.classList.add('down'));
addEventListener('pointerup', () => brushEl.classList.remove('down'));
