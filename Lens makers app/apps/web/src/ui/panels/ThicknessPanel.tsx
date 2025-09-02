import { useLensState } from '../../state/lensState'
import { edgeThicknessFromCT, centerThicknessFromET } from 'optics-core'

export function ThicknessPanel() {
  const design = useLensState((s) => s.design)
  const set = useLensState((s) => s.set)
  const D = Math.max(design.clearAperture ?? 0, design.diameter ?? 0)
  const rRaw = D / 2
  const r = Number.isFinite(rRaw) ? rRaw : 0
  let ET = 0, CT = design.centerThickness
  try {
    ET = edgeThicknessFromCT(design.centerThickness, r, design.front, design.back)
    CT = centerThicknessFromET(ET, r, design.front, design.back)
  } catch {
    ET = NaN
  }
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Thickness</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-24">CT (mm)</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="0.1" value={design.centerThickness}
          onChange={(e) => set({ centerThickness: parseFloat(e.target.value) || 0 })} />
      </div>
      <div className="text-xs text-gray-600">Derived ET at edge: {Number.isFinite(ET) ? ET.toFixed(2) : '—'} mm</div>
      <div className="text-xs text-gray-600">Consistency CT: {Number.isFinite(CT) ? CT.toFixed(2) : '—'} mm</div>
    </div>
  )
}
