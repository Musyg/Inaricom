import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import FoxPathsWorker from '@/workers/foxPathsWorker?worker'
import { processFoxPaths, type Pt, type Segment } from '@/utils/foxPaths'
import type { FoxPathsWorkerRequest, FoxPathsWorkerResponse } from '@/workers/foxPathsWorker'

// Inaricom — FoxAnimationV29 (React island)
//
// Concept v29 : "le WORDMARK INARICOM se demantele en poussiere pour former le renard".
// Au demarrage, le texte stylise "INARICOM" (extrait du logo officiel argente,
// partie droite du logo) apparait centre sur la bounding box du fox. Il est
// rasterise depuis /assets/logo-silver-v2.png, la moitie droite (wordmark)
// est isolee via detection du plus gros gap horizontal, puis echantillonnee
// pour generer des particules qui forment les lettres.
//
// Chaque beam v28 en phase de trace siphonne en continu des particules depuis
// le wordmark : chaque particule quitte sa place dans la lettre, vole vers la
// tete courante du beam avec petit trail, puis disparait absorbee par la ligne
// qui se materialise. Le mot se "ronge" progressivement jusqu'a disparition
// totale. Etat final : renard solide v28 identique, wordmark vide.
//
// Perf : le parse JSON (~2.3 MB) + le post-processing (stitch O(n²) + split +
// trim) sont decharges sur un Web Worker (`@/workers/foxPathsWorker`). Gain
// mesure ~30 ms LCP mobile homepage vs traitement main thread (ticket P1
// `perf/fox-paths-worker`). Fallback main thread si worker fail (CSP, etc.).

type ThemeName = 'rouge' | 'or' | 'bleu' | 'vert' | 'neutre'
type Rgb = { r: number; g: number; b: number }

const THEME_COLORS: Record<ThemeName, { primary: Rgb; dark: Rgb }> = {
  rouge: { primary: { r: 227, g: 30, b: 36 }, dark: { r: 160, g: 9, b: 9 } },
  or: { primary: { r: 255, g: 215, b: 0 }, dark: { r: 184, g: 134, b: 11 } },
  bleu: { primary: { r: 0, g: 212, b: 255 }, dark: { r: 0, g: 168, b: 204 } },
  vert: { primary: { r: 16, g: 185, b: 129 }, dark: { r: 5, g: 150, b: 105 } },
  neutre: { primary: { r: 208, g: 208, b: 208 }, dark: { r: 128, g: 128, b: 128 } },
}

const CONFIG = {
  jsonUrl: `${import.meta.env.BASE_URL}assets/data/fox-paths.json`,
  logoUrl: `${import.meta.env.BASE_URL}assets/logo-silver-v2.png`,
  minSegmentLength: 1000,
  stitchThreshold: 25,
  beamSpeed: 620,
  trailPercent: 0.02,
  lineWidth: 2,
  glowBlur: 5,
  revealOpacityWhite: 0.5,
  revealOpacityRed: 0.8,
  revealGlow: 5,
  finalOpacityWhite: 0.9,
  finalOpacityRed: 1,
  finalGlow: 12,
  finalLineMultiplier: 2,
  materializeDuration: 0.3,
  foxOffsetX: 0.72,
  foxScale: 0.85,
  sparkCount: 3,
  sparkSpeed: 80,
  sparkLife: 0.4,
  sparkSize: 5,
  sparkGlow: 5,
  colorTransitionDuration: 0.5,
  bgColor: '#0a0a0b',

  // === Wordmark (reservoir de particules extrait du logo) ===
  wordmarkSampling: 1,          // sampling tous les N px (1 = densité maximale)
  wordmarkPixelThreshold: 30,   // alpha minimum pour considerer un pixel actif
  wordmarkScaleFactor: 0.85,    // taille wordmark vs bbox fox (0.85 = plus petit que le fox)
  wordmarkYOffsetFactor: -0.2,  // remonte au-dessus du centre bbox fox
  wordmarkBrownianPx: 1.0,
  wordmarkBrownianFreq: 0.9,
  wordmarkMinSize: 0.8,
  wordmarkMaxSize: 1.6,
  wordmarkMinAlpha: 0.65,
  wordmarkMaxAlpha: 1.0,
  wordmarkIntroDuration: 0.8,   // duree d'arrivee des particules vers leur place
  wordmarkStableDuration: 0.6,  // pause stable avant que les beams puissent siphonner

  // === Streams ===
  streamSpawnIntervalMs: 28,
  streamSpeed: 750,
  streamSpeedJitter: 200,
  streamAbsorbDist: 4,
  streamTrailLen: 4,
  streamFadeInTime: 0.06,

  // === Auto-sync drain ===
  // Le streamSpawnIntervalMs ci-dessus n'est qu'une valeur fallback. Au runtime,
  // on auto-calcule l'intervalle pour drainer pile P particules dans la duree
  // cumulee d'activite des beams (sum(L_i)/beamSpeed). Safety factor < 1 fait
  // finir le drain avant le trace, > 1 apres. Sweet spot autour de 0.92.
  streamSpawnSafetyFactor: 1,
} as const

const MOBILE_MAX_W = 768

function isThemeName(s: string | null | undefined): s is ThemeName {
  return s === 'rouge' || s === 'or' || s === 'bleu' || s === 'vert' || s === 'neutre'
}

// ============================================================================

export function FoxAnimationV29() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [activeTheme, setActiveTheme] = useState<ThemeName>('neutre')
  const setThemeApi = useRef<((t: ThemeName, instant?: boolean) => void) | null>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const parent = wrap.parentElement?.closest('[data-theme]') as HTMLElement | null
    if (parent) {
      setHost(parent)
      const t = parent.getAttribute('data-theme')
      if (isThemeName(t)) setActiveTheme(t)
    }
  }, [])

  useEffect(() => {
    if (!host) return
    const mo = new MutationObserver(() => {
      const t = host.getAttribute('data-theme')
      if (isThemeName(t)) setActiveTheme(t)
    })
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [host])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctxMaybe = canvas.getContext('2d', { alpha: true })
    if (!ctxMaybe) return
    const ctx: CanvasRenderingContext2D = ctxMaybe

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ====== closure state ======
    let cssW = 0, cssH = 0, dpr = 1
    let originalWidth = 3840, originalHeight = 2160
    let scale = 1, offsetX = 0, offsetY = 0
    let isMobile = false

    let segments: Segment[] = []
    let beams: PulseBeam[] = []
    const sparks: Spark[] = []
    let wordmarkSamples: WordmarkSample[] = []   // sampling brut du wordmark (coords source)
    let wordmarkParticles: WordmarkParticle[] = [] // particules vivantes placees a l'ecran
    let foxBBox: { minX: number; minY: number; maxX: number; maxY: number } | null = null
    let phaseTimer = 0 // temps ecoule depuis le debut de l'anim
    const INTRO_END = CONFIG.wordmarkIntroDuration
    const STABLE_END = INTRO_END + CONFIG.wordmarkStableDuration
    let beamsStarted = false
    // Auto-tune au runtime (cf. CONFIG.streamSpawnSafetyFactor) une fois beams
    // crees et wordmark place. Defaut = valeur de fallback hardcodee.
    let runtimeSpawnIntervalMs: number = CONFIG.streamSpawnIntervalMs

    let lastTime = 0
    let raf = 0
    let cancelled = false
    let visible = true
    let animationComplete = false

    let currentTheme: ThemeName = 'neutre'
    let targetColors = { ...THEME_COLORS.neutre }
    const activeColors = {
      primary: { ...THEME_COLORS.neutre.primary },
      dark: { ...THEME_COLORS.neutre.dark },
    }
    let colorTransitionProgress = 1
    let firstThemeSet = true

    // ====== helpers ======
    const lerpColor = (from: Rgb, to: Rgb, t: number): Rgb => ({
      r: Math.round(from.r + (to.r - from.r) * t),
      g: Math.round(from.g + (to.g - from.g) * t),
      b: Math.round(from.b + (to.b - from.b) * t),
    })

    const getActiveColor = (segColor: string): Rgb => {
      const c = segColor.toLowerCase()
      if (c === '#ffffff' || c === '#fff') return { r: 255, g: 255, b: 255 }
      if (c === '#e31e24') return activeColors.primary
      if (c === '#a00909') return activeColors.dark
      return activeColors.primary
    }

    const applyTheme = (newTheme: ThemeName, instant: boolean) => {
      if (instant) {
        currentTheme = newTheme
        targetColors = THEME_COLORS[newTheme]
        activeColors.primary = { ...targetColors.primary }
        activeColors.dark = { ...targetColors.dark }
        colorTransitionProgress = 1
        for (const b of beams) if (b.isRed) b.color = activeColors.primary
        if (animationComplete) drawFinalState()
        return
      }
      if (newTheme === currentTheme && colorTransitionProgress >= 1) return
      currentTheme = newTheme
      targetColors = THEME_COLORS[newTheme]
      colorTransitionProgress = 0
      if (animationComplete) {
        activeColors.primary = { ...targetColors.primary }
        activeColors.dark = { ...targetColors.dark }
        for (const b of beams) if (b.isRed) b.color = activeColors.primary
        drawFinalState()
      }
    }

    setThemeApi.current = (t, inst) => {
      const doInst = inst || firstThemeSet
      firstThemeSet = false
      applyTheme(t, !!doInst)
    }

    const updateColorTransition = (dt: number) => {
      if (colorTransitionProgress >= 1) return
      colorTransitionProgress = Math.min(1, colorTransitionProgress + dt / CONFIG.colorTransitionDuration)
      const t = 1 - Math.pow(1 - colorTransitionProgress, 3)
      activeColors.primary = lerpColor(activeColors.primary, targetColors.primary, t * 0.1)
      activeColors.dark = lerpColor(activeColors.dark, targetColors.dark, t * 0.1)
      if (colorTransitionProgress >= 1) {
        activeColors.primary = { ...targetColors.primary }
        activeColors.dark = { ...targetColors.dark }
      }
      for (const b of beams) if (b.isRed) b.color = activeColors.primary
    }

    // ====== sparks v28 ======
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: Rgb }
    const createSpark = (x: number, y: number, color: Rgb) => {
      for (let i = 0; i < CONFIG.sparkCount; i++) {
        const angle = ((Math.PI * 2 * i) / CONFIG.sparkCount) + Math.random() * 0.5
        const sp = CONFIG.sparkSpeed * (0.5 + Math.random() * 0.5)
        sparks.push({ x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, life: CONFIG.sparkLife, maxLife: CONFIG.sparkLife, color })
      }
    }
    const updateAndDrawSparks = (dt: number) => {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx * dt; s.y += s.vy * dt
        s.vx *= 0.92; s.vy *= 0.92
        s.life -= dt
        const lr = s.life / s.maxLife
        const op = lr * lr
        if (op > 0.01) {
          const { r, g, b } = s.color
          const size = CONFIG.sparkSize * scale * (0.5 + lr * 0.5)
          ctx.shadowColor = `rgba(${r},${g},${b},${op})`
          ctx.shadowBlur = CONFIG.sparkGlow * scale * lr
          ctx.beginPath()
          ctx.arc(s.x, s.y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${op})`
          ctx.fill()
        }
        if (s.life <= 0) sparks.splice(i, 1)
      }
      ctx.shadowBlur = 0
    }

    // ====== WORDMARK sampling ======
    // Sample retourne positions relatives (0..1) dans la bbox du wordmark source
    type WordmarkSample = { u: number; v: number } // normalise

    type WordmarkParticle = {
      // position cible a l'ecran (centre du wordmark + offset)
      targetX: number; targetY: number
      // position initiale (point de spawn disperse pour intro)
      initX: number; initY: number
      // position courante (interpolee entre initial et target durant l'intro)
      x: number; y: number
      phaseX: number; phaseY: number // Brownien
      freq: number
      size: number
      alpha: number
    }

    // Analyse le logo PNG : detecte la separation renard | wordmark, retourne
    // les samples de la moitie "wordmark" uniquement (positions normalisees).
    const analyzeLogoImage = (img: HTMLImageElement): WordmarkSample[] => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const off = document.createElement('canvas')
      off.width = w; off.height = h
      const octx = off.getContext('2d', { alpha: true })
      if (!octx) return []
      octx.drawImage(img, 0, 0)
      const data = octx.getImageData(0, 0, w, h).data

      // Compte les pixels actifs par colonne
      const colCount = new Array<number>(w).fill(0)
      const threshold = CONFIG.wordmarkPixelThreshold
      for (let x = 0; x < w; x++) {
        let c = 0
        for (let y = 0; y < h; y++) {
          const idx = (y * w + x) * 4
          const a = data[idx + 3]
          if (a > threshold) c++
        }
        colCount[x] = c
      }

      // Detecte les colonnes "vides" (moins de 2% de pixels actifs)
      const emptyT = Math.max(1, Math.floor(h * 0.02))
      const empty = colCount.map((c) => c <= emptyT)

      // Trouve le plus long run de colonnes vides ENTRE deux zones de contenu
      let firstContent = -1, lastContent = -1
      for (let x = 0; x < w; x++) {
        if (!empty[x]) { if (firstContent === -1) firstContent = x; lastContent = x }
      }
      if (firstContent < 0 || lastContent <= firstContent) return []

      // Trouve le gap le plus long entre firstContent+20 et lastContent-20
      let gapStart = -1, gapEnd = -1, gapLen = 0
      let curStart = -1, curLen = 0
      for (let x = firstContent; x <= lastContent; x++) {
        if (empty[x]) {
          if (curStart === -1) curStart = x
          curLen++
        } else {
          if (curLen > gapLen) { gapLen = curLen; gapStart = curStart; gapEnd = curStart + curLen - 1 }
          curStart = -1; curLen = 0
        }
      }
      if (curLen > gapLen) { gapLen = curLen; gapStart = curStart; gapEnd = curStart + curLen - 1 }

      // Si gap trouve et de taille raisonnable (> 3% largeur), on split
      let wordmarkStart = firstContent
      let wordmarkEnd = lastContent
      if (gapLen > w * 0.03 && gapStart > firstContent + 10) {
        // Assume : renard a gauche, wordmark a droite (layout logo classique)
        // Mais on verifie : on prend la zone avec le plus de largeur (wordmark
        // est generalement plus large que le renard dans les logos inline)
        const leftW = gapStart - firstContent
        const rightW = lastContent - gapEnd
        if (rightW >= leftW * 0.8) {
          wordmarkStart = gapEnd + 1
          wordmarkEnd = lastContent
        } else {
          // renard > wordmark : on prend a gauche
          wordmarkStart = firstContent
          wordmarkEnd = gapStart - 1
        }
      }

      // Trouve la bbox verticale dans la zone wordmark
      let topY = h, bottomY = -1
      for (let x = wordmarkStart; x <= wordmarkEnd; x++) {
        for (let y = 0; y < h; y++) {
          const idx = (y * w + x) * 4
          if (data[idx + 3] > threshold) {
            if (y < topY) topY = y
            if (y > bottomY) bottomY = y
          }
        }
      }
      if (bottomY < topY) return []

      const bboxW = wordmarkEnd - wordmarkStart + 1
      const bboxH = bottomY - topY + 1
      const step = CONFIG.wordmarkSampling
      const samples: WordmarkSample[] = []
      for (let y = topY; y <= bottomY; y += step) {
        for (let x = wordmarkStart; x <= wordmarkEnd; x += step) {
          const idx = (y * w + x) * 4
          if (data[idx + 3] > threshold) {
            samples.push({
              u: (x - wordmarkStart) / bboxW,
              v: (y - topY) / bboxH,
            })
          }
        }
      }
      // stocker aspect ratio pour le mapping
      ;(samples as any).aspect = bboxW / bboxH
      return samples
    }

    // Positionne les wordmarkSamples a l'ecran en fonction de la bbox du fox
    const placeWordmark = () => {
      wordmarkParticles = []
      if (!foxBBox || wordmarkSamples.length === 0) return
      const foxW = foxBBox.maxX - foxBBox.minX
      const foxH = foxBBox.maxY - foxBBox.minY
      const foxCx = (foxBBox.minX + foxBBox.maxX) / 2
      const foxCy = (foxBBox.minY + foxBBox.maxY) / 2

      // Taille visuelle du wordmark : largeur = ~85% de la largeur du fox
      const targetW = foxW * CONFIG.wordmarkScaleFactor
      const aspect = (wordmarkSamples as any).aspect || 3
      const targetH = targetW / aspect

      const originX = foxCx - targetW / 2
      const originY = foxCy + foxH * CONFIG.wordmarkYOffsetFactor - targetH / 2

      for (const s of wordmarkSamples) {
        const tx = originX + s.u * targetW
        const ty = originY + s.v * targetH
        // Position initiale dispersee (cercle autour de la position cible, rayon
        // proportionnel a la largeur du viewport pour etre vraiment eparpille)
        const disperseR = Math.max(120, Math.min(cssW, cssH) * 0.35)
        const ang = Math.random() * Math.PI * 2
        const r = Math.random() * disperseR + 40
        const ix = tx + Math.cos(ang) * r
        const iy = ty + Math.sin(ang) * r
        wordmarkParticles.push({
          targetX: tx, targetY: ty,
          initX: ix, initY: iy,
          x: ix, y: iy,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          freq: CONFIG.wordmarkBrownianFreq * (0.7 + Math.random() * 0.6),
          size: CONFIG.wordmarkMinSize + Math.random() * (CONFIG.wordmarkMaxSize - CONFIG.wordmarkMinSize),
          alpha: CONFIG.wordmarkMinAlpha + Math.random() * (CONFIG.wordmarkMaxAlpha - CONFIG.wordmarkMinAlpha),
        })
      }
    }

    // ====== PulseBeam v29 ======
    type StreamParticle = { x: number; y: number; life: number; speed: number; trail: Pt[]; size: number; alpha: number }

    class PulseBeam {
      segment: Segment
      id: number
      originalColor: string
      color: Rgb
      speed: number
      progress = 0
      trail: Pt[] = []
      maxTrail: number
      isRed: boolean
      sparkTriggered = false
      revealedProgress = 0
      beamFinished = false
      materializePhase = false
      materializeProgress = 0
      fullyMaterialized = false

      streams: StreamParticle[] = []
      spawnAccumMs = 0
      headX = 0
      headY = 0

      constructor(segment: Segment, id: number) {
        this.segment = segment
        this.id = id
        this.originalColor = segment.color
        this.color = getActiveColor(segment.color)
        this.speed = CONFIG.beamSpeed / (segment.length ?? 1)
        this.maxTrail = Math.max(5, Math.floor(segment.points.length * CONFIG.trailPercent))
        const c = segment.color.toLowerCase()
        this.isRed = c === '#e31e24' || c === '#a00909'
      }

      spawnStream() {
        if (wordmarkParticles.length === 0) return
        // Prend la particule la plus proche de sa tete courante
        let bestIdx = -1
        let bestD = Infinity
        // Sampling : pour perf, on echantillonne seulement 40 particules aleatoires
        const n = wordmarkParticles.length
        const sampleCount = Math.min(80, n)
        for (let i = 0; i < sampleCount; i++) {
          const idx = (Math.random() * n) | 0
          const p = wordmarkParticles[idx]
          const d = Math.hypot(p.x - this.headX, p.y - this.headY)
          if (d < bestD) { bestD = d; bestIdx = idx }
        }
        if (bestIdx < 0) return
        const p = wordmarkParticles.splice(bestIdx, 1)[0]
        this.streams.push({
          x: p.x, y: p.y,
          life: 0,
          speed: CONFIG.streamSpeed + (Math.random() - 0.5) * CONFIG.streamSpeedJitter,
          trail: [],
          size: p.size,
          alpha: p.alpha,
        })
      }

      updateStreams(dt: number) {
        if (!this.beamFinished && !this.materializePhase && beamsStarted) {
          this.spawnAccumMs += dt * 1000
          while (this.spawnAccumMs >= runtimeSpawnIntervalMs) {
            this.spawnAccumMs -= runtimeSpawnIntervalMs
            this.spawnStream()
          }
        }
        for (let i = this.streams.length - 1; i >= 0; i--) {
          const s = this.streams[i]
          s.life += dt
          s.trail.push({ x: s.x, y: s.y })
          if (s.trail.length > CONFIG.streamTrailLen) s.trail.shift()
          const dx = this.headX - s.x
          const dy = this.headY - s.y
          const d = Math.hypot(dx, dy)
          if (d <= CONFIG.streamAbsorbDist) { this.streams.splice(i, 1); continue }
          const mv = s.speed * dt
          if (mv >= d) { this.streams.splice(i, 1); continue }
          s.x += (dx / d) * mv
          s.y += (dy / d) * mv
          if (s.life > 3.5) this.streams.splice(i, 1)
        }
      }

      update(dt: number) {
        if (this.isRed) this.color = getActiveColor(this.originalColor)
        if (this.fullyMaterialized) return

        if (this.materializePhase) {
          this.materializeProgress += dt / CONFIG.materializeDuration
          if (this.materializeProgress >= 1) { this.materializeProgress = 1; this.fullyMaterialized = true }
          this.updateStreams(dt)
          return
        }

        if (!this.beamFinished) {
          if (!beamsStarted) { this.updateStreams(dt); return }
          this.progress += this.speed * dt
          const pos = this.getPosition(Math.min(1, this.progress))
          this.headX = pos.x * scale + offsetX
          this.headY = pos.y * scale + offsetY
          this.trail.push({ x: this.headX, y: this.headY })
          while (this.trail.length > this.maxTrail) this.trail.shift()
          this.revealedProgress = Math.max(0, Math.min(1, this.progress - CONFIG.trailPercent))
          if (this.progress >= 1) {
            if (!this.sparkTriggered && this.trail.length > 0) {
              const endPos = this.trail[this.trail.length - 1]
              createSpark(endPos.x, endPos.y, this.color)
              this.sparkTriggered = true
            }
            for (let i = 0; i < 3 && this.trail.length > 0; i++) {
              this.trail.shift()
              this.revealedProgress = Math.min(1, this.revealedProgress + CONFIG.trailPercent / this.maxTrail)
            }
            if (this.trail.length === 0) {
              this.revealedProgress = 1
              this.beamFinished = true
              this.materializePhase = true
              this.materializeProgress = 0
            }
          }
          this.updateStreams(dt)
        }
      }

      getPosition(t: number): Pt {
        const clamped = Math.max(0, Math.min(1, t))
        const pts = this.segment.points
        const idx = Math.floor(clamped * (pts.length - 1))
        const localT = clamped * (pts.length - 1) - idx
        const p1 = pts[Math.min(idx, pts.length - 1)]
        const p2 = pts[Math.min(idx + 1, pts.length - 1)]
        return { x: p1.x + (p2.x - p1.x) * localT, y: p1.y + (p2.y - p1.y) * localT }
      }

      getMaterializeFactor() {
        if (!this.materializePhase && !this.fullyMaterialized) return 0
        const t = Math.min(1, this.materializeProgress)
        return 1 - Math.pow(1 - t, 3)
      }

      drawRevealedLine() {
        if (this.revealedProgress <= 0) return
        const { r, g, b } = this.color
        const baseLW = CONFIG.lineWidth * Math.max(0.5, scale)
        const mf = this.getMaterializeFactor()
        const startOp = this.isRed ? CONFIG.revealOpacityRed : CONFIG.revealOpacityWhite
        const endOp = this.isRed ? CONFIG.finalOpacityRed : CONFIG.finalOpacityWhite
        const op = startOp + (endOp - startOp) * mf
        const glow = CONFIG.revealGlow + (CONFIG.finalGlow - CONFIG.revealGlow) * mf
        const lineMul = 1 + (CONFIG.finalLineMultiplier - 1) * mf
        const scaledLW = baseLW * 0.8 * lineMul
        const pts = this.segment.points
        const endIdx = Math.floor(this.revealedProgress * (pts.length - 1))
        if (endIdx < 1) return
        ctx.shadowColor = `rgba(${r},${g},${b},${0.5 + 0.3 * mf})`
        ctx.shadowBlur = glow * scale
        ctx.beginPath()
        ctx.moveTo(pts[0].x * scale + offsetX, pts[0].y * scale + offsetY)
        for (let i = 1; i <= endIdx; i++) ctx.lineTo(pts[i].x * scale + offsetX, pts[i].y * scale + offsetY)
        ctx.strokeStyle = `rgba(${r},${g},${b},${op})`
        ctx.lineWidth = scaledLW
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      drawBeam() {
        if (this.fullyMaterialized) return
        const { r, g, b } = this.color
        // trail v28
        if (!this.beamFinished && this.trail.length >= 2) {
          const sw = CONFIG.lineWidth * Math.max(0.5, scale)
          for (let i = 1; i < this.trail.length; i++) {
            const alpha = Math.pow(i / this.trail.length, 2)
            ctx.beginPath()
            ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y)
            ctx.lineTo(this.trail[i].x, this.trail[i].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.9})`
            ctx.lineWidth = sw
            ctx.lineCap = 'round'
            ctx.stroke()
          }
        }
        if (this.streams.length === 0) return
        for (const s of this.streams) {
          let am = 1
          if (s.life < CONFIG.streamFadeInTime) am = s.life / CONFIG.streamFadeInTime
          const a = s.alpha * am
          if (s.trail.length >= 2) {
            for (let i = 1; i < s.trail.length; i++) {
              const ta = ((i / s.trail.length) * a) * 0.6
              ctx.beginPath()
              ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
              ctx.lineTo(s.trail[i].x, s.trail[i].y)
              ctx.strokeStyle = `rgba(${r},${g},${b},${ta})`
              ctx.lineWidth = s.size * 0.8
              ctx.stroke()
            }
          }
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`
          ctx.fill()
        }
      }
    }

    // ====== render wordmark ======
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const drawWordmark = (ts: number) => {
      if (wordmarkParticles.length === 0) return
      const { r, g, b } = activeColors.primary
      const tSec = ts / 1000
      // Phase intro : interpolation de initial -> target
      const introT = Math.min(1, phaseTimer / CONFIG.wordmarkIntroDuration)
      const eased = easeOutCubic(introT)
      for (const p of wordmarkParticles) {
        // Pendant intro : interp init->target, apres : brownien autour de target
        if (introT < 1) {
          p.x = p.initX + (p.targetX - p.initX) * eased
          p.y = p.initY + (p.targetY - p.initY) * eased
        } else {
          const ox = Math.sin(tSec * p.freq * Math.PI * 2 + p.phaseX) * CONFIG.wordmarkBrownianPx
          const oy = Math.cos(tSec * p.freq * Math.PI * 2 + p.phaseY) * CONFIG.wordmarkBrownianPx
          p.x = p.targetX + ox
          p.y = p.targetY + oy
        }
        // fade in pendant l'intro
        const fadeIn = Math.min(1, introT * 1.8)
        const a = p.alpha * fadeIn
        if (a <= 0.01) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx.fill()
      }
    }

    // ====== resize ======
    const resize = () => {
      const nextW = Math.max(1, wrap.clientWidth)
      const nextH = Math.max(1, wrap.clientHeight)
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
      if (nextW === cssW && nextH === cssH && nextDpr === dpr) return
      cssW = nextW; cssH = nextH; dpr = nextDpr
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      isMobile = cssW <= MOBILE_MAX_W
      if (isMobile) {
        const sX = cssW / originalWidth
        const sY = cssH / originalHeight
        scale = Math.min(sX, sY) * 1.5
        const foxW = originalWidth * scale
        const foxH = originalHeight * scale
        offsetX = (cssW - foxW) / 2
        offsetY = (cssH - foxH) / 0.95
      } else {
        const sX = cssW / originalWidth
        const sY = cssH / originalHeight
        scale = Math.min(sX, sY) * CONFIG.foxScale
        const foxW = originalWidth * scale
        const foxH = originalHeight * scale
        offsetX = cssW * CONFIG.foxOffsetX - foxW * 0.5
        // Constantes EXACTES de la v28 prod (snippet 443) : centré viewport - 10%
        offsetY = (cssH - foxH) / 2 - cssH * 0.1
      }
      if (segments.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const s of segments) {
          for (const p of s.points) {
            const x = p.x * scale + offsetX
            const y = p.y * scale + offsetY
            if (x < minX) minX = x
            if (y < minY) minY = y
            if (x > maxX) maxX = x
            if (y > maxY) maxY = y
          }
        }
        foxBBox = { minX, minY, maxX, maxY }
        if (wordmarkSamples.length > 0) placeWordmark()
      }
      if (animationComplete) drawFinalState()
    }

    function drawFinalState() {
      ctx.clearRect(0, 0, cssW, cssH)
      for (const b of beams) b.drawRevealedLine()
    }

    // ====== animate ======
    const animate = (ts: number) => {
      raf = requestAnimationFrame(animate)
      if (!visible || document.visibilityState === 'hidden') { lastTime = ts; return }
      const dt = lastTime ? Math.min(0.05, (ts - lastTime) / 1000) : 0.016
      lastTime = ts
      phaseTimer += dt

      if (!beamsStarted && phaseTimer >= STABLE_END) beamsStarted = true

      updateColorTransition(dt)
      const allMat = beams.length > 0 && beams.every((b) => b.fullyMaterialized)
      if (allMat && colorTransitionProgress >= 1 && wordmarkParticles.length === 0) animationComplete = true

      ctx.clearRect(0, 0, cssW, cssH)

      for (const b of beams) b.update(dt)
      for (const b of beams) b.drawRevealedLine()

      ctx.globalCompositeOperation = 'lighter'
      drawWordmark(ts)
      for (const b of beams) b.drawBeam()
      updateAndDrawSparks(dt)
      ctx.globalCompositeOperation = 'source-over'

      if (animationComplete && sparks.length === 0) { cancelAnimationFrame(raf); raf = 0 }
    }

    // ====== observers ======
    const io = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true }, { root: null, threshold: 0 })
    io.observe(wrap)

    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { resizeTimer = null; resize() }, 150)
    })
    ro.observe(wrap)

    // ====== load assets + start ======
    resize()
    ctx.clearRect(0, 0, cssW, cssH)

    const loadLogo = new Promise<void>((resolve) => {
      const img = new Image()
      // pas de crossOrigin : l'image est servie par Vite en same-origin,
      // et crossOrigin='anonymous' peut "tainter" le canvas et faire planter
      // getImageData en SecurityError → wordmarkSamples resterait vide.
      img.onload = () => {
        try {
          wordmarkSamples = analyzeLogoImage(img)
          // eslint-disable-next-line no-console
          console.log(`[FoxAnimationV29] wordmark samples extracted: ${wordmarkSamples.length}`)
        } catch (err) {
          console.warn('[FoxAnimationV29] logo analysis failed:', err)
          wordmarkSamples = []
        }
        resolve()
      }
      img.onerror = () => {
        console.warn('[FoxAnimationV29] logo image failed to load at', CONFIG.logoUrl)
        resolve()
      }
      img.src = CONFIG.logoUrl
    })

    // === Chargement + post-process des paths fox ===
    // Strategie : Web Worker en priorite (decharge le main thread du parse
    // 2.3 MB + stitch O(n²) + split). Fallback main thread si Worker
    // indisponible (CSP, browser sans support module workers, etc.).
    const applyProcessed = (
      processedSegments: Segment[],
      width: number,
      height: number,
      stats?: { splitCount: number; trimmedCount: number },
    ) => {
      if (cancelled) return
      segments = processedSegments
      originalWidth = width
      originalHeight = height
      // eslint-disable-next-line no-console
      console.log(
        `[FoxAnimationV29] segments after split: ${segments.length}` +
          (stats ? ` (${stats.splitCount} roundtrips split, ${stats.trimmedCount} cusps trimmed in low zone)` : ''),
      )
      beams = segments.map((s, i) => new PulseBeam(s, i))
    }

    const loadJson = new Promise<void>((resolve) => {
      let worker: Worker | null = null
      let mainThreadFallback = false

      const cleanup = () => {
        if (worker) {
          worker.terminate()
          worker = null
        }
      }

      const fallbackMainThread = async (reason: string) => {
        if (mainThreadFallback) return
        mainThreadFallback = true
        cleanup()
        // eslint-disable-next-line no-console
        console.warn('[FoxAnimationV29] fallback main thread :', reason)
        try {
          const res = await fetch(CONFIG.jsonUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          if (cancelled) return resolve()
          const out = processFoxPaths(data, {
            stitchThreshold: CONFIG.stitchThreshold,
            minSegmentLength: CONFIG.minSegmentLength,
          })
          applyProcessed(out.segments, out.originalWidth, out.originalHeight, out.stats)
        } catch (err) {
          if (!cancelled) console.warn('[FoxAnimationV29] main thread fetch error:', err)
        } finally {
          resolve()
        }
      }

      try {
        worker = new FoxPathsWorker()
        worker.onmessage = (e: MessageEvent<FoxPathsWorkerResponse>) => {
          const msg = e.data
          if (msg.type === 'success') {
            applyProcessed(msg.segments, msg.originalWidth, msg.originalHeight, msg.stats)
            cleanup()
            resolve()
          } else if (msg.type === 'error') {
            void fallbackMainThread(`worker error: ${msg.message}`)
          }
        }
        worker.onerror = (ev) => {
          void fallbackMainThread(`worker onerror: ${ev.message || 'unknown'}`)
        }
        const req: FoxPathsWorkerRequest = {
          type: 'load',
          jsonUrl: CONFIG.jsonUrl,
          config: {
            stitchThreshold: CONFIG.stitchThreshold,
            minSegmentLength: CONFIG.minSegmentLength,
          },
        }
        worker.postMessage(req)
      } catch (err) {
        void fallbackMainThread(`worker init failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    })

    Promise.all([loadLogo, loadJson]).then(() => {
      if (cancelled) return
      resize() // recalcule bbox au cas ou originalW/H ont change
      // Force placement du wordmark (resize peut early-return si les dimensions
      // n'ont pas change entre le 1er appel et maintenant).
      if (segments.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const s of segments) {
          for (const p of s.points) {
            const x = p.x * scale + offsetX
            const y = p.y * scale + offsetY
            if (x < minX) minX = x
            if (y < minY) minY = y
            if (x > maxX) maxX = x
            if (y > maxY) maxY = y
          }
        }
        foxBBox = { minX, minY, maxX, maxY }
      }
      if (wordmarkSamples.length > 0) {
        placeWordmark()
        // eslint-disable-next-line no-console
        console.log(`[FoxAnimationV29] wordmark placed: ${wordmarkParticles.length} particles`)

        // === Auto-sync drain : calcule l'intervalle de spawn pour que toutes
        // les particules soient drainees pile a la fin du dernier beam.
        // Total drain = sum_i(t_i) * (1000/I) ou t_i = L_i / beamSpeed.
        // → I = (totalActivity_seconds * 1000 / particleCount) * safetyFactor
        if (beams.length > 0 && wordmarkParticles.length > 0) {
          const totalActivity = beams.reduce(
            (acc, b) => acc + (b.segment.length ?? 0) / CONFIG.beamSpeed,
            0,
          )
          const particleCount = wordmarkParticles.length
          const computed =
            (totalActivity * 1000 / particleCount) * CONFIG.streamSpawnSafetyFactor
          // clamp pour eviter valeurs absurdes (perf / visu)
          runtimeSpawnIntervalMs = Math.max(2, Math.min(60, computed))
          // eslint-disable-next-line no-console
          console.log(
            `[FoxAnimationV29] auto-drain interval: ${runtimeSpawnIntervalMs.toFixed(1)}ms ` +
              `(activity=${totalActivity.toFixed(2)}s, particles=${particleCount}, ` +
              `safety=${CONFIG.streamSpawnSafetyFactor})`,
          )
        }
      }

      if (reduceMotion) {
        for (const b of beams) {
          b.progress = 1
          b.revealedProgress = 1
          b.trail = []
          b.beamFinished = true
          b.materializePhase = false
          b.fullyMaterialized = true
          b.materializeProgress = 1
        }
        animationComplete = true
        wordmarkParticles = []
        drawFinalState()
        return
      }

      raf = requestAnimationFrame(animate)
    })

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      if (resizeTimer) clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      setThemeApi.current = null
    }
  }, [])

  useEffect(() => { setThemeApi.current?.(activeTheme) }, [activeTheme])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.35] md:opacity-100"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
