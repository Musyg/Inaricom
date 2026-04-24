import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Inaricom — BlueprintGridBlue (v2.4 — L-shape routing, 1px)
// Fond animé thème "bleu" (institutionnel) : grille blueprint statique + nœuds
// statiques aux intersections + petits packets qui VOYAGENT en L sur deux
// segments orthogonaux (A -> B -> C). Seul le point se déplace, avec une
// courte traînée qui tourne au coude B quand elle l'enjambe.
//
// Contrats (docs/specs/animations-mapping.md § 🔵 + docs/specs/background-animations.md § 🔵) :
// - Actif UNIQUEMENT quand le plus proche ancêtre [data-theme] vaut "bleu".
// - Tout autre thème → return null.
// - Couleur via var(--inari-red) sur le host (vaut #00D4FF en bleu).
// - prefers-reduced-motion : 1 frame statique (grille + nœuds + packets figés).
// - Pause off-screen via IntersectionObserver + document.visibilityState.
// - MutationObserver sur le host pour couleur live.
// - Canvas 2D vanilla, DPR-aware (cap à 2).

const BLUE_THEME = 'bleu'
const MOBILE_MAX_W = 768

type Point = { col: number; row: number }

type Packet = {
  a: Point
  b: Point // coude
  c: Point
  startTs: number
  duration: number // ms total pour parcourir A -> B -> C
}

function pointKey(p: Point): string {
  return `${p.col},${p.row}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 212,
    b: parseInt(clean.slice(4, 6), 16) || 255,
  }
}

export function BlueprintGridBlue() {
  const probeRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null | undefined>(undefined)

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

  useEffect(() => {
    if (!host) return
    const mo = new MutationObserver(() => {
      setActiveTheme(host.getAttribute('data-theme'))
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [host])

  useEffect(() => {
    if (activeTheme !== BLUE_THEME || !host) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const staticCanvas = document.createElement('canvas')
    const staticCtx = staticCanvas.getContext('2d', { alpha: true })
    if (!staticCtx) return

    let cssW = 0
    let cssH = 0
    let gridSpacing = 80
    let cols = 0
    let rows = 0
    let activePacketCount = 7
    let packets: Packet[] = []

    const readColor = (): string => {
      const raw = getComputedStyle(host).getPropertyValue('--inari-red').trim()
      return raw || '#00D4FF'
    }
    let themeColor = readColor()
    let rgb = hexToRgb(themeColor)

    const drawStatic = () => {
      staticCanvas.width = Math.floor(cssW * dpr)
      staticCanvas.height = Math.floor(cssH * dpr)
      staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      staticCtx.clearRect(0, 0, cssW, cssH)

      staticCtx.strokeStyle = themeColor
      staticCtx.globalAlpha = 0.08
      staticCtx.lineWidth = 1
      staticCtx.beginPath()
      for (let c = 0; c <= cols; c++) {
        const x = c * gridSpacing + 0.5
        staticCtx.moveTo(x, 0)
        staticCtx.lineTo(x, cssH)
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * gridSpacing + 0.5
        staticCtx.moveTo(0, y)
        staticCtx.lineTo(cssW, y)
      }
      staticCtx.stroke()

      // Nœuds — petits, 1.3px
      staticCtx.globalAlpha = 0.28
      staticCtx.fillStyle = themeColor
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          staticCtx.beginPath()
          staticCtx.arc(c * gridSpacing, r * gridSpacing, 1.3, 0, Math.PI * 2)
          staticCtx.fill()
        }
      }
      staticCtx.globalAlpha = 1
    }

    const adjacentNeighbors = (p: Point): Point[] => {
      const out: Point[] = []
      if (p.col > 0) out.push({ col: p.col - 1, row: p.row })
      if (p.col < cols) out.push({ col: p.col + 1, row: p.row })
      if (p.row > 0) out.push({ col: p.col, row: p.row - 1 })
      if (p.row < rows) out.push({ col: p.col, row: p.row + 1 })
      return out
    }

    const endPositions = (): Set<string> => {
      const set = new Set<string>()
      for (const p of packets) {
        set.add(pointKey(p.c))
      }
      return set
    }

    // Spawn un packet en L : A -> B (coude) -> C, avec AB ⊥ BC
    const spawnPacket = (now: number): Packet | null => {
      if (cols < 1 || rows < 1) return null
      const ends = endPositions()
      for (let attempt = 0; attempt < 24; attempt++) {
        const a: Point = {
          col: (Math.random() * (cols + 1)) | 0,
          row: (Math.random() * (rows + 1)) | 0,
        }
        const nA = adjacentNeighbors(a)
        if (nA.length === 0) continue
        const b = nA[(Math.random() * nA.length) | 0]
        const dAB = { dc: b.col - a.col, dr: b.row - a.row }
        // c voisin de b, direction perpendiculaire à ab (produit scalaire = 0)
        const nB = adjacentNeighbors(b).filter((n) => {
          const dBC = { dc: n.col - b.col, dr: n.row - b.row }
          return dAB.dc * dBC.dc + dAB.dr * dBC.dr === 0
        })
        if (nB.length === 0) continue
        const c = nB[(Math.random() * nB.length) | 0]
        if (ends.has(pointKey(c))) continue
        return {
          a,
          b,
          c,
          startTs: now,
          // 2 segments -> plus long : 3400-4600ms (~1700-2300ms par segment)
          duration: 3400 + Math.random() * 1200,
        }
      }
      // Fallback : accepte un chevauchement à l'arrivée
      const a: Point = {
        col: (Math.random() * (cols + 1)) | 0,
        row: (Math.random() * (rows + 1)) | 0,
      }
      const nA = adjacentNeighbors(a)
      if (nA.length === 0) return null
      const b = nA[(Math.random() * nA.length) | 0]
      const dAB = { dc: b.col - a.col, dr: b.row - a.row }
      const nB = adjacentNeighbors(b).filter((n) => {
        const dBC = { dc: n.col - b.col, dr: n.row - b.row }
        return dAB.dc * dBC.dc + dAB.dr * dBC.dr === 0
      })
      if (nB.length === 0) return null
      const c = nB[(Math.random() * nB.length) | 0]
      return { a, b, c, startTs: now, duration: 3400 + Math.random() * 1200 }
    }

    const resize = () => {
      const nextW = Math.max(1, wrap.clientWidth)
      const nextH = Math.max(1, wrap.clientHeight)
      const nextMobile = nextW < MOBILE_MAX_W
      gridSpacing = nextMobile ? 60 : 80
      activePacketCount = nextMobile ? 4 : 7
      cssW = nextW
      cssH = nextH
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.floor(cssW / gridSpacing)
      rows = Math.floor(cssH / gridSpacing)
      drawStatic()
      packets = []
      const now = performance.now()
      for (let i = 0; i < activePacketCount; i++) {
        const p = spawnPacket(now - Math.random() * 2500)
        if (p) packets.push(p)
      }
    }
    resize()

    let resizeTimer: number | null = null
    const ro = new ResizeObserver(() => {
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 200)
    })
    ro.observe(wrap)

    const colorMo = new MutationObserver(() => {
      themeColor = readColor()
      rgb = hexToRgb(themeColor)
      drawStatic()
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

    // Position le long du trajet L à un progress [0..1]
    // [0..0.5] = A -> B, [0.5..1] = B -> C
    const pointAt = (p: Packet, t: number): { x: number; y: number } => {
      if (t < 0.5) {
        const k = t * 2
        return {
          x: (p.a.col + (p.b.col - p.a.col) * k) * gridSpacing,
          y: (p.a.row + (p.b.row - p.a.row) * k) * gridSpacing,
        }
      }
      const k = (t - 0.5) * 2
      return {
        x: (p.b.col + (p.c.col - p.b.col) * k) * gridSpacing,
        y: (p.b.row + (p.c.row - p.b.row) * k) * gridSpacing,
      }
    }

    // Reduced motion : 1 frame avec 6 packets figés mi-trajet
    if (reduceMotion) {
      ctx.drawImage(staticCanvas, 0, 0, cssW, cssH)
      const staticCount = 6
      for (let i = 0; i < staticCount; i++) {
        const p = spawnPacket(0)
        if (!p) continue
        const progress = 0.25 + Math.random() * 0.5
        const pos = pointAt(p, progress)
        ctx.globalAlpha = 0.85
        ctx.fillStyle = themeColor
        ctx.shadowColor = themeColor
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      return () => {
        if (resizeTimer !== null) clearTimeout(resizeTimer)
        ro.disconnect()
        colorMo.disconnect()
        io.disconnect()
      }
    }

    // Animation loop
    let raf = 0
    const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
    const TRAIL_LENGTH = 0.18 // 18% du trajet total (sur 2 segments)
    const MAX_TRAIL_ALPHA = 0.55

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.visibilityState === 'hidden') return

      ctx.clearRect(0, 0, cssW, cssH)
      ctx.drawImage(staticCanvas, 0, 0, cssW, cssH)

      ctx.lineCap = 'round'

      for (let i = 0; i < packets.length; i++) {
        const pk = packets[i]
        const t = ts - pk.startTs
        if (t < 0) continue
        if (t >= pk.duration) {
          const next = spawnPacket(ts)
          if (next) packets[i] = next
          continue
        }

        const progress = easeInOutCubic(t / pk.duration)
        const trailT = Math.max(0, progress - TRAIL_LENGTH)

        const headPos = pointAt(pk, progress)
        const trailPos = pointAt(pk, trailT)

        // Fade in/out très doux aux extrémités
        let alphaMult = 1
        if (progress < 0.05) alphaMult = progress / 0.05
        else if (progress > 0.95) alphaMult = (1 - progress) / 0.05

        // Traînée : enjambe-t-elle le coude B (progress = 0.5) ?
        const straddle = trailT < 0.5 && progress > 0.5
        const maxA = MAX_TRAIL_ALPHA * alphaMult

        if (straddle) {
          const bx = pk.b.col * gridSpacing
          const by = pk.b.row * gridSpacing
          // alpha au coude : linéaire sur la longueur totale de la traînée
          const bAlpha = maxA * ((0.5 - trailT) / TRAIL_LENGTH)

          // trail -> B
          const g1 = ctx.createLinearGradient(trailPos.x, trailPos.y, bx, by)
          g1.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
          g1.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},${bAlpha})`)
          ctx.strokeStyle = g1
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(trailPos.x, trailPos.y)
          ctx.lineTo(bx, by)
          ctx.stroke()

          // B -> head
          const g2 = ctx.createLinearGradient(bx, by, headPos.x, headPos.y)
          g2.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${bAlpha})`)
          g2.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},${maxA})`)
          ctx.strokeStyle = g2
          ctx.beginPath()
          ctx.moveTo(bx, by)
          ctx.lineTo(headPos.x, headPos.y)
          ctx.stroke()
        } else if (progress > TRAIL_LENGTH * 0.15) {
          // Traînée dans un seul segment : gradient simple
          const g = ctx.createLinearGradient(trailPos.x, trailPos.y, headPos.x, headPos.y)
          g.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
          g.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},${maxA})`)
          ctx.strokeStyle = g
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(trailPos.x, trailPos.y)
          ctx.lineTo(headPos.x, headPos.y)
          ctx.stroke()
        }

        // Tête — 1px, halo doux
        ctx.globalAlpha = 0.9 * alphaMult
        ctx.shadowColor = themeColor
        ctx.shadowBlur = 6
        ctx.fillStyle = themeColor
        ctx.beginPath()
        ctx.arc(headPos.x, headPos.y, 1, 0, Math.PI * 2)
        ctx.fill()

        // Petit flash d'impact à l'arrivée (5% final)
        if (progress > 0.95) {
          const cx = pk.c.col * gridSpacing
          const cy = pk.c.row * gridSpacing
          const impact = (progress - 0.95) / 0.05
          ctx.globalAlpha = 0.45 * (1 - impact) * alphaMult
          ctx.beginPath()
          ctx.arc(cx, cy, 1.5 + impact * 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      ro.disconnect()
      colorMo.disconnect()
      io.disconnect()
    }
  }, [activeTheme, host])

  if (activeTheme === undefined) {
    return <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
  }

  if (activeTheme !== BLUE_THEME) {
    return null
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0.3 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
