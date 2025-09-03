export const mmToWorld = (mm: number) => mm * 0.001
export const worldToMm = (w: number) => w / 0.001
export const dioptersToFocalMm = (D: number) => (D === 0 ? Infinity : 1000 / D)

