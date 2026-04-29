import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMountFadeIn } from '@/hooks/useMountFadeIn'

// Inaricom — VolumetricFog (universel, theme-aware)
//
// Fumee diffuse en fond de page, presente sur tous les themes (en-dessous des
// effets per-theme : ParticleNeonGold/MatrixRainRed/NeuralNetworkGreen/...).
// Donne aux cards le "verre sur lumiere coloree" qui manquait sur les pages
// dont le fond etait quasi-noir (probleme identifie par Gilles le 28 avril 2026).
//
// Concept : 7 orbes radiaux geants, drift TRES lent (periodes 38-70s),
// stops gaussian extra-etales pour effet volumetrique "fumee qui coule".
// Parallax centree : l'orbe central (k=1.0) suit la souris davantage que
// les peripheriques (k=0.4-0.6) → sensation de profondeur.
//
// Contrats :
// - Renders sur TOUS les themes (pas d'early-return). Palette selectionnee
//   selon [data-theme] de l'ancetre. Fallback rouge (theme defaut Inaricom)
//   si theme inconnu.
// - MutationObserver sur host pour re-rendre si data-theme change live.
// - IntersectionObserver pause off-screen + visibility hidden.
// - prefers-reduced-motion : 1 frame statique, pas de RAF.
// - Canvas downscale 50%, DPR cap 1 (gradients flous, retina inutile).
// - Couleurs en dur (depuis palette-locked.md). Pas de getComputedStyle pour
//   eviter d'avoir 5 themes a interroger via 5 var() differentes.

const MOBILE_MAX_W = 768
const DOWNSCALE = 0.5
const PARALLAX_MAX_CENTER = 60
const PARALLAX_LERP = 0.10
const DRIFT_FRAC = 0.10

type Rgb = { r: number; g: number; b: number }

type Palette = {
  highlight: Rgb
  midtone: Rgb
  lowlight: Rgb
}

// Palettes par theme — derivees des tokens --inari-* (palette-locked.md).
// Toutes les valeurs sont dans la palette verrouillee Inaricom.
const THEME_PALETTES: Record<string, Palette> = {
  neutre: {
    highlight: { r: 255, g: 255, b: 255 }, // blanc pur
    midtone: { r: 224, g: 224, b: 224 },   // argent (--inari-neutre-dark approx)
    lowlight: { r: 182, g: 176, b: 180 },  // text-soft
  },
  rouge: {
    highlight: { r: 255, g: 58, b: 64 },   // red-light
    midtone: { r: 227, g: 30, b: 36 },     // red default
    lowlight: { r: 184, g: 22, b: 27 },    // red-dark
  },
  or: {
    highlight: { r: 255, g: 229, b: 92 },  // or-light
    midtone: { r: 255, g: 215, b: 0 },     // or default
    lowlight: { r: 184, g: 134, b: 11 },   // or-dark
  },
  vert: {
    highlight: { r: 52, g: 211, b: 153 },  // vert-light
    midtone: { r: 16, g: 185, b: 129 },    // vert default
    lowlight: { r: 5, g: 150, b: 105 },    // vert-dark
  },
  bleu: {
    // Aligne sur trustsec.xyz (royal blue) — decision Gilles 29 avril 2026.
    highlight: { r: 26, g: 147, b: 254 },  // #1a93fe (bleu-light)
    midtone: { r: 0, g: 129, b: 242 },     // #0081f2 (bleu default)
    lowlight: { r: 27, g: 97, b: 166 },    // #1b61a6 (bleu-dark)
  },
}

const DEFAULT_PALETTE = THEME_PALETTES.rouge

type ColorKey = 'highlight' | 'midtone' | 'lowlight'

type OrbSpec = {
  baseFracX: number
  baseFracY: number
  phaseX: number
  phaseY: number
  periodX: number // ms — periodes 38-70s = drift "fumee"
  periodY: number
  radiusFrac: number
  colorKey: ColorKey
  opacity: number
  parallaxK: number
  mobile: boolean
}

// Ordre de dessin = ordre du tableau. Le central highlight est dessine en
// premier (en-dessous), les peripheriques par-dessus.
const ORB_SPECS: OrbSpec[] = [
  // Central highlight — le plus large, le plus visible
  {
    baseFracX: 0.5,
    baseFracY: 0.5,
    phaseX: 1.2,
    phaseY: 3.4,
    periodX: 45000,
    periodY: 38000,
    radiusFrac: 0.85,
    colorKey: 'highlight',
    opacity: 0.10,
    parallaxK: 1.0,
    mobile: true,
  },
  // 4 orbes midtone aux 4 angles
  {
    baseFracX: 0.15,
    baseFracY: 0.20,
    phaseX: 4.5,
    phaseY: 0.7,
    periodX: 52000,
    periodY: 41000,
    radiusFrac: 0.65,
    colorKey: 'midtone',
    opacity: 0.08,
    parallaxK: 0.4,
    mobile: true,
  },
  {
    baseFracX: 0.85,
    baseFracY: 0.20,
    phaseX: 2.1,
    phaseY: 5.3,
    periodX: 48000,
    periodY: 55000,
    radiusFrac: 0.65,
    colorKey: 'midtone',
    opacity: 0.08,
    parallaxK: 0.4,
    mobile: false,
  },
  {
    baseFracX: 0.15,
    baseFracY: 0.85,
    phaseX: 3.8,
    phaseY: 1.2,
    periodX: 60000,
    periodY: 50000,
    radiusFrac: 0.65,
    colorKey: 'midtone',
    opacity: 0.08,
    parallaxK: 0.4,
    mobile: false,
  },
  {
    baseFracX: 0.85,
    baseFracY: 0.85,
    phaseX: 0.4,
    phaseY: 4.8,
    periodX: 56000,
    periodY: 44000,
    radiusFrac: 0.65,
    colorKey: 'midtone',
    opacity: 0.08,
    parallaxK: 0.4,
    mobile: true,
  },
  // 2 orbes lowlight medians = profondeur
  {
    baseFracX: 0.35,
    baseFracY: 0.50,
    phaseX: 5.0,
    phaseY: 2.6,
    periodX: 70000,
    periodY: 38000,
    radiusFrac: 0.70,
    colorKey: 'lowlight',
    opacity: 0.07,
    parallaxK: 0.6,
    mobile: false,
  },
  {
    baseFracX: 0.65,
    baseFracY: 0.50,
    phaseX: 1.8,
    phaseY: 4.2,
    periodX: 65000,
    periodY: 42000,
    radiusFrac: 0.70,
    colorKey: 'lowlight',
    opacity: 0.07,
    parallaxK: 0.6,
    mobile: false,
  },
]

export function VolumetricFog() {
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)
  const visible = useMountFadeIn()

  // Phase 1 — resolve [data-theme] ancestor
  useLayoutEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    const parent = probe.parentElement?.closest('[data-theme]') as HTMLElement | null
    setHost(parent)
    setActiveTheme(parent?.getAttribute('data-theme') || null)
  }, [])

  // Phase 2 — react to [data-theme] mutations on host
  useEffect(() => {
    if (!host) return
    const mo = new MutationObserver(() => {
      setActiveTheme(host.getAttribute('data-theme'))
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [host])

  // Phase 3 — animation
  useEffect(() => {
    if (activeTheme === undefined) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let cssW = 0
    let cssH = 0
    let orbs: OrbSpec[] = []
    const palette: Palette =
      activeTheme && THEME_PALETTES[activeTheme]
        ? THEME_PALETTES[activeTheme]
        : DEFAULT_PALETTE

    const resize = () => {
      const nextW = Math.max(1, wrap.clientWidth)
      const nextH = Math.max(1, wrap.clientHeight)
      if (nextW === cssW && nextH === cssH && orbs.length > 0) return
      cssW = nextW
      cssH = nextH
      canvas.width = Math.max(1, Math.floor(cssW * DOWNSCALE))
      canvas.height = Math.max(1, Math.floor(cssH * DOWNSCALE))
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(DOWNSCALE, 0, 0, DOWNSCALE, 0, 0)
      orbs = cssW <= MOBILE_MAX_W ? ORB_SPECS.filter((o) => o.mobile) : ORB_SPECS.slice()
      ctx.clearRect(0, 0, cssW, cssH)
    }
    resize()

    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resizeTimer = null
        resize()
      }, 200)
    })
    ro.observe(wrap)

    let visible = true
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
      },
      { root: null, threshold: 0 },
    )
    io.observe(wrap)

    let targetOffsetX = 0
    let targetOffsetY = 0
    let curOffsetX = 0
    let curOffsetY = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      targetOffsetX = nx * PARALLAX_MAX_CENTER
      targetOffsetY = ny * PARALLAX_MAX_CENTER
    }

    const onMouseLeave = () => {
      targetOffsetX = 0
      targetOffsetY = 0
    }

    if (canHover && !reduceMotion) {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      wrap.addEventListener('mouseleave', onMouseLeave)
    }

    const drawFrame = (ts: number) => {
      ctx.clearRect(0, 0, cssW, cssH)
      const minSide = Math.min(cssW, cssH)
      const ampX = cssW * DRIFT_FRAC
      const ampY = cssH * DRIFT_FRAC

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i]
        const driftX = Math.sin((2 * Math.PI * ts) / orb.periodX + orb.phaseX) * ampX
        const driftY = Math.cos((2 * Math.PI * ts) / orb.periodY + orb.phaseY) * ampY
        const x = orb.baseFracX * cssW + driftX + curOffsetX * orb.parallaxK
        const y = orb.baseFracY * cssH + driftY + curOffsetY * orb.parallaxK
        const radius = orb.radiusFrac * minSide
        const c = palette[orb.colorKey]

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
        // Stops gaussian extra-etales pour effet "fumee" volumetrique :
        // courbe plus lisse que MeshGradient (qui a une attaque + raide).
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${orb.opacity})`)
        grad.addColorStop(
          0.10,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.85).toFixed(4)})`,
        )
        grad.addColorStop(
          0.25,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.55).toFixed(4)})`,
        )
        grad.addColorStop(
          0.45,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.28).toFixed(4)})`,
        )
        grad.addColorStop(
          0.70,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.10).toFixed(4)})`,
        )
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, cssW, cssH)
      }
    }

    if (reduceMotion) {
      drawFrame(0)
      return () => {
        if (resizeTimer) clearTimeout(resizeTimer)
        ro.disconnect()
        io.disconnect()
      }
    }

    let raf = 0
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.visibilityState === 'hidden') return
      curOffsetX += (targetOffsetX - curOffsetX) * PARALLAX_LERP
      curOffsetY += (targetOffsetY - curOffsetY) * PARALLAX_LERP
      drawFrame(ts)
    }
    // Defer le start de l'animation hors du critical path → reduit le TBT au load.
    let idleHandle: number | null = null
    type RIC = (cb: () => void, opts?: { timeout?: number }) => number
    type CIC = (h: number) => void
    const ric = (window as Window & { requestIdleCallback?: RIC }).requestIdleCallback
    const cic = (window as Window & { cancelIdleCallback?: CIC }).cancelIdleCallback
    const startAnimation = () => {
      idleHandle = null
      raf = requestAnimationFrame(tick)
    }
    if (typeof ric === 'function') {
      idleHandle = ric(startAnimation, { timeout: 2000 })
    } else {
      idleHandle = window.setTimeout(startAnimation, 100)
    }

    return () => {
      if (idleHandle !== null) {
        if (typeof cic === 'function') cic(idleHandle)
        else clearTimeout(idleHandle)
      }
      cancelAnimationFrame(raf)
      if (resizeTimer) clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      if (canHover && !reduceMotion) {
        window.removeEventListener('mousemove', onMouseMove)
        wrap.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [activeTheme])

  // Probe invisible tant que le theme n'est pas resolu
  if (activeTheme === undefined) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 800ms ease-out',
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
