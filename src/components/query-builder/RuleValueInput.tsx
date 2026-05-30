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
  'h-8 px-3 text-sm',
  'bg-[var(--bg-base)] text-[var(--text-primary)]',
  'border border-[var(--border)]',
  'rounded-[var(--radius-sm)]',
  'placeholder:text-[var(--text-muted)]',
  'focus:outline-none focus:border-[var(--brand)]',
  'focus:shadow-[0_0_0_2px_var(--brand-glow)]',
  'transition-all duration-150',
  'w-full min-w-0',
)

export function RuleValueInput({
  field,
  operatorOption,
  value,
  onChange,
}: RuleValueInputProps) {
  if (!operatorOption.requiresValue) {
    return (
      <span className="text-xs text-[var(--text-muted)] italic px-2 flex items-center">
        no value needed
      </span>
    )
  }

  if (field.type === 'boolean') {
    const boolVal = value === true || value === 'true'
    return (
      <button
        onClick={() => onChange(!boolVal)}
        className={cn(
          'flex items-center gap-2 h-8 px-3',
          'rounded-[var(--radius-sm)]',
          'border border-[var(--border)]',
          'bg-[var(--bg-base)]',
          'text-sm font-medium',
          'transition-all duration-150',
          boolVal ? 'text-[var(--success)]' : 'text-[var(--text-muted)]',
        )}
      >
        <span
          className={cn(
            'relative inline-flex h-4 w-7 rounded-full transition-colors duration-200',
            boolVal ? 'bg-[var(--success)]' : 'bg-[var(--border-strong)]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-3 w-3 rounded-full bg-white',
              'transition-transform duration-200 shadow-sm',
              boolVal ? 'translate-x-3.5' : 'translate-x-0.5',
            )}
          />
        </span>
        <span>{boolVal ? 'true' : 'false'}</span>
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
      <div className="flex flex-wrap gap-1 min-w-0 flex-1">
        {field.enumOptions?.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              'px-2 py-0.5 rounded text-xs font-mono transition-all duration-100',
              selected.includes(opt)
                ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[rgba(6,182,212,0.3)]'
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
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type={field.type === 'date' ? 'date' : 'number'}
          value={String(range[0] ?? '')}
          onChange={e => onChange([
            field.type === 'number' ? Number(e.target.value) : e.target.value,
            range[1],
          ] as RuleValue)}
          className={cn(inputBase, 'w-24')}
          placeholder="Min"
        />
        <span className="text-xs text-[var(--text-muted)] shrink-0">and</span>
        <input
          type={field.type === 'date' ? 'date' : 'number'}
          value={String(range[1] ?? '')}
          onChange={e => onChange([
            range[0],
            field.type === 'number' ? Number(e.target.value) : e.target.value,
          ] as RuleValue)}
          className={cn(inputBase, 'w-24')}
          placeholder="Max"
        />
      </div>
    )
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={String(value ?? '')}
        onChange={e => onChange(e.target.value)}
        className={inputBase}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={String(value ?? '')}
        onChange={e => onChange(Number(e.target.value))}
        className={inputBase}
        placeholder="Enter number..."
      />
    )
  }

  return (
    <input
      type="text"
      value={String(value ?? '')}
      onChange={e => onChange(e.target.value)}
      className={inputBase}
      placeholder="Enter value..."
    />
  )
}
