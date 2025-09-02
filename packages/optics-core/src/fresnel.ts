/**
 * Fresnel reflectance for unpolarized light at an interface.
 * Returns {Rs, Rp, R} with R = (Rs + Rp)/2. Inputs: cos(theta_i), n1, n2.
 */
export function fresnelReflectance(cosThetaI: number, n1: number, n2: number) {
  // Clamp c in [-1, 1]
  const c = Math.min(1, Math.max(-1, cosThetaI));
  // Snell's law to get cosThetaT
  const r = n1 / n2;
  const sin2t = r * r * (1 - c * c);
  if (sin2t > 1) {
    // TIR: reflectance 1
    return { Rs: 1, Rp: 1, R: 1 };
  }
  const ct = Math.sqrt(Math.max(0, 1 - sin2t));
  const ci = Math.abs(c);
  const Rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2;
  const Rp = ((n2 * ci - n1 * ct) / (n2 * ci + n1 * ct)) ** 2;
  return { Rs, Rp, R: 0.5 * (Rs + Rp) };
}

/** Schlick approximation for quick highlights */
export function schlickApprox(cosTheta: number, n1: number, n2: number) {
  const r0 = ((n1 - n2) / (n1 + n2)) ** 2;
  const m = 1 - Math.max(0, Math.min(1, cosTheta));
  return r0 + (1 - r0) * m ** 5;
}

