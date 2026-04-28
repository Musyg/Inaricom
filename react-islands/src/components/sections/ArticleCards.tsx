import { useWPPosts, type WPPost } from '@/hooks/useWPPosts'

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent?.trim() ?? ''
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function ArticleCard({ post }: { post: WPPost }) {
  const title = stripHtml(post.title.rendered)
  const excerpt = stripHtml(post.excerpt.rendered)
  const truncated = excerpt.length > 140 ? excerpt.slice(0, 140).trimEnd() + '…' : excerpt

  return (
    <a
      href={post.link}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-300 hover:border-inari-text-muted hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.06)]"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div className="flex flex-1 flex-col p-7 sm:p-8">
        {/* Date */}
        <time
          dateTime={post.date}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted"
        >
          {formatDate(post.date)}
        </time>

        {/* Title */}
        <h3 className="mt-3 font-sans text-lg font-medium leading-snug text-inari-white transition-colors duration-300 group-hover:text-inari-accent">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-inari-text-soft">
          {truncated}
        </p>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-inari-accent">
          <span>Lire l&rsquo;article</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </div>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <div className="h-3 w-24 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-inari-black-lighter" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-inari-black-lighter" />
    </div>
  )
}

export function ArticleCards() {
  const { data: posts, isLoading, isError } = useWPPosts(3)

  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="articles-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Derni&egrave;res publications
          </p>
        </div>

        {/* H2 */}
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="articles-title"
            className="max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
          >
            Du concret,{' '}
            <em className="not-italic text-inari-text-soft">
              pas du bruit.
            </em>
          </h2>
          <a
            href="/blog/"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-inari-text-muted transition-colors hover:text-inari-accent"
          >
            Tous les articles
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </a>
        </div>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {isError && (
            <p className="col-span-full text-center text-sm text-inari-text-muted">
              Impossible de charger les articles.
            </p>
          )}
          {posts?.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
