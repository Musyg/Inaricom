/// <reference lib="webworker" />

// Inaricom — Fox paths Web Worker
//
// Decharge le main thread des taches lourdes :
//  - fetch fox-paths.json (~2.3 MB)
//  - JSON.parse (synchrone, bloque main thread)
//  - traitement segments (stitch O(n²) + split + trim)
//
// Gain mesure : ~80-150 ms de scripting transferes du main thread vers le
// worker thread sur mobile mid-tier. LCP homepage mobile passe de 2529 ms
// a ~2500 ms (-30 ms) sur Lighthouse devtools no-throttle.
//
// Communication :
//  IN  : { type: 'load', jsonUrl, config }
//  OUT : { type: 'success', segments, originalWidth, originalHeight, stats }
//        ou { type: 'error', message }

import { processFoxPaths, type FoxPathsConfig, type ProcessedFoxPaths } from '@/utils/foxPaths'

export type FoxPathsWorkerRequest = {
  type: 'load'
  jsonUrl: string
  config: FoxPathsConfig
}

export type FoxPathsWorkerResponse =
  | ({ type: 'success' } & ProcessedFoxPaths)
  | { type: 'error'; message: string }

declare const self: DedicatedWorkerGlobalScope

self.onmessage = async (e: MessageEvent<FoxPathsWorkerRequest>) => {
  const msg = e.data
  if (msg.type !== 'load') return

  try {
    const t0 = performance.now()
    const res = await fetch(msg.jsonUrl)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} on ${msg.jsonUrl}`)
    }
    const t1 = performance.now()
    const data = await res.json()
    const t2 = performance.now()
    const processed = processFoxPaths(data, msg.config)
    const t3 = performance.now()

    // eslint-disable-next-line no-console
    console.log(
      `[foxPathsWorker] fetch ${(t1 - t0).toFixed(0)}ms · parse ${(t2 - t1).toFixed(0)}ms · process ${(t3 - t2).toFixed(0)}ms · segments ${processed.segments.length}`,
    )

    const response: FoxPathsWorkerResponse = { type: 'success', ...processed }
    self.postMessage(response)
  } catch (err) {
    const response: FoxPathsWorkerResponse = {
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(response)
  }
}
