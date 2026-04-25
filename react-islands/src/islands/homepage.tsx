import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@/styles/globals.css'

import { MatrixRainRed } from '@/components/backgrounds/MatrixRainRed'
import { ParticleNeonGold } from '@/components/backgrounds/ParticleNeonGold'
import { NeuralNetworkGreen } from '@/components/backgrounds/NeuralNetworkGreen'
import { BlueprintGridBlue } from '@/components/backgrounds/BlueprintGridBlue'
import { MeshGradientNeutral } from '@/components/backgrounds/MeshGradientNeutral'
import { FoxAnimationV29 } from '@/components/hero/FoxAnimationV29'

/**
 * Island: homepage
 *
 * Mount target: <div id="inari-homepage-root" data-theme="neutre"></div>
 * Inject par WordPress via le shortcode [inari_island name="homepage"]
 * (Phase 2.2). data-theme par defaut = "neutre" pour la home (equite entre
 * les 4 piliers). Sur les autres pages, ThemeMapper.php pose le data-theme
 * correspondant au pilier de la page (rouge/or/vert/bleu).
 *
 * --- SCOPE DE CETTE SESSION ---
 * On livre uniquement le HERO :
 *   - 5 backgrounds animes (auto-filtres par theme)
 *   - fox v29 layered
 *   - structure titre / sous-titre / CTA cote gauche desktop
 *
 * Suite de la home (cards piliers, why, articles, CTA final) : prochaine
 * session Phase 2.1.x.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Stack des 5 backgrounds animes par theme.
 *
 * Chaque composant lit son closest('[data-theme]') et return null si ce
 * n'est pas son theme. Les 5 sont donc tous montes simultanement, mais un
 * seul rend un canvas actif selon data-theme du parent. Au switch live
 * (MutationObserver dans chaque composant), l'ancien se met en sommeil
 * et le nouveau demarre sa RAF.
 *
 * Cout perf negligeable : chaque composant fait un useLayoutEffect court
 * qui retourne null si pas le bon theme.
 */
function ThemedBackgroundStack() {
  return (
    <>
      <MatrixRainRed />
      <ParticleNeonGold />
      <NeuralNetworkGreen />
      <BlueprintGridBlue />
      <MeshGradientNeutral />
    </>
  )
}

/**
 * HERO : composition en 3 couches z-index :
 *   - z-0  : backgrounds animes
 *   - z-10 : fox v29 (canvas avec wordmark INARICOM qui se demantele)
 *   - z-20 : contenu titre/sous-titre/CTA (cote gauche desktop, plein
 *            largeur mobile)
 *
 * En mobile, la fox a une opacity 0.35 + se centre (gere dans le composant)
 * pour ne pas gener la lecture du contenu.
 *
 * Le copy ci-dessous est un PLACEHOLDER posture cybersec/IA, a adapter
 * selon le brief final Inaricom. Vise un ton direct, sec, pas mou
 * (ref Sherlock.xyz "Onchain systems do not get second chances").
 */
function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-inari-black"
      style={{ minHeight: '100vh' }}
      aria-label="Hero Inaricom"
    >
      {/* Couche 0 : backgrounds animes par theme */}
      <div className="absolute inset-0 z-0">
        <ThemedBackgroundStack />
      </div>

      {/* Couche 1 : fox animation v29 */}
      <div className="absolute inset-0 z-10">
        <FoxAnimationV29 />
      </div>

      {/* Couche 2 : contenu hero */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24 lg:px-12">
        <div className="max-w-2xl lg:w-1/2">
          {/* Eyebrow / kicker mono pour ancrer le ton technique */}
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Inaricom &middot; Cybers&eacute;curit&eacute; &amp; IA
          </p>

          {/* H1 display Instrument Serif, 3 lignes pour rythme editorial */}
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-inari-white sm:text-6xl lg:text-7xl">
            <span className="block">Syst&egrave;mes IA</span>
            <span className="block text-inari-text-soft">exploitables,</span>
            <span className="block">
              mesurables,{' '}
              <em className="not-italic text-inari-accent">contr&ocirc;lables.</em>
            </span>
          </h1>

          {/* Sous-titre Geist Sans, posture differenciante */}
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-inari-text-soft">
            Convergence unique IA + cybers&eacute;curit&eacute; offensive. Pour les
            PME et CTO francophones qui refusent la bo&icirc;te noire.
          </p>

          {/* CTAs : primary = audit (rouge/sec), secondary = blog (vert) */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/services-cybersecurite/"
              className="group inline-flex items-center gap-2 rounded-md bg-inari-accent px-6 py-3 font-sans text-sm font-medium text-inari-black transition hover:bg-inari-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            >
              Commander un audit
              <span
                aria-hidden="true"
                className="transition group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </a>
            <a
              href="/blog/"
              className="inline-flex items-center gap-2 rounded-md border border-inari-border bg-inari-black-alt px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-inari-black-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            >
              Explorer le blog
            </a>
          </div>

          {/* Indicateur scroll discret (UX cue desktop only) */}
          <div className="mt-16 hidden items-center gap-3 lg:flex">
            <span aria-hidden="true" className="h-px w-12 bg-inari-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
              Scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomepageIsland() {
  return (
    <main className="relative bg-inari-black text-inari-text">
      <Hero />
      {/*
        TODO Phase 2.1.x : ajouter ici les sections suivantes
          - Cards piliers (rouge / or / vert / bleu)
          - Section "Pourquoi Inaricom" (4 points-cles)
          - Derniers articles (fetch via @tanstack/react-query + REST WP)
          - CTA final contact
      */}
    </main>
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
