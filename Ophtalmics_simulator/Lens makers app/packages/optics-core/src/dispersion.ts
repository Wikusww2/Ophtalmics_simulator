export type Sellmeier = { B1: number; B2: number; B3: number; C1: number; C2: number; C3: number };

export function iorRGBFromAbbe(nd: number, Abbe: number) {
  const scale = 1 / Math.max(1e-6, Abbe);
  const nR = nd - 0.004 * scale;
  const nG = nd;
  const nB = nd + 0.008 * scale;
  return { nR, nG, nB };
}

export function sellmeierN(lambda_um: number, s: Sellmeier): number {
  const L2 = lambda_um * lambda_um;
  const n2 = 1 + (s.B1 * L2) / (L2 - s.C1) + (s.B2 * L2) / (L2 - s.C2) + (s.B3 * L2) / (L2 - s.C3);
  return Math.sqrt(n2);
}

export function iorRGBFromSellmeier(s: Sellmeier) {
  const nR = sellmeierN(0.700, s);
  const nG = sellmeierN(0.5461, s);
  const nB = sellmeierN(0.4861, s);
  return { nR, nG, nB };
}

