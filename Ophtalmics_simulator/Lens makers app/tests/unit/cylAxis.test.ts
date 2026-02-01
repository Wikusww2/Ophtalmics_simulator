import { describe, it, expect } from 'vitest'
import { transposeMinusToPlus, meridianPowers, wrapAxisDeg } from '../../apps/web/src/optics/cylAxis'

describe('Cyl/Axis utilities', () => {
  it('transposes minus to plus correctly', () => {
    const rx = { sphere: -2, cylinder: -1.5, axisDeg: 180 }
    const t = transposeMinusToPlus(rx)
    expect(t.sphere).toBeCloseTo(-3.5, 1)
    expect(t.cylinder).toBeCloseTo(1.5, 1)
    expect([90, 180]).toContain(t.axisDeg) // wrapped range 1..180
  })

  it('meridian powers match S and S+C', () => {
    const rx = { sphere: 1, cylinder: -2, axisDeg: 45 }
    const m = meridianPowers(rx)
    expect(m.axisMeridian).toBeCloseTo(1)
    expect(m.powerMeridian).toBeCloseTo(-1)
  })

  it('axis wraps into 1..180', () => {
    expect(wrapAxisDeg(0)).toBe(180)
    expect(wrapAxisDeg(181)).toBe(1)
  })
})

