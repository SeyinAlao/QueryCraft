
export type LogicOperator = 'AND' | 'OR'

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'regex'

export type RuleValue =
  | string
  | number
  | boolean
  | Date
  | [number, number]   
  | [string, string]    
  | string[]           
  | number[]             
  | null               

export interface QueryRule {
  id: string
  type: 'rule'
  field: string       
  operator: Operator
  value: RuleValue
}

export interface QueryGroup {
  id: string
  type: 'group'
  logic: LogicOperator
  collapsed: boolean    
  children: QueryNode[] 
}

export type QueryNode = QueryRule | QueryGroup

export interface SchemaField {
  key: string          
  label: string        
  type: FieldType
  enumOptions?: string[]  
  description?: string  
}

export interface Schema {
  id: string
  name: string        
  description: string
  fields: SchemaField[]
}

export interface QueryState {
  root: QueryGroup
  activeSchemaId: string
}

export interface QuerySnapshot {
  id: string
  name: string
  description?: string
  root: QueryGroup
  schemaId: string
  createdAt: Date
}

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationError {
  nodeId: string         
  message: string
  severity: ValidationSeverity
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export type QueryFormat = 'sql' | 'mongodb' | 'graphql'

export interface GeneratedQuery {
  format: QueryFormat
  output: string         
  generatedAt: Date
}
