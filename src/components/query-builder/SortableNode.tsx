'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function SortableNode({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 group/drag',
        isDragging && 'opacity-40 z-50 shadow-[var(--shadow-md)]',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 w-5 h-10 flex items-center justify-center',
          'text-[var(--text-dim)] hover:text-[var(--text-muted)]',
          'opacity-0 group-hover/drag:opacity-100',
          'cursor-grab active:cursor-grabbing',
          'transition-opacity duration-150',
          'touch-none', 
          isDragging && 'opacity-100',
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical size={13} />
      </div>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
