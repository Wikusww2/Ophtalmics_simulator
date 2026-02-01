/** Vogel best-form base curve suggestions (Ostwalt-leaning) */
export function sphericalEquivalent(sphere: number, cylinder: number) {
  return sphere + 0.5 * cylinder
}

export function vogelBaseCurve(se: number) {
  if (se >= 0) {
    // plus lenses
    return se + 6.0
  }
  // minus lenses
  return se / 2 + 6.0
}

