import { useLensState } from '../../state/lensState'

export function MaterialPanel() {
  const material = useLensState((s) => s.design.material)
  const set = useLensState((s) => s.set)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Material</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">n_d</label>
        <input className="border px-2 py-1 rounded w-24" type="number" step="0.001" value={material.nd}
          onChange={(e) => set({ material: { ...material, nd: parseFloat(e.target.value) || 1.5 } })} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">Abbe</label>
        <input className="border px-2 py-1 rounded w-24" type="number" step="1" value={material.Abbe}
          onChange={(e) => set({ material: { ...material, Abbe: parseFloat(e.target.value) || 40 } })} />
      </div>
    </div>
  )
}

