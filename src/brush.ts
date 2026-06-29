export function stroke(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  cpx: number,
  cpy: number,
  x2: number,
  y2: number,
  w: number,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * w;
  const ny = (dx / len) * w;
  ctx.beginPath();
  ctx.moveTo(x1 - nx, y1 - ny);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.quadraticCurveTo(cpx + nx * 0.35, cpy + ny * 0.35, x1 + nx, y1 + ny);
  ctx.closePath();
  ctx.fill();
}

export function dab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot = 0,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, 7);
  ctx.fill();
}
