import { useLensState } from '../../state/lensState'

const styles = [
  { key: 'studio', label: 'Studio' },
  { key: 'sunset', label: 'Beach/Sunset' },
  { key: 'forest', label: 'Jungle/Forest' },
  { key: 'apartment', label: 'Classroom/Apartment' },
  { key: 'city', label: 'Office/City' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'park', label: 'Park' },
  { key: 'lobby', label: 'Lobby' },
  { key: 'room', label: 'Simple Room (6 walls)' },
]

export function EnvironmentPanel() {
  const envStyle = useLensState((s) => s.design.envStyle)
  const set = useLensState((s) => s.set)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Environment</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-24">Style</label>
        <select className="border px-2 py-1 rounded" value={envStyle}
          onChange={(e) => set({ envStyle: e.target.value as any })}>
          {styles.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
      <div className="text-[10px] text-gray-500">Pick a 360° room; objects in front of the lens will refract through it.</div>
    </div>
  )
}

