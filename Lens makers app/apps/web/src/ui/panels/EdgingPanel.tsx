import { useState } from 'react'

export function EdgingPanel() {
  const [axisLock, setAxisLock] = useState(true)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Edging</div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={axisLock} onChange={(e) => setAxisLock(e.target.checked)} />
        Axis lock during cut
      </label>
      <div className="text-xs text-gray-600">Axis line shown on lens; rotation locked when enabled.</div>
    </div>
  )
}

