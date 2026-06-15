import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { isValidUrl } from '../lib/storage'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; url: string; icon?: string; sub?: string }) => void
}

const EMOJI_CHOICES = ['🔗', '🛠', '📊', '💬', '🗂', '📅', '✉️', '🧮', '🎨', '⚙️', '📝', '🚀']

export default function AddToolDialog({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('🔗')
  const [sub, setSub] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setUrl('')
      setIcon('🔗')
      setSub('')
      setTouched(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const nameOk = name.trim().length > 0
  const urlOk = isValidUrl(url)
  const canSubmit = nameOk && urlOk

  const submit = () => {
    setTouched(true)
    if (!canSubmit) return
    onSubmit({ name, url, icon, sub })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="clip-angular glass carbon relative w-full max-w-md p-6"
            style={{ boxShadow: '0 0 0 1px rgba(255,0,60,0.5), 0 0 40px rgba(255,0,60,0.3)' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-wider text-white neon-text">
                ADD TOOL
              </h2>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="名前 *">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：勤務計算ツール"
                  className="input"
                />
                {touched && !nameOk && <Err>名前を入力してください</Err>}
              </Field>

              <Field label="リンク (URL) *">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="例：tool.example.com"
                  className="input"
                />
                {touched && !urlOk && <Err>有効なURLを入力してください</Err>}
              </Field>

              <Field label="補足 (任意)">
                <input
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  placeholder="例：勤怠の集計用"
                  className="input"
                />
              </Field>

              <Field label="アイコン (任意)">
                <div className="flex flex-wrap gap-2">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      onClick={() => setIcon(e)}
                      className={`grid h-9 w-9 place-items-center rounded-md text-xl transition ${
                        icon === e
                          ? 'bg-rog-red/30 ring-1 ring-rog-red'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="clip-angular mt-6 w-full bg-gradient-to-r from-rog-red to-rog-magenta py-3 font-display font-bold tracking-wider text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              追加する
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/60">{label}</span>
      {children}
    </label>
  )
}

function Err({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-xs text-rog-red">{children}</span>
}
