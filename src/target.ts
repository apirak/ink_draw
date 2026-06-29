export interface PointerState {
  x: number;
  y: number;
  lastMove: number;
  down: boolean;
}

export interface Bounds {
  w: number;
  h: number;
}

export function targetPoint(
  pointer: PointerState,
  bounds: Bounds,
  t: number,
  now: number,
): [number, number] {
  const idle = now - pointer.lastMove;
  const k = Math.min(Math.max((idle - 2600) / 1800, 0), 1);
  const wx = bounds.w * (0.5 + 0.32 * Math.sin(t * 0.00021 + 1.3));
  const wy = bounds.h * (0.45 + 0.26 * Math.sin(t * 0.00033));
  const tx = pointer.x + (wx - pointer.x) * k;
  const ty = pointer.y + (wy - pointer.y) * k;
  return [tx, ty];
}
