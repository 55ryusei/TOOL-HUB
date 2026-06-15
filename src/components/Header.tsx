import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import ParticleTitle from './ParticleTitle'

interface Props {
  count: number
  onAdd: () => void
}

export default function Header({ count, onAdd }: Props) {
  return (
    <header className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-6 sm:pt-16">
      {/* HUD top line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-4 flex items-center gap-3 text-[11px] tracking-[0.35em] text-rog-magenta/70"
        style={{ transformOrigin: 'left' }}
      >
        <span className="font-display">// REPUBLIC OF TOOLS</span>
        <span className="h-px flex-1 bg-gradient-to-r from-rog-red/60 to-transparent" />
        <span className="font-display text-white/50">{count} MODULES</span>
      </motion.div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <ParticleTitle text="TOOL HUB" />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-2 text-sm text-white/55"
          >
            自作ツールを、ここからワンタップで。
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="clip-angular glass group relative flex shrink-0 items-center gap-2 px-5 py-3 font-display text-sm font-bold tracking-wider text-white"
          style={{ boxShadow: '0 0 0 1px rgba(255,0,60,0.5), 0 0 24px rgba(255,0,60,0.25)' }}
        >
          <Plus size={18} className="text-rog-red transition-transform group-hover:rotate-90" />
          ツールを追加
        </motion.button>
      </div>
    </header>
  )
}
