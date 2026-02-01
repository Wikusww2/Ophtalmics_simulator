import { describe, it, expect } from 'vitest'
import { toricSagParaxial } from '../../apps/web/src/optics/sag_toric'

describe('Toric sag', () => {
  it('reduces to spherical when radii equal', () => {
    const R = 100
    const s1 = toricSagParaxial(10, 5, R, R, 45)
    const s2 = (10*10 + 5*5) / (2*R)
    expect(Math.abs(s1 - s2)).toBeLessThan(1e-9)
  })
})

