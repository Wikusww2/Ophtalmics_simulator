import { useLensState } from '../../state/lensState'

export function SurfacePanel({ which }: { which: 'front' | 'back' }) {
  const surf = useLensState((s) => s.design[which])
  const placement = useLensState((s) => s.design.toricPlacement)
  const spherePlacement = useLensState((s) => s.design.spherePlacement)
  const useBestForm = useLensState((s) => s.design.useBestForm)
  const set = useLensState((s) => s.set)
  const title = which === 'front' ? 'Front Surface' : 'Back Surface'
  const toricOnThis = (placement === which) || (placement === 'bitoric')
  const valueR = Number.isFinite(surf.R) ? (surf.R as number) : ('' as any)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">R (mm)</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="0.1" value={valueR} placeholder="Flat (∞)" disabled={toricOnThis}
          onChange={(e) => {
            const v = e.target.value
            const num = v === '' ? Infinity : Number(v)
            set({ [which]: { ...surf, R: Number.isFinite(num) ? num : Infinity } } as any)
          }} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">K</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="0.1" value={surf.conicK ?? 0} disabled={toricOnThis}
          onChange={(e) => set({ [which]: { ...surf, conicK: Number(e.target.value) || 0 } } as any)} />
      </div>
      {toricOnThis && (
        <div className="text-xs text-gray-600">This surface is toric; radii derived from Rx.</div>
      )}
      {which === 'front' && (
        <>
          <div className="flex gap-2 items-center">
            <label className="text-xs w-24">Sphere placement</label>
            <select className="border px-2 py-1 rounded" value={spherePlacement}
              onChange={(e) => set({ spherePlacement: e.target.value as any })}>
              <option value="front">Front</option>
              <option value="back">Back</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={useBestForm} onChange={(e) => set({ useBestForm: e.target.checked })} />
            Use best-form (Vogel/Tscherning)
          </label>
          <div className="text-[10px] text-gray-500">Default flat surfaces. Sphere adds curvature on the selected side.</div>
        </>
      )}
    </div>
  )
}
