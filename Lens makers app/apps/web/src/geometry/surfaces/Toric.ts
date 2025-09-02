import { toricSagParaxial, toricSagDerivatives } from '../../optics/sag_toric'

export function sampleToricSurface(
  R_parallel: number,
  R_perp: number,
  axisDeg: number,
  radius: number,
  segments = 72
) {
  const positions: number[] = []
  const normals: number[] = []
  const ringCount = segments
  const segCount = segments
  for (let i = 0; i <= ringCount; i++) {
    const t = i / ringCount
    const r = t * radius
    for (let j = 0; j <= segCount; j++) {
      const ang = (j / segCount) * Math.PI * 2
      const x = r * Math.cos(ang)
      const y = r * Math.sin(ang)
      const z = toricSagParaxial(x, y, R_parallel, R_perp, axisDeg)
      positions.push(x, y, z)
      const { ds_dx, ds_dy } = toricSagDerivatives(x, y, R_parallel, R_perp, axisDeg)
      const nx = -ds_dx, ny = -ds_dy, nz = 1
      const l = Math.hypot(nx, ny, nz) || 1
      normals.push(nx / l, ny / l, nz / l)
    }
  }
  return { positions, normals, ringCount, segCount }
}

