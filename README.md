# QueryCraft — Visual Query Builder

> Build complex database queries visually. No raw syntax required.

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-vitest-green)](https://vitest.dev)

## Live Demo

🔗 **[querycraft.vercel.app](https://querycraft.vercel.app)** _(deployed after PR #1)_

## Overview

QueryCraft is a production-grade visual query builder that lets users construct complex, nested database queries through an intuitive graphical interface — no raw SQL, MongoDB, or GraphQL syntax required.

Built for the challenge of recursive UI engineering, complex state management, and schema-driven rendering.

---

## Architecture

### Recursive Query Tree

The core data structure is a recursive tree of nodes:

```typescript
type QueryNode = QueryRule | QueryGroup

interface QueryGroup {
  id: string
  type: 'group'
  logic: 'AND' | 'OR'
  collapsed: boolean
  children: QueryNode[]  // ← Recursive
}

interface QueryRule {
  id: string
  type: 'rule'
  field: string
  operator: Operator
  value: unknown
}
```

This unified recursive type drives everything: rendering, generation, validation, and state.

### Recursive Rendering Strategy

`ConditionGroup` renders itself recursively. When it encounters a child node of type `'group'`, it renders another `ConditionGroup`. When it encounters `'rule'`, it renders a `QueryRule`. Depth is passed as a prop for visual differentiation.

```
<ConditionGroup depth={0}>        ← Root group
  <QueryRule />
  <QueryRule />
  <ConditionGroup depth={1}>      ← Nested group (same component)
    <QueryRule />
    <ConditionGroup depth={2}>    ← Deeper nesting
      <QueryRule />
    </ConditionGroup>
  </ConditionGroup>
</ConditionGroup>
```

### State Management

Zustand store with normalized tree. All mutations are recursive tree traversals with structural sharing (immutable updates). No context providers needed — components subscribe to only the slice they need.

### Query Generation

Three generators share the same recursive traversal algorithm:
- `generateSQL` → `SELECT * FROM table WHERE ...`
- `generateMongo` → `{ "$and": [...] }`
- `generateGraphQL` → `filter: { and: [...] }`

### Schema-Driven Rendering

Each schema field declares its type. The engine resolves:
- Valid operators for that type
- Correct value input component
- Validation rules

### Performance

- `React.memo` on `QueryRule` and `ConditionGroup`
- Zustand selectors with shallow equality
- `useMemo` for query generation
- Stable `nanoid` keys prevent key thrashing on reorder

---

## Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js 14 (App Router) | Required |
| Language | TypeScript (strict) | Type safety on recursive structures |
| Styling | Tailwind CSS + custom tokens | Design system control |
| State | Zustand | Simple API, great for recursive updates |
| DnD | DnD Kit | Accessible, composable |
| Animation | Framer Motion | Smooth group transitions |
| Testing | Vitest + Testing Library | Fast, ESM-native |
| Deployment | Vercel | PR preview deployments |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Trade-offs

- **Zustand over Redux**: Redux would offer better devtools for deep tree debugging, but Zustand's simpler API reduces boilerplate significantly for a recursive tree structure
- **Client-side execution**: Query execution is fully client-side for the simulator. A real system would send the query AST to a backend
- **Unlimited nesting depth**: We support it but warn users beyond depth 5 for UX clarity

---

## Project Structure

```
src/
├── app/               # Next.js App Router
├── components/
│   ├── query-builder/ # Core recursive UI
│   ├── preview/       # Live query preview
│   ├── schema-selector/
│   └── ui/            # Shared components
├── store/             # Zustand state
├── engine/            # Query generation, execution, validation
├── schemas/           # Data source definitions
├── types/             # TypeScript types
├── hooks/             # Custom hooks
├── lib/               # Utilities
└── __tests__/         # Tests
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, and PR workflow.
