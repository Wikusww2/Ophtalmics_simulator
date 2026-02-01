import { describe, it, expect } from 'vitest';
import { refract } from '../../packages/optics-core/src/snell';
import { fresnelReflectance } from '../../packages/optics-core/src/fresnel';

describe('Snell & Fresnel', () => {
  it('refract vector returns null on TIR', () => {
    const i: [number, number, number] = [Math.sin(1.2), 0, -Math.cos(1.2)];
    const n: [number, number, number] = [0, 0, 1];
    const t = refract(i, n, 1.6, 1.0);
    expect(t).toBeNull();
  });

  it('fresnel average between 0 and 1', () => {
    const F = fresnelReflectance(Math.cos(0.3), 1.0, 1.6);
    expect(F.R).toBeGreaterThanOrEqual(0);
    expect(F.R).toBeLessThanOrEqual(1);
  });
});

