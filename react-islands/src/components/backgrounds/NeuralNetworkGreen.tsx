import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'

// Inaricom — NeuralNetworkGreen
// Porte l'animation "Interactive neural network" (source: Animations/Ineractive neural network/html.txt)
// vers React pour le thème VERT uniquement.
//
// Contrats (docs/specs/animations-mapping.md § 🟢 + docs/specs/background-animations.md § 🟢) :
// - Actif UNIQUEMENT quand le plus proche ancêtre [data-theme] vaut "vert".
// - Sur tout autre thème → return null.
// - Couleur lue dynamiquement via getComputedStyle du parent porteur de data-theme
//   (`var(--inari-red)` qui vaut #10B981 en vert). Aucun hex en dur.
// - MutationObserver sur le parent pour relire la couleur si le thème change live.
// - IntersectionObserver + document.visibilityState : pause off-screen / tab hidden.
//
// STRATÉGIE 2 ÉTAGES :
// - Étage 1 (Desktop ≥1024px, no reduced-motion) : Three.js (r184) — nuage synaptique
//   3D auto-rotatif. Pas de UnrealBloomPass ni post-processing. Glow via
//   AdditiveBlending + CanvasTexture circulaire. Palette monochrome dérivée de
//   var(--inari-red) via Color.offsetHSL (5 teintes).
// - Étage 2 (Mobile <1024px OU prefers-reduced-motion) : SVG inline statique,
//   12 neurones sur 4 layers avec connexions forward. currentColor = var(--inari-red).
//   Zéro JS post-render, opacity 10% comme les autres bg animations.
//
// DÉTECTION : window.matchMedia (+ change listener) pour bascule live au resize.
// FALLBACK : handler webglcontextlost → bascule SVG proprement si GPU perdu.
//
// PROGRESSIVE HYDRATION (décision Gilles 24/04/2026) :
// - Three.js (~130 KB gzip) chargé via DYNAMIC IMPORT (`await import('three')`)
//   → chunk séparé émis par Rollup, fetché UNIQUEMENT après le mount et après
//     que `closest('[data-theme="vert"]')` + tier === 'desktop' sont confirmés.
// - Pendant le chargement (~100-500 ms), on affiche le SVG statique de l'étage 2
//   en fallback visuel (hydratation progressive — l'utilisateur voit tout de suite
//   le motif neural).
// - Si l'import échoue (network down, CDN KO) OU si WebGL est perdu,
//   on reste définitivement sur le SVG statique (setWebglFailed(true)).
// - Pourquoi pas OGL (~15 KB) : prérequis Phase 2 = stack R3F ciblée
//   plus tard, et le lazy-load isole déjà le coût aux seules pages thème vert
//   desktop non-reduced-motion. Migration OGL envisageable si le budget perf
//   se resserre (critère Lighthouse 95+ sur pages commerciales).

const GREEN_THEME = 'vert'
const DESKTOP_QUERY = '(min-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type Tier = 'desktop' | 'mobile'

// --- SVG statique (étage 2 ET fallback pendant chargement Three.js) ----------
// 4 layers (colonnes) × 3 neurones, coords en pourcentage viewBox 100×100.
// Connexions full-mesh entre layers voisins (pas d'animation, pas de forward pass).
const SVG_LAYERS = 4
const SVG_NODES_PER_LAYER = 3
const svgNodes: Array<{ x: number; y: number; r: number }> = []
for (let l = 0; l < SVG_LAYERS; l++) {
  for (let n = 0; n < SVG_NODES_PER_LAYER; n++) {
    svgNodes.push({
      x: 12 + (l * 76) / (SVG_LAYERS - 1),
      y: 22 + (n * 56) / (SVG_NODES_PER_LAYER - 1),
      r: 1.6,
    })
  }
}
const svgConnections: Array<{ a: number; b: number }> = []
for (let l = 0; l < SVG_LAYERS - 1; l++) {
  for (let i = 0; i < SVG_NODES_PER_LAYER; i++) {
    for (let j = 0; j < SVG_NODES_PER_LAYER; j++) {
      svgConnections.push({
        a: l * SVG_NODES_PER_LAYER + i,
        b: (l + 1) * SVG_NODES_PER_LAYER + j,
      })
    }
  }
}

function StaticNeuralSvg() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      style={{ color: 'var(--inari-red)' }}
    >
      <g stroke="currentColor" strokeWidth="0.15" fill="none" opacity="0.45">
        {svgConnections.map((c, i) => {
          const a = svgNodes[c.a]
          const b = svgNodes[c.b]
          return <line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        })}
      </g>
      <g fill="currentColor">
        {svgNodes.map((n, i) => (
          <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r} />
        ))}
      </g>
    </svg>
  )
}

// Distribution quasi-sphérique Fibonacci (répartition uniforme sans cluster).
// Ne dépend pas de Three.js → reste au scope module.
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const y = 1 - 2 * t
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const shellRadius = radius * (0.55 + (i % 3) * 0.2 + Math.random() * 0.15)
    positions[i * 3 + 0] = Math.cos(theta) * r * shellRadius
    positions[i * 3 + 1] = y * shellRadius
    positions[i * 3 + 2] = Math.sin(theta) * r * shellRadius
  }
  return positions
}

export function NeuralNetworkGreen() {
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const visible = useMountFadeIn()

  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)
  const [tier, setTier] = useState<Tier | null>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const [threeReady, setThreeReady] = useState(false)

  // Phase 1 — détection du plus proche [data-theme] via probe invisible
  useLayoutEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    const parent = probe.parentElement?.closest('[data-theme]') as HTMLElement | null
    if (!parent) {
      setActiveTheme(null)
      return
    }
    setHost(parent)
    setActiveTheme(parent.getAttribute('data-theme'))
  }, [])

  // Phase 2 — observe les changements de [data-theme] sur le host
  useEffect(() => {
    if (!host) return
    const mo = new MutationObserver(() => {
      setActiveTheme(host.getAttribute('data-theme'))
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [host])

  // Phase 3 — tier desktop vs mobile/reduced-motion (live via matchMedia change)
  useEffect(() => {
    if (activeTheme !== GREEN_THEME) return
    const desktopMq = window.matchMedia(DESKTOP_QUERY)
    const reduceMq = window.matchMedia(REDUCED_MOTION_QUERY)
    const compute = (): Tier =>
      desktopMq.matches && !reduceMq.matches ? 'desktop' : 'mobile'
    setTier(compute())
    const handler = () => setTier(compute())
    desktopMq.addEventListener('change', handler)
    reduceMq.addEventListener('change', handler)
    return () => {
      desktopMq.removeEventListener('change', handler)
      reduceMq.removeEventListener('change', handler)
    }
  }, [activeTheme])

  // Phase 4 — Three.js scene, lazy chargé (chunk séparé)
  useEffect(() => {
    if (activeTheme !== GREEN_THEME || tier !== 'desktop' || webglFailed || !host) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    const readColor = (): string => {
      const raw = getComputedStyle(host).getPropertyValue('--inari-red').trim()
      return raw || '#10B981'
    }

    const run = async () => {
      // ↓↓↓ chunk Three.js fetché ICI, pas au parse du module ↓↓↓
      let mod: typeof THREE
      try {
        mod = await import('three')
      } catch {
        if (!cancelled) setWebglFailed(true)
        return
      }
      if (cancelled) return

      const {
        AdditiveBlending,
        BufferAttribute,
        BufferGeometry,
        CanvasTexture,
        Color,
        Float32BufferAttribute,
        LineBasicMaterial,
        LineSegments,
        PerspectiveCamera,
        Points,
        PointsMaterial,
        Scene,
        WebGLRenderer,
      } = mod

      // --- Sprite circulaire pour les neurones Points ---
      const makeNodeSprite = (): THREE.CanvasTexture => {
        const size = 128
        const c2d = document.createElement('canvas')
        c2d.width = size
        c2d.height = size
        const ctx = c2d.getContext('2d')!
        const c = size / 2
        const grad = ctx.createRadialGradient(c, c, 0, c, c, c)
        grad.addColorStop(0, 'rgba(255,255,255,1)')
        grad.addColorStop(0.25, 'rgba(255,255,255,0.85)')
        grad.addColorStop(0.6, 'rgba(255,255,255,0.25)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
        const tex = new CanvasTexture(c2d)
        tex.needsUpdate = true
        return tex
      }

      // --- Palette 5 teintes dérivées via offsetHSL ---
      const derivePalette = (base: THREE.Color): THREE.Color[] => [
        base.clone(),
        base.clone().offsetHSL(0, 0, -0.1),
        base.clone().offsetHSL(0, 0, 0.1),
        base.clone().offsetHSL(0.02, 0, 0.05),
        base.clone().offsetHSL(-0.02, 0, 0.05),
      ]

      // Setup renderer — défensif si WebGL indisponible
      let renderer: THREE.WebGLRenderer
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        })
      } catch {
        if (!cancelled) setWebglFailed(true)
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)

      const scene = new Scene()
      const camera = new PerspectiveCamera(55, 1, 0.1, 100)
      camera.position.set(0, 0, 22)

      // --- Neurons (Points) ---
      const nodeCount = 110
      const sphereRadius = 7.5
      const positions = fibonacciSphere(nodeCount, sphereRadius)
      const basePalette = derivePalette(new Color(readColor()))
      const colors = new Float32Array(nodeCount * 3)
      const assignColors = (palette: THREE.Color[]) => {
        for (let i = 0; i < nodeCount; i++) {
          const col = palette[i % palette.length]
          colors[i * 3 + 0] = col.r
          colors[i * 3 + 1] = col.g
          colors[i * 3 + 2] = col.b
        }
      }
      assignColors(basePalette)

      const nodesGeom = new BufferGeometry()
      nodesGeom.setAttribute('position', new BufferAttribute(positions, 3))
      const colorAttr = new BufferAttribute(colors, 3)
      nodesGeom.setAttribute('color', colorAttr)

      const sprite = makeNodeSprite()
      const nodesMat = new PointsMaterial({
        size: 0.75,
        vertexColors: true,
        map: sprite,
        transparent: true,
        opacity: 0.9,
        blending: AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
      const nodesMesh = new Points(nodesGeom, nodesMat)
      scene.add(nodesMesh)

      // --- Connections (LineSegments) — 2 plus proches voisins par node ---
      const maxConnectionsPerNode = 2
      const distanceThresholdSq = 10
      const linePositionsArr: number[] = []
      const edgePairs: Array<[number, number]> = []
      const seen = new Set<string>()
      for (let i = 0; i < nodeCount; i++) {
        const ax = positions[i * 3]
        const ay = positions[i * 3 + 1]
        const az = positions[i * 3 + 2]
        const neighbors: Array<{ j: number; d: number }> = []
        for (let j = 0; j < nodeCount; j++) {
          if (j === i) continue
          const dx = positions[j * 3] - ax
          const dy = positions[j * 3 + 1] - ay
          const dz = positions[j * 3 + 2] - az
          const d = dx * dx + dy * dy + dz * dz
          if (d < distanceThresholdSq) neighbors.push({ j, d })
        }
        neighbors.sort((a, b) => a.d - b.d)
        const take = neighbors.slice(0, maxConnectionsPerNode)
        for (const { j } of take) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) continue
          seen.add(key)
          linePositionsArr.push(
            ax,
            ay,
            az,
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2],
          )
          edgePairs.push([i, j])
        }
      }
      const lineColorsBuffer = new Float32Array(edgePairs.length * 6)
      const fillLineColors = () => {
        for (let k = 0; k < edgePairs.length; k++) {
          const [i, j] = edgePairs[k]
          const base = k * 6
          lineColorsBuffer[base + 0] = colors[i * 3 + 0]
          lineColorsBuffer[base + 1] = colors[i * 3 + 1]
          lineColorsBuffer[base + 2] = colors[i * 3 + 2]
          lineColorsBuffer[base + 3] = colors[j * 3 + 0]
          lineColorsBuffer[base + 4] = colors[j * 3 + 1]
          lineColorsBuffer[base + 5] = colors[j * 3 + 2]
        }
      }
      fillLineColors()
      const linesGeom = new BufferGeometry()
      const linePosAttr = new Float32BufferAttribute(linePositionsArr, 3)
      const lineColorAttr = new BufferAttribute(lineColorsBuffer, 3)
      linesGeom.setAttribute('position', linePosAttr)
      linesGeom.setAttribute('color', lineColorAttr)
      const linesMat = new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: AdditiveBlending,
        depthWrite: false,
      })
      const linesMesh = new LineSegments(linesGeom, linesMat)
      scene.add(linesMesh)

      // Resize (canvas suit le wrap, DPR aware)
      let cssW = 0
      let cssH = 0
      const resize = () => {
        const nextW = Math.max(1, wrap.clientWidth)
        const nextH = Math.max(1, wrap.clientHeight)
        if (nextW === cssW && nextH === cssH) return
        cssW = nextW
        cssH = nextH
        renderer.setSize(cssW, cssH, false)
        camera.aspect = cssW / cssH
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap)

      // Couleur live : re-lecture + reassign palette si --inari-red change
      const colorMo = new MutationObserver(() => {
        const next = readColor()
        const palette = derivePalette(new Color(next))
        assignColors(palette)
        colorAttr.needsUpdate = true
        fillLineColors()
        lineColorAttr.needsUpdate = true
      })
      colorMo.observe(host, {
        attributes: true,
        attributeFilter: ['data-theme', 'class', 'style'],
      })

      let visible = true
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true
        },
        { root: null, threshold: 0 },
      )
      io.observe(wrap)

      // WebGL context lost → fallback SVG sans crash
      const onLost = (e: Event) => {
        e.preventDefault()
        setWebglFailed(true)
      }
      canvas.addEventListener('webglcontextlost', onLost)

      let raf = 0
      const tick = () => {
        raf = requestAnimationFrame(tick)
        if (!visible || document.visibilityState === 'hidden') return
        scene.rotation.y += 0.0018
        scene.rotation.x = Math.sin(performance.now() * 0.00008) * 0.08
        renderer.render(scene, camera)
      }

      // Premier render synchrone → fade-in canvas dans la frame suivante
      renderer.render(scene, camera)
      setThreeReady(true)
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        colorMo.disconnect()
        io.disconnect()
        canvas.removeEventListener('webglcontextlost', onLost)
        nodesGeom.dispose()
        nodesMat.dispose()
        linesGeom.dispose()
        linesMat.dispose()
        sprite.dispose()
        renderer.dispose()
      }
    }

    run()

    return () => {
      cancelled = true
      if (cleanup) cleanup()
      setThreeReady(false)
    }
  }, [activeTheme, tier, host, webglFailed])

  // Rendu — probe invisible tant que le thème n'est pas mesuré
  if (activeTheme === undefined) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  // Tout thème ≠ vert → rien
  if (activeTheme !== GREEN_THEME) {
    return null
  }

  // Tier non encore résolu (1 frame) → rien pour éviter flash
  if (tier === null) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  // Étage SVG pur (mobile / reduced-motion / webgl failed)
  if (tier === 'mobile' || webglFailed) {
    return (
      <div
        ref={wrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: visible ? 0.1 : 0, transition: 'opacity 800ms ease-out' }}
      >
        <StaticNeuralSvg />
      </div>
    )
  }

  // Étage Three.js (desktop) + SVG en fallback pendant le chargement async
  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: visible ? 0.1 : 0, transition: 'opacity 800ms ease-out' }}
    >
      {!threeReady && <StaticNeuralSvg />}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: threeReady ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
      />
    </div>
  )
}
