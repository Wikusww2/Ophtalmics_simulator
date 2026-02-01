import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { makeScreenRefractionMaterial } from '../materials/ScreenRefractionMaterial'

export function ScreenRefractionLens({ geometry, ior, thickness }: { geometry: THREE.BufferGeometry, ior: number, thickness: number }) {
  const mat = useMemo(() => makeScreenRefractionMaterial(ior, thickness), [ior, thickness])
  const meshRef = useRef<THREE.Mesh>(null)
  const { gl, scene, camera } = useThree()
  const rt = useFBO({ samples: 4, stencilBuffer: false, depthBuffer: true })

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    // Hide the lens and capture the background
    const prevVis = mesh.visible
    mesh.visible = false
    gl.setRenderTarget(rt)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    mesh.visible = prevVis
    // Update uniforms
    ;(mat.uniforms as any).tBackground.value = rt.texture
    ;(mat.uniforms as any).resolution.value.set(gl.domElement.width, gl.domElement.height)
    ;(mat.uniforms as any).ior.value = ior
    ;(mat.uniforms as any).thickness.value = thickness
  })

  return <mesh ref={meshRef as any} geometry={geometry} material={mat as any} />
}

