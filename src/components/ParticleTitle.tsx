import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
  c: string
}

interface Props {
  text: string
  /** 表示高さ(px)。フォントサイズの目安。 */
  height?: number
}

/**
 * 文字をオフスクリーンに描画してピクセルをサンプリングし、
 * バラバラの粒子が集まってタイトルを形作る演出。以後はゆらゆら微振動。
 */
export default function ParticleTitle({ text, height = 110 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    let start = 0
    let disposed = false
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const build = () => {
      const parent = canvas.parentElement
      const cssW = parent ? parent.clientWidth : 800
      const cssH = height
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`

      // Render the text to sample its pixels.
      const fontPx = Math.floor(height * 0.66 * dpr)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `900 ${fontPx}px Orbitron, system-ui, sans-serif`
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)

      const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gap = Math.max(3, Math.floor(4 * dpr))
      const next: Particle[] = []
      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const alpha = img[(y * canvas.width + x) * 4 + 3]
          if (alpha > 128) {
            const mix = x / canvas.width
            const c =
              mix < 0.5
                ? `rgba(255, ${Math.floor(0 + mix * 90)}, ${Math.floor(60 + mix * 80)}, 1)`
                : `rgba(255, ${Math.floor(45 + (mix - 0.5) * 60)}, ${Math.floor(120 + (mix - 0.5) * 60)}, 1)`
            next.push({
              x: reduced ? x : Math.random() * canvas.width,
              y: reduced ? y : Math.random() * canvas.height,
              tx: x,
              ty: y,
              vx: 0,
              vy: 0,
              c,
            })
          }
        }
      }
      particles = next
    }

    const draw = (ts: number) => {
      if (disposed) return
      if (!start) start = ts
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const tSec = (ts - start) / 1000

      for (const pt of particles) {
        // spring toward target
        const ax = (pt.tx - pt.x) * 0.08
        const ay = (pt.ty - pt.y) * 0.08
        pt.vx = (pt.vx + ax) * 0.82
        pt.vy = (pt.vy + ay) * 0.82
        pt.x += pt.vx
        pt.y += pt.vy
        // idle shimmer once settled
        const jx = Math.sin(tSec * 2 + pt.tx * 0.05) * 0.6 * dpr
        const jy = Math.cos(tSec * 2 + pt.ty * 0.05) * 0.6 * dpr
        ctx.fillStyle = pt.c
        ctx.fillRect(pt.x + jx, pt.y + jy, 1.6 * dpr, 1.6 * dpr)
      }

      ctx.shadowColor = 'rgba(255,0,60,0.0)'
      raf = requestAnimationFrame(draw)
    }

    const init = () => {
      build()
      if (reduced) {
        // draw once, static
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const pt of particles) {
          ctx.fillStyle = pt.c
          ctx.fillRect(pt.tx, pt.ty, 1.6 * dpr, 1.6 * dpr)
        }
        return
      }
      raf = requestAnimationFrame(draw)
    }

    // Make sure Orbitron is ready so sampling matches the rendered title.
    const ready = (document as Document & { fonts?: FontFaceSet }).fonts
    if (ready && ready.load) {
      Promise.all([ready.load(`900 80px Orbitron`)])
        .catch(() => undefined)
        .finally(() => {
          if (!disposed) init()
        })
    } else {
      init()
    }

    const onResize = () => {
      if (disposed) return
      cancelAnimationFrame(raf)
      start = 0
      init()
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [text, height, reduced])

  return <canvas ref={canvasRef} aria-label={text} className="block w-full" />
}
