import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { makeMagnifyMaterial } from '../materials/MagnifyMaterial'

export function MagnifyLens({ geometry, radiusUnits, sphereD, cylinderD, axisDeg, hideRefs = [] }: { geometry: THREE.BufferGeometry, radiusUnits: number, sphereD: number, cylinderD: number, axisDeg: number, hideRefs?: Array<{ readonly current: THREE.Object3D | null }> }) {
  const mat = useMemo(() => makeMagnifyMaterial(), [])
  const meshRef = useRef<THREE.Mesh>(null)
  const { gl, scene, camera, size } = useThree()
  // Lower MSAA and rely on moderate supersampling for crispness at lower cost
  const rt = useFBO({ samples: 2, stencilBuffer: false, depthBuffer: true })
  // Track when we actually need to refresh the background capture
  const prevCamMat = useRef<Float32Array>(new Float32Array(16))
  const dirty = useRef<boolean>(true)
  const lastCapture = useRef<number>(0)

  // Resize FBO on viewport or DPR changes (supersample for cleaner lines)
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const superScale = 1.5
    rt.setSize(
      Math.round(size.width * dpr * superScale),
      Math.round(size.height * dpr * superScale)
    )
    dirty.current = true
  }, [size.width, size.height, gl, rt])

  // Mark overlay capture dirty when optical parameters or geometry change
  useEffect(() => { dirty.current = true }, [sphereD, cylinderD, axisDeg, radiusUnits, geometry])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    // Decide if we need to refresh the background capture
    let camChanged = false
    const e = camera.matrixWorld.elements
    const p = prevCamMat.current
    for (let i = 0; i < 16; i++) { if (Math.abs(e[i] - p[i]) > 1e-7) { camChanged = true; break } }
    if (camChanged) dirty.current = true

    const now = state.clock.elapsedTime
    const timeSince = now - lastCapture.current
    const shouldCapture = dirty.current || camChanged || timeSince > 0.5
    if (shouldCapture) {
      // Hide lens and optional refs, render background into FBO
      const objs: THREE.Object3D[] = [mesh]
      if (Array.isArray(hideRefs)) {
        for (let k = 0; k < hideRefs.length; k++) {
          const o = hideRefs[k]?.current as THREE.Object3D | null
          if (o) objs.push(o)
        }
      }
      const prev: boolean[] = []
      for (let k = 0; k < objs.length; k++) { prev[k] = objs[k].visible; objs[k].visible = false }
      gl.setRenderTarget(rt)
      gl.render(scene, camera)
      gl.setRenderTarget(null)
      for (let k = 0; k < objs.length; k++) { objs[k].visible = prev[k] }
      // Update capture state
      prevCamMat.current.set(e)
      dirty.current = false
      lastCapture.current = now
    }

    // Update uniforms
    (mat.uniforms as any).tBackground.value = rt.texture
    ;(mat.uniforms as any).resolution.value.set(gl.domElement.width, gl.domElement.height)
    ;(mat.uniforms as any).radiusUnits.value = radiusUnits
    // Pass clinical powers unmodified; shader handles sign so +D magnifies, −D minifies
    ;(mat.uniforms as any).sphD.value = sphereD
    ;(mat.uniforms as any).cylD.value = cylinderD
    ;(mat.uniforms as any).axisRad.value = (axisDeg * Math.PI) / 180
    // Use positive pxPerD; shader has negative sign in offset computation
    const dpr = gl.getPixelRatio()
    ;(mat.uniforms as any).pxPerD.value = (sphereD === 0 && cylinderD === 0) ? 0.0 : (0.14 * dpr)
<<<<<<< HEAD
=======
    ;(mat.uniforms as any).blurMaxPx.value = 2.0 * dpr
>>>>>>> c83f44d (chore: sync local changes (MagnifyLens/Scene/MagnifyMaterial) and add Ophtalmics_simulator dir)
    // Full opacity when powered to preserve colors; zero when plano
    ;(mat.uniforms as any).opacity.value = (sphereD === 0 && cylinderD === 0) ? 0.0 : 1.0
    // Minus-only grid-line darkening tuning (consider sphere and cylinder minification)
    const minusMag = Math.max(0, -sphereD) + Math.max(0, -cylinderD)
    ;(mat.uniforms as any).minusEdgeStrength.value = 1.2 + Math.min(1.0, minusMag / 4.0) * 1.0
    ;(mat.uniforms as any).minusEdgeMax.value = 0.18 + Math.min(1.0, minusMag / 6.0) * 0.08
  })

  // Draw before the physical glass so specular highlights remain on top
  return <mesh ref={meshRef as any} geometry={geometry} material={mat as any} renderOrder={5} />
}
