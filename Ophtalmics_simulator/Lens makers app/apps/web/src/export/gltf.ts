import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import * as THREE from 'three'

export async function exportGLB(mesh: THREE.Object3D): Promise<Blob> {
  const exporter = new GLTFExporter()
  return new Promise<Blob>((resolve) => {
    exporter.parse(mesh, (result) => {
      if (result instanceof ArrayBuffer) {
        resolve(new Blob([result], { type: 'model/gltf-binary' }))
      } else {
        const json = JSON.stringify(result)
        resolve(new Blob([json], { type: 'model/gltf+json' }))
      }
    }, undefined as any, { binary: true } as any)
  })
}
