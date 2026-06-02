'use client'

import { memo, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { SCHEMA_MAP } from '@/schemas'
import { getOperatorsForType, getOperatorOption } from '@/engine/operatorConfig'
import { RuleValueInput } from './RuleValueInput'
import type { QueryRule as QR } from '@/types/query'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export const QueryRule = memo(function QueryRule({ rule }: { rule: QR }) {
  const updateRule     = useQueryStore(s => s.updateRule)
  const removeNode     = useQueryStore(s => s.removeNode)
  const activeSchemaId = useQueryStore(s => s.activeSchemaId)

  const schema    = SCHEMA_MAP[activeSchemaId]
  const fields    = schema?.fields ?? []
  const field     = fields.find(f => f.key === rule.field)
  const operators = field ? getOperatorsForType(field.type) : []
  const opOption  = field ? getOperatorOption(field.type, rule.operator) : undefined

  const handleField = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const nf = schema?.fields.find(f => f.key === e.target.value)
    if (!nf) return
    const ops = getOperatorsForType(nf.type)
    updateRule(rule.id, { field: e.target.value, operator: ops[0]?.value ?? 'equals', value: '' })
  }, [rule.id, schema, updateRule])

  const handleOperator = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRule(rule.id, { operator: e.target.value as QR['operator'], value: '' })
  }, [rule.id, updateRule])

  const handleValue = useCallback((v: QR['value']) => {
    updateRule(rule.id, { value: v })
  }, [rule.id, updateRule])

  return (
    <div 
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3',
        'sm:h-10 w-full',
        'bg-[var(--bg-base)] hover:bg-[var(--bg-hover)]',
        'border border-[var(--border-subtle)] hover:border-[var(--border)]',
        'rounded-xl sm:rounded-[var(--radius-md)]',
        'transition-all duration-150 group relative',
        'p-3 sm:p-0' 
      )}
      style={{
        paddingLeft: typeof window !== 'undefined' && window.innerWidth < 640 ? '12px' : '24px',
        paddingRight: typeof window !== 'undefined' && window.innerWidth < 640 ? '12px' : '12px',
        marginRight: typeof window !== 'undefined' && window.innerWidth < 640 ? '0px' : '24px'
      }}
    >
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 min-w-0 w-full sm:w-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <select
            value={rule.field}
            onChange={handleField}
            style={{ ...MONO, background: 'transparent' }}
            className="appearance-none border-none outline-none cursor-pointer text-[12px] font-medium text-[var(--brand)] w-24 sm:w-[130px] flex-shrink-0"
            aria-label="Field"
          >
            {fields.map(f => (
              <option key={f.key} value={f.key}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {f.label}
              </option>
            ))}
          </select>

          <span style={MONO} className="text-[var(--border-strong)] flex-shrink-0 mx-0.5">·</span>

          <select
            value={rule.operator}
            onChange={handleOperator}
            style={{ ...MONO, background: 'transparent' }}
            className="appearance-none border-none outline-none cursor-pointer text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] w-24 sm:w-[120px] flex-shrink-0 transition-colors"
            aria-label="Operator"
          >
            {operators.map(op => (
              <option key={op.value} value={op.value}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => removeNode(rule.id)}
          className="flex sm:hidden h-7 w-7 items-center justify-center text-[var(--text-dim)] active:text-[var(--danger)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md"
          aria-label="Remove Rule"
        >
          <X size={13} />
        </button>
      </div>

      <span style={MONO} className="text-[var(--border-strong)] flex-shrink-0 hidden sm:inline">·</span>

      <div className="flex-1 w-full min-w-0">
        {field && opOption ? (
          <RuleValueInput field={field} operatorOption={opOption} value={rule.value} onChange={handleValue} />
        ) : (
          <span style={MONO} className="text-[11px] text-[var(--text-dim)] flex items-center h-8">select a field</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => removeNode(rule.id)}
        className="hidden sm:flex flex-shrink-0 h-6 w-6 items-center justify-center text-[var(--text-dim)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-all duration-150 rounded cursor-pointer"
        aria-label="Remove"
      >
        <X size={12} />
      </button>
    </div>
  )
})