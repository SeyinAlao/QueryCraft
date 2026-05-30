import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const base = [
  'inline-flex items-center justify-center gap-2',
  'font-medium leading-none',
  'rounded-[var(--radius-md)]',
  'transition-all duration-150',
  'cursor-pointer select-none',
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-1',
  'focus-visible:ring-offset-[var(--bg-base)]',
  'disabled:opacity-40 disabled:pointer-events-none',
].join(' ')

const variants: Record<Variant, string> = {
  primary: [
    'bg-[var(--brand)] text-[#080c14]',
    'hover:bg-[var(--brand-dim)]',
    'active:scale-[0.98]',
    'shadow-[0_0_16px_var(--brand-glow)]',
    'font-semibold',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
    'active:scale-[0.98]',
  ].join(' '),

  danger: [
    'bg-transparent text-[var(--danger)]',
    'hover:bg-[var(--danger-bg)]',
    'active:scale-[0.98]',
  ].join(' '),

  outline: [
    'bg-transparent text-[var(--text-primary)]',
    'border border-[var(--border-strong)]',
    'hover:border-[var(--brand)] hover:text-[var(--brand)]',
    'active:scale-[0.98]',
  ].join(' '),
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-8 px-3.5 text-sm',
  lg: 'h-10 px-5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          iconPosition === 'left' && icon
        )}
        {children}
        {!loading && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'
