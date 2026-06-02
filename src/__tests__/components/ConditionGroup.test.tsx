import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQueryStore } from '@/store/queryStore'
import { ConditionGroup } from '@/components/query-builder/ConditionGroup'

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, layout, layoutId, ...props }: any, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: any) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

const TestContainer = () => {
  const root = useQueryStore((state) => state.root)
  return <ConditionGroup group={root} depth={0} isRoot={true} />
}

describe('<ConditionGroup /> UI Integration Canvas', () => {
  beforeEach(() => {
    useQueryStore.getState().resetQuery()
  })

  it('renders the core root logical container with active control buttons', () => {
    render(<TestContainer />)

    expect(screen.getByText('AND')).toBeInTheDocument()
    expect(screen.getByText('OR')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /Add Rule/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Group/i })).toBeInTheDocument()
  })

  it('spawns a new filter rule element on the DOM when clicking Add Rule', () => {
    render(<TestContainer />)

    const addRuleButton = screen.getByRole('button', { name: /Add Rule/i })
    fireEvent.click(addRuleButton)

    const inputs = screen.getAllByPlaceholderText(/Enter value.../i)
    expect(inputs).toHaveLength(1)
  })

  it('spawns a recursive nested child group card structure when clicking Add Group', () => {
    render(<TestContainer />)

    const addGroupButton = screen.getByRole('button', { name: /Add Group/i })
    fireEvent.click(addGroupButton)

    const ruleButtons = screen.getAllByRole('button', { name: 'Rule' })
    const groupButtons = screen.getAllByRole('button', { name: 'Group' })

    expect(ruleButtons).toHaveLength(2) 
    expect(groupButtons).toHaveLength(2)
  })

  it('updates state logical gating values when swapping matching strategy headers', () => {
    render(<TestContainer />)

    const orToggleSwitch = screen.getByText('OR')
    fireEvent.click(orToggleSwitch)

    expect(useQueryStore.getState().root.logic).toBe('OR')
  })

  it('clears rules out of the DOM tree upon clicking the rule delete action element', () => {
    const store = useQueryStore.getState()
    store.addRule(store.root.id) 

    render(<TestContainer />)

    expect(screen.getByPlaceholderText(/Enter value.../i)).toBeInTheDocument()

    const deleteButton = screen.getAllByRole('button', { name: /Remove/i })[0]
    fireEvent.click(deleteButton)

    expect(screen.queryByPlaceholderText(/Enter value.../i)).not.toBeInTheDocument()
  })
})