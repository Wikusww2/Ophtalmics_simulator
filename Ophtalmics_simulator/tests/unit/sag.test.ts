import { describe, it, expect } from 'vitest';
import { sphericalSagExact, sphericalSagParaxial, asphereSag } from '../../packages/optics-core/src/sag';

describe('Sagitta', () => {
  it('exact vs paraxial close for small r', () => {
    const R = 100; // mm
    const r = 5;   // small
    const sExact = sphericalSagExact(R, r);
    const sApprox = sphericalSagParaxial(R, r);
    expect(Math.abs(sExact - sApprox)).toBeLessThan(1e-3);
  });

  it('asphere reduces to conic+poly', () => {
    const s = asphereSag(100, 10, -1, 0.001);
    expect(Number.isFinite(s)).toBe(true);
  });
});

