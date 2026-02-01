import { sphericalSagExact, asphereSag } from './sag';

export type SurfaceSpec = {
  R: number;
  conicK?: number;
  a2?: number; a4?: number; a6?: number; a8?: number;
  aspheric?: boolean;
};

/**
 * Compute ET from CT (plus-mode) using sags difference at aperture radius r.
 * ET = CT - s_f(r) + s_b(r)
 */
export function edgeThicknessFromCT(
  CT: number,
  r: number,
  front: SurfaceSpec,
  back: SurfaceSpec
): number {
  const sf = sagFor(front, r);
  const sb = sagFor(back, r);
  return CT - sf + sb;
}

/**
 * Compute CT from ET (minus-mode) using sags difference at aperture radius r.
 * CT = ET + s_f(r) - s_b(r)
 */
export function centerThicknessFromET(
  ET: number,
  r: number,
  front: SurfaceSpec,
  back: SurfaceSpec
): number {
  const sf = sagFor(front, r);
  const sb = sagFor(back, r);
  return ET + sf - sb;
}

function sagFor(s: SurfaceSpec, r: number): number {
  if (s.aspheric) {
    const K = s.conicK ?? 0;
    return asphereSag(s.R, r, K, s.a2 ?? 0, s.a4 ?? 0, s.a6 ?? 0, s.a8 ?? 0);
  }
  return sphericalSagExact(s.R, r);
}

export type ThicknessPolicy = {
  minCTMinus: number; // minimum center thickness for minus lenses (mm)
  minETPlus: number;  // minimum edge thickness for plus lenses (mm)
};

export function enforceThicknessPolicy(
  isMinusLens: boolean,
  CT: number,
  ET: number,
  policy: ThicknessPolicy
): { CT: number; ET: number } {
  let ct = CT;
  let et = ET;
  if (isMinusLens) {
    ct = Math.max(ct, policy.minCTMinus);
  } else {
    et = Math.max(et, policy.minETPlus);
  }
  return { CT: ct, ET: et };
}

