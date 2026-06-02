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
  const [activePanel, setPanel] = useState<Panel>(null)
  const [hasRun, setHasRun] = useState(false)
  const exportQuery = useQueryStore(s => s.exportQuery)
  const openPanel  = useCallback((p: Panel) => setPanel(p), [])
  const closePanel = useCallback(() => setPanel(null), [])
  const handleRun = useCallback(() => {
    setHasRun(true)
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
    'escape':       () => closePanel(),
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        onHistoryOpen={() => openPanel('history')}
        onPresetsOpen={() => openPanel('presets')}
        onImport={() => openPanel('import')}
        onExport={handleExport}
      />

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        <div className="flex-1 lg:flex-none lg:w-[58%] flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border)] overflow-hidden">
          <QueryBuilderPanel onRunQuery={handleRun} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <PreviewPanel hasRun={hasRun} />
        </div>

      </main>

      <HistoryPanel isOpen={activePanel === 'history'} onClose={closePanel} />
      <PresetsPanel isOpen={activePanel === 'presets'} onClose={closePanel} />
      <ImportModal  isOpen={activePanel === 'import'}  onClose={closePanel} />
    </div>
  )
}