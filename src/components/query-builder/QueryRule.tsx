'use client'

import { memo, useCallback } from 'react'
import { GripVertical, X, Hash, Type, Calendar, List, ToggleLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryStore } from '@/store/queryStore'
import { SCHEMA_MAP } from '@/schemas'
import { getOperatorsForType, getOperatorOption } from '@/engine/operatorConfig'
import { RuleValueInput } from './RuleValueInput'
import type { QueryRule as QueryRuleType } from '@/types/query'
import type { RuleValue } from '@/types/query'

interface QueryRuleProps {
  rule: QueryRuleType
  isDragging?: boolean
}

const FIELD_TYPE_ICONS = {
  string:  <Type size={11} />,
  number:  <Hash size={11} />,
  date:    <Calendar size={11} />,
  enum:    <List size={11} />,
  boolean: <ToggleLeft size={11} />,
}

export const QueryRule = memo(function QueryRule({ rule, isDragging }: QueryRuleProps) {
  const updateRule  = useQueryStore(s => s.updateRule)
  const removeNode  = useQueryStore(s => s.removeNode)
  const schemaId    = useQueryStore(s => s.activeSchemaId)

  const schema = SCHEMA_MAP[schemaId]
  const fields = schema?.fields ?? []
  const currentField = fields.find(f => f.key === rule.field) ?? fields[0]
  const operators = currentField ? getOperatorsForType(currentField.type) : []
  const currentOperator = getOperatorOption(currentField?.type ?? 'string', rule.operator)
    ?? operators[0]

  const handleFieldChange = useCallback((fieldKey: string) => {
    const newField = fields.find(f => f.key === fieldKey)
    if (!newField) return
    const newOperators = getOperatorsForType(newField.type)
    updateRule(rule.id, {
      field: fieldKey,
      operator: newOperators[0]?.value ?? 'equals',
      value: '',
    })
  }, [fields, rule.id, updateRule])

  const handleOperatorChange = useCallback((op: string) => {
    updateRule(rule.id, {
      operator: op as QueryRuleType['operator'],
      value: '', 
    })
  }, [rule.id, updateRule])

  const handleValueChange = useCallback((value: RuleValue) => {
    updateRule(rule.id, { value })
  }, [rule.id, updateRule])

  const handleRemove = useCallback(() => {
    removeNode(rule.id)
  }, [rule.id, removeNode])

  return (
    <div
      className={cn(
        'group flex items-center gap-2 p-2 pr-3',
        'rounded-[var(--radius-md)]',
        'bg-[var(--bg-tertiary)]',
        'border border-[var(--border-subtle)]',
        'hover:border-[var(--border)]',
        'transition-all duration-150',
        'animate-slide-down',
        isDragging && 'opacity-50 scale-[0.99] shadow-lg',
      )}
    >
      <button
        className={cn(
          'flex-shrink-0 h-6 w-5 flex items-center justify-center',
          'text-[var(--text-muted)] cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'rounded hover:text-[var(--text-secondary)]',
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical size={13} />
      </button>
      <div className="relative flex-shrink-0">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10">
          {currentField && FIELD_TYPE_ICONS[currentField.type]}
        </span>
        <select
          value={rule.field}
          onChange={e => handleFieldChange(e.target.value)}
          className={cn(
            'h-8 pl-7 pr-6 text-sm w-36',
            'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
            'border border-[var(--border)]',
            'rounded-[var(--radius-sm)]',
            'focus:outline-none focus:border-[var(--brand)]',
            'cursor-pointer transition-all duration-150',
            'appearance-none',
          )}
        >
          {fields.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none text-[10px]">▾</span>
      </div>

      <div className="relative flex-shrink-0">
        <select
          value={rule.operator}
          onChange={e => handleOperatorChange(e.target.value)}
          className={cn(
            'h-8 px-3 pr-7 text-sm w-40',
            'bg-[var(--bg-secondary)] text-[var(--logic-or)]',
            'border border-[var(--border)]',
            'rounded-[var(--radius-sm)]',
            'focus:outline-none focus:border-[var(--brand)]',
            'cursor-pointer transition-all duration-150',
            'appearance-none font-mono text-xs',
          )}
        >
          {operators.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none text-[10px]">▾</span>
      </div>

      <div className="flex-1 min-w-0">
        {currentField && currentOperator && (
          <RuleValueInput
            field={currentField}
            operatorOption={currentOperator}
            value={rule.value}
            onChange={handleValueChange}
          />
        )}
      </div>

      <button
        onClick={handleRemove}
        className={cn(
          'flex-shrink-0 h-6 w-6 flex items-center justify-center',
          'rounded-[var(--radius-sm)]',
          'text-[var(--text-muted)]',
          'hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]',
          'opacity-0 group-hover:opacity-100',
          'transition-all duration-150',
        )}
        aria-label="Remove condition"
      >
        <X size={13} />
      </button>
    </div>
  )
})
