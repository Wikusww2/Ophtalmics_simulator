import { sphericalSagExact } from 'optics-core'

export function sampleSphericalSurface(R: number, radius: number, segments = 64) {
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
      const z = sphericalSagExact(R, r)
      positions.push(x, y, z)
      if (Number.isFinite(R) && R !== 0) {
        // Normal from analytic sphere: outward = (P - C) normalized, with center at (0,0,R)
        const nx = x
        const ny = y
        const nz = z - R
        const len = Math.hypot(nx, ny, nz) || 1
        normals.push(nx / len, ny / len, nz / len)
      } else {
        // planar surface normal
        normals.push(0, 0, 1)
      }
    }
  }

  return { positions, normals, ringCount, segCount }
}
