// ─────────────────────────────────────────────────────────────────────────────
// Operator Configuration
//
// Defines which operators are valid for each field type,
// and human-readable labels for each operator.
// The UI reads this — never hardcodes operators in components.
// ─────────────────────────────────────────────────────────────────────────────

import type { FieldType, Operator } from '@/types/query'

export interface OperatorOption {
  value: Operator
  label: string
  // Does this operator need a value input? is_null/is_not_null don't.
  requiresValue: boolean
  // Does this operator need TWO value inputs? (between)
  requiresRange: boolean
  // Does this operator need an array input? (in, not_in)
  requiresArray: boolean
}

const op = (
  value: Operator,
  label: string,
  opts: Partial<Omit<OperatorOption, 'value' | 'label'>> = {}
): OperatorOption => ({
  value,
  label,
  requiresValue: true,
  requiresRange: false,
  requiresArray: false,
  ...opts,
})

// ── All operator definitions ──────────────────────────────────────────────────

export const OPERATOR_OPTIONS: Record<FieldType, OperatorOption[]> = {
  string: [
    op('equals',       'equals'),
    op('not_equals',   'does not equal'),
    op('contains',     'contains'),
    op('not_contains', 'does not contain'),
    op('starts_with',  'starts with'),
    op('ends_with',    'ends with'),
    op('regex',        'matches regex'),
    op('is_null',      'is empty',    { requiresValue: false }),
    op('is_not_null',  'is not empty', { requiresValue: false }),
  ],
  number: [
    op('equals',      'equals'),
    op('not_equals',  'does not equal'),
    op('gt',          'greater than'),
    op('gte',         'greater than or equal'),
    op('lt',          'less than'),
    op('lte',         'less than or equal'),
    op('between',     'is between',  { requiresRange: true }),
    op('is_null',     'is empty',    { requiresValue: false }),
    op('is_not_null', 'is not empty', { requiresValue: false }),
  ],
  boolean: [
    op('equals',     'is'),
    op('not_equals', 'is not'),
  ],
  date: [
    op('equals',      'is'),
    op('not_equals',  'is not'),
    op('gt',          'is after'),
    op('gte',         'is on or after'),
    op('lt',          'is before'),
    op('lte',         'is on or before'),
    op('between',     'is between', { requiresRange: true }),
    op('is_null',     'is empty',   { requiresValue: false }),
    op('is_not_null', 'is not empty', { requiresValue: false }),
  ],
  enum: [
    op('equals',      'equals'),
    op('not_equals',  'does not equal'),
    op('in',          'is any of',    { requiresArray: true }),
    op('not_in',      'is none of',   { requiresArray: true }),
    op('is_null',     'is empty',     { requiresValue: false }),
    op('is_not_null', 'is not empty', { requiresValue: false }),
  ],
}

export function getOperatorsForType(type: FieldType): OperatorOption[] {
  return OPERATOR_OPTIONS[type] ?? OPERATOR_OPTIONS.string
}

export function getOperatorOption(type: FieldType, operator: Operator): OperatorOption | undefined {
  return getOperatorsForType(type).find(o => o.value === operator)
}
