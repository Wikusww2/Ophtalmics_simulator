/**
 * Thin and thick lensmaker relations (paraxial).
 * Units: R in mm, thickness t in mm, returns power in diopters (1/m); convert mm->m where needed.
 */

export function thinLensPower(n: number, R1: number, R2: number): number {
  const term = (1 / R1) - (1 / R2);
  return 1000 * (n - 1) * term;
}

export function thickLensPower(n: number, R1: number, R2: number, t_mm: number): number {
  const base = (1 / R1) - (1 / R2);
  const thicknessTerm = ((n - 1) * t_mm) / (n * R1 * R2);
  return 1000 * (n - 1) * (base + thicknessTerm);
}

export function vertexPowerFront(n: number, R1: number): number {
  return 1000 * (n - 1) * (1 / R1);
}

export function vertexPowerBack(n: number, R2: number): number {
  return -1000 * (n - 1) * (1 / R2);
}

