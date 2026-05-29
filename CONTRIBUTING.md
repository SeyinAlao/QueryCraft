# Contributing to QueryCraft

Thank you for your interest in contributing. This document outlines the standards and workflow for this project.

## Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/feature-name` | `feat/recursive-query-builder` |
| Bug Fix | `fix/bug-name` | `fix/group-collapse-animation` |
| Chore | `chore/chore-name` | `chore/update-dependencies` |
| Docs | `docs/doc-name` | `docs/architecture-overview` |
| Test | `test/test-name` | `test/query-engine-coverage` |
| Refactor | `refactor/refactor-name` | `refactor/condition-group-state` |

**Guidelines:**
- Lowercase letters only
- Hyphens to separate words (no underscores or spaces)
- Delete branches after merging into main

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Purpose |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that is not a fix or feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, config |
| `ci` | CI/CD configuration |

### Subject Line Rules
- Use imperative mood ("add" not "added")
- Don't capitalize the first letter
- No period at the end
- Limit to 50 characters

### Examples

✅ Good
```
feat(query-builder): add recursive condition group rendering
fix(store): resolve immutable update on deep nested groups
test(engine): add edge cases for empty group validation
```

❌ Bad
```
fixed stuff
updated code
WIP
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Commit with descriptive conventional commit messages
3. Push: `git push origin feat/your-feature`
4. Open a PR with the project PR template
5. Ensure all CI checks pass before requesting review
6. Use **Squash and Merge** to keep main history clean

## Code Standards

- All code must pass `npm run lint` and `npm run type-check`
- New features must include tests
- Components must be memoized appropriately
- No `any` types — use `unknown` or proper generics
- No direct console.log in production code

## Project Structure

```
src/
├── app/               # Next.js App Router pages and layouts
├── components/        # React components, organized by domain
│   ├── query-builder/ # Core recursive query builder UI
│   ├── preview/       # Query preview and results panels
│   ├── schema-selector/
│   └── ui/            # Shared design system components
├── store/             # Zustand state management
├── engine/            # Query generation, execution, validation
├── schemas/           # Data source schema definitions
├── types/             # All TypeScript type definitions
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── __tests__/         # Test files mirroring src structure
```
