'use client'

import { cn } from '@/lib/utils'
import type { SchemaField, RuleValue } from '@/types/query'
import type { OperatorOption } from '@/engine/operatorConfig'

interface RuleValueInputProps {
  field: SchemaField
  operatorOption: OperatorOption
  value: RuleValue
  onChange: (value: RuleValue) => void
}

const inputBase = cn(
  'h-9 sm:h-8 text-sm px-3 w-full transition-all duration-150', 
  'bg-[var(--bg-base)] text-[var(--text-primary)]',
  'border border-[var(--border)] rounded-lg sm:rounded-[var(--radius-sm)]',
  'placeholder:text-[var(--text-muted)]',
  'focus:outline-none focus:border-[var(--brand)]',
  'focus:shadow-[0_0_0_2px_var(--brand-glow)]',
  'sm:w-64 max-w-full', 
)

export function RuleValueInput({
  field,
  operatorOption,
  value,
  onChange,
}: RuleValueInputProps) {
  if (!operatorOption.requiresValue) {
    return (
      <span className="text-xs text-[var(--text-muted)] italic px-2 flex items-center h-9 sm:h-8">
        no value needed
      </span>
    )
  }

  if (field.type === 'boolean') {
    const boolVal = value === true || value === 'true'
    return (
      <button
        type="button"
        onClick={() => onChange(!boolVal)}
        className={cn(
          'flex items-center gap-3 h-9 sm:h-8 w-full sm:w-auto px-3',
          'border border-[var(--border)] rounded-lg sm:rounded-[var(--radius-sm)]',
          'bg-[var(--bg-base)] text-sm font-medium transition-all duration-150',
          boolVal ? 'text-[var(--success)] border-[var(--success)]' : 'text-[var(--text-muted)]',
        )}
      >
        <span
          className={cn(
            'relative inline-flex h-4 w-7 rounded-full transition-colors duration-200 shrink-0',
            boolVal ? 'bg-[var(--success)]' : 'bg-[var(--border-strong)]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform duration-200 shadow-sm',
              boolVal ? 'translate-x-3.5' : 'translate-x-0.5',
            )}
          />
        </span>
        <span className="font-mono text-xs uppercase tracking-wider">{boolVal ? 'true' : 'false'}</span>
      </button>
    )
  }

  if (field.type === 'enum' && !operatorOption.requiresArray) {
    return (
      <select
        value={String(value ?? '')}
        onChange={e => onChange(e.target.value)}
        className={cn(inputBase, 'cursor-pointer')}
      >
        <option value="" disabled>Select value...</option>
        {field.enumOptions?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'enum' && operatorOption.requiresArray) {
    const selected = Array.isArray(value) ? (value as string[]) : []
    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter(v => v !== opt)
        : [...selected, opt]
      onChange(next)
    }
    return (
      <div className="flex flex-wrap gap-1.5 w-full">
        {field.enumOptions?.map(opt => (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              'px-2.5 py-1.5 sm:py-0.5 rounded-md sm:rounded text-xs font-mono transition-all duration-100 flex-grow sm:flex-grow-0 min-h-[34px] sm:min-h-0 flex items-center justify-center',
              selected.includes(opt)
                ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[rgba(6,182,212,0.4)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border-strong)]'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (operatorOption.requiresRange) {
    const range = Array.isArray(value) ? value as [number, number] : [0, 0]
    return (
      <div className="flex flex-row items-center gap-2 w-full">
        <input
          type={field.type === 'date' ? 'date' : 'number'}
          value={String(range[0] ?? '')}
          onChange={e => onChange([
            field.type === 'number' ? Number(e.target.value) : e.target.value,
            range[1],
          ] as RuleValue)}
          className={cn(inputBase, 'flex-1 sm:w-28')}
          placeholder="Min"
        />
        <span className="text-xs text-[var(--text-muted)] shrink-0 font-mono">to</span>
        <input
          type={field.type === 'date' ? 'date' : 'number'}
          value={String(range[1] ?? '')}
          onChange={e => onChange([
            range[0],
            field.type === 'number' ? Number(e.target.value) : e.target.value,
          ] as RuleValue)}
          className={cn(inputBase, 'flex-1 sm:w-28')}
          placeholder="Max"
        />
      </div>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      value={String(value ?? '')}
      onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      className={inputBase}
      placeholder={field.type === 'number' ? "Enter number..." : field.type === 'date' ? "" : "Enter value..."}
    />
  )
}