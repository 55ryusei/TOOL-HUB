// Dependency-free PNG icon generator (pure Node + zlib).
// Draws a ROG-style emblem: angular hex ring + 2x2 launcher squares, red→magenta neon.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const RED = [1.0, 0.0, 0.235]
const MAG = [1.0, 0.176, 0.471]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const add = (a, b) => a.map((v, i) => v + b[i])
const mul = (a, s) => a.map((v) => v * s)

// margin: maskable needs content inside the safe center (~0.7)
function color(nx, ny, scale) {
  const r = Math.hypot(nx, ny)
  let col = [0.035, 0.035, 0.047]
  col = add(col, mul(RED, 0.14 * Math.exp(-r * 1.6)))

  const grad = mix(RED, MAG, clamp((nx + 1) / 2, 0, 1))

  // Hexagon ring (flat-top SDF)
  const ax = Math.abs(nx) * scale
  const ay = Math.abs(ny) * scale
  const hex = Math.max(ax * 0.866025 + ay * 0.5, ay) - 0.62
  const ring = 1 - smoothstep(0.0, 0.055, Math.abs(hex))
  col = add(col, mul(grad, ring))
  // inner fill glow
  const inner = smoothstep(0.18, -0.05, hex)
  col = add(col, mul(grad, inner * 0.12))

  // 2x2 launcher squares
  const q = 0.2
  const s = 0.115
  const centers = [
    [-q, -q],
    [q, -q],
    [-q, q],
    [q, q],
  ]
  let sq = 0
  let glow = 0
  for (const [cx, cy] of centers) {
    const dx = Math.abs(nx * scale - cx) - s
    const dy = Math.abs(ny * scale - cy) - s
    const d = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
    if (dx < 0 && dy < 0) sq = 1
    glow = Math.max(glow, Math.exp(-d * 26))
  }
  col = add(col, mul([1.0, 0.95, 0.98], sq))
  col = add(col, mul(grad, glow * 0.5))

  // vignette
  col = mul(col, smoothstep(1.35, 0.2, r) * 0.5 + 0.5)
  return col
}

function render(size) {
  // scale content slightly smaller so it sits in maskable safe zone
  const scale = 1.18
  const data = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * 2 - 1
      const ny = (y / size) * 2 - 1
      const c = color(nx, ny, scale)
      const i = (y * size + x) * 4
      data[i] = clamp(Math.round(c[0] * 255), 0, 255)
      data[i + 1] = clamp(Math.round(c[1] * 255), 0, 255)
      data[i + 2] = clamp(Math.round(c[2] * 255), 0, 255)
      data[i + 3] = 255
    }
  }
  return data
}

// ---- minimal PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  // rows with filter byte 0
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), encodePNG(size, render(size)))
}
// maskable = same emblem (already centered in safe zone)
writeFileSync(join(outDir, 'maskable-512.png'), encodePNG(512, render(512)))
console.log('Icons written to', outDir)
