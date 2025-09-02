/** Simple ANSI-like axis tolerance lookup (deg) by cylinder magnitude (|C| in D) */
export function axisToleranceDeg(cylAbs: number): number {
  if (cylAbs <= 0.25) return 14
  if (cylAbs <= 0.50) return 7
  if (cylAbs <= 0.75) return 5
  if (cylAbs <= 1.50) return 3
  return 2
}

/** Cylinder power tolerance (basic quick ref, in D) */
export function cylinderToleranceD(cylAbs: number): number {
  if (cylAbs <= 0.25) return 0.12
  if (cylAbs <= 0.50) return 0.12
  if (cylAbs <= 2.00) return 0.12
  return 0.15
}

