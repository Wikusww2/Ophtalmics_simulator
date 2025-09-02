import { describe, it, expect } from 'vitest';
import { thinLensPower, thickLensPower } from '../../packages/optics-core/src/lensmaker';

describe('Lensmaker', () => {
  it('thin vs thick close when t small', () => {
    const n = 1.6;
    const R1 = 100;
    const R2 = -100;
    const thin = thinLensPower(n, R1, R2);
    const thick = thickLensPower(n, R1, R2, 2);
    expect(Math.abs(thin - thick)).toBeLessThan(0.5);
  });
});

