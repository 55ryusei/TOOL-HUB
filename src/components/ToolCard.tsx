import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowUpRight, X } from 'lucide-react'
import type { Tool } from '../types'

/** HUD corner bracket */
function Corner({ className }: { className: string }) {
  return <span className={`pointer-events-none absolute h-3 w-3 border-rog-red/70 ${className}`} />
}

/**
 * 見た目だけのカード（並べ替え中の DragOverlay でも再利用する）。
 */
export function CardFace({
  tool,
  onRemove,
  overlay = false,
}: {
  tool: Tool
  onRemove?: (id: string) => void
  overlay?: boolean
}) {
  return (
    <div
      className={`clip-angular glass carbon scanline group relative flex aspect-[4/3] select-none flex-col justify-between overflow-hidden p-5 ${
        overlay ? 'scale-105' : 'cursor-pointer'
      }`}
      style={
        overlay
          ? {
              boxShadow:
                'inset 0 0 0 1px rgba(255,45,120,0.9), 0 0 34px rgba(255,0,60,0.55), 0 0 70px rgba(255,45,120,0.3)',
            }
          : undefined
      }
    >
      {/* neon border */}
      <span
        className="pointer-events-none absolute inset-0 clip-angular"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,0,60,0.45)' }}
      />
      {/* hover glow border */}
      <span
        className="pointer-events-none absolute inset-0 clip-angular opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(255,45,120,0.9), 0 0 28px rgba(255,0,60,0.45), 0 0 60px rgba(255,45,120,0.25)',
        }}
      />

      <Corner className="left-2 top-2 border-l border-t" />
      <Corner className="right-2 top-2 border-r border-t" />
      <Corner className="bottom-2 left-2 border-b border-l" />
      <Corner className="bottom-2 right-2 border-b border-r" />

      <div className="flex items-start justify-between">
        <span className="text-4xl drop-shadow-[0_0_10px_rgba(255,0,60,0.5)]">
          {tool.icon ?? '🔗'}
        </span>
        <ArrowUpRight
          size={20}
          className="text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rog-red"
        />
      </div>

      <div>
        <h3 className="font-display text-lg font-bold leading-tight text-white group-hover:neon-text">
          {tool.name}
        </h3>
        {tool.sub && <p className="mt-1 truncate text-xs text-white/45">{tool.sub}</p>}
      </div>

      {!overlay && tool.source === 'user' && onRemove && (
        <button
          aria-label="削除"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tool.id)
          }}
          className="absolute right-2.5 top-2.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white/60 opacity-0 transition hover:bg-rog-red hover:text-white group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}

interface Props {
  tool: Tool
  onRemove: (id: string) => void
}

/**
 * スマホのアイコン移動のように、掴むと他のタイルが避けて並び替わる sortable カード。
 * 小さく動かす＝ドラッグ、その場でクリック＝ツールを開く（activationConstraint で区別）。
 */
export default function ToolCard({ tool, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tool.id,
  })

  const open = () => window.open(tool.url, '_blank', 'noopener,noreferrer')

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
      role="button"
      tabIndex={0}
    >
      <CardFace tool={tool} onRemove={onRemove} />
    </div>
  )
}
