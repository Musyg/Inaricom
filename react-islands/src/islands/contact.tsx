import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds (theme bleu institutionnel)
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)
const BlueprintGridBlue = lazy(() =>
  import('@/components/backgrounds/BlueprintGridBlue').then((m) => ({ default: m.BlueprintGridBlue })),
)

// ---------------------------------------------------------------------------
// Hero contact (theme bleu)
// ---------------------------------------------------------------------------

function ContactHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '50vh' }}
      aria-label="Hero contact"
    >
      <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-[1360px] flex-col px-6 pb-12 lg:px-10 lg:pb-16">
        {/* Badge bleu */}
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(0, 129, 242, 0.08)',
              borderColor: 'rgba(0, 129, 242, 0.25)',
              color: 'var(--inari-text-soft)',
              fontSize: '14px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
              paddingTop: '10px',
              paddingBottom: '10px',
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
              <path d="M2 4l6 5 6-5M2 4v8h12V4" />
            </svg>
            <span>Echange ecrit &middot; Reponse 48h &middot; Sans engagement</span>
          </div>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="w-full max-w-3xl">
            <h1
              className="font-serif text-inari-white"
              style={{
                fontSize: 'clamp(40px, 4.8vw, 72px)',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                margin: 0,
              }}
            >
              <span className="block">On commence</span>
              <span className="block">
                par{' '}
                <em className="not-italic" style={{ color: '#1a93fe' }}>
                  un message.
                </em>
              </span>
            </h1>
            <p
              className="text-inari-text-soft"
              style={{
                fontSize: '20px',
                lineHeight: '1.7',
                marginTop: '32px',
                maxWidth: '40rem',
              }}
            >
              Pas de tunnel commercial, pas de discovery call de 45 minutes
              avant d&rsquo;avoir compris votre besoin. Vous ecrivez, on lit, on
              repond. Si on peut aider, on le dit. Si ce n&rsquo;est pas pour
              nous, on vous oriente.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section "A quoi t'attendre" (3 etapes du process)
// ---------------------------------------------------------------------------

function ProcessSection() {
  const steps: { mark: string; title: string; body: string }[] = [
    {
      mark: '01',
      title: 'Vous ecrivez',
      body: 'Decrivez votre contexte, ce qui bloque, ce que vous avez deja teste. Pas de format impose. Plus c\'est concret, mieux c\'est.',
    },
    {
      mark: '02',
      title: 'On vous repond sous 48h',
      body: 'Diagnostic ecrit : ce que nous comprenons du probleme, ce que nous proposons, le perimetre, l\'enveloppe budgetaire indicative. Si ce n\'est pas pour nous, on vous oriente.',
    },
    {
      mark: '03',
      title: 'Echange optionnel',
      body: 'Si la proposition ecrite vous interesse, on planifie un echange (visio ou tel) pour caler le perimetre exact. Sinon, vous gardez la reponse, sans engagement.',
    },
  ]

  return (
    <section
      className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-20"
      aria-labelledby="process-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            A quoi t&rsquo;attendre
          </p>
        </div>

        <h2
          id="process-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Trois etapes,{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            pas de surprise.
          </em>
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <article
              key={s.mark}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.22em]"
                style={{ color: '#1a93fe' }}
              >
                {s.mark}
              </span>
              <h3 className="mt-3 font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
                {s.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section "Comment ecrire un bon message" (intro juste avant le formulaire)
// ---------------------------------------------------------------------------

function FormIntroSection() {
  const tips: { label: string; body: string }[] = [
    {
      label: 'Soyez factuel',
      body: 'Decrivez le contexte, le probleme, ce qui a deja ete tente. Pas besoin d\'argumentaire commercial.',
    },
    {
      label: 'Indiquez votre structure',
      body: 'Particulier, independant, TPE, PME, association ou collectivite : le cadre change la reponse.',
    },
    {
      label: 'Pas d\'urgence imposee',
      body: 'Si c\'est un incident en cours, mentionnez-le. Sinon, prenez le temps de bien formuler.',
    },
  ]

  return (
    <section
      className="relative overflow-hidden px-6 pb-8 pt-4 lg:px-10 lg:pb-10 lg:pt-6"
      aria-labelledby="form-intro-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Le formulaire
          </p>
        </div>

        <h2
          id="form-intro-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Trois principes pour{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            une reponse utile.
          </em>
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tips.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-white/[0.08] p-5"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <p
                className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                style={{ color: '#1a93fe' }}
              >
                {t.label}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-inari-text-soft">
                {t.body}
              </p>
            </div>
          ))}
        </div>

        {/* Anchor pour scroll vers le formulaire WP */}
        <div className="mt-10 text-center">
          <a
            href="#wpforms-643"
            className="inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#0081f2', color: '#FFFFFF' }}
          >
            Acceder au formulaire
            <span aria-hidden="true" className="ml-1">&darr;</span>
          </a>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

function ContactIsland() {
  return (
    <div className="relative text-inari-text" data-theme="bleu" role="region" aria-label="Contact Inaricom">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <Suspense fallback={null}>
          <VolumetricFog />
          <BlueprintGridBlue />
        </Suspense>
      </div>

      <div className="relative z-10">
        <ContactHero />
        <ProcessSection />
        <FormIntroSection />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-contact-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ContactIsland />
    </StrictMode>,
  )
}
