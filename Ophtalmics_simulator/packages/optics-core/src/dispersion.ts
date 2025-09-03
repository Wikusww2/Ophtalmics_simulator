/**
 * Dispersion utilities using Abbe number or Sellmeier coefficients.
 */

export type Sellmeier = { B1: number; B2: number; B3: number; C1: number; C2: number; C3: number };

/** Abbe-based simple per-channel IOR around nd (589.3 nm). */
export function iorRGBFromAbbe(nd: number, Abbe: number) {
  // Empirical small offsets scaled by 1/Abbe. Red (700nm) < nd < Blue (450nm)
  const scale = 1 / Math.max(1e-6, Abbe);
  const nR = nd - 0.004 * scale;
  const nG = nd;
  const nB = nd + 0.008 * scale;
  return { nR, nG, nB };
}

/** Sellmeier index at wavelength lambda in micrometers */
export function sellmeierN(lambda_um: number, s: Sellmeier): number {
  const L2 = lambda_um * lambda_um;
  const n2 = 1 +
    (s.B1 * L2) / (L2 - s.C1) +
    (s.B2 * L2) / (L2 - s.C2) +
    (s.B3 * L2) / (L2 - s.C3);
  return Math.sqrt(n2);
}

export function iorRGBFromSellmeier(s: Sellmeier) {
  // Wavelengths: R=700nm, G=546.1nm (e-line), B=486.1nm (F)
  const nR = sellmeierN(0.700, s);
  const nG = sellmeierN(0.5461, s);
  const nB = sellmeierN(0.4861, s);
  return { nR, nG, nB };
}

