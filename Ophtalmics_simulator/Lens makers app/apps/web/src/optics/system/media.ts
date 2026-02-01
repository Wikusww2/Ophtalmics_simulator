import type { Medium } from './types'

// Simple media catalogue; extend as needed
export const defaultMedia: Medium[] = [
  { name: 'air', nd: 1.0 },
  { name: 'water', nd: 1.333, Abbe: 55 },
  { name: 'CR-39', nd: 1.498, Abbe: 58 },
  { name: '1.60', nd: 1.6, Abbe: 42 },
  { name: '1.67', nd: 1.67, Abbe: 32 },
  { name: 'cement', nd: 1.52, Abbe: 50 },
]

export function getMedium(map: Record<string, Medium>, name: string): Medium {
  const m = map[name]
  if (!m) throw new Error(`Unknown medium: ${name}`)
  return m
}

export function buildMediaMap(list: Medium[]): Record<string, Medium> {
  const m: Record<string, Medium> = {}
  for (const x of list) m[x.name] = x
  return m
}
