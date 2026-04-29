// Inaricom — Fox paths processing (shared module)
//
// Pure data processing, no DOM/Worker dependencies. Used by both :
// - `src/workers/foxPathsWorker.ts` (off-main-thread parsing + post-process)
// - `src/components/hero/FoxAnimationV29.tsx` (main thread fallback)
//
// Etape lourde isolee : iteration sur ~3000 paths × ~100 points + stitching
// O(n²) intra-couleur + split aller-retour + trim cusps. Sur mobile mid-tier,
// ce travail bloquait le main thread ~80-150 ms apres le parse JSON.

export type Pt = { x: number; y: number }

export type Segment = {
  points: Pt[]
  color: string
  parentId?: string
  length?: number
}

export type RawFoxPaths = {
  schema?: string
  canvas: [number, number] | { width: number; height: number }
  paths: Array<{
    id?: string
    color?: string
    fill?: string
    subpaths?: Array<Array<[number, number] | null>>
  }>
}

export type ProcessedFoxPaths = {
  segments: Segment[]
  originalWidth: number
  originalHeight: number
  stats: {
    rawPathCount: number
    afterStitch: number
    afterLengthFilter: number
    afterSplit: number
    splitCount: number
    trimmedCount: number
  }
}

export type FoxPathsConfig = {
  /** Threshold de proximite pour stitch deux segments memes couleur. */
  stitchThreshold: number
  /** Longueur min d'un segment apres stitching pour etre conserve. */
  minSegmentLength: number
  /** Ratio de tronquage (chaque cote) sur les boucles cusp en zone basse. */
  trimRatio?: number
  /** Si la cusp d'un roundtrip est dans les Y > yMax * yLowRatio, c'est une boucle a degager. */
  yLowRatio?: number
}

const DEFAULT_TRIM_RATIO = 0.10
const DEFAULT_YLOW_RATIO = 0.95

// ============================================================================
// Helpers atomiques

export function calculatePathLength(points: Pt[]): number {
  let l = 0
  for (let i = 1; i < points.length; i++) {
    l += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return l
}

export function trimEnd(pts: Pt[], keepRatio: number): Pt[] {
  if (keepRatio >= 1.0) return pts
  const total = calculatePathLength(pts)
  const target = total * keepRatio
  let cum = 0
  for (let i = 1; i < pts.length; i++) {
    const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    if (cum + segLen >= target) return pts.slice(0, i + 1)
    cum += segLen
  }
  return pts
}

export function trimStart(pts: Pt[], dropRatio: number): Pt[] {
  if (dropRatio <= 0) return pts
  const total = calculatePathLength(pts)
  const target = total * dropRatio
  let cum = 0
  for (let i = 1; i < pts.length; i++) {
    const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    if (cum + segLen >= target) return pts.slice(i)
    cum += segLen
  }
  return pts.slice(-2)
}

export function trySplitRoundtrip(
  seg: Segment,
  closeRatio = 0.12,
): { halves: [Segment, Segment]; cuspIdx: number } | null {
  const pts = seg.points
  if (pts.length < 10) return null
  const totalLen = seg.length ?? calculatePathLength(pts)
  const start = pts[0]
  const end = pts[pts.length - 1]
  const endpointDist = Math.hypot(end.x - start.x, end.y - start.y)
  if (endpointDist > closeRatio * totalLen) return null
  let farIdx = 0
  let farD = 0
  for (let i = 0; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - start.x, pts[i].y - start.y)
    if (d > farD) {
      farD = d
      farIdx = i
    }
  }
  if (farIdx < pts.length * 0.2 || farIdx > pts.length * 0.8) return null
  const h1: Segment = { points: pts.slice(0, farIdx + 1), color: seg.color, parentId: seg.parentId }
  const h2: Segment = { points: pts.slice(farIdx), color: seg.color, parentId: seg.parentId }
  return { halves: [h1, h2], cuspIdx: farIdx }
}

export function stitchSegments(segs: Segment[], threshold: number): Segment[] {
  type Mut = { points: Pt[]; color: string; parentId?: string; merged: boolean }
  const byColor: Record<string, Mut[]> = {}
  for (const s of segs) {
    if (!byColor[s.color]) byColor[s.color] = []
    byColor[s.color].push({ points: [...s.points], color: s.color, parentId: s.parentId, merged: false })
  }
  const result: Segment[] = []
  for (const color in byColor) {
    const cs = byColor[color]
    let changed = true
    let iter = 0
    while (changed && iter < 100) {
      changed = false
      iter++
      for (let i = 0; i < cs.length; i++) {
        if (cs[i].merged) continue
        const a = cs[i]
        const sA = a.points[0]
        const eA = a.points[a.points.length - 1]
        for (let j = i + 1; j < cs.length; j++) {
          if (cs[j].merged) continue
          const b = cs[j]
          const sB = b.points[0]
          const eB = b.points[b.points.length - 1]
          const d1 = Math.hypot(eA.x - sB.x, eA.y - sB.y)
          const d2 = Math.hypot(eA.x - eB.x, eA.y - eB.y)
          const d3 = Math.hypot(sA.x - sB.x, sA.y - sB.y)
          const d4 = Math.hypot(sA.x - eB.x, sA.y - eB.y)
          const minD = Math.min(d1, d2, d3, d4)
          if (minD < threshold) {
            let pts: Pt[]
            if (minD === d1) pts = [...a.points, ...b.points]
            else if (minD === d2) pts = [...a.points, ...b.points.slice().reverse()]
            else if (minD === d3) pts = [...a.points.slice().reverse(), ...b.points]
            else pts = [...b.points, ...a.points]
            cs[i] = { points: pts, color: a.color, parentId: a.parentId, merged: false }
            cs[j].merged = true
            changed = true
            break
          }
        }
        if (changed) break
      }
    }
    for (const s of cs) {
      if (!s.merged) result.push({ points: s.points, color: s.color, parentId: s.parentId })
    }
  }
  return result
}

// ============================================================================
// Pipeline complet : raw JSON -> segments finaux

/**
 * Transforme le JSON brut fox-paths.json en segments prets a etre consommes
 * par le moteur d'animation (PulseBeam).
 *
 * Pipeline :
 *  1. Iteration paths/subpaths -> segments bruts
 *  2. Stitch (fusion de proximite intra-couleur)
 *  3. Filtre par longueur min
 *  4. Split aller-retour pour les contours fermes
 *  5. Trim conditionnel des cusps en zone basse (queue residuelle)
 */
export function processFoxPaths(
  data: RawFoxPaths,
  config: FoxPathsConfig,
): ProcessedFoxPaths {
  const trimRatio = config.trimRatio ?? DEFAULT_TRIM_RATIO
  const yLowRatio = config.yLowRatio ?? DEFAULT_YLOW_RATIO

  const originalWidth = Array.isArray(data.canvas) ? data.canvas[0] : data.canvas.width
  const originalHeight = Array.isArray(data.canvas) ? data.canvas[1] : data.canvas.height

  // 1. Extraction segments bruts depuis paths/subpaths
  let segments: Segment[] = []
  for (const path of data.paths) {
    const color = path.color || path.fill || '#ffffff'
    if (!path.subpaths || !Array.isArray(path.subpaths)) continue
    for (const subpath of path.subpaths) {
      const valid = subpath.filter((p): p is [number, number] => p !== null && p[0] !== null)
      if (valid.length < 2) continue
      const points: Pt[] = valid.map((p) => ({ x: p[0], y: p[1] }))
      segments.push({ points, color, parentId: path.id })
    }
  }
  const rawPathCount = segments.length

  // 2. Stitch
  segments = stitchSegments(segments, config.stitchThreshold)
  const afterStitch = segments.length

  // 3. Filtre longueur min
  segments.forEach((s) => {
    s.length = calculatePathLength(s.points)
  })
  segments = segments.filter((s) => (s.length ?? 0) >= config.minSegmentLength)
  const afterLengthFilter = segments.length

  // 4 + 5. Split + trim
  let yMaxFox = -Infinity
  for (const s of segments) {
    for (const p of s.points) if (p.y > yMaxFox) yMaxFox = p.y
  }
  const yLowThreshold = yMaxFox * yLowRatio

  const splitSegments: Segment[] = []
  let splitCount = 0
  let trimmedCount = 0

  for (const s of segments) {
    const split = trySplitRoundtrip(s)
    if (!split) {
      splitSegments.push(s)
      continue
    }
    splitCount++
    const [h1, h2] = split.halves
    const cuspY = s.points[split.cuspIdx].y
    if (cuspY >= yLowThreshold) {
      // boucle en bas → tronquer + colorer en primary (boost luminosite arriere-tete)
      trimmedCount++
      const h1Pts = trimEnd(h1.points, 1.0 - trimRatio)
      const h2Pts = trimStart(h2.points, trimRatio)
      const h1New: Segment = {
        ...h1,
        points: h1Pts,
        length: calculatePathLength(h1Pts),
        color: '#e31e24',
      }
      const h2New: Segment = {
        ...h2,
        points: h2Pts,
        length: calculatePathLength(h2Pts),
        color: '#e31e24',
      }
      if ((h1New.length ?? 0) >= 200) splitSegments.push(h1New)
      if ((h2New.length ?? 0) >= 200) splitSegments.push(h2New)
    } else {
      // pliure ailleurs (oeil, oreille) → garder les 2 moities
      h1.length = calculatePathLength(h1.points)
      h2.length = calculatePathLength(h2.points)
      if ((h1.length ?? 0) >= 200) splitSegments.push(h1)
      if ((h2.length ?? 0) >= 200) splitSegments.push(h2)
    }
  }
  segments = splitSegments

  return {
    segments,
    originalWidth,
    originalHeight,
    stats: {
      rawPathCount,
      afterStitch,
      afterLengthFilter,
      afterSplit: segments.length,
      splitCount,
      trimmedCount,
    },
  }
}
