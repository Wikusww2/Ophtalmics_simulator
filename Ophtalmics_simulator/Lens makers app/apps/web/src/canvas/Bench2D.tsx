import { useSystemState } from '../state/systemState'

export function Bench2D() {
  const sys = useSystemState((s) => s.system)
  const width = 800, height = 200
  const scale = 2 // px per mm for simple display
  const minZ = 0
  const maxZ = Math.max(100, ...sys.elements.map((e) => (e.kind === 'lens' ? (e.back.z) : (e.kind==='gap'? e.zEnd: 0))))
  const toX = (z: number) => 50 + (z - minZ) * scale
  return (
    <svg width={width} height={height} style={{ background: '#f8fafc' }}>
      <line x1={toX(minZ)} y1={height/2} x2={toX(maxZ)} y2={height/2} stroke="#94a3b8" />
      {sys.elements.map((el, i) => {
        if (el.kind === 'lens') {
          const x1 = toX(el.front.z)
          const x2 = toX(el.back.z)
          return <rect key={i} x={x1} y={height/2-30} width={Math.max(2, x2-x1)} height={60} fill="#bfdbfe" stroke="#60a5fa" />
        } else if (el.kind === 'gap') {
          const x1 = toX(el.zStart), x2 = toX(el.zEnd)
          return <rect key={i} x={x1} y={height/2-10} width={Math.max(2, x2-x1)} height={20} fill="#e2e8f0" stroke="#94a3b8" />
        } else {
          const x = toX(el.z)
          return <circle key={i} cx={x} cy={height/2} r={8} fill="#fca5a5" stroke="#ef4444" />
        }
      })}
    </svg>
  )
}

