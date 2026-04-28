import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@/styles/globals.css'

import { MatrixRainRed } from '@/components/backgrounds/MatrixRainRed'
import { ParticleNeonGold } from '@/components/backgrounds/ParticleNeonGold'
import { NeuralNetworkGreen } from '@/components/backgrounds/NeuralNetworkGreen'
import { BlueprintGridBlue } from '@/components/backgrounds/BlueprintGridBlue'
import { MeshGradientNeutral } from '@/components/backgrounds/MeshGradientNeutral'
import { VolumetricFog } from '@/components/backgrounds/VolumetricFog'
import { FoxAnimationV29 } from '@/components/hero/FoxAnimationV29'
import { PillarCards } from '@/components/sections/PillarCards'
import { WhySection } from '@/components/sections/WhySection'
import { ArticleCards } from '@/components/sections/ArticleCards'
import { FinalCTA } from '@/components/sections/FinalCTA'

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
      {/* VolumetricFog : fumee dense en fond, presente sur tous les themes
          (silver sur neutre, rouge/or/vert/bleu sur les autres). Sur la
          homepage, remplace l'orbe centrale argent qui etait dans
          MeshGradientNeutral. */}
      <VolumetricFog />
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
      className="relative isolate overflow-hidden"
      style={{ minHeight: '100vh' }}
      aria-label="Hero Inaricom"
    >
      {/* Couche 1 : fox animation v29 (PLEIN ECRAN, par-dessus le fond global) */}
      <div className="absolute inset-0 z-10">
        <FoxAnimationV29 />
      </div>

      {/* Couche 2 : contenu hero — badge en pilule rouge + texte gauche
          PADDING REDUITS (mesures vs ref accueil-cybersecurite) :
          header(81px) + 58px gap + badge(47px) + 40px gap + h1(top 226px) */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-[1360px] flex-col px-6 lg:px-10">
        {/* Badge en pilule, centre tout en haut.
            Style chiffres ref : bg rgba(227,30,36,0.10), text rgb(227,30,36),
            font 14px, align center, h ~47px, radius full. */}
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(var(--inari-red-rgb), 0.06)',
              borderColor: 'rgba(var(--inari-red-rgb), 0.18)',
              color: 'var(--inari-text-soft)',
              fontSize: '14px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 500,
              paddingTop: '10px',
              paddingBottom: '10px',
              boxShadow: '0 0 24px -12px rgba(var(--inari-red-rgb), 0.25)',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
            </svg>
            <span>Cybers&eacute;curit&eacute; &middot; IA souveraine</span>
          </div>
        </div>

        {/* Bloc contenu : texte a gauche 60%, fox a droite (layout Cloudflare) */}
        <div className="flex flex-1" style={{ paddingTop: '40px' }}>
          <div className="w-full md:w-[60%]">
            {/* H1 : style inline pour CONTOURNER Kadence cascade qui force line-height 1.5
                Mesures ref : 88px / line-height 92.4px (1.05) / tracking serre / blanc */}
            <h1
              className="font-serif text-inari-white"
              style={{
                fontSize: 'clamp(40px, 4.5vw, 72px)',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                textAlign: 'left',
                margin: 0,
              }}
            >
              <span className="block">S&eacute;curit&eacute; offensive.</span>
              <span className="block text-inari-text-soft">IA souveraine.</span>
              <span className="block">
                Sans{' '}
                <em className="not-italic text-inari-accent">d&eacute;pendance.</em>
              </span>
            </h1>

            {/* Sous-titre : ref 22.4px / lh 1.8 / muted */}
            <p
              style={{
                fontSize: '22.4px',
                lineHeight: '1.8',
                color: 'rgba(240, 240, 245, 0.65)',
                marginTop: '32px',
                maxWidth: '36rem',
              }}
            >
              Convergence unique IA + cybers&eacute;curit&eacute; offensive. Pour les
              PME et CTO francophones qui refusent la bo&icirc;te noire.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/services-cybersecurite/"
                className="group inline-flex items-center gap-2 rounded-md bg-inari-accent px-6 py-3 font-sans text-sm font-medium text-inari-black transition hover:bg-inari-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
              >
                Commander un audit
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="/blog/"
                className="inline-flex items-center gap-2 rounded-md border border-inari-border bg-inari-black-alt px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-inari-black-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
              >
                Explorer le blog
              </a>
            </div>

          </div>
        </div>

        {/* 3 arguments — ancres bas du hero */}
        <div className="pb-12 lg:pb-20">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'OWASP · PTES · MITRE',
                desc: 'Méthodologie offensive documentée, pas de rapport générique.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                    <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
                    <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ),
                title: 'IA local-first',
                desc: 'Self-hosted, open-weight, zéro dépendance cloud US.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                title: 'Tarifs publics',
                desc: 'Grilles EUR / CHF, périmètres clairs, livrables lisibles.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 sm:p-7"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-inari-border text-inari-text-muted">
                  {item.icon}
                </div>
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-inari-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-inari-text-soft">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HomepageIsland() {
  return (
    <main className="relative text-inari-text">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <ThemedBackgroundStack />
      </div>

      <div className="relative z-10">
        <Hero />
        <PillarCards />
        <WhySection />
        <ArticleCards />
        <FinalCTA />
      </div>
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
