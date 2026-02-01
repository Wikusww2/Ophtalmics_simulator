import { create } from 'zustand'

export type SceneObject = {
  id: string
  type: 'sphere'|'box'|'cylinder'|'cone'|'torus'|'torusKnot'|'dodeca'|'icosa'|'octa'|'tetra'|'capsule'|'ring'|'circle'|'plane'|'chart'|'book'
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}

type Store = {
  objects: SceneObject[]
  selectedId?: string
  mode: 'translate'|'rotate'|'scale'
  transforming: boolean
  addObject: (obj: Partial<SceneObject> & { type: 'sphere'|'box' }) => void
  updateObject: (id: string, patch: Partial<SceneObject>) => void
  removeObject: (id: string) => void
  select: (id?: string) => void
  setMode: (m: 'translate'|'rotate'|'scale') => void
  setTransforming: (b: boolean) => void
}

export const useSceneState = create<Store>((set) => ({
  objects: [],
  selectedId: undefined,
  mode: 'translate',
  transforming: false,
  addObject: (obj) => set((s) => ({
    objects: [
      ...s.objects,
      {
        id: Math.random().toString(36).slice(2),
        type: obj.type as any,
        position: obj.position ?? [0, 0, -0.2],
        scale: obj.scale ?? [0.05, 0.05, 0.05],
        color: obj.color ?? '#ff8844',
      },
    ]
  })),
  updateObject: (id, patch) => set((s) => ({
    objects: s.objects.map(o => o.id === id ? { ...o, ...patch } : o)
  })),
  removeObject: (id) => set((s) => ({ objects: s.objects.filter(o => o.id !== id), selectedId: s.selectedId === id ? undefined : s.selectedId })),
  select: (id) => set({ selectedId: id }),
  setMode: (m) => set({ mode: m }),
  setTransforming: (b) => set({ transforming: b })
}))
