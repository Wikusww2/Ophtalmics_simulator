/**
 * Sagitta and surface utilities.
 *
 * Sign convention:
 *  - Global +Z is direction of incident light (object side -> eye side).
 *  - Radius R is positive when the surface is convex toward incident light.
 *  - r is radial distance from optical axis (>= 0).
 * Units: millimeters.
 */

export function sphericalSagExact(R: number, r: number): number {
  if (!isFinite(R) || !isFinite(r)) throw new Error('Invalid input');
  if (R === 0) return 0; // planar as limit
  const R2 = R * R;
  const r2 = r * r;
  if (r2 >= R2) {
    // Clamp to avoid sqrt of negative due to numeric noise; geometrically, sag approaches |R|.
    // But in ophthalmic lenses, r << |R|, so we constrain.
    const eps = Math.max(0, R2 - 1e-9);
    return R - Math.sign(R) * Math.sqrt(eps);
  }
  return R - Math.sign(R) * Math.sqrt(R2 - r2);
}

export function sphericalSagParaxial(R: number, r: number): number {
  if (!isFinite(R) || !isFinite(r)) throw new Error('Invalid input');
  if (R === 0) return 0;
  return (r * r) / (2 * R);
}

/**
 * Conic + even asphere sag.
 * s(r) = r^2 / ( R (1 + sqrt(1 - (1+K) r^2 / R^2)) ) + a2 r^2 + a4 r^4 + a6 r^6 ...
 */
export function asphereSag(
  R: number,
  r: number,
  K: number,
  a2 = 0,
  a4 = 0,
  a6 = 0,
  a8 = 0
): number {
  if (R === 0) return a2 * r * r + a4 * r ** 4 + a6 * r ** 6 + a8 * r ** 8;
  const r2 = r * r;
  const term = 1 - (1 + K) * (r2 / (R * R));
  const root = Math.sqrt(Math.max(0, term));
  const conicSag = r2 / (R * (1 + root));
  const poly = a2 * r2 + a4 * r2 * r2 + a6 * r2 ** 3 + a8 * r2 ** 4;
  return conicSag + poly;
}

/**
 * Surface power from radius and refractive indices (paraxial).
 * F = (n2 - n1) / R
 */
export function surfacePower(n1: number, n2: number, R: number): number {
  if (R === 0) return 0;
  return (n2 - n1) / R;
}

