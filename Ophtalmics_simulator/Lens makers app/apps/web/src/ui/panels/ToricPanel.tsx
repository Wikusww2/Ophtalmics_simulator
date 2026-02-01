import { useLensState } from '../../state/lensState'
import { transposeMinusToPlus, meridianPowers, wrapAxisDeg } from '../../optics/cylAxis'
import { axisToleranceDeg } from '../../optics/tolerances'

export function ToricPanel() {
  const design = useLensState((s) => s.design)
  const set = useLensState((s) => s.set)
  const rx = { sphere: design.spherePower, cylinder: design.cylinderPower, axisDeg: design.axisDeg }
  const plusForm = transposeMinusToPlus(rx)
  const mer = meridianPowers(rx)
  const tol = axisToleranceDeg(Math.abs(design.cylinderPower))

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Toric (Spherocyl)</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">Sphere (D)</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="0.25" value={design.spherePower}
          onChange={(e) => set({ spherePower: parseFloat(e.target.value) || 0 })} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">Cylinder (D)</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="0.25" value={design.cylinderPower}
          onChange={(e) => set({ cylinderPower: parseFloat(e.target.value) || 0 })} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">Axis (°)</label>
        <input className="border px-2 py-1 rounded w-28" type="number" step="1" min={1} max={180} value={design.axisDeg}
          onChange={(e) => set({ axisDeg: wrapAxisDeg(parseFloat(e.target.value) || 180) })} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs w-16">Placement</label>
        <select className="border px-2 py-1 rounded" value={design.toricPlacement}
          onChange={(e) => set({ toricPlacement: e.target.value as any })}>
          <option value="none">None</option>
          <option value="back">Back toric</option>
          <option value="front">Front toric</option>
          <option value="bitoric">Bitoric</option>
        </select>
      </div>
      <div className="text-xs text-gray-700">Meridian powers: axis {mer.axisMeridian.toFixed(2)} D, 90° {mer.powerMeridian.toFixed(2)} D</div>
      <div className="text-xs text-gray-700">Plus form: {plusForm.sphere.toFixed(2)} / {plusForm.cylinder.toFixed(2)} × {plusForm.axisDeg}</div>
      <div className="text-xs text-gray-700">ANSI axis tolerance ≈ ±{tol}°</div>
    </div>
  )
}

