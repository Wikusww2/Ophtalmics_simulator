import type { OpticalSystem } from './types'
import { thickLensPower } from 'optics-core'

export type ABCD = { A: number; B: number; C: number; D: number }

export function matMul(m1: ABCD, m2: ABCD): ABCD {
  return {
    A: m1.A * m2.A + m1.B * m2.C,
    B: m1.A * m2.B + m1.B * m2.D,
    C: m1.C * m2.A + m1.D * m2.C,
    D: m1.C * m2.B + m1.D * m2.D,
  }
}

export function gap(d: number, n: number): ABCD { return { A: 1, B: d / n, C: 0, D: 1 } }
export function thinLens(phi: number): ABCD { return { A: 1, B: 0, C: -phi, D: 1 } }

export function chain(system: OpticalSystem, collapseToThin = true): ABCD {
  let M: ABCD = { A: 1, B: 0, C: 0, D: 1 }
  for (const el of system.elements) {
    if (el.kind === 'gap') {
      M = matMul(gap(el.zEnd - el.zStart, 1.0), M)
    } else if (el.kind === 'stop') {
      // stops do not change ABCD in paraxial matrix; could be modeled as vignetting only
    } else if (el.kind === 'lens') {
      if (collapseToThin) {
        // approximate equivalent power via thick-lens maker with body medium index
        const n = 1.0 * 1 + 0 // air assumption outside
        const t = Math.abs(el.back.z - el.front.z)
        const R1 = ('R' in el.front.geom) ? (el.front.geom as any).R : Infinity
        const R2 = ('R' in el.back.geom) ? (el.back.geom as any).R : Infinity
        const phi = thickLensPower(n, R1, R2, t)
        M = matMul(thinLens(phi), M)
      }
    }
  }
  return M
}

export function eflFromABCD(M: ABCD): number {
  // EFL approx: -1/C (in meters) when B!=0; our units mm so return mm
  if (Math.abs(M.C) < 1e-9) return Infinity
  const F_m = -1 / (M.C)
  return 1000 * F_m
}
