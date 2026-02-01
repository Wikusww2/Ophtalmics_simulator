import { describe, it, expect } from 'vitest';
import { centerThicknessFromET, edgeThicknessFromCT } from '../../packages/optics-core/src/thickness';

describe('Thickness', () => {
  const front = { R: 100 };
  const back = { R: -100 };
  const r = 30; // mm radius

  it('CT/ET parity', () => {
    const CT = 4;
    const ET = edgeThicknessFromCT(CT, r, front, back);
    const CT2 = centerThicknessFromET(ET, r, front, back);
    expect(Math.abs(CT - CT2)).toBeLessThan(1e-6);
  });
});

