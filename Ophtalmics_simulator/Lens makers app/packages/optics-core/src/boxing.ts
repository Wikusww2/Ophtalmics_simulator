export type FrameShape = 'rectangle' | 'round' | 'oval' | 'aviator_basic';

export type FrameBoxing = {
  A: number;
  B: number;
  DBL: number;
  shape: FrameShape;
  shapeParams?: Record<string, number>;
};

export function geometricCenter(frame: FrameBoxing) {
  return { x: frame.A / 2, y: frame.B / 2 };
}

export function effectiveDiameter(frame: FrameBoxing): number {
  const rx = frame.A / 2;
  const ry = frame.B / 2;
  return 2 * Math.hypot(rx, ry);
}

export function minimumBlank(frame: FrameBoxing, decentrationX_mm: number, margin = 2): number {
  const ED = effectiveDiameter(frame);
  return ED + 2 * Math.abs(decentrationX_mm) + margin;
}

