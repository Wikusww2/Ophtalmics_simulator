/**
 * Thin and thick lensmaker relations (paraxial).
 * Units: R in mm, thickness t in mm, returns power in diopters (1/m); convert mm->m where needed.
 * We compute power in diopters directly using mm by converting to meters when forming focal length.
 */

/**
 * Thin lens equivalent power (diopters) in air.
 * 1/f = (n-1)(1/R1 - 1/R2)
 * R in mm → convert to meters for diopters: F = 1000 * (n-1)(1/R1 - 1/R2)
 */
export function thinLensPower(n: number, R1: number, R2: number): number {
  const term = (1 / R1) - (1 / R2);
  return 1000 * (n - 1) * term;
}

/**
 * Thick lens equivalent power (diopters), approximate.
 * Φ = (n-1)(1/R1 - 1/R2 + ((n-1) t)/(n R1 R2))
 * with R and t in mm → multiply by 1000 for diopters.
 */
export function thickLensPower(n: number, R1: number, R2: number, t_mm: number): number {
  const base = (1 / R1) - (1 / R2);
  const thicknessTerm = ((n - 1) * t_mm) / (n * R1 * R2);
  return 1000 * (n - 1) * (base + thicknessTerm);
}

/**
 * Vertex power at front and back surfaces (diopters) in air, useful for QA.
 */
export function vertexPowerFront(n: number, R1: number): number {
  return 1000 * (n - 1) * (1 / R1);
}

export function vertexPowerBack(n: number, R2: number): number {
  return -1000 * (n - 1) * (1 / R2);
}

