import { sphericalSagExact, asphereSag } from './sag';

export type SurfaceSpec = {
  R: number;
  conicK?: number;
  a2?: number; a4?: number; a6?: number; a8?: number;
  aspheric?: boolean;
};

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
  minCTMinus: number;
  minETPlus: number;
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

