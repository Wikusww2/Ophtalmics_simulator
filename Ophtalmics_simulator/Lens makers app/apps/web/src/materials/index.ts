import * as THREE from 'three'

export type MaterialInfo = { name: string; nd: number; Abbe: number }

export type CoatingSpec = { type: 'none'|'single'|'multi'; ior?: number; thicknessNm?: number; residualRAvg?: number }

export function makeGlassMaterial(material: MaterialInfo, CT_mm: number, sideOverride?: THREE.Side) {
  const mat = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    ior: material.nd,
    thickness: CT_mm * 0.001, // scale
    transparent: true,
    roughness: 0.02,
    metalness: 0,
    clearcoat: 0.0,
    color: new THREE.Color(0xffffff),
    // Default to negligible absorption for calibration unless material provides otherwise
    attenuationDistance: 1000.0,
    attenuationColor: new THREE.Color(0xffffff),
    // Render both faces but avoid depth artifacts by disabling depthWrite
    side: sideOverride ?? THREE.DoubleSide
  })
  // Avoid double-blend z-fighting inside volume
  mat.depthWrite = false
  // Calibrate reflectance to IOR (dielectric): R0 = ((n-1)/(n+1))^2
  const n = material.nd
  const R0 = ((n - 1) / (n + 1)) ** 2
  // SpecularIntensity scales energy of specular lobe for physical material
  if ((mat as any).specularIntensity !== undefined) {
    ;(mat as any).specularIntensity = Math.min(1, Math.max(0, R0 / 0.04))
  }
  ;(mat as any).envMapIntensity = 1.0
  return mat
}

export function makeCoatedGlassMaterial(material: MaterialInfo, CT_mm: number, coating?: CoatingSpec, sideOverride?: THREE.Side) {
  const mat = makeGlassMaterial(material, CT_mm, sideOverride)
  const c = coating?.type ?? 'none'
  if (c !== 'none') {
    // Approximate AR via thin-film interference using iridescence
    const ior = coating?.ior ?? 1.38 // MgF2
    const t = coating?.thicknessNm ?? 120
    ;(mat as any).iridescence = 1.0
    ;(mat as any).iridescenceIOR = ior
    ;(mat as any).iridescenceThicknessRange = c === 'single' ? [t - 10, t + 10] : [90, 350]
    // Adjust specular to target residual average reflectance if provided
    const n = material.nd
    const R0 = ((n - 1) / (n + 1)) ** 2
    const target = Math.max(0, Math.min(1, coating?.residualRAvg ?? 0.01))
    if ((mat as any).specularIntensity !== undefined && R0 > 0) {
      ;(mat as any).specularIntensity = Math.min(1, Math.max(0, target / R0))
    }
  } else {
    ;(mat as any).iridescence = 0.0
  }
  return mat
}
