import { sampleSphericalSurface } from './surfaces/Sphere'
import { mergeSurfaces } from './Meshing'
import type { LensDesign } from '../state/lensState'
import { centerThicknessFromET, edgeThicknessFromCT } from 'optics-core'
import { sampleToricSurface } from './surfaces/Toric'
import { vogelBaseCurve, sphericalEquivalent } from '../optics/baseCurve'
import { frontRadiusFromPower, backRadiusFromPower, solveBackRadiusForTargetThick } from '../optics/lensmaker'

export function buildLensGeometry(design: LensDesign) {
  const D = Math.max(design.clearAperture, design.diameter)
  const radius = D / 2
  // Increase angular resolution to reduce silhouette pixelation
  const segs = 192

  const n = design.material.nd
  const Sph = design.spherePower
  const Cyl = design.cylinderPower
  const axisDeg = design.axisDeg
  const toricPlacement = design.toricPlacement
  const spherePlacement = design.spherePlacement
  const useBest = design.useBestForm

  // Determine spherical base radii from spherePlacement
  let R1_sph = design.front.R
  let R2_sph = design.back.R
  if (!Number.isFinite(R1_sph)) R1_sph = Infinity
  if (!Number.isFinite(R2_sph)) R2_sph = Infinity

  const drawR = (R: number) => (Number.isFinite(R) ? -R : R)

  const zeroPower = Math.abs(Sph) < 1e-6 && Math.abs(Cyl) < 1e-6

  if (zeroPower) {
    // Plano-plano when no sphere/cylinder is applied (no visual bias)
    R1_sph = Infinity
    R2_sph = Infinity
  } else if (spherePlacement === 'back') {
    // front flat, solve back from sphere
    R1_sph = Infinity
    R2_sph = backRadiusFromPower(n, Sph)
  } else if (spherePlacement === 'front') {
    R1_sph = frontRadiusFromPower(n, Sph)
    R2_sph = Infinity
  } else {
    // balanced: pick front base curve (Vogel if enabled), then solve back using thick lens
    const se = sphericalEquivalent(Sph, Cyl)
    const F_front = useBest ? vogelBaseCurve(se) : 6.0
    R1_sph = frontRadiusFromPower(n, F_front)
    R2_sph = solveBackRadiusForTargetThick(n, R1_sph, design.centerThickness, Sph)
  }

  // Now apply toric if requested, generating appropriate surfaces
  const E_axis = Sph
  const E_power = Sph + Cyl
  let front, back
  if (toricPlacement === 'back') {
    const F1_base = Number.isFinite(R1_sph) ? 1000 * (n - 1) * (1 / R1_sph) : 0
    const F2b_axis = E_axis - F1_base
    const F2b_power = E_power - F1_base
    const R2_axis = backRadiusFromPower(n, F2b_axis)
    const R2_power = backRadiusFromPower(n, F2b_power)
    front = sampleSphericalSurface(drawR(R1_sph), radius, segs)
    back = sampleToricSurface(drawR(R2_axis), drawR(R2_power), axisDeg, radius, segs)
  } else if (toricPlacement === 'front') {
    const F2b_base = Number.isFinite(R2_sph) ? -1000 * (n - 1) * (1 / R2_sph) : 0
    const F1_axis = E_axis - F2b_base
    const F1_power = E_power - F2b_base
    const R1_axis = frontRadiusFromPower(n, F1_axis)
    const R1_power = frontRadiusFromPower(n, F1_power)
    front = sampleToricSurface(drawR(R1_axis), drawR(R1_power), axisDeg, radius, segs)
    back = sampleSphericalSurface(drawR(R2_sph), radius, segs)
  } else if (toricPlacement === 'bitoric') {
    // Split needed power between both sides (simple even split)
    const F1_base = Number.isFinite(R1_sph) ? 1000 * (n - 1) * (1 / R1_sph) : 0
    const F2b_base = Number.isFinite(R2_sph) ? -1000 * (n - 1) * (1 / R2_sph) : 0
    const E_base = F1_base + F2b_base
    const d_axis = E_axis - E_base
    const d_power = E_power - E_base
    const F1_axis = F1_base + 0.5 * d_axis
    const F1_power = F1_base + 0.5 * d_power
    const F2b_axis = F2b_base + 0.5 * d_axis
    const F2b_power = F2b_base + 0.5 * d_power
    const R1_axis = frontRadiusFromPower(n, F1_axis)
    const R1_power = frontRadiusFromPower(n, F1_power)
    const R2_axis = backRadiusFromPower(n, F2b_axis)
    const R2_power = backRadiusFromPower(n, F2b_power)
    front = sampleToricSurface(drawR(R1_axis), drawR(R1_power), axisDeg, radius, segs)
    back = sampleToricSurface(drawR(R2_axis), drawR(R2_power), axisDeg, radius, segs)
  } else {
    front = sampleSphericalSurface(drawR(R1_sph), radius, segs)
    back = sampleSphericalSurface(drawR(R2_sph), radius, segs)
  }

  // Offset back surface by thickness at center
  const rEdge = radius
  let CT = design.centerThickness
  if (design.isMinusLens) {
    // treat centerThickness as derived; compute from ET policy
    CT = centerThicknessFromET(design.centerThickness, rEdge, design.front, design.back)
  } else {
    // compute ET once for QA if needed
    edgeThicknessFromCT(design.centerThickness, rEdge, design.front, design.back)
  }

  for (let i = 0; i < back.positions.length; i += 3) {
    back.positions[i + 2] -= CT
  }

  const geom = mergeSurfaces(front, back)

  // Convert mm to meters-ish scale for three.js stability (1mm -> 0.001 units)
  const mmScale = 0.001
  geom.scale(mmScale, mmScale, mmScale)
  return geom
}

//
