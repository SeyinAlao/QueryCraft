import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — class name utility
 *
 * Combines clsx (conditional class logic) with tailwind-merge
 * (deduplicates conflicting Tailwind classes).
 *
 * Example:
 *   cn('px-4 py-2', isActive && 'bg-brand', 'px-6')
 *   → 'py-2 bg-brand px-6'  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * generateId — stable unique ID for query nodes
 *
 * Uses nanoid for short, URL-safe IDs.
 * We prefix with the node type so IDs are self-documenting
 * in DevTools and test output.
 */
export function generateId(prefix: 'group' | 'rule' = 'rule'): string {
  // Simple UUID-lite for the scaffold; will use nanoid in later PRs
  const random = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * getDepthColor — returns the CSS class for nesting depth borders
 *
 * Cycles through 5 colors. Depth 5+ wraps back to depth 0.
 * This is our signature visual: each nesting level has a distinct color.
 */
export function getDepthBorderClass(depth: number): string {
  const normalizedDepth = depth % 5
  return `depth-border-${normalizedDepth}`
}
