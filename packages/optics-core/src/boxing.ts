/**
 * Boxing system computations for simple shapes.
 */

export type FrameShape = 'rectangle' | 'round' | 'oval' | 'aviator_basic';

export type FrameBoxing = {
  A: number; // width mm
  B: number; // height mm
  DBL: number; // bridge mm
  shape: FrameShape;
  shapeParams?: Record<string, number>;
};

export function geometricCenter(frame: FrameBoxing) {
  // For symmetric boxing, GC at (A/2, B/2) in frame coords
  return { x: frame.A / 2, y: frame.B / 2 };
}

/** Effective Diameter (ED): 2x max distance from GC to edge */
export function effectiveDiameter(frame: FrameBoxing): number {
  // Approximate per shape; for rectangle with rounded corners, ED ~ sqrt((A/2)^2 + (B/2)^2) * 2
  const rx = frame.A / 2;
  const ry = frame.B / 2;
  const rmax = Math.hypot(rx, ry);
  return 2 * rmax;
}

/** Minimum blank size needed given decentration (monocular, mm). */
export function minimumBlank(frame: FrameBoxing, decentrationX_mm: number, margin = 2): number {
  const ED = effectiveDiameter(frame);
  // Add decentration allowance and small margin
  return ED + 2 * Math.abs(decentrationX_mm) + margin;
}

