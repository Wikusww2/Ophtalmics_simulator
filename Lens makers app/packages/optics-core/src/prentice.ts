export function prentice(F_diopters: number, c_mm_x: number, c_mm_y: number) {
  const c_mm = Math.hypot(c_mm_x, c_mm_y);
  const delta = (F_diopters * c_mm) / 10;
  let bx = 0, by = 0;
  if (c_mm > 0) {
    bx = c_mm_x / c_mm;
    by = c_mm_y / c_mm;
  }
  return { delta, baseDir: { x: bx, y: by } };
}

