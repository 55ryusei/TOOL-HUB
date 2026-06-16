import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowUpRight, X, Star } from 'lucide-react'
import type { Tool } from '../types'

/** HUD corner bracket */
function Corner({ className }: { className: string }) {
  return <span className={`pointer-events-none absolute h-3 w-3 border-rog-red/70 ${className}`} />
}

interface FaceProps {
  tool: Tool
  onOpen?: () => void
  onToggleFav?: (id: string) => void
  onRemove?: (id: string) => void
  overlay?: boolean
}

/** カードの見た目＋操作（クリックで開く・★お気に入り・削除）。DragOverlay でも再利用。 */
export function CardFace({ tool, onOpen, onToggleFav, onRemove, overlay = false }: FaceProps) {
  const interactive = !overlay
  return (
    <div
      onClick={interactive ? onOpen : undefined}
      onKeyDown={
        interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onOpen?.() : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`clip-angular glass carbon scanline group relative flex aspect-[4/3] select-none flex-col justify-between overflow-hidden p-5 outline-none ${
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

      {/* top-right actions: favorite + delete */}
      {interactive && (
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1">
          {onRemove && (
            <button
              aria-label="削除"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(tool.id)
              }}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white/55 opacity-0 transition hover:bg-rog-red hover:text-white group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          )}
          {onToggleFav && (
            <button
              aria-label={tool.favorite ? 'お気に入り解除' : 'お気に入りに追加'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFav(tool.id)
              }}
              className={`grid h-7 w-7 place-items-center rounded-full bg-black/50 transition hover:bg-black/70 ${
                tool.favorite
                  ? 'text-amber-300 opacity-100'
                  : 'text-white/55 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={14} fill={tool.favorite ? '#fcd34d' : 'none'} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start">
        <span className="text-4xl drop-shadow-[0_0_10px_rgba(255,0,60,0.5)]">
          {tool.icon ?? '🔗'}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold leading-tight text-white group-hover:neon-text">
            {tool.name}
          </h3>
          {tool.sub && <p className="mt-1 truncate text-xs text-white/45">{tool.sub}</p>}
        </div>
        <ArrowUpRight
          size={20}
          className="shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rog-red"
        />
      </div>
    </div>
  )
}

interface Props {
  tool: Tool
  onRemove: (id: string) => void
  onToggleFav: (id: string) => void
}

/**
 * スマホのアイコン移動のように、掴むと他のタイルが避けて並び替わる sortable カード。
 * 小さく動かす＝ドラッグ、その場でクリック＝ツールを開く（activationConstraint で区別）。
 */
export default function ToolCard({ tool, onRemove, onToggleFav }: Props) {
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
    >
      <CardFace tool={tool} onOpen={open} onRemove={onRemove} onToggleFav={onToggleFav} />
    </div>
  )
}
