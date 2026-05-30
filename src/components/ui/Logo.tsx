
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { mark: 22, text: 'text-sm'  },
  md: { mark: 28, text: 'text-base' },
  lg: { mark: 38, text: 'text-xl'  },
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const { mark, text } = sizes[size]
  const gradId = `qc-grad-${size}`

  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <path
          d="M13 5 L7 5 L7 31 L13 31"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <line x1="14" y1="12" x2="28" y2="12"
          stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="14" y1="18" x2="24" y2="18"
          stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
        <line x1="14" y1="24" x2="20" y2="24"
          stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
        <circle cx="30" cy="27" r="3"
          fill={`url(#${gradId})`} />

        <line x1="28" y1="29" x2="24" y2="33"
          stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </svg>

      {showText && (
        <span
          className={cn('leading-none tracking-tight', text)}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            query
          </span>
          <span
            style={{
              color: 'var(--brand)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            craft
          </span>
        </span>
      )}
    </div>
  )
}
