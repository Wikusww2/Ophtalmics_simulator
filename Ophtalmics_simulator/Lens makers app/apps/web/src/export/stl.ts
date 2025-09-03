import * as THREE from 'three'

export function exportSTL(geometry: THREE.BufferGeometry): Blob {
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute
  const index = geometry.getIndex()
  let stl = 'solid lens\n'

  const writeTri = (a: number, b: number, c: number) => {
    const ax = positions.getX(a), ay = positions.getY(a), az = positions.getZ(a)
    const bx = positions.getX(b), by = positions.getY(b), bz = positions.getZ(b)
    const cx = positions.getX(c), cy = positions.getY(c), cz = positions.getZ(c)
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = cx - ax, vy = cy - ay, vz = cz - az
    const nx = uy * vz - uz * vy
    const ny = uz * vx - ux * vz
    const nz = ux * vy - uy * vx
    const nl = Math.hypot(nx, ny, nz) || 1
    stl += `  facet normal ${nx / nl} ${ny / nl} ${nz / nl}\n`
    stl += `    outer loop\n`
    stl += `      vertex ${ax} ${ay} ${az}\n`
    stl += `      vertex ${bx} ${by} ${bz}\n`
    stl += `      vertex ${cx} ${cy} ${cz}\n`
    stl += `    endloop\n`
    stl += `  endfacet\n`
  }

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      writeTri(index.getX(i), index.getX(i + 1), index.getX(i + 2))
    }
  } else {
    for (let i = 0; i < positions.count; i += 3) {
      writeTri(i, i + 1, i + 2)
    }
  }

  stl += 'endsolid lens\n'
  return new Blob([stl], { type: 'model/stl' })
}

