'use client'

import { useState, useCallback } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { QueryBuilderPanel } from '@/components/query-builder/QueryBuilderPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { HistoryPanel } from '@/components/ui/HistoryPanel'
import { PresetsPanel } from '@/components/ui/PresetsPanel'
import { ImportModal } from '@/components/ui/ImportModal'
import { useQueryStore } from '@/store/queryStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

type Panel = 'history' | 'presets' | 'import' | null

export default function Home() {
  const [isDark, setIsDark]       = useState(true)
  const [activePanel, setPanel]   = useState<Panel>(null)
  const exportQuery               = useQueryStore(s => s.exportQuery)

  const openPanel  = useCallback((p: Panel) => setPanel(p), [])
  const closePanel = useCallback(() => setPanel(null), [])

  const handleThemeToggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('light', !next)
      return next
    })
  }, [])

  const handleExport = useCallback(() => {
    const json = exportQuery()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `querycraft-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportQuery])

  useKeyboardShortcuts({
    'ctrl+shift+h': () => openPanel(activePanel === 'history' ? null : 'history'),
    'ctrl+shift+p': () => openPanel(activePanel === 'presets' ? null : 'presets'),
    'ctrl+shift+i': () => openPanel(activePanel === 'import'  ? null : 'import'),
    'ctrl+shift+e': () => handleExport(),
    'escape':        () => closePanel(),
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        onHistoryOpen={() => openPanel('history')}
        onPresetsOpen={() => openPanel('presets')}
        onImport={() => openPanel('import')}
        onExport={handleExport}
      />

      <main className="flex flex-1 overflow-hidden">
        <div className="w-[58%] flex flex-col border-r border-[var(--border)] overflow-hidden">
          <QueryBuilderPanel />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewPanel />
        </div>
      </main>

      <HistoryPanel
        isOpen={activePanel === 'history'}
        onClose={closePanel}
      />
      <PresetsPanel
        isOpen={activePanel === 'presets'}
        onClose={closePanel}
      />
      <ImportModal
        isOpen={activePanel === 'import'}
        onClose={closePanel}
      />
    </div>
  )
}
