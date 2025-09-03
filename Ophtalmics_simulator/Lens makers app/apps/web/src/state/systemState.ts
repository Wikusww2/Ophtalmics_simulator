import { create } from 'zustand'
import type { OpticalSystem, Element, LensElement } from '../optics/system/types'
import { useLensState } from './lensState'

type Store = {
  system: OpticalSystem
  addElement: (el: Element) => void
  setSystem: (s: Partial<OpticalSystem>) => void
  resetFromDesigner: () => void
}

const initialSystem: OpticalSystem = {
  elements: [],
  settings: {
    spectral: { mode: 'abbe', samples: 3 },
    sampling: { spp: 1, pupilSamples: 1, fieldSamples: 1 },
    reversibility: 'forward',
    collapseToThin: true,
  },
}

export const useSystemState = create<Store>((set) => ({
  system: initialSystem,
  addElement: (el) => set((s) => ({ system: { ...s.system, elements: [...s.system.elements, el] } })),
  setSystem: (partial) => set((s) => ({ system: { ...s.system, ...partial } })),
  resetFromDesigner: () => {
    const d = useLensState.getState().design
    const lens: LensElement = {
      kind: 'lens',
      bodyMedium: d.material.name,
      front: {
        z: 0,
        geom: { kind: 'sphere', R: d.front.R },
        aperture: { type: 'circular', dia: d.clearAperture },
        mediumIn: 'air',
        mediumOut: d.material.name,
        label: 'Front',
      },
      back: {
        z: d.centerThickness,
        geom: { kind: 'sphere', R: d.back.R },
        aperture: { type: 'circular', dia: d.clearAperture },
        mediumIn: d.material.name,
        mediumOut: 'air',
        label: 'Back',
      },
      label: 'Lens 1',
    }
    set({ system: { ...initialSystem, elements: [lens] } })
  },
}))
