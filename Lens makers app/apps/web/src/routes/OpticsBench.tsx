import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Bench2D } from '../canvas/Bench2D'
import { RayView3D } from '../canvas/RayView3D'
import { SystemPanel } from '../ui/panels/SystemPanel'

export function OpticsBench() {
  return (
    <div className="flex w-full h-full">
      <div className="w-80 border-r border-gray-200 p-3 space-y-3 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Optical Bench</h2>
        </div>
        <SystemPanel />
      </div>
      <div className="flex-1 grid grid-rows-2">
        <div className="border-b">
          <Bench2D />
        </div>
        <div className="">
          <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} camera={{ position: [0.05, 0.05, 0.3], fov: 40 }}>
            <color attach="background" args={[1,1,1]} />
            <ambientLight intensity={0.5} />
            <RayView3D />
            <OrbitControls enablePan enableDamping />
          </Canvas>
        </div>
      </div>
    </div>
  )
}
