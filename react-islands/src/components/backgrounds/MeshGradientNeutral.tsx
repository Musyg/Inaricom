import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Inaricom — MeshGradientNeutral (v3 "prisme homepage")
//
// Concept : 5 orbes radiaux très diffus, stackés.
//   - 4 halos PÉRIPHÉRIQUES aux 4 coins, un par pilier Inaricom :
//       top-left   = bleu   (institutionnel)
//       top-right  = rouge  (cybersec)
//       bottom-left  = or   (IA)
//       bottom-right = vert (blog)
//     → très discrets, annoncent sans crier les 4 univers.
//   - 1 halo ARGENT DOMINANT au centre, dessiné en dernier, qui "gagne"
//     visuellement sur la zone où atterrira la fox hero v29 argentée.
//
// Tous les orbes sont radial gradients ultra flous. Aucun point, aucune
// particule, aucun bord net. Le fond noir laisse transparaître un prisme
// atmosphérique imperceptible en regardant fixement, mais visible sur
// 3 captures écartées de 5 s.
//
// Contrats :
// - Actif UNIQUEMENT si le plus proche ancêtre [data-theme] vaut "neutre".
//   Return null sinon.
// - Couleurs lues via getComputedStyle sur le host :
//     --accent-rouge, --accent-or, --accent-vert, --accent-bleu (fixes)
//     --inari-red pour le centre (= #FFFFFF sur thème neutre)
// - Fallbacks hex uniquement si la lecture échoue.
// - MutationObserver sur host (data-theme/class/style).
// - IntersectionObserver + document.visibilityState : pause off-screen / tab hidden.
// - prefers-reduced-motion : 1 frame statique, pas de RAF.
// - Canvas downscale 50% + DPR cap 1 (gradients flous, retina inutile).
// - Parallaxe souris légère, skip sur touch device.

const NEUTRE_THEME = 'neutre'
const MOBILE_MAX_W = 768
const DOWNSCALE = 0.5
const PARALLAX_MAX_CENTER = 12 // px sur l'orbe central
const PARALLAX_LERP = 0.08
const DRIFT_FRAC = 0.06 // ±6% du viewport autour du point d'ancrage

type ColorKey = 'center' | 'bleu' | 'rouge' | 'or' | 'vert'
type Rgb = { r: number; g: number; b: number }

type OrbSpec = {
  // Ancrage en fraction du viewport
  baseFracX: number
  baseFracY: number
  // Phases sinusoïdales initiales (radians)
  phaseX: number
  phaseY: number
  // Périodes de dérive (ms) — désynchronisées entre orbes
  periodX: number
  periodY: number
  // Rayon du gradient en fraction de min(cssW, cssH)
  radiusFrac: number
  // Couleur (clé → lookup dans `colors`)
  colorKey: ColorKey
  // Opacité au centre du gradient (stop 0)
  opacity: number
  // Coefficient de parallaxe souris (0 = immobile, 1 = max)
  parallaxK: number
  // Inclus en mobile ?
  mobile: boolean
}

// Ordre de dessin = ordre de la liste. Le dernier dessiné est devant.
// Les 4 périphériques d'abord (bleu → vert → or → rouge), puis le centre
// argent qui domine visuellement la zone fox hero.
const ORB_SPECS: OrbSpec[] = [
  // Opacités calibrées pour compenser la courbe V-lambda (sensibilité
  // rétinienne) : sur fond noir, bleu/vert sont perceptuellement inférieurs
  // à rouge/or → bleu et vert remontés (0.13), rouge et or baissés (0.07)
  // pour ne plus écraser les autres, centre argent à 0.18 pour rester dominant.
  //
  // 1 · Périphérie top-left · bleu (institutionnel) — poussé au coin, agrandi
  {
    baseFracX: 0.1,
    baseFracY: 0.12,
    phaseX: 1.1,
    phaseY: 3.7,
    periodX: 26000,
    periodY: 22000,
    radiusFrac: 0.78,
    colorKey: 'bleu',
    opacity: 0.1,
    parallaxK: 0.4,
    mobile: true,
  },
  // 2 · Périphérie bottom-right · vert (blog) — poussé au coin, agrandi
  {
    baseFracX: 0.9,
    baseFracY: 0.88,
    phaseX: 4.3,
    phaseY: 0.9,
    periodX: 21000,
    periodY: 29000,
    radiusFrac: 0.75,
    colorKey: 'vert',
    opacity: 0.1,
    parallaxK: 0.35,
    mobile: true,
  },
  // 3 · Périphérie bottom-left · or (IA) — poussé au coin, agrandi
  {
    baseFracX: 0.1,
    baseFracY: 0.88,
    phaseX: 2.5,
    phaseY: 5.2,
    periodX: 28000,
    periodY: 19000,
    radiusFrac: 0.78,
    colorKey: 'or',
    opacity: 0.08,
    parallaxK: 0.45,
    mobile: true, // conservé en mobile
  },
  // 4 · Périphérie top-right · rouge (cybersec, pilier 1) — poussé au coin, agrandi
  {
    baseFracX: 0.9,
    baseFracY: 0.12,
    phaseX: 0.3,
    phaseY: 2.8,
    periodX: 24000,
    periodY: 31000,
    radiusFrac: 0.75,
    colorKey: 'rouge',
    opacity: 0.08,
    parallaxK: 0.5,
    mobile: true, // conservé en mobile
  },
  // 5 · CENTRE · argent (= --inari-red = #FFFFFF en neutre) — DOMINANT,
  // dessiné en dernier, couvre la zone fox hero argentée. Rayon RÉDUIT
  // pour laisser les 4 coins respirer avec leur teinte.
  {
    baseFracX: 0.5,
    baseFracY: 0.5,
    phaseX: 3.9,
    phaseY: 1.6,
    periodX: 30000,
    periodY: 23000,
    radiusFrac: 0.55,
    colorKey: 'center',
    opacity: 0.08,
    parallaxK: 1.0,
    mobile: true, // toujours présent
  },
]

const FALLBACK_COLORS: Record<ColorKey, Rgb> = {
  center: { r: 255, g: 255, b: 255 },
  bleu: { r: 0, g: 212, b: 255 },
  rouge: { r: 227, g: 30, b: 36 },
  or: { r: 255, g: 215, b: 0 },
  vert: { r: 16, g: 185, b: 129 },
}

function hexToRgb(input: string): Rgb | null {
  const s = input.trim()
  if (!s) return null
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      if ([r, g, b].every((v) => Number.isFinite(v))) return { r, g, b }
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      if ([r, g, b].every((v) => Number.isFinite(v))) return { r, g, b }
    }
    return null
  }
  const m = s.match(/rgba?\(([^)]+)\)/i)
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p.trim()))
    if (parts.length >= 3) {
      return { r: parts[0] | 0, g: parts[1] | 0, b: parts[2] | 0 }
    }
  }
  return null
}

export function MeshGradientNeutral() {
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)

  // Phase 1 — resolve [data-theme] ancestor
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

  // Phase 2 — react to data-theme attribute mutations
  useEffect(() => {
    if (!host) return
    const mo = new MutationObserver(() => {
      setActiveTheme(host.getAttribute('data-theme'))
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [host])

  // Phase 3 — animation (neutre uniquement)
  useEffect(() => {
    if (activeTheme !== NEUTRE_THEME || !host) return
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
    const colors: Record<ColorKey, Rgb> = { ...FALLBACK_COLORS }

    const readColors = () => {
      const cs = getComputedStyle(host)
      const map: Array<[ColorKey, string, Rgb]> = [
        ['center', '--inari-red', FALLBACK_COLORS.center],
        ['rouge', '--accent-rouge', FALLBACK_COLORS.rouge],
        ['or', '--accent-or', FALLBACK_COLORS.or],
        ['vert', '--accent-vert', FALLBACK_COLORS.vert],
        ['bleu', '--accent-bleu', FALLBACK_COLORS.bleu],
      ]
      for (const [key, prop, fallback] of map) {
        const raw = cs.getPropertyValue(prop).trim()
        const parsed = hexToRgb(raw)
        colors[key] = parsed ?? fallback
      }
    }
    readColors()

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

      // Mobile : on garde l'orbe central + les 2 piliers dominants (rouge + or),
      // donc 3 orbes au lieu de 5. Ordre préservé (centre toujours en dernier).
      orbs =
        cssW <= MOBILE_MAX_W
          ? ORB_SPECS.filter((o) => o.mobile)
          : ORB_SPECS.slice()
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

    const colorMo = new MutationObserver(() => {
      readColors()
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
        const c = colors[orb.colorKey]

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
        // Courbe gaussienne approchée via 4 stops intermédiaires : pas de plateau,
        // pas de bord identifiable entre noyau et halo (évite l'effet "blob").
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${orb.opacity})`)
        grad.addColorStop(
          0.15,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.72).toFixed(4)})`,
        )
        grad.addColorStop(
          0.35,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.38).toFixed(4)})`,
        )
        grad.addColorStop(
          0.6,
          `rgba(${c.r},${c.g},${c.b},${(orb.opacity * 0.14).toFixed(4)})`,
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
        colorMo.disconnect()
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
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (resizeTimer) clearTimeout(resizeTimer)
      ro.disconnect()
      colorMo.disconnect()
      io.disconnect()
      if (canHover && !reduceMotion) {
        window.removeEventListener('mousemove', onMouseMove)
        wrap.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [activeTheme, host])

  if (activeTheme === undefined) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  if (activeTheme !== NEUTRE_THEME) {
    return null
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
