import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { BackgroundSkeleton } from '@/components/backgrounds/BackgroundSkeleton'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds (theme bleu institutionnel — meme que /a-propos/ et /contact/)
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)
const BlueprintGridBlue = lazy(() =>
  import('@/components/backgrounds/BlueprintGridBlue').then((m) => ({ default: m.BlueprintGridBlue })),
)

// ---------------------------------------------------------------------------
// API config injectee par ReactLoader.php : window.inariApi = { root, nonce }
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    inariApi?: { root: string; nonce: string }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LegalPageData = {
  title: string
  content: string
  date: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: LegalPageData }
  | { status: 'error'; message: string }

// ---------------------------------------------------------------------------
// Fetch page content from WP REST API based on current URL slug
// ---------------------------------------------------------------------------

function getCurrentSlug(): string | null {
  const path = window.location.pathname.replace(/^\/|\/$/g, '')
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || null
}

async function fetchPageBySlug(slug: string): Promise<LegalPageData> {
  const api = window.inariApi
  if (!api?.root) throw new Error('window.inariApi indisponible')
  // Custom endpoint inaricom/v1/legal/{slug} qui retourne le contenu original
  // (sauvegarde dans le meta `_legal_original_content` avant remplacement par
  // le shortcode island). Le namespace inaricom/v1 est aussi celui qui bypasse
  // WooCommerce (mu-plugin) pour eviter le memory exhaust 128MB.
  const url = `${api.root}inaricom/v1/legal/${encodeURIComponent(slug)}`
  const res = await fetch(url, { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as {
    title: string
    content: string
    modified: string
  }
  return {
    title: decodeHtml(data.title),
    content: data.content,
    date: data.modified,
  }
}

function decodeHtml(html: string): string {
  const tmp = document.createElement('textarea')
  tmp.innerHTML = html
  return tmp.value
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Hero (theme bleu, simple)
// ---------------------------------------------------------------------------

function LegalHero({ title, date }: { title: string; date: string }) {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '40vh' }}
      aria-label="Hero page legale"
    >
      <div className="relative z-10 mx-auto flex min-h-[40vh] max-w-[1024px] flex-col px-6 pb-10 lg:px-10 lg:pb-14">
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(0, 129, 242, 0.08)',
              borderColor: 'rgba(0, 129, 242, 0.25)',
              color: 'var(--inari-text-soft)',
              fontSize: '13px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
              paddingTop: '9px',
              paddingBottom: '9px',
              boxShadow: '0 0 24px -12px rgba(0, 129, 242, 0.35)',
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
              <path d="M3 2h7l3 3v9H3z" />
              <path d="M10 2v3h3" />
            </svg>
            <span>Document legal</span>
          </div>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="w-full">
            <h1
              className="font-serif text-inari-white"
              style={{
                fontSize: 'clamp(36px, 4.2vw, 60px)',
                lineHeight: '1.08',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {title}
            </h1>
            {date && (
              <p
                className="mt-5 font-mono text-[13px] uppercase tracking-[0.18em] text-inari-text-muted"
                style={{ letterSpacing: '0.18em' }}
              >
                Derniere mise a jour : {formatDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Content card (glassmorphism wrap autour du contenu WP)
// ---------------------------------------------------------------------------

function LegalContent({ html }: { html: string }) {
  return (
    <section className="relative px-6 pb-24 lg:px-10 lg:pb-32">
      <div className="mx-auto max-w-[1024px]">
        <div
          className="legal-island-content rounded-2xl border border-white/[0.08] p-7 sm:p-10 lg:p-14"
          style={{
            background: 'rgba(18, 18, 26, 0.10)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Back to home link */}
        <div className="mt-10 flex justify-center">
          <a
            href="/"
            className="group inline-flex items-center gap-2 rounded-md border border-white/[0.12] px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(8px)' }}
          >
            <span aria-hidden="true" className="transition group-hover:-translate-x-0.5">&larr;</span>
            Retour a l&rsquo;accueil
          </a>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton (CLS prevention)
// ---------------------------------------------------------------------------

function LegalSkeleton() {
  return (
    <div className="mx-auto max-w-[1024px] px-6 py-24 lg:px-10">
      <div className="h-12 w-3/4 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-4 h-5 w-48 animate-pulse rounded bg-inari-black-lighter" />
      <div
        className="mt-12 rounded-2xl border border-white/[0.08] p-10"
        style={{ background: 'rgba(18, 18, 26, 0.10)' }}
      >
        <div className="space-y-4">
          {[80, 95, 70, 88, 60].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-inari-black-lighter"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline styles pour le contenu HTML legal (typo + accents, NO ugly cards)
// ---------------------------------------------------------------------------

function LegalContentStyles() {
  // Styles propres pour le contenu HTML servi par /wp-json/inaricom/v1/legal/{slug}.
  // Snippet 684 (legacy "Pages Legales CSS") a ete desactive : pas besoin
  // d'override avec !important. Les selecteurs natifs HTML + classes legacy
  // (legal-*) recoivent ici un styling minimaliste coherent avec /a-propos/
  // et /contact/.
  const css = `
    .legal-island-content { color: var(--inari-text); font-size: 16px; line-height: 1.75; }

    /* Headings */
    .legal-island-content h2 {
      font-family: 'Geist', 'Inter', sans-serif;
      font-size: clamp(22px, 2vw, 28px);
      font-weight: 600;
      color: var(--inari-white);
      margin: 2.5rem 0 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      letter-spacing: -0.01em;
    }
    .legal-island-content h2:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
    .legal-island-content h3 {
      font-family: 'Geist', 'Inter', sans-serif;
      font-size: 17px;
      font-weight: 600;
      color: var(--inari-white);
      margin: 1.75rem 0 0.5rem;
    }

    /* Body text */
    .legal-island-content p { margin: 0 0 1rem; color: var(--inari-text-soft); }
    .legal-island-content strong { color: var(--inari-text); font-weight: 600; }

    /* Links */
    .legal-island-content a {
      color: #1a93fe;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(26, 147, 254, 0.4);
      transition: text-decoration-color 0.2s, color 0.2s;
    }
    .legal-island-content a:hover {
      color: #4ba8ff;
      text-decoration-color: rgba(75, 168, 255, 0.8);
    }

    /* Lists */
    .legal-island-content ul,
    .legal-island-content ol {
      padding-left: 1.5rem;
      margin: 0 0 1rem;
      color: var(--inari-text-soft);
    }
    .legal-island-content ul li,
    .legal-island-content ol li { margin-bottom: 0.4rem; }
    .legal-island-content ul li::marker { color: rgba(0, 129, 242, 0.7); }
    .legal-island-content ol li::marker { color: rgba(0, 129, 242, 0.7); font-weight: 600; }

    /* Article + header (le hero island affiche deja le titre + date) */
    .legal-island-content > article,
    .legal-island-content article.legal-page { all: unset; display: block; }
    .legal-island-content .legal-header,
    .legal-island-content > article > header { display: none; }

    /* TOC : style discret */
    .legal-island-content .legal-toc,
    .legal-island-content nav.legal-toc {
      background: rgba(0, 129, 242, 0.04);
      border: 1px solid rgba(0, 129, 242, 0.12);
      border-radius: 12px;
      padding: 1.5rem 1.75rem;
      margin: 0 0 2.5rem;
    }
    .legal-island-content .legal-toc h2 {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--inari-text-muted);
      font-weight: 500;
    }
    .legal-island-content .legal-toc ol { padding-left: 1.25rem; margin: 1rem 0 0; }
    .legal-island-content .legal-toc a { font-size: 14px; }

    /* Callouts */
    .legal-island-content .legal-info,
    .legal-island-content .legal-notice,
    .legal-island-content blockquote,
    .legal-island-content .wp-block-quote {
      background: rgba(0, 129, 242, 0.05);
      border-left: 3px solid #0081f2;
      border-radius: 0 6px 6px 0;
      padding: 1rem 1.25rem;
      margin: 1.25rem 0;
      font-size: 15px;
    }
    .legal-island-content .legal-warning {
      background: rgba(245, 158, 11, 0.06);
      border-left: 3px solid #F59E0B;
      border-radius: 0 6px 6px 0;
      padding: 1rem 1.25rem;
      margin: 1.25rem 0;
      font-size: 15px;
    }
    .legal-island-content .legal-info p:last-child,
    .legal-island-content .legal-notice p:last-child,
    .legal-island-content .legal-warning p:last-child,
    .legal-island-content blockquote p:last-child { margin-bottom: 0; }

    /* Tables */
    .legal-island-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.5rem;
      font-size: 14px;
    }
    .legal-island-content th {
      background: rgba(0, 129, 242, 0.08);
      color: var(--inari-white);
      text-align: left;
      padding: 10px 14px;
      font-weight: 600;
      border-bottom: 1px solid rgba(0, 129, 242, 0.2);
    }
    .legal-island-content td {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--inari-text-soft);
    }

    /* hr separator */
    .legal-island-content hr {
      border: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(0, 129, 242, 0.3) 50%, transparent 100%);
      margin: 2rem 0;
    }

    /* Legacy back-link bouton (de l'ancien 684) — au cas ou il reste du contenu : on cache */
    .legal-island-content .legal-back-link { display: none; }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

// Lit le payload JSON embedde par ReactMountPoints.php cote serveur.
// Evite un fetch REST API supplementaire au mount.
function readEmbeddedPayload(): LegalPageData | null {
  const el = document.getElementById('inari-legal-data')
  if (!el) return null
  try {
    const raw = el.textContent || ''
    if (!raw.trim()) return null
    const parsed = JSON.parse(raw) as {
      title: string
      content: string
      modified: string
    }
    return {
      title: decodeHtml(parsed.title),
      content: parsed.content,
      date: parsed.modified,
    }
  } catch {
    return null
  }
}

function LegalIsland() {
  // Init synchrone : tente de lire le payload embedde (instant, zero round-trip).
  // Si dispo, etat 'ready' direct -> render immediat sans flicker.
  const [state, setState] = useState<LoadState>(() => {
    const embedded = readEmbeddedPayload()
    return embedded
      ? { status: 'ready', data: embedded }
      : { status: 'loading' }
  })

  useEffect(() => {
    // Si deja ready (embed cote serveur), pas de fetch
    if (state.status !== 'loading') return

    const slug = getCurrentSlug()
    if (!slug) {
      setState({ status: 'error', message: 'Slug introuvable dans l\'URL' })
      return
    }
    fetchPageBySlug(slug)
      .then((data) => setState({ status: 'ready', data }))
      .catch((err) =>
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Erreur de chargement',
        }),
      )
  }, [state.status])

  return (
    <div className="relative text-inari-text" data-theme="bleu" role="region" aria-label="Page legale">
      <LegalContentStyles />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <Suspense fallback={<BackgroundSkeleton />}>
          <VolumetricFog />
          <BlueprintGridBlue />
        </Suspense>
      </div>

      <div className="relative z-10">
        {state.status === 'loading' && <LegalSkeleton />}
        {state.status === 'error' && (
          <div className="mx-auto max-w-[1024px] px-6 py-24 text-center">
            <h1 className="font-serif text-3xl text-inari-white">Erreur de chargement</h1>
            <p className="mt-4 text-inari-text-soft">{state.message}</p>
            <a
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/[0.12] px-6 py-3 text-sm text-inari-text hover:bg-white/[0.06]"
            >
              &larr; Retour a l&rsquo;accueil
            </a>
          </div>
        )}
        {state.status === 'ready' && (
          <>
            <LegalHero title={state.data.title} date={state.data.date} />
            <LegalContent html={state.data.content} />
          </>
        )}
      </div>
    </div>
  )
}

const root = document.getElementById('inari-legal-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <LegalIsland />
    </StrictMode>,
  )
}
