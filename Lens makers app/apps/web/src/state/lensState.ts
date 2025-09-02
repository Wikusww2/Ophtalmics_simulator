import { create } from 'zustand'
import { z } from 'zod'

export const SurfaceSchema = z.object({
  R: z.number(),
  conicK: z.number().default(0),
  a2: z.number().optional(),
  a4: z.number().optional(),
  a6: z.number().optional(),
  a8: z.number().optional(),
})

export type Surface = z.infer<typeof SurfaceSchema>

export const MaterialSchema = z.object({
  name: z.string(),
  nd: z.number(),
  Abbe: z.number(),
})
export type Material = z.infer<typeof MaterialSchema>

export const LensDesignSchema = z.object({
  front: SurfaceSchema,
  back: SurfaceSchema,
  material: MaterialSchema,
  diameter: z.number(),
  clearAperture: z.number(),
  centerThickness: z.number(),
  isMinusLens: z.boolean(),
  spherePower: z.number().default(0),
  cylinderPower: z.number().default(0),
  axisDeg: z.number().default(180),
  toricPlacement: z.enum(['none','front','back','bitoric']).default('none'),
  spherePlacement: z.enum(['front','back','balanced']).default('back'),
  useBestForm: z.boolean().default(false),
  coatingFront: z.object({ type: z.enum(['none','single','multi']), ior: z.number().optional(), thicknessNm: z.number().optional(), residualRAvg: z.number().optional() }).default({ type:'none' }),
  coatingBack: z.object({ type: z.enum(['none','single','multi']), ior: z.number().optional(), thicknessNm: z.number().optional(), residualRAvg: z.number().optional() }).default({ type:'none' }),
  envStyle: z.enum(['studio','sunset','forest','city','apartment','warehouse','park','lobby','room']).default('studio'),
})
export type LensDesign = z.infer<typeof LensDesignSchema>

type Store = {
  design: LensDesign
  set: (partial: Partial<LensDesign>) => void
  reset: () => void
}

export function defaultDesign(): LensDesign {
  return {
    front: { R: Infinity, conicK: 0 },
    back: { R: Infinity, conicK: 0 },
    material: { name: '1.60', nd: 1.6, Abbe: 42 },
    diameter: 70,
    clearAperture: 60,
    centerThickness: 3,
    isMinusLens: false,
    spherePower: 0,
    cylinderPower: 0,
    axisDeg: 180,
    toricPlacement: 'none',
    spherePlacement: 'back',
    useBestForm: false,
    coatingFront: { type: 'none' },
    coatingBack: { type: 'none' },
    envStyle: 'studio',
  }
}

export const useLensState = create<Store>((set) => ({
  design: defaultDesign(),
  set: (partial) => set((s) => ({ design: { ...s.design, ...partial } })),
  reset: () => set({ design: defaultDesign() }),
}))
