import './index.css'
import { useState } from 'react'
import { Designer } from './routes/Designer'
import { OpticsBench } from './routes/OpticsBench'

export default function App() {
  const [view, setView] = useState<'designer'|'bench'>('designer')
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="p-2 border-b flex items-center gap-2 bg-white/70 backdrop-blur">
        <button className={`px-2 py-1 border rounded ${view==='designer'?'bg-gray-100':''}`} onClick={() => setView('designer')}>Designer</button>
        <button className={`px-2 py-1 border rounded ${view==='bench'?'bg-gray-100':''}`} onClick={() => setView('bench')}>Bench</button>
      </div>
      <div className="flex-1">
        {view === 'designer' ? (
          <Designer />
        ) : (
          <OpticsBench />
        )}
      </div>
    </div>
  )
}
