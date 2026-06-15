import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= aspect;

    vec2 m = uMouse - 0.5;
    m.x *= aspect;
    float md = length(p - m);

    vec3 col = vec3(0.039, 0.039, 0.051);

    // Flowing aurora (red -> magenta), gently pulled by the cursor
    float t = uTime * 0.06;
    float flow = fbm(p * 2.2 + vec2(t, -t * 0.6) + m * 0.4);
    flow += 0.5 * fbm(p * 4.0 - vec2(t * 0.7, t));
    vec3 red = vec3(1.0, 0.0, 0.235);
    vec3 mag = vec3(1.0, 0.176, 0.471);
    vec3 aurora = mix(red, mag, smoothstep(0.2, 0.9, flow));
    col += aurora * pow(flow, 2.2) * 0.55;

    // Cursor glow
    col += mag * 0.22 * exp(-md * 4.5);

    // Diagonal tech grid
    vec2 g = uv * vec2(aspect, 1.0) * 22.0;
    float grid = min(abs(fract(g.x + g.y) - 0.5), abs(fract(g.x - g.y) - 0.5));
    col += vec3(1.0, 0.1, 0.3) * smoothstep(0.49, 0.5, 1.0 - grid) * 0.045;

    // Scanlines
    float sl = sin(uv.y * uRes.y * 0.7 + uTime * 2.0) * 0.5 + 0.5;
    col *= 0.92 + 0.08 * sl;

    // Vignette + grain
    col *= smoothstep(1.25, 0.2, length(p));
    col += (hash(uv * uRes + uTime) - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`

function FullScreenShader() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })
  const { size, gl } = useThree()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    )
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2))
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  )

  // Track pointer in normalized coords (0..1), origin bottom-left for GLSL.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth
      mouse.current.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const m = mouse.current
    m.x += (m.tx - m.x) * Math.min(1, delta * 4)
    m.y += (m.ty - m.y) * Math.min(1, delta * 4)
    const u = matRef.current.uniforms
    u.uTime.value += delta
    u.uMouse.value.set(m.x, m.y)
    const dpr = gl.getPixelRatio()
    u.uRes.value.set(size.width * dpr, size.height * dpr)
  })

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}

/** Static, cheap fallback used when motion is reduced. */
function StaticBackground() {
  return (
    <div
      className="carbon fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(120% 80% at 30% 0%, rgba(255,0,60,0.18), transparent 55%),' +
          'radial-gradient(120% 80% at 80% 100%, rgba(255,45,120,0.16), transparent 55%),' +
          '#0a0a0d',
      }}
    />
  )
}

export default function Background() {
  const reduced = useReducedMotion()
  if (reduced) return <StaticBackground />

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <FullScreenShader />
      </Canvas>
    </div>
  )
}
