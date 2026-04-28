export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-28 lg:px-10 lg:py-36"
      aria-labelledby="final-cta-title"
    >
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(var(--inari-red-rgb), 0.06), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="final-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
        >
          D&eacute;crivez-nous{' '}
          <em className="not-italic text-inari-text-soft">votre projet.</em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Audit de s&eacute;curit&eacute;, d&eacute;ploiement IA local,
          accompagnement technique&nbsp;: un premier &eacute;change
          sans engagement pour cadrer votre besoin.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md bg-inari-accent px-7 py-3.5 font-sans text-sm font-medium text-inari-black transition hover:bg-inari-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
          >
            Prendre contact
            <span
              aria-hidden="true"
              className="transition group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </a>
          <a
            href="/services-cybersecurite/"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inari-accent focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Voir nos services
          </a>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          R&eacute;ponse sous 48h &middot; Premier &eacute;change gratuit
        </p>
      </div>
    </section>
  )
}
