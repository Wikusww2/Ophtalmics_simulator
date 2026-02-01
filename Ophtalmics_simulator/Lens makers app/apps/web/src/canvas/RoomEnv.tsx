import * as THREE from 'three'

type Style = 'studio'|'sunset'|'forest'|'apartment'|'city'|'warehouse'|'park'|'lobby'|'room'

const PALE = {
  white: 0xf5f5f5,
  gray: 0xd9d9d9,
  dark: 0x888888,
  sky: 0x87ceeb,
  sand: 0xedd9a3,
  green: 0x8fbf6a,
  wood: 0xb58969,
  city: 0xb0c4de,
}

export function RoomEnv({ style='studio', size=4 }: { style?: Style; size?: number }) {
  const mats = materialsFor(style)
  const half = size/2
  return (
    <group>
      {/* floor */}
      <mesh position={[0, -half, 0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.floor} side={THREE.BackSide} />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, half, 0]} rotation={[Math.PI/2,0,0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.ceiling} side={THREE.BackSide} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 0, -half]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.back} side={THREE.BackSide} />
      </mesh>
      {/* front wall */}
      <mesh position={[0, 0, half]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.front} side={THREE.BackSide} />
      </mesh>
      {/* left wall */}
      <mesh position={[-half, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.left} side={THREE.BackSide} />
      </mesh>
      {/* right wall */}
      <mesh position={[half, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={mats.right} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function materialsFor(style: Style) {
  switch (style) {
    case 'sunset':
      return { floor: PALE.sand, ceiling: PALE.sky, back: PALE.sky, front: PALE.sand, left: PALE.sky, right: PALE.sky }
    case 'forest':
      return { floor: PALE.wood, ceiling: PALE.green, back: PALE.green, front: PALE.green, left: PALE.green, right: PALE.green }
    case 'apartment':
      return { floor: PALE.wood, ceiling: PALE.white, back: PALE.gray, front: PALE.gray, left: PALE.white, right: PALE.white }
    case 'city':
      return { floor: PALE.gray, ceiling: PALE.city, back: PALE.city, front: PALE.city, left: PALE.city, right: PALE.city }
    case 'warehouse':
      return { floor: PALE.dark, ceiling: PALE.gray, back: PALE.gray, front: PALE.gray, left: PALE.dark, right: PALE.dark }
    case 'park':
      return { floor: PALE.green, ceiling: PALE.sky, back: PALE.sky, front: PALE.sky, left: PALE.green, right: PALE.green }
    case 'lobby':
      return { floor: PALE.wood, ceiling: PALE.white, back: PALE.white, front: PALE.white, left: PALE.gray, right: PALE.gray }
    case 'room':
      return { floor: PALE.gray, ceiling: PALE.white, back: PALE.gray, front: PALE.gray, left: PALE.gray, right: PALE.gray }
    default:
      return { floor: PALE.white, ceiling: PALE.white, back: PALE.white, front: PALE.white, left: PALE.white, right: PALE.white }
  }
}

