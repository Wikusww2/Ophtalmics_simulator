export const EPS = 1e-9
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
export const safeSqrt = (x: number) => Math.sqrt(Math.max(0, x))

