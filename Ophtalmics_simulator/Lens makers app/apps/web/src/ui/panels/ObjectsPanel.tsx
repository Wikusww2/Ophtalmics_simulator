import { useSceneState } from '../../state/sceneState'

export function ObjectsPanel() {
  const objects = useSceneState((s) => s.objects)
  const add = useSceneState((s) => s.addObject)
  const select = useSceneState((s) => s.select)
  const selectedId = useSceneState((s) => s.selectedId)
  const remove = useSceneState((s) => s.removeObject)
  const mode = useSceneState((s) => s.mode)
  const setMode = useSceneState((s) => s.setMode)
  const update = useSceneState((s) => s.updateObject)

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Objects</div>
      <div className="flex gap-2 items-center">
        <select className="border px-2 py-1 rounded" id="addType">
          {['sphere','box','cylinder','cone','torus','torusKnot','dodeca','icosa','octa','tetra','capsule','ring','circle','plane','chart','book'].map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button className="px-2 py-1 border rounded" onClick={() => {
          const sel = (document.getElementById('addType') as HTMLSelectElement).value as any
          add({ type: sel, position: [0, 0, -0.2], scale: [0.03,0.03,0.03], color: '#ff8844' })
        }}>Add</button>
        <button className="px-2 py-1 border rounded" disabled={!selectedId} onClick={() => selectedId && remove(selectedId)}>Delete</button>
      </div>
      <div className="flex gap-2 items-center text-xs">
        <label>Gizmo</label>
        <select className="border px-2 py-1 rounded" value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="translate">Move</option>
          <option value="rotate">Rotate</option>
          <option value="scale">Scale</option>
        </select>
      </div>
      <ul className="text-xs divide-y">
        {objects.map(o => (
          <li key={o.id} className={`py-1 flex items-center justify-between ${selectedId===o.id?'bg-gray-100':''}`}>
            <button className="text-left flex-1 px-1" onClick={() => select(o.id)}>
              {o.type} @ [{o.position.map((v:number)=>v.toFixed(2)).join(', ')}]
            </button>
            <div className="flex items-center gap-1">
              <label>Scale</label>
              <input className="w-20 border px-1 py-0.5 rounded" type="number" step="0.01" value={o.scale[0]}
                onChange={(e) => update(o.id, { scale: [parseFloat(e.target.value)||0.01, parseFloat(e.target.value)||0.01, parseFloat(e.target.value)||0.01] })} />
            </div>
          </li>
        ))}
      </ul>
      <div className="text-[10px] text-gray-500">Select an object and drag in the viewport to reposition. Objects remain fixed and refract through the lens.</div>
    </div>
  )
}
