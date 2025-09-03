import type { OpticalSystem, SurfaceGeom } from './types'
import { refract } from 'optics-core'
import { fresnelReflectance } from 'optics-core'
import { buildMediaMap, defaultMedia } from './media'

export type Ray = { o: [number, number, number]; d: [number, number, number]; n: number; T: number; lambda: number }
export type Hit = { p: [number, number, number]; n: [number, number, number]; elementIndex: number; surface: 'front' | 'back' }

const EPS = 1e-6

export function traceRay(system: OpticalSystem, rayIn: Ray): { ray: Ray; hits: Hit[] } {
  // Minimal tracer: handles spherical/planar with correct media transitions.
  const hits: Hit[] = []
  const media = buildMediaMap(defaultMedia)
  const nFor = (name: string) => {
    const m = (media as any)[name]
    if (m && typeof m.nd === 'number') return m.nd as number
    const parsed = parseFloat(name)
    return Number.isFinite(parsed) ? parsed : 1.0
  }
  let ray = { ...rayIn }
  for (let ei = 0; ei < system.elements.length; ei++) {
    const el = system.elements[ei]
    if (el.kind === 'lens') {
      // FRONT
      const frontHit = intersectSurfaceSphereZ(el.front.geom, el.front.z, ray)
      if (frontHit) {
        const p = frontHit.p
        let n = frontHit.n
        // Orient normal toward incident medium
        if (dot(n, ray.d) > 0) n = [-n[0], -n[1], -n[2]] as [number, number, number]
        const n1 = nFor(el.front.mediumIn)
        const n2 = nFor(el.front.mediumOut)
        const F = fresnelReflectance(-dot(n, ray.d), n1, n2)
        ray.T *= 1 - F.R
        const tdir = refract(ray.d, n, n1, n2)
        if (!tdir) break
        ray = { ...ray, o: p, d: tdir, n: n2 }
        hits.push({ p, n, elementIndex: ei, surface: 'front' })
      }
      // BACK
      const backHit = intersectSurfaceSphereZ(el.back.geom, el.back.z, ray)
      if (backHit) {
        const p = backHit.p
        let n = backHit.n
        if (dot(n, ray.d) > 0) n = [-n[0], -n[1], -n[2]] as [number, number, number]
        const n1 = nFor(el.back.mediumIn)
        const n2 = nFor(el.back.mediumOut)
        const F = fresnelReflectance(-dot(n, ray.d), n1, n2)
        ray.T *= 1 - F.R
        const tdir = refract(ray.d, n, n1, n2)
        if (!tdir) break
        ray = { ...ray, o: p, d: tdir, n: n2 }
        hits.push({ p, n, elementIndex: ei, surface: 'back' })
      }
    }
  }
  return { ray, hits }
}

function intersectSurfaceSphereZ(geom: SurfaceGeom, zSurf: number, ray: Ray): { p: [number, number, number]; n: [number, number, number] } | null {
  if (geom.kind !== 'sphere') return null
  const R = geom.R
  if (!isFinite(R)) {
    // plane at z = zSurf
    const t = (zSurf - ray.o[2]) / ray.d[2]
    if (t < EPS) return null
    const p: [number, number, number] = [ray.o[0] + t * ray.d[0], ray.o[1] + t * ray.d[1], zSurf]
    const n: [number, number, number] = [0, 0, 1]
    return { p, n }
  }
  // Sphere with center on axis: center at z = zSurf + R
  const cx = 0, cy = 0, cz = zSurf + R
  const ox = ray.o[0] - cx, oy = ray.o[1] - cy, oz = ray.o[2] - cz
  const dx = ray.d[0], dy = ray.d[1], dz = ray.d[2]
  const a = dx * dx + dy * dy + dz * dz
  const b = 2 * (ox * dx + oy * dy + oz * dz)
  const c = ox * ox + oy * oy + oz * oz - R * R
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const sqrtDisc = Math.sqrt(disc)
  let t0 = (-b - sqrtDisc) / (2 * a)
  let t1 = (-b + sqrtDisc) / (2 * a)
  if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp }
  let tHit = t0
  if (tHit < EPS) tHit = t1
  if (tHit < EPS) return null
  const px = ray.o[0] + tHit * dx, py = ray.o[1] + tHit * dy, pz = ray.o[2] + tHit * dz
  let nx = px - cx, ny = py - cy, nz = pz - cz
  const nl = Math.hypot(nx, ny, nz) || 1
  nx /= nl; ny /= nl; nz /= nl
  return { p: [px, py, pz], n: [nx, ny, nz] }
}

function dot(a: [number, number, number], b: [number, number, number]) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] }
