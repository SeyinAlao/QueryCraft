import { describe, it, expect } from 'vitest'
import { cn, generateId, getDepthBorderClass } from '@/lib/utils'

describe('cn (class name utility)', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})

describe('generateId', () => {
  it('generates a rule-prefixed id by default', () => {
    const id = generateId()
    expect(id).toMatch(/^rule_/)
  })

  it('generates a group-prefixed id when specified', () => {
    const id = generateId('group')
    expect(id).toMatch(/^group_/)
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('getDepthBorderClass', () => {
  it('returns the correct depth class for depths 0-4', () => {
    for (let i = 0; i <= 4; i++) {
      expect(getDepthBorderClass(i)).toBe(`depth-border-${i}`)
    }
  })

  it('cycles back at depth 5', () => {
    expect(getDepthBorderClass(5)).toBe('depth-border-0')
    expect(getDepthBorderClass(7)).toBe('depth-border-2')
  })
})
