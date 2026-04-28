import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Inaricom — MatrixRainRed
// Porte l'animation "Run Matrix Text" (source: Animations/Run Matrix Text/js.txt)
// vers React / Canvas 2D pour le thème ROUGE uniquement.
//
// Contrats (docs/specs/animations-mapping.md § 🔴 + docs/specs/background-animations.md § 🔴) :
// - Actif UNIQUEMENT quand le plus proche ancêtre [data-theme] vaut "rouge".
// - Sur tout autre thème (or / vert / bleu / pas de data-theme) → return null.
// - Couleur lue dynamiquement via getComputedStyle du parent porteur de data-theme
//   (`var(--inari-red)`). Aucun hex en dur.
// - Police : Geist Mono (self-hosted).
// - MutationObserver sur le parent pour relire la couleur si le thème change live.
// - IntersectionObserver + document.visibilityState : pause off-screen / tab hidden.
// - Respect prefers-reduced-motion : dessine une frame statique, pas de RAF.
// - Canvas 2D vanilla, DPR-aware.

const RED_THEME = 'rouge'

// Pool de caractères cybersec (hex + ASCII + symboles) — spec bg-animations §🔴
const CHAR_POOL =
  '0123456789ABCDEFabcdef' +
  'ghijklmnopqrstuvwxyzGHIJKLMNOPQRSTUVWXYZ' +
  '<>{}[]()/\\|~!@#$%^&*+=?.,:;'

const CHAR_POOL_LEN = CHAR_POOL.length

function randChar(): string {
  return CHAR_POOL.charAt((Math.random() * CHAR_POOL_LEN) | 0)
}

type Column = {
  y: number
  speed: number // px / ms
  char: string
  sinceMutate: number // ms depuis dernier changement de caractère
}

export function MatrixRainRed() {
  // Probe invisible pour détecter le parent porteur de [data-theme] au premier render.
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [host, setHost] = useState<HTMLElement | null>(null)
  // undefined = pas encore mesuré · null = pas d'ancêtre [data-theme] · string = thème actif
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)

  // Phase 1 — après premier layout, remonte au plus proche [data-theme]
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

  // Phase 3 — animation, uniquement si le thème actif est "rouge"
  useEffect(() => {
    if (activeTheme !== RED_THEME || !host) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const fontSize = 14
    const columnWidth = 14
    const fontStack = `${fontSize}px "Geist Mono", ui-monospace, SFMono-Regular, monospace`

    let cssW = 0
    let cssH = 0
    let columns: Column[] = []

    const readColor = (): string => {
      const raw = getComputedStyle(host).getPropertyValue('--inari-red').trim()
      return raw || '#E31E24'
    }
    let themeColor = readColor()

    const resize = () => {
      const nextW = Math.max(1, wrap.clientWidth)
      const nextH = Math.max(1, wrap.clientHeight)
      if (nextW === cssW && nextH === cssH && columns.length > 0) return
      cssW = nextW
      cssH = nextH
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const n = Math.max(1, Math.floor(cssW / columnWidth))
      columns = new Array(n).fill(null).map(() => ({
        y: Math.random() * cssH,
        speed: 0.2 + Math.random() * 0.333, // ralenti d'1/3 vs spec : 0.2–0.533 px/ms
        char: randChar(),
        sinceMutate: 0,
      }))

      // Clear initial
      ctx.clearRect(0, 0, cssW, cssH)
    }
    resize()

    const ro = new ResizeObserver(() => resize())
    ro.observe(wrap)

    // Observe aussi les changements de style/class sur host (ex: theme live switch
    // qui modifie la valeur computed de --inari-red sans toucher data-theme)
    const colorMo = new MutationObserver(() => {
      themeColor = readColor()
    })
    colorMo.observe(host, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    })

    // Off-screen pause
    let visible = true
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
      },
      { root: null, threshold: 0 },
    )
    io.observe(wrap)

    // Reduced motion : une seule frame statique, pas de RAF
    if (reduceMotion) {
      ctx.font = fontStack
      ctx.textBaseline = 'top'
      ctx.fillStyle = themeColor
      ctx.globalAlpha = 0.45
      for (let i = 0; i < columns.length; i += 2) {
        ctx.fillText(randChar(), i * columnWidth + 1, Math.random() * cssH)
      }
      ctx.globalAlpha = 1
      return () => {
        ro.disconnect()
        colorMo.disconnect()
        io.disconnect()
      }
    }

    // Animation loop — RAF + delta-time
    let raf = 0
    let lastTs = performance.now()
    const MUTATION_MS = 120 // fréquence de mutation des caractères

    // Twinkle: une étoile scintille toutes les ~20s
    const TWINKLE_INTERVAL = 20_000
    const TWINKLE_DURATION = 800
    let twinkleTimer = TWINKLE_INTERVAL * Math.random() // offset initial aléatoire
    let twinkle: { col: number; y: number; char: string; age: number } | null = null

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(ts - lastTs, 64) // clamp pour éviter les sauts après pause
      lastTs = ts

      if (!visible || document.visibilityState === 'hidden') return

      // Twinkle logic
      twinkleTimer += dt
      if (!twinkle && twinkleTimer >= TWINKLE_INTERVAL && columns.length > 0) {
        const ci = (Math.random() * columns.length) | 0
        twinkle = {
          col: ci,
          y: columns[ci].y,
          char: columns[ci].char,
          age: 0,
        }
        twinkleTimer = 0
      }
      if (twinkle) {
        twinkle.age += dt
        if (twinkle.age >= TWINKLE_DURATION) twinkle = null
      }

      // Trail fade (comme la source : ctx.fillStyle = 'rgba(0,0,0,.05)' + fillRect)
      ctx.fillStyle = 'rgba(10, 10, 15, 0.08)'
      ctx.fillRect(0, 0, cssW, cssH)

      ctx.font = fontStack
      ctx.textBaseline = 'top'
      ctx.fillStyle = themeColor

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]

        // Tête du trail (plus lumineuse)
        ctx.globalAlpha = 0.85
        ctx.fillText(col.char, i * columnWidth + 1, Math.floor(col.y))

        col.sinceMutate += dt
        if (col.sinceMutate > MUTATION_MS) {
          col.char = randChar()
          col.sinceMutate = 0
        }

        col.y += col.speed * dt

        if (col.y > cssH + Math.random() * 200) {
          col.y = -fontSize * 2
          col.speed = 0.2 + Math.random() * 0.333
          col.char = randChar()
        }
      }

      // Dessine le twinkle par-dessus
      if (twinkle) {
        const t = twinkle.age / TWINKLE_DURATION
        // Ease in-out: monte puis redescend
        const intensity = t < 0.5 ? t * 2 : (1 - t) * 2
        const x = twinkle.col * columnWidth + 1
        const y = Math.floor(twinkle.y)

        // Halo glow
        ctx.save()
        ctx.shadowColor = themeColor
        ctx.shadowBlur = 12 * intensity
        ctx.globalAlpha = 0.6 + 0.4 * intensity
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(twinkle.char, x, y)
        ctx.restore()
      }

      ctx.globalAlpha = 1
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

  // Tout thème ≠ rouge → rien (return null strict)
  if (activeTheme !== RED_THEME) {
    return null
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0.10 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
