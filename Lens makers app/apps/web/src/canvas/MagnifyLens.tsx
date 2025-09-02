import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { makeMagnifyMaterial } from '../materials/MagnifyMaterial'

export function MagnifyLens({ geometry, radiusUnits, sphereD, cylinderD, axisDeg, hideRefs = [] }: { geometry: THREE.BufferGeometry, radiusUnits: number, sphereD: number, cylinderD: number, axisDeg: number, hideRefs?: RefObject<THREE.Object3D>[] }) {
  const mat = useMemo(() => makeMagnifyMaterial(), [])
  const meshRef = useRef<THREE.Mesh>(null)
  const { gl, scene, camera, size } = useThree()
  const rt = useFBO({ samples: 4, stencilBuffer: false, depthBuffer: true, multisample: true, width: size.width, height: size.height })

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    // Hide lens and render background
    const objs: THREE.Object3D[] = [mesh]
    if (Array.isArray(hideRefs)) {
      for (let k = 0; k < hideRefs.length; k++) {
        const o = hideRefs[k]?.current
        if (o) objs.push(o)
      }
    }
    const prev: boolean[] = []
    for (let k = 0; k < objs.length; k++) { prev[k] = objs[k].visible; objs[k].visible = false }
    gl.setRenderTarget(rt);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    for (let k = 0; k < objs.length; k++) { objs[k].visible = prev[k] }

    // Update uniforms
    (mat.uniforms as any).tBackground.value = rt.texture
    ;(mat.uniforms as any).resolution.value.set(gl.domElement.width, gl.domElement.height)
    ;(mat.uniforms as any).radiusUnits.value = radiusUnits
    ;(mat.uniforms as any).sphD.value = sphereD
    ;(mat.uniforms as any).cylD.value = cylinderD
    ;(mat.uniforms as any).axisRad.value = (axisDeg * Math.PI) / 180
    // Calibrate pixel shift per diopter based on DPR so effect is subtle by default
    const dpr = gl.getPixelRatio()
    ;(mat.uniforms as any).pxPerD.value = cylinderD === 0 && sphereD === 0 ? 0.0 : (0.12 * dpr)
  })

  return <mesh ref={meshRef as any} geometry={geometry} material={mat as any} />
}
