'use client'

import { useState, useCallback } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { QueryBuilderPanel } from '@/components/query-builder/QueryBuilderPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { useQueryStore } from '@/store/queryStore'

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const exportQuery = useQueryStore(s => s.exportQuery)

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
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'querycraft-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [exportQuery])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        onHistoryOpen={() => {}}
        onPresetsOpen={() => {}}
        onImport={() => {}}
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
    </div>
  )
}
