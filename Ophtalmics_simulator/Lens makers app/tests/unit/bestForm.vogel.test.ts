import { describe, it, expect } from 'vitest'
import { sphericalEquivalent, vogelBaseCurve } from '../../apps/web/src/optics/baseCurve'

describe('Vogel best-form', () => {
  it('computes base curve from SE', () => {
    const se1 = sphericalEquivalent(+2, -1)
    expect(se1).toBe(1.5)
    const basePlus = vogelBaseCurve(se1)
    expect(basePlus).toBeCloseTo(7.5, 2)

    const se2 = sphericalEquivalent(-4, -2)
    // se2 = -5, minus rule => (-5)/2 + 6 = 3.5
    const baseMinus = vogelBaseCurve(se2)
    expect(baseMinus).toBeCloseTo(3.5, 2)
  })
})

