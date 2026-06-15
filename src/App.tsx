import { Suspense, lazy, useState } from 'react'
import Header from './components/Header'
import ToolGrid from './components/ToolGrid'
import Footer from './components/Footer'
import AddToolDialog from './components/AddToolDialog'
import { addTool, getAllTools, removeTool, setOrder } from './lib/storage'
import type { Tool } from './types'

// WebGL background pulls in three.js — load it after the UI paints.
const Background = lazy(() => import('./components/Background'))

export default function App() {
  const [tools, setTools] = useState<Tool[]>(() => getAllTools())
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAdd = (data: { name: string; url: string; icon?: string; sub?: string }) => {
    setTools(addTool(data))
  }

  const handleRemove = (id: string) => {
    setTools(removeTool(id))
  }

  const handleReorder = (next: Tool[]) => {
    setTools(next)
    setOrder(next.map((t) => t.id))
  }

  return (
    <>
      {/* Instant dark base so there is never a white flash while three.js loads */}
      <div className="fixed inset-0 -z-10 bg-ink" />
      <Suspense fallback={null}>
        <Background />
      </Suspense>
      <main className="relative z-10 flex min-h-screen flex-col">
        <Header count={tools.length} onAdd={() => setDialogOpen(true)} />
        <ToolGrid tools={tools} onReorder={handleReorder} onRemove={handleRemove} />
        <div className="flex-1" />
        <Footer />
      </main>
      <AddToolDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleAdd} />
    </>
  )
}
