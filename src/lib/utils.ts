import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: 'group' | 'rule' = 'rule'): string {
  const random = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}_${timestamp}_${random}`
}

export function getDepthBorderClass(depth: number): string {
  const normalizedDepth = depth % 5
  return `depth-border-${normalizedDepth}`
}
