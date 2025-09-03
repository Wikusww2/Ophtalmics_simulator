import { describe, it, expect } from 'vitest'
import { backRadiusFromPower, frontRadiusFromPower, solveBackRadiusForTargetThick } from '../../apps/web/src/optics/lensmaker'
import { thinLensPower, thickLensPower } from '../../packages/optics-core/src/lensmaker'

describe('Solve radii from flat', () => {
  const n = 1.6
  it('back radius from flat front reproduces target thin power', () => {
    const target = -4 // D overall when front flat
    const R2 = backRadiusFromPower(n, target)
    const F = thinLensPower(n, Infinity as any, R2)
    expect(F).toBeCloseTo(target, 5)
  })
  it('balanced Vogel front then solve back (thick)', () => {
    const target = -2
    const R1 = frontRadiusFromPower(n, 6) // neutral meniscus
    const R2 = solveBackRadiusForTargetThick(n, R1, 3, target)
    const Fthick = thickLensPower(n, R1, R2, 3)
    expect(Fthick).toBeCloseTo(target, 0.25)
  })
})

