import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import { useSystemState } from '../state/systemState'
import { traceRay, type Ray } from '../optics/system/tracer'

export function RayView3D() {
  const sys = useSystemState((s) => s.system)
  const bundles = useMemo(() => {
    const rays: Ray[] = []
    for (let i = -2; i <= 2; i++) {
      // Define rays in millimeters for the tracer
      rays.push({ o: [i, 0, -50], d: [0, 0, 1], n: 1.0, T: 1, lambda: 550 })
    }
    return rays.map((r) => sampleRayPath(sys, r))
  }, [sys])
  return (
    <group>
      {bundles.map((pts, i) => (
        <Line key={i} points={pts} color="#34d399" linewidth={1} />
      ))}
    </group>
  )
}

function sampleRayPath(sys: any, r: Ray) {
  const res = traceRay(sys, r)
  const pts: THREE.Vector3[] = []
  const S = 0.001 // mm -> scene units
  pts.push(new THREE.Vector3(r.o[0] * S, r.o[1] * S, r.o[2] * S))
  for (const h of res.hits) {
    pts.push(new THREE.Vector3(h.p[0] * S, h.p[1] * S, h.p[2] * S))
  }
  // Extend a bit beyond last surface for visibility
  const L = 100 // mm
  const ro = res.ray.o, rd = res.ray.d
  pts.push(new THREE.Vector3((ro[0] + rd[0] * L) * S, (ro[1] + rd[1] * L) * S, (ro[2] + rd[2] * L) * S))
  return pts
}
