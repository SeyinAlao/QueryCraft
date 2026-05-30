'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SortableNodeProps {
  id: string
  children: ReactNode
}

export function SortableNode({ id, children }: SortableNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-2 group/sortable',
        isDragging && 'opacity-50 z-50',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 mt-[11px]',
          'h-5 w-4 flex items-center justify-center',
          'text-[var(--text-muted)] rounded',
          'opacity-0 group-hover/sortable:opacity-100',
          'hover:text-[var(--text-secondary)]',
          'transition-opacity duration-150',
          'cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-100',
        )}
        aria-label="Drag to reorder"
        onPointerDown={e => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
