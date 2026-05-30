import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'and' | 'or'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
  success:  'bg-[var(--success-bg)] text-[var(--success)] border border-[rgba(16,185,129,0.2)]',
  warning:  'bg-[var(--logic-or-bg)] text-[var(--warning)] border border-[var(--logic-or-border)]',
  danger:   'bg-[var(--danger-bg)] text-[var(--danger)] border border-[rgba(244,63,94,0.2)]',
  brand:    'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[rgba(6,182,212,0.2)]',
  and:      'bg-[var(--logic-and-bg)] text-[var(--logic-and)] border border-[var(--logic-and-border)]',
  or:       'bg-[var(--logic-or-bg)] text-[var(--logic-or)] border border-[var(--logic-or-border)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5',
        'text-xs font-mono font-medium',
        'rounded-[var(--radius-sm)]',
        'leading-none whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
