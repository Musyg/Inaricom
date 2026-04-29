import { StrictMode, Suspense, lazy, useMemo, useState } from 'react'
import { BackgroundSkeleton } from '@/components/backgrounds/BackgroundSkeleton'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

import '@/styles/globals.css'

// Lazy backgrounds (meme pattern que homepage/ia/cybersec) :
// VolumetricFog universel + NeuralNetworkGreen pour theme=vert.
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)
const NeuralNetworkGreen = lazy(() =>
  import('@/components/backgrounds/NeuralNetworkGreen').then((m) => ({ default: m.NeuralNetworkGreen })),
)

// ---------------------------------------------------------------------------
// Types + WP REST fetchers
// ---------------------------------------------------------------------------

type WPPost = {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  categories: number[]
}

type WPCategory = {
  id: number
  name: string
  slug: string
  count: number
}

const WP_API =
  (document.querySelector<HTMLMetaElement>('meta[name="wp-api-root"]')?.content
    ?? window.location.origin) + '/wp-json/wp/v2'

async function fetchPostsByIds(ids: number[]): Promise<WPPost[]> {
  if (ids.length === 0) return []
  const url = `${WP_API}/posts?include=${ids.join(',')}&per_page=${ids.length}&orderby=include&_fields=id,title,date,link,excerpt,categories`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`WP REST ${res.status}`)
  return res.json()
}

async function fetchLatestPosts(count: number, excludeIds: number[] = []): Promise<WPPost[]> {
  const params = new URLSearchParams({
    per_page: String(count),
    orderby: 'date',
    order: 'desc',
    _fields: 'id,title,date,link,excerpt,categories',
  })
  if (excludeIds.length > 0) params.set('exclude', excludeIds.join(','))
  const res = await fetch(`${WP_API}/posts?${params.toString()}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`WP REST ${res.status}`)
  return res.json()
}

async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=20&hide_empty=true&_fields=id,name,slug,count`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`WP REST ${res.status}`)
  return res.json()
}

// Featured articles : selection manuelle "grand public" (decision Gilles 29/04).
// IDs fixes — a editer ici quand on veut changer la mise en avant.
const FEATURED_IDS = [883, 808, 388]

// ---------------------------------------------------------------------------
// Helpers UI
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent?.trim() ?? ''
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function decode(html: string): string {
  // Decoder rapide pour titres avec entites WP (« » ’ etc.)
  const tmp = document.createElement('textarea')
  tmp.innerHTML = html
  return tmp.value.trim()
}

// ---------------------------------------------------------------------------
// Hero (theme vert)
// ---------------------------------------------------------------------------

function BlogHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '60vh' }}
      aria-label="Hero blog"
    >
      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-[1360px] flex-col px-6 pb-16 lg:px-10 lg:pb-24">
        {/* Badge vert */}
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderColor: 'rgba(16, 185, 129, 0.25)',
              color: 'var(--inari-text-soft)',
              fontSize: '14px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
              paddingTop: '10px',
              paddingBottom: '10px',
              boxShadow: '0 0 24px -12px rgba(16, 185, 129, 0.35)',
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
              <path d="M2 3h6a4 4 0 0 1 4 4v8a3 3 0 0 0-3-3H2z" />
              <path d="M14 3h-6a4 4 0 0 0-4 4v8" />
            </svg>
            <span>Blog &middot; Guides &middot; Outils</span>
          </div>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="w-full max-w-3xl">
            <h1
              className="font-serif text-inari-white"
              style={{
                fontSize: 'clamp(40px, 4.5vw, 72px)',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                margin: 0,
              }}
            >
              <span className="block">Le savoir,</span>
              <span className="block">
                en{' '}
                <em className="not-italic" style={{ color: '#10B981' }}>
                  clair.
                </em>
              </span>
            </h1>
            <p
              className="text-inari-text-soft"
              style={{
                fontSize: '20px',
                lineHeight: '1.7',
                marginTop: '32px',
                maxWidth: '38rem',
              }}
            >
              Guides techniques, retours d&rsquo;experience, outils ouverts.
              Pas de bruit marketing&nbsp;: ce que vous lisez ici, vous pouvez
              le tester chez vous demain.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#latest"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#10B981', color: '#0A0A0F' }}
              >
                Derniers articles
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#lead-magnets"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                Guides PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Featured articles (3 cards, "grand public")
// ---------------------------------------------------------------------------

function FeaturedCard({ post, large }: { post: WPPost; large?: boolean }) {
  const title = decode(post.title.rendered)
  const excerpt = stripHtml(post.excerpt.rendered)
  const truncated = excerpt.length > 160 ? excerpt.slice(0, 160).trimEnd() + '…' : excerpt

  return (
    <a
      href={post.link}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#10B981] hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] sm:p-8 ${large ? 'lg:row-span-2' : ''}`}
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }}
      />

      <span
        className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
        style={{ color: '#10B981' }}
      >
        Selection
      </span>

      <time
        dateTime={post.date}
        className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted"
      >
        {formatDate(post.date)}
      </time>

      <h3 className={`mt-3 font-serif font-medium leading-tight text-inari-white transition-colors duration-300 group-hover:text-[#10B981] ${large ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
        {title}
      </h3>

      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-inari-text-soft">
        {truncated}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#10B981]">
        <span>Lire l&rsquo;article</span>
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.06), transparent 70%)',
        }}
      />
    </a>
  )
}

function FeaturedSkeletonCard({ large }: { large?: boolean }) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8 ${large ? 'lg:row-span-2' : ''}`}
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div className="h-3 w-24 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-inari-black-lighter" />
    </div>
  )
}

function FeaturedSection() {
  const { data, isLoading } = useQuery<WPPost[]>({
    queryKey: ['featured', FEATURED_IDS],
    queryFn: () => fetchPostsByIds(FEATURED_IDS),
  })

  return (
    <section
      className="relative overflow-hidden px-6 pb-16 pt-12 lg:px-10 lg:pb-20 lg:pt-16"
      aria-labelledby="featured-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            A la une
          </p>
        </div>

        <h2
          id="featured-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Les indispensables{' '}
          <em className="not-italic" style={{ color: '#10B981' }}>
            pour bien commencer.
          </em>
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {isLoading && (
            <>
              <FeaturedSkeletonCard />
              <FeaturedSkeletonCard />
              <FeaturedSkeletonCard />
            </>
          )}
          {data?.map((post) => (
            <FeaturedCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Categories pills + Latest grid (filtrable client-side)
// ---------------------------------------------------------------------------

function CategoriesPills({
  categories,
  active,
  onSelect,
}: {
  categories: WPCategory[]
  active: number | null
  onSelect: (id: number | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
          active === null
            ? 'border-[#10B981] text-[#10B981]'
            : 'border-white/[0.08] text-inari-text-soft hover:border-white/[0.20]'
        }`}
        style={{
          background:
            active === null ? 'rgba(16, 185, 129, 0.08)' : 'rgba(18, 18, 26, 0.10)',
          backdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        Tous ({categories.reduce((sum, c) => sum + c.count, 0)})
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
            active === c.id
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-white/[0.08] text-inari-text-soft hover:border-white/[0.20]'
          }`}
          style={{
            background:
              active === c.id ? 'rgba(16, 185, 129, 0.08)' : 'rgba(18, 18, 26, 0.10)',
            backdropFilter: 'blur(16px) saturate(180%)',
          }}
          dangerouslySetInnerHTML={{ __html: `${c.name} (${c.count})` }}
        />
      ))}
    </div>
  )
}

function ArticleCard({ post }: { post: WPPost }) {
  const title = decode(post.title.rendered)
  const excerpt = stripHtml(post.excerpt.rendered)
  const truncated = excerpt.length > 140 ? excerpt.slice(0, 140).trimEnd() + '…' : excerpt

  return (
    <a
      href={post.link}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-6 transition-all duration-300 hover:border-[#10B981] hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.12)] sm:p-7"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }}
      />

      <time
        dateTime={post.date}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted"
      >
        {formatDate(post.date)}
      </time>

      <h3 className="mt-3 font-sans text-base font-medium leading-snug text-inari-white transition-colors duration-300 group-hover:text-[#10B981]">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-inari-text-soft">
        {truncated}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#10B981]">
        <span>Lire</span>
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.06), transparent 70%)',
        }}
      />
    </a>
  )
}

function ArticleSkeletonCard() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-6 sm:p-7"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div className="h-3 w-24 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-inari-black-lighter" />
    </div>
  )
}

function LatestSection() {
  const [active, setActive] = useState<number | null>(null)

  const cats = useQuery<WPCategory[]>({
    queryKey: ['wp-categories'],
    queryFn: fetchCategories,
  })
  const posts = useQuery<WPPost[]>({
    queryKey: ['wp-latest', 12, FEATURED_IDS],
    queryFn: () => fetchLatestPosts(12, FEATURED_IDS),
  })

  // Filtre client-side : si une categorie est active, on garde uniquement les posts qui l'ont
  const filtered = useMemo(() => {
    if (!posts.data) return []
    if (active === null) return posts.data
    return posts.data.filter((p) => p.categories?.includes(active))
  }, [active, posts.data])

  return (
    <section
      id="latest"
      className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-10 lg:pb-28 lg:pt-16"
      aria-labelledby="latest-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Tous les articles
          </p>
        </div>

        <h2
          id="latest-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Explorez{' '}
          <em className="not-italic" style={{ color: '#10B981' }}>
            par sujet.
          </em>
        </h2>

        {/* Filters */}
        <div className="mt-8">
          {cats.isLoading && (
            <p className="font-mono text-[11px] text-inari-text-muted">
              Chargement des categories…
            </p>
          )}
          {cats.data && (
            <CategoriesPills
              categories={cats.data}
              active={active}
              onSelect={setActive}
            />
          )}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.isLoading &&
            Array.from({ length: 6 }).map((_, i) => <ArticleSkeletonCard key={i} />)}
          {posts.isError && (
            <p className="col-span-full text-center text-sm text-inari-text-muted">
              Impossible de charger les articles.
            </p>
          )}
          {filtered.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
          {posts.data && filtered.length === 0 && active !== null && (
            <p className="col-span-full text-center text-sm text-inari-text-muted">
              Aucun article dans cette categorie pour l&rsquo;instant.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Lead magnets (placeholder — Phase 6)
// ---------------------------------------------------------------------------

type LeadMagnet = {
  id: string
  category: string
  title: string
  description: string
  status: string
  icon: React.ReactNode
}

const LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'guide-ia-locale',
    category: 'IA · 30 pages',
    title: 'Guide complet IA locale 2026',
    description:
      'Choisir son hardware, installer Ollama, deployer un agent metier, securiser le tout. Avec checklists, schemas, scripts pret-a-l\'emploi.',
    status: 'Bientot disponible',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    id: 'checklist-nlpd',
    category: 'Cybersec · Checklist',
    title: 'Checklist nLPD pour PME 2026',
    description:
      'Audit conformite en 12 points : registre traitements, DPIA, sous-traitants, droits, breaches. Copie-colle dans votre Notion / drive.',
    status: 'Bientot disponible',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'pipeline-ecom',
    category: 'IA · Operationnel',
    title: 'Pipeline e-commerce automatise',
    description:
      'Architecture complete IA + WooCommerce + emails declenchements : description produit, recommandations, support tier 1, retours analytics.',
    status: 'Bientot disponible',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
]

function LeadMagnetCard({ pdf }: { pdf: LeadMagnet }) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#10B981]/40 sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}
        >
          {pdf.icon}
        </div>
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.10)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.30)',
          }}
        >
          {pdf.status}
        </span>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
        {pdf.category}
      </p>

      <h3 className="mt-2 font-sans text-lg font-medium leading-tight text-inari-white">
        {pdf.title}
      </h3>

      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-inari-text-soft">
        {pdf.description}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-xs font-medium text-inari-text-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M2 6h20M5 12h14M8 18h8" />
        </svg>
        <span>Notification quand pret</span>
      </div>
    </div>
  )
}

function LeadMagnetsSection() {
  return (
    <section
      id="lead-magnets"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="lead-magnets-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Guides PDF
          </p>
        </div>

        <h2
          id="lead-magnets-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Trois guides{' '}
          <em className="not-italic" style={{ color: '#10B981' }}>
            en preparation.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas de gating obligatoire. Quand un guide est pret, on l&rsquo;envoie
          a ceux qui ont demande, sans newsletter spam derriere.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEAD_MAGNETS.map((pdf) => (
            <LeadMagnetCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function BlogCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="blog-cta-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="blog-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Vous avez un sujet{' '}
          <em className="not-italic text-inari-text-soft">
            a creuser&nbsp;?
          </em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Une question technique, un cas pratique, un outil que vous voulez
          voir teste&nbsp;? On le note et on le couvre dans un prochain article.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#10B981', color: '#0A0A0F' }}
          >
            Suggerer un sujet
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="#latest"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Continuer a lire
          </a>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          Reponse sous 48h &middot; Pas de spam, jamais
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

function BlogIsland() {
  return (
    <div className="relative text-inari-text" data-theme="vert" role="region" aria-label="Contenu blog">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <Suspense fallback={<BackgroundSkeleton />}>
          <VolumetricFog />
          <NeuralNetworkGreen />
        </Suspense>
      </div>

      <div className="relative z-10">
        <BlogHero />
        <FeaturedSection />
        <LatestSection />
        <LeadMagnetsSection />
        <BlogCTA />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-blog-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BlogIsland />
      </QueryClientProvider>
    </StrictMode>,
  )
}
