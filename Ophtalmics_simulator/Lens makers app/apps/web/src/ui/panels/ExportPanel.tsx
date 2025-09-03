import { useLensState } from '../../state/lensState'
import { buildLensGeometry } from '../../geometry/LensBuilder'
import { exportGLB } from '../../export/gltf'
import { exportSTL } from '../../export/stl'
import { buildSpecSheetJSON } from '../../export/specSheet'
import * as THREE from 'three'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel() {
  const design = useLensState((s) => s.design)
  const onExportGLB = async () => {
    const geom = buildLensGeometry(design)
    const mesh = new THREE.Mesh(geom)
    const blob = await exportGLB(mesh)
    downloadBlob(blob, 'lens.glb')
    try { mesh.geometry.dispose() } catch {}
  }
  const onExportSTL = () => {
    const geom = buildLensGeometry(design)
    const blob = exportSTL(geom)
    downloadBlob(blob, 'lens.stl')
    try { geom.dispose() } catch {}
  }
  const onExportJSON = () => {
    downloadBlob(buildSpecSheetJSON(design), 'lens.json')
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Export</div>
      <div className="flex gap-2">
        <button className="px-2 py-1 rounded border" onClick={onExportGLB}>GLB</button>
        <button className="px-2 py-1 rounded border" onClick={onExportSTL}>STL</button>
        <button className="px-2 py-1 rounded border" onClick={onExportJSON}>JSON</button>
      </div>
    </div>
  )
}
