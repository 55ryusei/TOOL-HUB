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
  onReorder: (next: Tool[]) => void
  onRemove: (id: string) => void
}

export default function ToolGrid({ tools, onReorder, onRemove }: Props) {
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
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-5 pb-10 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>{activeTool ? <CardFace tool={activeTool} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}
