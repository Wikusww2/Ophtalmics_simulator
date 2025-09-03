/**
 * Vector Snell's law: refract incident vector i through surface with unit normal n, from n1 to n2.
 * Returns transmitted vector t or null if total internal reflection occurs.
 */
export function refract(i: [number, number, number], n: [number, number, number], n1: number, n2: number): [number, number, number] | null {
  const ix = i[0], iy = i[1], iz = i[2];
  let nx = n[0], ny = n[1], nz = n[2];
  // Normalize inputs defensively
  const il = Math.hypot(ix, iy, iz) || 1;
  const nl = Math.hypot(nx, ny, nz) || 1;
  const I = [ix / il, iy / il, iz / il] as [number, number, number];
  nx /= nl; ny /= nl; nz /= nl;

  const c = -(nx * I[0] + ny * I[1] + nz * I[2]);
  const r = n1 / n2;
  const k = 1 - r * r * (1 - c * c);
  if (k < 0) return null; // TIR
  const a = r;
  const b = r * c - Math.sqrt(k);
  return [
    a * I[0] + b * nx,
    a * I[1] + b * ny,
    a * I[2] + b * nz,
  ];
}

export function reflect(i: [number, number, number], n: [number, number, number]): [number, number, number] {
  const il = Math.hypot(i[0], i[1], i[2]) || 1;
  const nl = Math.hypot(n[0], n[1], n[2]) || 1;
  const I = [i[0] / il, i[1] / il, i[2] / il];
  const N = [n[0] / nl, n[1] / nl, n[2] / nl];
  const dot = I[0] * N[0] + I[1] * N[1] + I[2] * N[2];
  return [
    I[0] - 2 * dot * N[0],
    I[1] - 2 * dot * N[1],
    I[2] - 2 * dot * N[2],
  ];
}

