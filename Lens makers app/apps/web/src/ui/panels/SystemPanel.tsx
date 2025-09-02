import { useSystemState } from '../../state/systemState'

export function SystemPanel() {
  const system = useSystemState((s) => s.system)
  const add = useSystemState((s) => s.addElement)
  const resetFromDesigner = useSystemState((s) => s.resetFromDesigner)
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">System</div>
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={resetFromDesigner}>From Designer</button>
        <button className="px-2 py-1 border rounded" onClick={() => add({ kind:'gap', zStart: 10, zEnd: 20, medium:'air', label:'Gap' })}>Add Gap</button>
      </div>
      <div className="text-xs text-gray-600">Elements: {system.elements.length}</div>
      <ul className="text-xs list-disc ml-4">
        {system.elements.map((el, i) => (
          <li key={i}>{el.kind === 'lens' ? (el.label || 'Lens') : el.kind}</li>
        ))}
      </ul>
    </div>
  )
}

