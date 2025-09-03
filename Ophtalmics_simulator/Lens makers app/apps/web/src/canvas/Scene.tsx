import { useMemo, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useLensState } from '../state/lensState'
import { buildLensGeometry } from '../geometry/LensBuilder'
import { TransformControls, CubeCamera, Line } from '@react-three/drei'
import { useSceneState } from '../state/sceneState'
import * as THREE from 'three'
import { RoomEnv } from './RoomEnv'
import { MagnifyLens } from './MagnifyLens'
import { makeCoatedGlassMaterial } from '../materials'

export function LensScene() {
  const design = useLensState((s) => s.design)
  const { scene: r3fScene } = useThree()
  const geom = useMemo(() => buildLensGeometry(design), [design])
  const envStyle = design.envStyle
  const objects = useSceneState((s) => s.objects)
  const selectedId = useSceneState((s) => s.selectedId)
  const select = useSceneState((s) => s.select)
  const updateObject = useSceneState((s) => s.updateObject)
  // mode/transforming used inside DraggableObject via hooks

  // Dispose GPU resources when geometry/material change or on unmount to avoid WebGL context loss
  useEffect(() => {
    return () => {
      try { (geom as any)?.dispose?.() } catch {}
    }
  }, [geom])

  // Lens radius in world units for magnify shader (mm -> units)
  const radiusUnits = useMemo(() => (Math.max(design.clearAperture, design.diameter) * 0.5) * 0.001, [design])
  const glassMat = useMemo(() => makeCoatedGlassMaterial(design.material, design.centerThickness, design.coatingFront), [design])
  const glassRef = useRef<THREE.Mesh>(null)
  // Clinical deadband: treat as plano when both |sphere| and |cylinder| ≤ 0.25 D
  const plano = Math.abs(design.spherePower) <= 0.25 && Math.abs(design.cylinderPower) <= 0.25

  // Optional thickness map for transmission based on actual geometry (mm -> meters)
  useMemo(() => {
    const ud: any = (geom as any)?.userData
    if (!ud || !ud.gridW || !ud.gridH || !ud.thick) return
    const w = ud.gridW as number
    const h = ud.gridH as number
    const data = ud.thick as Float32Array
    let maxT = -Infinity, minT = Infinity
    for (let i = 0; i < data.length; i++) { const v = data[i]; if (v>maxT) maxT=v; if (v<minT) minT=v }
    const span = Math.max(1e-9, maxT - minT)
    const arr = new Uint8Array(w * h)
    for (let i = 0; i < data.length; i++) arr[i] = Math.max(0, Math.min(255, Math.round(255 * ((data[i]-minT)/span))))
    const tex = new THREE.DataTexture(arr, w, h, THREE.RedFormat)
    tex.needsUpdate = true
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearFilter
    ;(glassMat as any).thickness = ((maxT + minT) * 0.5) * 0.001
    ;(glassMat as any).thicknessMap = span > 1e-4 ? tex : null
  }, [geom, glassMat])

  return (
    <group>
      {/* Base physical glass for subtle reflections/highlights with dynamic env */}
      <CubeCamera frames={1} resolution={256}>
        {(texture) => {
          try {
            (glassMat as any).envMap = texture
            ;(glassMat as any).needsUpdate = true
            ;(r3fScene as any).environment = texture
          } catch {}
          return (
            <mesh ref={glassRef} geometry={geom} material={glassMat as any} renderOrder={10} />
          )
        }}
      </CubeCamera>
      {/* Magnification overlay (hides glass during capture) */}
      <MagnifyLens
        geometry={geom}
        radiusUnits={radiusUnits}
        sphereD={plano ? 0 : design.spherePower}
        cylinderD={plano ? 0 : design.cylinderPower}
        axisDeg={design.axisDeg}
        hideRefs={[glassRef]}
      />
      {/* Local 6-wall room for visual background */}
      <RoomEnv style={envStyle as any} size={6} />
      <SceneObjects objects={objects} selectedId={selectedId} onSelect={select} onChange={updateObject} />
      {/* Axis overlay lines (not part of mesh) */}
      <AxisOverlay axisDeg={design.axisDeg} visible={design.toricPlacement !== 'none'} />
      <gridHelper args={[0.2, 20, 0x888888, 0xdddddd]} position={[0, -0.02, 0]} />
    </group>
  )
}

function AxisOverlay({ axisDeg, visible }: { axisDeg: number; visible: boolean }) {
  const len = 0.04 // 40 mm in world units
  const th = (axisDeg * Math.PI) / 180
  const c = Math.cos(th), s = Math.sin(th)
  const dir1 = new THREE.Vector3(c, s, 0)
  const dir2 = new THREE.Vector3(-s, c, 0)
  const p1a = dir1.clone().multiplyScalar(-len)
  const p1b = dir1.clone().multiplyScalar(len)
  const p2a = dir2.clone().multiplyScalar(-len * 0.4)
  const p2b = dir2.clone().multiplyScalar(len * 0.4)
  return (
    <group visible={visible} position={[0, 0, 0.001]}>
      <Line points={[p1a, p1b]} color="#3366ff" linewidth={1} transparent opacity={0.6} />
      <Line points={[p2a, p2b]} color="#3366ff" linewidth={1} transparent opacity={0.6} />
    </group>
  )
}

// removed remote preset mapping; using local RoomEnv

function SceneObjects({ objects, selectedId, onSelect, onChange }: { objects: any[]; selectedId?: string; onSelect: (id?: string)=>void; onChange: (id: string, patch: any)=>void }) {
  return (
    <group>
      {objects.map((o) => (
        <DraggableObject key={o.id} obj={o} selected={o.id === selectedId} onSelect={onSelect} onChange={onChange} />
      ))}
    </group>
  )
}

function DraggableObject({ obj, selected, onSelect, onChange }: { obj: any; selected: boolean; onSelect: (id?: string)=>void; onChange: (id: string, patch: any)=>void }) {
  const mode = useSceneState((s) => s.mode)
  const setTransforming = useSceneState((s) => s.setTransforming)
  const mesh = (
    <mesh
      position={obj.position}
      scale={obj.scale}
      onClick={(e) => { e.stopPropagation(); onSelect(obj.id) }}>
      {geometryFor(obj.type)}
      <meshStandardMaterial color={obj.color} />
    </mesh>
  )
  if (!selected) return mesh
  return (
    <TransformControls mode={mode as any}
      onMouseDown={() => setTransforming(true)}
      onMouseUp={(e) => {
      const t = (e as any).target?.object as THREE.Object3D
      if (t) {
        const p = t.position
        onChange(obj.id, { position: [p.x, p.y, p.z] })
      }
      setTransforming(false)
    }}>
      {mesh}
    </TransformControls>
  )
}

function geometryFor(type: string) {
  switch (type) {
    case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />
    case 'box': return <boxGeometry args={[1,1,1]} />
    case 'cylinder': return <cylinderGeometry args={[0.5,0.5,1,32]} />
    case 'cone': return <coneGeometry args={[0.5,1,32]} />
    case 'torus': return <torusGeometry args={[0.5,0.2,16,64]} />
    case 'torusKnot': return <torusKnotGeometry args={[0.4,0.15,100,16]} />
    case 'dodeca': return <dodecahedronGeometry args={[0.6,0]} />
    case 'icosa': return <icosahedronGeometry args={[0.6,0]} />
    case 'octa': return <octahedronGeometry args={[0.6,0]} />
    case 'tetra': return <tetrahedronGeometry args={[0.6,0]} />
    case 'capsule': return <capsuleGeometry args={[0.4,0.3,4,8]} />
    case 'ring': return <ringGeometry args={[0.3,0.5,32]} />
    case 'circle': return <circleGeometry args={[0.5,32]} />
    case 'plane': return <planeGeometry args={[1,1]} />
    case 'chart': return <planeGeometry args={[1,1]} />
    case 'book': return <boxGeometry args={[1,0.05,0.8]} />
    default: return <boxGeometry args={[1,1,1]} />
  }
}
