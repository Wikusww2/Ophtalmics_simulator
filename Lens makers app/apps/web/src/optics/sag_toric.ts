/** Toric sag (paraxial quadric) in rotated frame by axisDeg */
export function toricSagParaxial(
  x: number,
  y: number,
  R_parallel: number,
  R_perp: number,
  axisDeg: number
) {
  const th = (axisDeg * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  const xp = x * c + y * s
  const yp = -x * s + y * c
  const s1 = (xp * xp) / (2 * R_parallel)
  const s2 = (yp * yp) / (2 * R_perp)
  return s1 + s2
}

/** Partial derivatives for analytic normals (z = s(x,y)) */
export function toricSagDerivatives(
  x: number,
  y: number,
  R_parallel: number,
  R_perp: number,
  axisDeg: number
) {
  const th = (axisDeg * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  const xp = x * c + y * s
  const yp = -x * s + y * c
  const ds_dx = (xp / R_parallel) * c + (yp / R_perp) * (-s)
  const ds_dy = (xp / R_parallel) * s + (yp / R_perp) * c
  return { ds_dx, ds_dy }
}

