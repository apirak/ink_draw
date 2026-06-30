// ponytail: ambient decl — p5.brush ships no .d.ts
declare module "p5.brush" {
  type AnyCanvas = unknown;
  type BrushName = string;
  type Color = string | number[] | { levels: number[] };

  export function instance(p: unknown): void;
  export function load(buffer?: unknown): void;
  export function scaleBrushes(scale: number): void;

  export function set(brushName: BrushName, color: Color, weight: number): void;
  export function pick(brushName: BrushName): void;
  export function stroke(color: Color): void;
  export function strokeWeight(weight: number): void;
  export function noStroke(): void;

  export function fill(color: Color, opacity?: number): void;
  export function noFill(): void;
  export function wash(color: Color, opacity?: number): void;
  export function noWash(): void;
  export function fillBleed(strength: number, direction?: "out" | "in"): void;
  export function fillTexture(
    textureStrength: number,
    borderIntensity: number,
    scatter?: boolean,
  ): void;

  export function hatch(
    dist: number,
    angle: number,
    options?: { rand?: number | false; continuous?: boolean; gradient?: number | false },
  ): void;
  export function noHatch(): void;

  export function noField(): void;
  export function field(name: string): void;
  export function wiggle(intensity: number): void;

  export function line(x1: number, y1: number, x2: number, y2: number): void;
  export function flowLine(x: number, y: number, length: number, dir: number): void;
  export function rect(
    x: number,
    y: number,
    w: number,
    h: number,
    mode?: "corner" | "center",
  ): void;
  export function circle(x: number, y: number, radius: number, r?: number | boolean): unknown;
  export function arc(
    x: number,
    y: number,
    radius: number,
    start: number,
    end: number,
  ): unknown;
  export function polygon(points: Array<[number, number]>): unknown;
  export function spline(
    points: Array<[number, number] | [number, number, number]>,
    curvature?: number,
  ): unknown;
  export function beginShape(curvature?: number): void;
  export function vertex(x: number, y: number, pressure?: number): void;
  export function endShape(close?: boolean): unknown;
}
