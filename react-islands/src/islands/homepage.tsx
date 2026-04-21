import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/globals.css'

/**
 * Island: homepage
 * Mount target: <div id="inari-homepage-root" data-theme="neutre"></div>
 * Injected by WordPress via enqueue.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

function HomepageIsland() {
  return (
    <section className="relative min-h-[60vh] bg-inari-black p-8 text-inari-text">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-5xl tracking-tight text-inari-white">
          Inaricom <span className="text-inari-accent">React islands</span>
        </h1>
        <p className="mt-4 text-inari-text-soft">
          Phase 2.0 — setup operationnel (Vite + React 19 + Tailwind v4 + shadcn/ui).
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-md border border-inari-border bg-inari-black-alt px-4 py-2 font-mono text-sm text-inari-accent">
          <span className="h-2 w-2 rounded-full bg-inari-accent shadow-[0_0_8px_currentColor]" />
          island mounted
        </div>
      </div>
    </section>
  )
}

const root = document.getElementById('inari-homepage-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HomepageIsland />
      </QueryClientProvider>
    </StrictMode>,
  )
}
