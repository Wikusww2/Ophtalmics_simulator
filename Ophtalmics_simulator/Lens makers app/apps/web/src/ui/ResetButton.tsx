import { useLensState } from '../state/lensState'

export function ResetButton() {
  const reset = useLensState((s) => s.reset)
  return (
    <button className="text-xs border px-2 py-1 rounded" onClick={reset}>Reset</button>
  )
}

