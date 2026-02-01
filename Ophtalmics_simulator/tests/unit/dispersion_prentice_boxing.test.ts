import { describe, it, expect } from 'vitest';
import { iorRGBFromAbbe } from '../../packages/optics-core/src/dispersion';
import { prentice } from '../../packages/optics-core/src/prentice';
import { effectiveDiameter, minimumBlank } from '../../packages/optics-core/src/boxing';

describe('Dispersion, Prentice, Boxing', () => {
  it('Abbe-based IORs monotonic with 1/nu', () => {
    const { nR, nG, nB } = iorRGBFromAbbe(1.6, 40);
    expect(nR).toBeLessThan(nG);
    expect(nG).toBeLessThan(nB);
  });

  it('Prentice rule basic check', () => {
    const res = prentice(5, 2, 0);
    expect(Math.abs(res.delta - 1)).toBeLessThan(1e-6);
  });

  it('Boxing ED and blank sizing', () => {
    const frame = { A: 52, B: 36, DBL: 18, shape: 'rectangle' as const };
    const ed = effectiveDiameter(frame);
    expect(ed).toBeGreaterThan(50);
    const blank = minimumBlank(frame, 2);
    expect(blank).toBeGreaterThan(ed);
  });
});

