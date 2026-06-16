import { Suspense, lazy, useMemo, useState } from 'react'
import Header from './components/Header'
import ControlsBar, { type Filter } from './components/ControlsBar'
import ToolGrid from './components/ToolGrid'
import Footer from './components/Footer'
import AddToolDialog from './components/AddToolDialog'
import { addTool, getAllTools, removeTool, setOrder, toggleFavorite } from './lib/storage'
import type { Tool } from './types'

// WebGL background pulls in three.js — load it after the UI paints.
const Background = lazy(() => import('./components/Background'))

function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function App() {
  const [tools, setTools] = useState<Tool[]>(() => getAllTools())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const handleAdd = (data: { name: string; url: string; icon?: string; sub?: string }) => {
    setTools(addTool(data))
  }
  const handleRemove = (id: string) => setTools(removeTool(id))
  const handleToggleFav = (id: string) => setTools(toggleFavorite(id))
  const handleReorder = (next: Tool[]) => {
    setTools(next)
    setOrder(next.map((t) => t.id))
  }

  const favCount = useMemo(() => tools.filter((t) => t.favorite).length, [tools])

  const visibleTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools.filter((t) => {
      if (filter === 'fav' && !t.favorite) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        (t.sub?.toLowerCase().includes(q) ?? false) ||
        hostOf(t.url).toLowerCase().includes(q)
      )
    })
  }, [tools, query, filter])

  // 全件表示のときだけ並べ替え可（部分表示だと順序が壊れるため）
  const sortable = query.trim() === '' && filter === 'all'

  return (
    <>
      {/* Instant dark base so there is never a white flash while three.js loads */}
      <div className="fixed inset-0 -z-10 bg-ink" />
      <Suspense fallback={null}>
        <Background />
      </Suspense>
      <main className="relative z-10 flex min-h-screen flex-col">
        <Header count={tools.length} onAdd={() => setDialogOpen(true)} />
        <ControlsBar
          query={query}
          onQuery={setQuery}
          filter={filter}
          onFilter={setFilter}
          favCount={favCount}
        />
        {visibleTools.length > 0 ? (
          <ToolGrid
            tools={visibleTools}
            sortable={sortable}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onToggleFav={handleToggleFav}
          />
        ) : (
          <p className="mx-auto w-full max-w-6xl px-5 py-16 text-center text-sm text-white/45">
            {filter === 'fav' && query.trim() === ''
              ? '★ お気に入りはまだありません。カードの星アイコンで追加できます。'
              : '一致するツールが見つかりませんでした。'}
          </p>
        )}
        <div className="flex-1" />
        <Footer />
      </main>
      <AddToolDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleAdd} />
    </>
  )
}
