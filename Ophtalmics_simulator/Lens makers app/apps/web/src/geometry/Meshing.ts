import * as THREE from 'three'

export function buildSurfaceIndices(ringCount: number, segCount: number) {
  const indices: number[] = []
  const stride = segCount + 1
  for (let i = 0; i < ringCount; i++) {
    for (let j = 0; j < segCount; j++) {
      const a = i * stride + j
      const b = a + stride
      const c = b + 1
      const d = a + 1
      indices.push(a, b, d, b, c, d)
    }
  }
  return indices
}

export function mergeSurfaces(
  front: { positions: number[]; normals: number[]; ringCount: number; segCount: number },
  back: { positions: number[]; normals: number[]; ringCount: number; segCount: number }
) {
  // Build sidewall and combine into a single BufferGeometry
  const frontIdx = buildSurfaceIndices(front.ringCount, front.segCount)
  const backIdx = buildSurfaceIndices(back.ringCount, back.segCount)
  const frontCount = (front.segCount + 1) * (front.ringCount + 1)
  const backOffset = frontCount

  const indices = new Uint32Array(frontIdx.length + backIdx.length + front.segCount * 6)
  indices.set(frontIdx, 0)
  // back surface winding reversed
  const startBack = frontIdx.length
  for (let k = 0; k < backIdx.length; k += 3) {
    indices[startBack + k] = backOffset + backIdx[k]
    indices[startBack + k + 1] = backOffset + backIdx[k + 2]
    indices[startBack + k + 2] = backOffset + backIdx[k + 1]
  }
  // Side wall connect outer rings
  const sideStart = startBack + backIdx.length
  let ptr = sideStart
  const stride = front.segCount + 1
  const i = front.ringCount - 1
  for (let j = 0; j < front.segCount; j++) {
    const a = i * stride + j
    const b = a + 1
    const c = backOffset + i * stride + j
    const d = backOffset + i * stride + j + 1
    indices[ptr++] = a; indices[ptr++] = c; indices[ptr++] = b
    indices[ptr++] = c; indices[ptr++] = d; indices[ptr++] = b
  }

  const positions = new Float32Array(front.positions.length + back.positions.length)
  positions.set(front.positions, 0)
  positions.set(back.positions, front.positions.length)
  const normals = new Float32Array(front.normals.length + back.normals.length)
  normals.set(front.normals, 0)
  // Orient back normals outward relative to the lens volume
  for (let k = 0; k < back.normals.length; k++) normals[front.normals.length + k] = -back.normals[k]

  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geom.setIndex(new THREE.BufferAttribute(indices, 1))
  // UVs for front/back surfaces (u = angle, v = radius)
  const uvFront = new Float32Array((front.ringCount + 1) * (front.segCount + 1) * 2)
  let uvi = 0
  for (let i = 0; i <= front.ringCount; i++) {
    const v = i / front.ringCount
    for (let j = 0; j <= front.segCount; j++) {
      const u = j / front.segCount
      uvFront[uvi++] = u
      uvFront[uvi++] = v
    }
  }
  const uv = new Float32Array(uvFront.length * 2)
  uv.set(uvFront, 0)
  uv.set(uvFront, uvFront.length)
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  // Define groups: 0=front, 1=back, 2=side
  geom.clearGroups()
  geom.addGroup(0, frontIdx.length, 0)
  geom.addGroup(frontIdx.length, backIdx.length, 1)
  geom.addGroup(frontIdx.length + backIdx.length, front.segCount * 6, 2)
  geom.computeBoundingSphere()
  // Store meta for thickness map consumers
  const gridW = front.segCount + 1
  const gridH = front.ringCount + 1
  const thick = new Float32Array(gridW * gridH)
  for (let i = 0; i < gridH; i++) {
    for (let j = 0; j < gridW; j++) {
      const idx = (i * gridW + j) * 3
      const zf = front.positions[idx + 2]
      const zb = back.positions[idx + 2]
      thick[i * gridW + j] = zf - zb
    }
  }
  ;(geom as any).userData = { ...(geom as any).userData, gridW, gridH, thick }
  return geom
}
