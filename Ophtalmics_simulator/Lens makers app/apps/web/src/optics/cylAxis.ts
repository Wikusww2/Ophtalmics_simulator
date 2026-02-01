export type Spherocyl = { sphere: number; cylinder: number; axisDeg: number }

export function wrapAxisDeg(axis: number): number {
  let a = Math.round(axis)
  // Axis range 1..180
  a = ((a - 1) % 180 + 180) % 180 + 1
  return a
}

export function transposeMinusToPlus(rx: Spherocyl): Spherocyl {
  const S = rx.sphere, C = rx.cylinder, A = rx.axisDeg
  const S2 = S + C
  const C2 = -C
  let A2 = wrapAxisDeg(A + 90)
  return { sphere: S2, cylinder: C2, axisDeg: A2 }
}

export function transposePlusToMinus(rx: Spherocyl): Spherocyl {
  const S = rx.sphere, C = rx.cylinder, A = rx.axisDeg
  const S2 = S + C
  const C2 = -C
  let A2 = wrapAxisDeg(A + 90)
  return { sphere: S2, cylinder: C2, axisDeg: A2 }
}

/** Meridian powers: at axis meridian = S; at orthogonal meridian = S + C */
export function meridianPowers(rx: Spherocyl) {
  return { axisMeridian: rx.sphere, powerMeridian: rx.sphere + rx.cylinder }
}

