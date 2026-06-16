import { motion } from 'framer-motion'
import { Search, Star, X } from 'lucide-react'

export type Filter = 'all' | 'fav'

interface Props {
  query: string
  onQuery: (v: string) => void
  filter: Filter
  onFilter: (f: Filter) => void
  favCount: number
}

export default function ControlsBar({ query, onQuery, filter, onFilter, favCount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mx-auto mb-5 flex w-full max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center"
    >
      {/* search box */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="ツールを検索…"
          className="input"
          style={{ paddingLeft: 36, paddingRight: query ? 36 : 12 }}
        />
        {query && (
          <button
            aria-label="クリア"
            onClick={() => onQuery('')}
            className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* filter chips */}
      <div className="flex shrink-0 gap-2">
        <Chip active={filter === 'all'} onClick={() => onFilter('all')}>
          すべて
        </Chip>
        <Chip active={filter === 'fav'} onClick={() => onFilter('fav')}>
          <Star size={13} fill={filter === 'fav' ? '#fcd34d' : 'none'} />
          お気に入り
          <span className="font-mono text-[11px] opacity-70">{favCount}</span>
        </Chip>
      </div>
    </motion.div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`clip-angular flex items-center gap-1.5 px-4 py-2 font-display text-xs font-bold tracking-wider transition ${
        active
          ? 'bg-gradient-to-r from-rog-red to-rog-magenta text-white'
          : 'glass text-white/60 hover:text-white'
      }`}
      style={active ? { boxShadow: '0 0 18px rgba(255,0,60,0.35)' } : undefined}
    >
      {children}
    </button>
  )
}
