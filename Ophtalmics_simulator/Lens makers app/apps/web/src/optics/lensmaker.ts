/** Lens power/radius helpers for app-level solving (thin/thick mix) */

export function frontRadiusFromPower(n: number, F_front_D: number) {
  // F_front = 1000*(n-1)/R1  => R1 = 1000*(n-1)/F_front
  const A = n - 1
  const eps = 1e-6
  const F = Math.abs(F_front_D) < eps ? (F_front_D >= 0 ? eps : -eps) : F_front_D
  return (1000 * A) / F
}

export function backRadiusFromPower(n: number, F_back_vertex_D: number) {
  // Back vertex power convention: F_back_vertex = -1000*(n-1)/R2
  const A = n - 1
  const eps = 1e-6
  const F = Math.abs(F_back_vertex_D) < eps ? (F_back_vertex_D >= 0 ? eps : -eps) : F_back_vertex_D
  return -(1000 * A) / F
}

/** Solve R2 for target equivalent power using thick-lens relation */
export function solveBackRadiusForTargetThick(n: number, R1: number, t_mm: number, target_D: number) {
  const a = 1 / R1
  const P = target_D / (1000 * (n - 1))
  const K = ((n - 1) * t_mm) / n
  const denom = K * a - 1
  const eps = 1e-9
  const b = (P - a) / (Math.abs(denom) < eps ? (denom >= 0 ? eps : -eps) : denom)
  return 1 / b
}

export function solveFrontRadiusForTargetThick(n: number, R2: number, t_mm: number, target_D: number) {
  const b = 1 / R2
  const P = target_D / (1000 * (n - 1))
  const K = ((n - 1) * t_mm) / n
  // P = a - b + K a b => P + b = a (1 + K b) => a = (P + b) / (1 + K b)
  const denom = 1 + K * b
  const eps = 1e-9
  const a = (P + b) / (Math.abs(denom) < eps ? (denom >= 0 ? eps : -eps) : denom)
  return 1 / a
}

