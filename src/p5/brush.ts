function vertexQuadratic(
  p: any,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  steps = 6,
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    p.vertex(
      mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    );
  }
}

export function stroke(
  p: any,
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

  p.beginShape();
  p.vertex(x1 - nx, y1 - ny);
  vertexQuadratic(p, x1 - nx, y1 - ny, cpx, cpy, x2, y2);
  vertexQuadratic(
    p,
    x2,
    y2,
    cpx + nx * 0.35,
    cpy + ny * 0.35,
    x1 + nx,
    y1 + ny,
  );
  p.endShape(p.CLOSE);
}

export function dab(
  p: any,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot = 0,
): void {
  p.push();
  p.translate(x, y);
  p.rotate(rot);
  p.ellipse(0, 0, rx * 2, ry * 2);
  p.pop();
}
