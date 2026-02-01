import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSceneState } from '../state/sceneState'
import { LensScene } from '../canvas/Scene'
import { SurfacePanel } from '../ui/panels/SurfacePanel'
import { MaterialPanel } from '../ui/panels/MaterialPanel'
import { ThicknessPanel } from '../ui/panels/ThicknessPanel'
import { ToricPanel } from '../ui/panels/ToricPanel'
import { ExportPanel } from '../ui/panels/ExportPanel'
import { EdgingPanel } from '../ui/panels/EdgingPanel'
import { ResetButton } from '../ui/ResetButton'
import { EnvironmentPanel } from '../ui/panels/EnvironmentPanel'
import { ObjectsPanel } from '../ui/panels/ObjectsPanel'

export function Designer() {
  const transforming = useSceneState((s) => s.transforming)
  return (
    <div className="flex w-full h-full">
      <div className="w-80 border-r border-gray-200 p-3 space-y-3 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Lens Designer</h2>
          <ResetButton />
        </div>
        <MaterialPanel />
        <EnvironmentPanel />
        <ObjectsPanel />
        <ToricPanel />
        <SurfacePanel which="front" />
        <SurfacePanel which="back" />
        <ThicknessPanel />
        <EdgingPanel />
        <ExportPanel />
      </div>
      <div className="flex-1">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} camera={{ position: [0.05, 0.05, 0.25], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <LensScene />
          <OrbitControls enablePan enableDamping enabled={!transforming} />
        </Canvas>
      </div>
    </div>
  )
}
