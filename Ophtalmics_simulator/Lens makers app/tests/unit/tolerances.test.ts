import { describe, it, expect } from 'vitest'
import { axisToleranceDeg, cylinderToleranceD } from '../../apps/web/src/optics/tolerances'

describe('Tolerances', () => {
  it('axis tolerance decreases with cylinder magnitude', () => {
    expect(axisToleranceDeg(0.25)).toBeGreaterThan(axisToleranceDeg(2.0))
  })
  it('cylinder tolerance returns reasonable band', () => {
    expect(cylinderToleranceD(1.0)).toBeCloseTo(0.12, 2)
  })
})

