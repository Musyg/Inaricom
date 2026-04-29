import { StrictMode, Suspense, lazy, useState, type FormEvent, type ChangeEvent } from 'react'
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
// API config injectee par ReactLoader.php : window.inariApi = { root, nonce }
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    inariApi?: { root: string; nonce: string }
  }
}

// ---------------------------------------------------------------------------
// Hero (theme bleu)
// ---------------------------------------------------------------------------

function ContactHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '50vh' }}
      aria-label="Hero contact"
    >
      <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-[1360px] flex-col px-6 pb-12 lg:px-10 lg:pb-16">
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
// Process section (3 cards)
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
// Custom React contact form (bypass WPForms entirely)
// ---------------------------------------------------------------------------

type FormState = {
  firstname: string
  lastname: string
  email: string
  subject: string
  structure: string
  message: string
  honeypot: string // anti-spam : doit rester vide
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const INITIAL_FORM: FormState = {
  firstname: '',
  lastname: '',
  email: '',
  subject: '',
  structure: '',
  message: '',
  honeypot: '',
}

const STRUCTURE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Choisir...' },
  { value: 'particulier', label: 'Particulier' },
  { value: 'independant', label: 'Independant / freelance' },
  { value: 'tpe', label: 'TPE (1-9 salaries)' },
  { value: 'pme', label: 'PME (10-249 salaries)' },
  { value: 'autre', label: 'Autre (association, collectivite...)' },
]

function ContactFormSection() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  function update(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state.status === 'submitting') return

    // Validation client basique (le serveur revalide tout)
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim() || !form.subject.trim()) {
      setState({ status: 'error', message: 'Merci de remplir les champs obligatoires.' })
      return
    }
    if (form.message.trim().length < 10) {
      setState({ status: 'error', message: 'Le message doit faire au moins 10 caracteres.' })
      return
    }

    const api = window.inariApi
    if (!api?.root || !api?.nonce) {
      setState({
        status: 'error',
        message: 'Configuration API manquante. Rechargez la page et reessayez.',
      })
      return
    }

    setState({ status: 'submitting' })

    try {
      const res = await fetch(`${api.root}inaricom/v1/contact`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': api.nonce,
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = (await res.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null

      if (res.ok && data?.success) {
        setState({
          status: 'success',
          message: data.message ?? 'Message envoye. Reponse sous 48h ouvres.',
        })
        setForm(INITIAL_FORM)
        return
      }

      setState({
        status: 'error',
        message: data?.message ?? 'L\'envoi a echoue. Reessayez dans quelques minutes.',
      })
    } catch (err) {
      console.error('[contact] fetch error', err)
      setState({
        status: 'error',
        message: 'Erreur reseau. Verifiez votre connexion et reessayez.',
      })
    }
  }

  return (
    <section
      id="contact-form"
      className="relative overflow-hidden px-6 pb-24 pt-8 lg:px-10 lg:pb-32 lg:pt-12"
      aria-labelledby="form-title"
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Le formulaire
          </p>
        </div>
        <h2
          id="form-title"
          className="mt-5 font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Ecrivez-nous{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            directement.
          </em>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Soyez factuel. Indiquez votre structure. Pas d&rsquo;urgence imposee&nbsp;:
          si c&rsquo;est un incident en cours, mentionnez-le.
        </p>

        {/* Card formulaire — meme glassmorphism que les autres cards */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-10 rounded-2xl border border-white/[0.08] p-6 sm:p-8 lg:p-10"
          style={{
            background: 'rgba(18, 18, 26, 0.10)',
            backdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          {/* Honeypot (cache) */}
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', top: 'auto', height: 1, width: 1, overflow: 'hidden' }}
          >
            <label>
              Ne pas remplir ce champ
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.honeypot}
                onChange={update('honeypot')}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prenom" required>
              <input
                type="text"
                name="firstname"
                required
                autoComplete="given-name"
                value={form.firstname}
                onChange={update('firstname')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              />
            </Field>
            <Field label="Nom" required>
              <input
                type="text"
                name="lastname"
                required
                autoComplete="family-name"
                value={form.lastname}
                onChange={update('lastname')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Email" required>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="vous@domaine.com"
                value={form.email}
                onChange={update('email')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              />
            </Field>
            <Field label="Structure">
              <select
                name="structure"
                value={form.structure}
                onChange={update('structure')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              >
                {STRUCTURE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Sujet" required>
              <input
                type="text"
                name="subject"
                required
                value={form.subject}
                onChange={update('subject')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Message" required hint="Minimum 10 caracteres. Soyez factuel : contexte, probleme, ce qui a deja ete tente.">
              <textarea
                name="message"
                required
                rows={7}
                minLength={10}
                value={form.message}
                onChange={update('message')}
                disabled={state.status === 'submitting'}
                className="contact-input"
              />
            </Field>
          </div>

          {/* Submit + state */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={state.status === 'submitting'}
              className="group inline-flex items-center gap-2 rounded-md px-7 py-3 font-sans text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-110"
              style={{ backgroundColor: '#0081f2', color: '#FFFFFF' }}
            >
              {state.status === 'submitting' ? (
                <>
                  <Spinner /> Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer le message
                  <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
                </>
              )}
            </button>

            <p className="text-[12px] font-mono uppercase tracking-[0.18em] text-inari-text-muted">
              Reponse sous 48h ouvres
            </p>
          </div>

          {/* Etats de soumission */}
          {state.status === 'success' && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-md border px-4 py-3 text-sm"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.30)',
                color: '#10B981',
              }}
            >
              <strong>Message envoye.</strong> {state.message}
            </div>
          )}

          {state.status === 'error' && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-md border px-4 py-3 text-sm"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.30)',
                color: '#F59E0B',
              }}
            >
              {state.message}
            </div>
          )}

          {/* RGPD note */}
          <p className="mt-6 text-[12px] leading-relaxed text-inari-text-muted">
            Vos donnees sont uniquement utilisees pour repondre a votre message.
            Pas de newsletter, pas de partage. Voir notre{' '}
            <a
              href="/privacy-policy/"
              className="underline underline-offset-2 hover:text-inari-text-soft"
              style={{ color: 'inherit' }}
            >
              politique de confidentialite
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="font-sans text-sm font-medium text-inari-text">
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: '#1a93fe', marginLeft: 4 }}>
            *
          </span>
        )}
      </span>
      <div className="mt-2">{children}</div>
      {hint && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-inari-text-muted">{hint}</p>
      )}
    </label>
  )
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'inari-spin 0.7s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Inline styles pour les inputs (scoped via classe contact-input)
// ---------------------------------------------------------------------------

function ContactInputStyles() {
  // CSS injectee une fois — assure le styling royal blue meme si Tailwind ne couvre pas tout
  const css = `
    @keyframes inari-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .contact-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-family: 'Geist Sans', ui-sans-serif, system-ui, sans-serif;
      font-size: 0.9375rem;
      color: var(--inari-text);
      background-color: rgba(10, 10, 15, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    }
    .contact-input::placeholder { color: var(--inari-text-muted); opacity: 1; }
    .contact-input:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.16);
    }
    .contact-input:focus {
      outline: none;
      border-color: #0081f2;
      box-shadow: 0 0 0 3px rgba(0, 129, 242, 0.18);
      background-color: rgba(10, 10, 15, 0.8);
    }
    .contact-input:disabled { opacity: 0.6; cursor: not-allowed; }
    select.contact-input {
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23B6B0B4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }
    textarea.contact-input { resize: vertical; min-height: 9rem; }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

function ContactIsland() {
  return (
    <div className="relative text-inari-text" data-theme="bleu" role="region" aria-label="Contact Inaricom">
      <ContactInputStyles />
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
        <ContactFormSection />
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
