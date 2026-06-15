import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-6xl justify-center px-5 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        whileHover={{ scale: 1.04 }}
        className="clip-angular glass carbon group relative flex items-center gap-3 px-5 py-2.5"
        style={{ boxShadow: '0 0 0 1px rgba(255,0,60,0.4), 0 0 22px rgba(255,0,60,0.18)' }}
      >
        {/* pulsing core dot */}
        <motion.span
          className="h-2 w-2 rounded-full bg-rog-red"
          style={{ boxShadow: '0 0 10px rgba(255,0,60,0.9)' }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-display text-[10px] tracking-[0.4em] text-white/45">
          POWERED BY
        </span>
        <span
          className="bg-gradient-to-r from-rog-red to-rog-magenta bg-clip-text font-display text-sm font-black tracking-[0.25em] text-transparent neon-text"
        >
          SWIFTRAPTOR
        </span>
      </motion.div>
    </footer>
  )
}
