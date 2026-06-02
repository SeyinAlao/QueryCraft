'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import { SCHEMAS } from '@/schemas'
import { useQueryStore } from '@/store/queryStore'

interface NavbarProps {
  onHistoryOpen: () => void
  onPresetsOpen: () => void
  onImport: () => void
  onExport: () => void
}

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

function ShortcutTip({ label, shortcut, onClick }: {
  label: string
  shortcut?: string
  onClick: () => void
}) {
  return (
    <div className="relative flex-shrink-0 group">
      <button
        onClick={onClick}
        style={MONO}
        className="h-9 px-5 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap flex-shrink-0 font-medium"
      >
        {label}
      </button>
      
      {shortcut && (
        <div 
          style={MONO} 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 whitespace-nowrap shadow-[var(--shadow-md)]">
            <span className="text-[11px] text-[var(--text-muted)] tracking-wider">
              {shortcut}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar({ onHistoryOpen, onPresetsOpen, onImport, onExport }: NavbarProps) {
  const activeSchemaId  = useQueryStore(s => s.activeSchemaId)
  const setActiveSchema = useQueryStore(s => s.setActiveSchema)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => setMounted(true), [])
  const isDark = theme === 'dark'

  return (
    <header className={cn(
      'h-16 flex items-center justify-between px-4 sm:px-6 gap-4 sm:gap-8',
      'border-b border-[var(--border)]',
      'bg-[var(--bg-secondary)]',
      'sticky top-0 z-50 flex-shrink-0 relative',
    )}>

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Logo size="sm" />
        <span style={MONO} className="text-[11px] text-[var(--text-dim)] hidden lg:block tracking-wide flex-shrink-0">
          // v1.0
        </span>
      </div>

      <nav className="flex items-center justify-start md:justify-center gap-2 sm:gap-4 flex-shrink-0 overflow-x-auto no-scrollbar max-w-[50vw] md:max-w-none mask-edges px-2">
        {SCHEMAS.map(s => {
          const active = s.id === activeSchemaId
          return (
            <button
              key={s.id}
              onClick={() => setActiveSchema(s.id)}
              style={MONO}
              className={cn(
                'uppercase tracking-[0.06em] rounded-lg transition-all duration-150 flex items-center justify-center h-9 min-w-[90px] sm:min-w-[110px] px-3 sm:px-4 text-[10px] sm:text-[11px] cursor-pointer select-none shadow-sm active:scale-[0.97] border flex-shrink-0',
                active
                  ? 'text-[var(--brand)] bg-[var(--brand-subtle)] border-[var(--brand)] font-semibold'
                  : 'text-[var(--text-muted)] bg-[var(--bg-base)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] font-medium',
              )}
            >
              {s.name}
            </button>
          )
        })}
      </nav>
      <div className="hidden md:flex flex-1 items-center gap-2 justify-end min-w-0">
        <ShortcutTip label="History" shortcut="Ctrl+Shift+H" onClick={onHistoryOpen} />
        <ShortcutTip label="Presets" shortcut="Ctrl+Shift+P" onClick={onPresetsOpen} />
        <div className="w-px h-4 bg-[var(--border)] mx-2 flex-shrink-0" />
        <ShortcutTip label="Import" shortcut="Ctrl+Shift+I" onClick={onImport} />
        <ShortcutTip label="Export" shortcut="Ctrl+Shift+E" onClick={onExport} />
        <div className="w-px h-4 bg-[var(--border)] mx-2 flex-shrink-0" />
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="h-9 w-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-150 cursor-pointer flex-shrink-0"
          aria-label="Toggle theme"
        >
          {mounted ? (isDark ? <Sun size={15} /> : <Moon size={15} />) : <span className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex md:hidden items-center justify-end flex-1">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-base)] border border-[var(--border)] rounded-lg transition-all"
        >
          {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] flex flex-col md:hidden shadow-lg p-4 gap-2 z-50">
          <button onClick={() => { onHistoryOpen(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-3 text-[12px] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md">History</button>
          <button onClick={() => { onPresetsOpen(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-3 text-[12px] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md">Presets</button>
          <button onClick={() => { onImport(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-3 text-[12px] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md">Import</button>
          <button onClick={() => { onExport(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-3 text-[12px] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md">Export</button>
          <div className="h-px bg-[var(--border)] my-1" />
          <button 
            onClick={() => { setTheme(isDark ? 'light' : 'dark'); setIsMobileMenuOpen(false); }} 
            className="flex items-center gap-3 px-4 py-3 text-[12px] font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md"
          >
            {mounted ? (isDark ? <Sun size={14} /> : <Moon size={14} />) : null}
            Toggle Theme
          </button>
        </div>
      )}
    </header>
  )
}