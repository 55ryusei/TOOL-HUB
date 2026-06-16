import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import type { Tool } from '../types'
import ToolCard, { CardFace } from './ToolCard'

interface Props {
  tools: Tool[]
  /** true のときだけドラッグ並べ替え可（検索・絞り込み中は false）。 */
  sortable: boolean
  onReorder: (next: Tool[]) => void
  onRemove: (id: string) => void
  onToggleFav: (id: string) => void
}

const GRID = 'mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-5 pb-10 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4'

export default function ToolGrid({ tools, sortable, onReorder, onRemove, onToggleFav }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    // 8px 動かすまではドラッグ開始しない＝その場クリックは「開く」になる
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const handleEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = tools.findIndex((t) => t.id === active.id)
    const to = tools.findIndex((t) => t.id === over.id)
    if (from === -1 || to === -1) return
    onReorder(arrayMove(tools, from, to))
  }

  // 検索・絞り込み中はドラッグ無効。普通のグリッドとして描画。
  if (!sortable) {
    return (
      <div className={GRID}>
        {tools.map((tool) => (
          <CardFace
            key={tool.id}
            tool={tool}
            onOpen={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}
            onRemove={onRemove}
            onToggleFav={onToggleFav}
          />
        ))}
      </div>
    )
  }

  const activeTool = tools.find((t) => t.id === activeId) ?? null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={tools.map((t) => t.id)} strategy={rectSortingStrategy}>
        <div className={GRID}>
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onRemove={onRemove} onToggleFav={onToggleFav} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>{activeTool ? <CardFace tool={activeTool} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}
