import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Inaricom — ParticleNeonGold
// Porte l'animation "Particle neon" (source: Animations/Particle neon/js.txt)
// vers React / Canvas 2D pour le thème OR uniquement.
//
// Contrats (docs/specs/animations-mapping.md § 🟡 + docs/specs/background-animations.md § 🟡) :
// - Actif UNIQUEMENT quand le plus proche ancêtre [data-theme] vaut "or".
// - Sur tout autre thème → return null.
// - Couleur lue dynamiquement via getComputedStyle du parent porteur de data-theme
//   (`var(--inari-red)` qui vaut #FFD700 en or). Aucun hex en dur.
// - hueChange / cycle chromatique de la source SUPPRIMÉ. La teinte reste fixe.
// - MutationObserver sur le parent pour relire la couleur si le thème change live.
// - IntersectionObserver + document.visibilityState : pause off-screen / tab hidden.
// - Respect prefers-reduced-motion : 1 frame statique (centres + branches), pas de RAF.
// - Canvas 2D vanilla, DPR-aware.
//
// ADAPTATION CLÉ vs source (décision Gilles) :
// - MULTI-CENTRES (3 mobile / 4 desktop) pseudo-aléatoires mais déterministes
//   (seed Mulberry32) → pas de flicker au refresh.
// - Répartition : stratification X (bandes de largeur 1/N + jitter ±20%)
//   + zigzag vertical (pairs en bande haute 18–40%, impairs en bande basse 60–82%)
//   → séparation visuelle garantie, pas de chevauchement des "clouds" voisins.
// - Chaque centre émet ses propres lignes hexagonales + sparks.
// - Drift lent par centre (< 5 px/s) pour éviter l'effet figé.
// - Densité proportionnelle : 14 lignes/centre desktop, 10/centre mobile.

const GOLD_THEME = 'or'

const BASE_RAD = (Math.PI * 2) / 6
const LEN = 16 // px par unité radiale (équivalent opts.len de la source, reduit de 20→16)
const DIE_RANGE = 16 // en len-units → ~256px de rayon effectif autour du centre (2x vs initial)
                    // → batches voisins se chevauchent et particules se "rencontrent"
const MAX_DRIFT_PX = 70 // bornes du drift autour de la position base — centres deplacent plus,
                       // amplifie le chevauchement entre batches voisins

// Mulberry32 — PRNG déterministe pour positions seedées stables entre refresh
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Line = {
  x: number // position en len-units relative au centre
  y: number
  addedX: number
  addedY: number
  rad: number
  time: number // progression dans la phase courante (ticks ~16.67ms)
  targetTime: number
  cumulativeTime: number
  lightInputMultiplier: number
}

type Center = {
  cx: number // position px courante (drifte)
  cy: number
  baseCx: number
  baseCy: number
  vx: number // px/ms
  vy: number
  lines: Line[]
}

export function ParticleNeonGold() {
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)

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

  // Phase 3 — animation, uniquement si le thème actif est "or"
  useEffect(() => {
    if (activeTheme !== GOLD_THEME || !host) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const readColor = (): string => {
      const raw = getComputedStyle(host).getPropertyValue('--inari-red').trim()
      return raw || '#FFD700'
    }
    let themeColor = readColor()

    let cssW = 0
    let cssH = 0
    let centers: Center[] = []

    const isMobile = () => wrap.clientWidth < 768

    const makeLine = (): Line => ({
      x: 0,
      y: 0,
      addedX: 0,
      addedY: 0,
      rad: 0,
      time: 0,
      targetTime: (20 + Math.random() * 20) | 0,
      cumulativeTime: 0,
      lightInputMultiplier: 0.01 + 0.02 * Math.random(),
    })

    const makeCenters = (): Center[] => {
      const N = isMobile() ? 4 : 6
      const linesPerCenter = isMobile() ? 10 : 14
      // PRNG frais à chaque resize → positions identiques entre refresh (pas de flicker)
      const localRand = mulberry32(1337 + N * 7)
      const result: Center[] = []
      const stripRatio = 1 / N
      for (let i = 0; i < N; i++) {
        // Stratification X + jitter resserré (±20% du stripe vs ±30% avant)
        const jitter = (localRand() - 0.5) * stripRatio * 0.4
        const cxRatio = (i + 0.5) * stripRatio + jitter
        // Zigzag vertical : pairs en bande haute, impairs en bande basse
        // → séparation verticale garantie entre voisins horizontaux
        // Bandes elargies (8-48% / 52-92%) pour couvrir un peu plus de viewport
        const isUpper = i % 2 === 0
        const cyRatio = isUpper ? 0.08 + localRand() * 0.40 : 0.52 + localRand() * 0.40
        const cx = cxRatio * cssW
        const cy = cyRatio * cssH
        const angle = localRand() * Math.PI * 2
        const driftSpeed = 0.0008 + localRand() * 0.0012 // px/ms, ~2.5x plus lent (calme)
        result.push({
          cx,
          cy,
          baseCx: cx,
          baseCy: cy,
          vx: Math.cos(angle) * driftSpeed,
          vy: Math.sin(angle) * driftSpeed,
          lines: Array.from({ length: linesPerCenter }, makeLine),
        })
      }
      return result
    }

    const resize = () => {
      const nextW = Math.max(1, wrap.clientWidth)
      const nextH = Math.max(1, wrap.clientHeight)
      if (nextW === cssW && nextH === cssH && centers.length > 0) return
      cssW = nextW
      cssH = nextH
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      centers = makeCenters()
      ctx.clearRect(0, 0, cssW, cssH)
    }
    resize()

    const ro = new ResizeObserver(() => resize())
    ro.observe(wrap)

    // Couleur live : re-lecture si class/style/data-theme change
    const colorMo = new MutationObserver(() => {
      themeColor = readColor()
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

    // Reduced motion : centres + 6 branches fixes, aucun RAF
    if (reduceMotion) {
      ctx.fillStyle = themeColor
      for (const center of centers) {
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(center.cx, center.cy, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.25
        for (let b = 0; b < 6; b++) {
          const a = b * BASE_RAD
          for (let r = 1; r <= 3; r++) {
            const ex = center.cx + Math.cos(a) * LEN * r
            const ey = center.cy + Math.sin(a) * LEN * r
            ctx.fillRect(ex - 1, ey - 1, 2, 2)
          }
        }
      }
      ctx.globalAlpha = 1
      return () => {
        ro.disconnect()
        colorMo.disconnect()
        io.disconnect()
      }
    }

    const beginPhase = (line: Line) => {
      line.x += line.addedX
      line.y += line.addedY
      line.time = 0
      line.targetTime = (20 + Math.random() * 20) | 0
      line.rad += BASE_RAD * (Math.random() < 0.5 ? 1 : -1)
      line.addedX = Math.cos(line.rad)
      line.addedY = Math.sin(line.rad)
      if (
        Math.random() < 0.05 ||
        line.x > DIE_RANGE ||
        line.x < -DIE_RANGE ||
        line.y > DIE_RANGE ||
        line.y < -DIE_RANGE
      ) {
        line.x = 0
        line.y = 0
        line.addedX = 0
        line.addedY = 0
        line.rad = 0
        line.cumulativeTime = 0
        line.time = 0
        line.targetTime = (20 + Math.random() * 20) | 0
        line.lightInputMultiplier = 0.01 + 0.02 * Math.random()
      }
    }

    let raf = 0
    let lastTs = performance.now()

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(ts - lastTs, 64)
      lastTs = ts

      if (!visible || document.visibilityState === 'hidden') return

      // Fade trail avec teinte noire palette Inari.
      // Alpha 0.03 → trail longue, particules laissent une comete dorée.
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(10, 10, 15, 0.03)'
      ctx.fillRect(0, 0, cssW, cssH)

      // Draw additif pour effet glow (comme la source)
      ctx.globalCompositeOperation = 'lighter'
      ctx.shadowColor = themeColor
      ctx.fillStyle = themeColor

      const step = dt / 16.67 // 1 tick = 16.67ms

      for (const center of centers) {
        // Drift doux avec rebond aux bornes ±MAX_DRIFT_PX
        center.cx += center.vx * dt
        center.cy += center.vy * dt
        if (Math.abs(center.cx - center.baseCx) > MAX_DRIFT_PX) center.vx = -center.vx
        if (Math.abs(center.cy - center.baseCy) > MAX_DRIFT_PX) center.vy = -center.vy

        for (const line of center.lines) {
          line.time += step
          line.cumulativeTime += step
          if (line.time >= line.targetTime) beginPhase(line)

          const prop = line.time / line.targetTime
          const wave = Math.sin((prop * Math.PI) / 2)
          const x = line.addedX * wave
          const y = line.addedY * wave

          // shadowBlur 10 → halo dore 2x plus large = brillance accrue sans
          // grossir la tete (qui reste 1x1, finesse preservee)
          ctx.shadowBlur = prop * 10
          // Variation d'alpha (teinte fixe, pas de cycle "light" source)
          const alpha = 0.62 + 0.22 * Math.sin(line.cumulativeTime * line.lightInputMultiplier)
          ctx.globalAlpha = alpha

          const px = center.cx + (line.x + x) * LEN
          const py = center.cy + (line.y + y) * LEN
          // Tete 1x1 → particules fines, la trainee prend visuellement le dessus
          ctx.fillRect(px, py, 1, 1)

          // Sparks (5% de chance par frame par ligne)
          if (Math.random() < 0.05) {
            ctx.fillRect(
              px + (Math.random() - 0.5) * 10,
              py + (Math.random() - 0.5) * 10,
              1,
              1,
            )
          }
        }
      }

      // Reset composite state
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      colorMo.disconnect()
      io.disconnect()
    }
  }, [activeTheme, host])

  // Rendu — probe invisible tant que le thème n'est pas mesuré
  if (activeTheme === undefined) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  // Tout thème ≠ or → rien
  if (activeTheme !== GOLD_THEME) {
    return null
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0.07 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
