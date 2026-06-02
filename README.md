cat > README.md << 'ENDREADME'
# QueryCraft — Visual Query Builder

> Build complex database queries visually. No SQL required.

[![Tests](https://img.shields.io/badge/tests-98%20passing-brightgreen)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](/)

## 🔗 Live Demo

**[querycraft.vercel.app](https://query-craft-zeta.vercel.app/)** — deployed on Vercel, auto-deploys on every PR merge

📹 **Demo Video**: [Watch 5-minute walkthrough](https://drive.google.com/file/d/1dTBKrxp0doqIRUOHDBbsoM3nKK1DYfWW/view?usp=sharing) 

---

## Overview

QueryCraft is a production-grade visual query builder. Users construct complex, nested database queries through a graphical interface — no raw SQL, MongoDB, or GraphQL syntax required. Every condition, group, and nesting level updates the live query preview in real time.

---

## Architecture

### Folder Structure

```text
src/
├── app/                              # Next.js 14 App Router
├── components/
│   ├── query-builder/                # Core recursive UI components
│   │   ├── ConditionGroup.tsx        # Recursive group renderer
│   │   ├── QueryRule.tsx             # Individual condition row
│   │   ├── RuleValueInput.tsx        # Schema-aware value inputs
│   │   ├── SortableNode.tsx          # DnD Kit drag wrapper
│   │   ├── AnimatedRule.tsx          # Framer Motion rule animations
│   │   └── AnimatedGroup.tsx         # Framer Motion group animations
│   │
│   ├── preview/
│   │   └── PreviewPanel.tsx          # Live SQL/MongoDB/GraphQL preview + results
│   │
│   └── ui/                           # Shared design system components
│
├── store/
│   └── queryStore.ts                 # Zustand recursive tree store
│
├── engine/
│   ├── queryGenerator.ts             # Tree → SQL / MongoDB / GraphQL
│   ├── queryExecutor.ts              # Filters mock dataset against tree
│   └── queryValidator.ts             # Type-aware operator validation
│
├── schemas/
│   └── index.ts                      # Users, Orders, Products schema definitions
│
├── types/
│   └── query.ts                      # All TypeScript types
│
├── hooks/
│   └── useKeyboardShortcuts.ts
│
└── tests/                            # Vitest test suite (98 tests)
```

## Recursive Rendering Strategy

The entire query builder is built on a single recursive discriminated union type:

```typescript
type QueryNode = QueryRule | QueryGroup

interface QueryGroup {
  id: string
  type: 'group'
  logic: 'AND' | 'OR'
  collapsed: boolean
  children: QueryNode[]  // ← THE RECURSIVE PART
}
```

`ConditionGroup` renders itself recursively. When it encounters a child of `type: 'group'`, it renders another `ConditionGroup`. When it encounters `type: 'rule'`, it renders a `QueryRule`. Depth is passed as a prop for visual differentiation (depth-colored left borders).
<ConditionGroup depth={0}>        ← Root
<QueryRule />
<ConditionGroup depth={1}>      ← Nested (same component)
<QueryRule />
<ConditionGroup depth={2}>    ← Deeper (same component again)
<QueryRule />
</ConditionGroup>
</ConditionGroup>
</ConditionGroup>

**Performance:** `React.memo` on both `ConditionGroup` and `QueryRule` prevents cascade re-renders. Only the changed node re-renders, not the entire tree.

---

## State Management

**Choice: Zustand** over Redux or Context.

Zustand was chosen because:
- No boilerplate reducers — mutations are plain functions
- `subscribeWithSelector` middleware allows components to subscribe to only the slice they need
- Recursive tree updates are cleaner with direct mutation patterns

### Core Tree Mutation Pattern

All mutations use a single `mapTree` recursive traversal:

```typescript
function mapTree(node: QueryNode, transform: (node: QueryNode) => QueryNode): QueryNode {
  const transformed = transform(node)
  if (transformed.type === 'group') {
    return {
      ...transformed,
      children: transformed.children.map(child => mapTree(child, transform)),
    }
  }
  return transformed
}
```

To update any node at any depth, we pass its ID. The traversal finds it and returns a new tree with structural sharing — unchanged nodes are not re-created.

### Store Actions
- `addRule(groupId)` — appends a new rule to a specific group
- `addGroup(groupId)` — appends a new nested group
- `removeNode(nodeId)` — recursive filter removes node at any depth
- `updateRule(ruleId, patch)` — partial update via mapTree
- `updateGroupLogic(groupId, logic)` — AND/OR toggle
- `moveNode(nodeId, targetGroupId, newIndex)` — used by DnD drop handler
- `exportQuery()` → JSON string, `importQuery(json)` → validates + applies

---

## Query Engine Design

Three generators share the same recursive traversal algorithm. Each walks the tree and builds its output format:

### SQL Generator
QueryGroup (AND) → "condition1 AND condition2"
QueryGroup (OR)  → "(condition1 OR condition2)"
QueryRule        → "FieldLabel operator value"

### MongoDB Generator
QueryGroup (AND) → { "$and": [...] }
QueryGroup (OR)  → { "$or": [...] }
QueryRule (equals) → { "field": value }
QueryRule (gt)   → { "field": { "$gt": value } }

### GraphQL Generator
QueryGroup (AND) → "and: [...]"
QueryGroup (OR)  → "or: [...]"
QueryRule        → "field: { eq: value }"

### Validator
The validation engine checks:
1. Field exists in active schema
2. Operator is valid for the field's type (e.g. `contains` blocked on `number`)
3. Between min < max
4. Non-root empty groups are flagged as errors
5. Missing values produce warnings (not hard errors)

---

## Performance Optimization

| Technique | Where Applied | Why |
|-----------|--------------|-----|
| `React.memo` | `ConditionGroup`, `QueryRule` | Prevents cascade re-renders on tree updates |
| Zustand shallow selectors | All components | Components only re-render when their slice changes |
| `useCallback` on handlers | All event handlers | Stable references prevent child re-renders |
| `useMemo` on query generation | `PreviewPanel` | Query only recomputed when tree or format changes |
| `AnimatePresence initial={false}` | Children list | Prevents entrance animations on initial render |
| DnD 8px activation constraint | `PointerSensor` | Prevents accidental drag on input click |

---

## Trade-offs

**Zustand vs Redux**
Redux DevTools offer better time-travel debugging for deep tree mutations. Chosen Zustand for reduced boilerplate and simpler recursive mutation patterns. Trade-off: slightly harder to debug complex tree mutations.

**Client-side execution**
The query simulator runs entirely in the browser against mock data. A production system would serialize the query AST and send it to a backend. Trade-off: limited to mock dataset size, but zero latency for the demo experience.

**Framer Motion for height animation**
Pure CSS cannot animate `height: 0 → auto`. Framer Motion's layout engine measures the natural height and interpolates. Trade-off: adds ~30kb to bundle. Alternative would be `max-height` CSS trick which causes animation timing issues.

**Inline styles for modal padding**
The `ImportModal` uses inline `style` props for critical layout padding rather than Tailwind utilities. This guarantees rendering regardless of Tailwind's build-time purge behavior with dynamic class names. Trade-off: slightly less readable than Tailwind, but 100% reliable.

---

## Getting Started

```bash
# Install
npm install

# Development
npm run dev

# Tests
npm test

# Build
npm run build

# Type check
npm run type-check
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+H` | Open History panel |
| `Ctrl+Shift+P` | Open Presets panel |
| `Ctrl+Shift+I` | Open Import modal |
| `Ctrl+Shift+E` | Export query as JSON |
| `Escape` | Close any open panel |

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 App Router | Required |
| Language | TypeScript strict | Type-safe recursive structures |
| Styling | Tailwind CSS + CSS variables | Design token system |
| State | Zustand | Recursive tree mutations |
| DnD | DnD Kit | Accessible, composable sensors |
| Animation | Framer Motion | Height: auto animation |
| Testing | Vitest + Testing Library | Native ESM, fast |
| Deployment | Vercel | PR preview deployments |
ENDREADME

git add README.md
git commit -m "docs(readme): add complete architecture documentation for final submission

- Architecture explanation with folder structure
- Recursive rendering strategy with code examples
- State management decisions and Zustand trade-offs
- Query engine design for SQL, MongoDB, GraphQL generators
- Performance optimization techniques table
- Trade-offs made with reasoning
- Keyboard shortcuts reference
- Tech stack with rationale"

git push -u origin docs/final-submission
