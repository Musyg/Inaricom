import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds (meme pattern que blog/ia/cybersec).
// Theme bleu institutionnel : VolumetricFog universel + BlueprintGridBlue.
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)
const BlueprintGridBlue = lazy(() =>
  import('@/components/backgrounds/BlueprintGridBlue').then((m) => ({ default: m.BlueprintGridBlue })),
)

// ---------------------------------------------------------------------------
// Hero (theme bleu — manifeste pragmatique nourri par Ethical Empire)
// ---------------------------------------------------------------------------

function AboutHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '70vh' }}
      aria-label="Hero a propos"
    >
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1360px] flex-col px-6 pb-16 lg:px-10 lg:pb-24">
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
              <circle cx="8" cy="8" r="6" />
              <path d="M8 4v4l2.5 2.5" />
            </svg>
            <span>Manifeste &middot; Approche &middot; Equipe</span>
          </div>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="w-full max-w-4xl">
            <h1
              className="font-serif text-inari-white"
              style={{
                fontSize: 'clamp(40px, 4.8vw, 80px)',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                fontWeight: 400,
                margin: 0,
              }}
            >
              <span className="block">La technologie doit</span>
              <span className="block">
                <em className="not-italic" style={{ color: '#1a93fe' }}>
                  liberer.
                </em>
              </span>
            </h1>
            <p
              className="text-inari-text-soft"
              style={{
                fontSize: '20px',
                lineHeight: '1.7',
                marginTop: '32px',
                maxWidth: '42rem',
              }}
            >
              Pas intensifier le travail, pas surveiller, pas concentrer le pouvoir.
              Inaricom est une agence IA hybride qui simplifie ce qui est devenu
              trop complexe&nbsp;: redonner du temps, de la clarte et de la marge
              de manoeuvre humaine.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#approche"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#0081f2', color: '#FFFFFF' }}
              >
                Notre approche
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#engagements"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                Nos engagements
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Constat (le pourquoi — non ideologique, factuel)
// ---------------------------------------------------------------------------

function ConstatSection() {
  const facts: { mark: string; title: string; body: string }[] = [
    {
      mark: '01',
      title: 'La productivite augmente.',
      body: 'Les outils, l\'IA et l\'automatisation ont decuple la capacite de production des organisations sur les 20 dernieres annees.',
    },
    {
      mark: '02',
      title: 'La charge mentale aussi.',
      body: 'Plus d\'outils, plus de processus, plus de notifications. Les equipes croulent sous la complexite censee les soulager.',
    },
    {
      mark: '03',
      title: 'Le temps libre, lui, recule.',
      body: 'L\'utopie qui consiste a croire qu\'on peut empiler technologie et fatigue indefiniment ne tient plus. Inaricom part de ce constat.',
    },
  ]

  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="constat-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Le constat
          </p>
        </div>

        <h2
          id="constat-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Pourquoi Inaricom{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            existe.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas un projet ideologique. Un projet pragmatique. Le notre repose sur
          trois faits que vous voyez chaque jour dans votre PME&nbsp;:
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {facts.map((fact) => (
            <article
              key={fact.mark}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.22em]"
                style={{ color: '#1a93fe' }}
              >
                {fact.mark}
              </span>
              <h3 className="mt-3 font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
                {fact.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
                {fact.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Notre approche (4 principes — A propos+Notre approche)
// ---------------------------------------------------------------------------

function ApprocheSection() {
  const principes: {
    label: string
    title: string
    body: string
    icon: React.ReactNode
  }[] = [
    {
      label: 'Principe 01',
      title: 'Utile avant sophistique',
      body: 'Si une regle metier de 15 lignes resout 80 % du probleme, on n\'installe pas un agent multi-LLM avec orchestration. La sobriete est un choix technique.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.07 7.07l4.24 4.24M1 12h6m10 0h6" />
        </svg>
      ),
    },
    {
      label: 'Principe 02',
      title: 'Comprehensible avant performant',
      body: 'Une solution que vous ne comprenez pas est une solution que vous ne maitrisez pas. Nous documentons, nous expliquons, nous formons. Pas de boite noire.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M2 3h20v18H2z" />
          <path d="M2 9h20" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      label: 'Principe 03',
      title: 'Reversible avant generalise',
      body: 'On commence petit, on mesure, on documente les effets. Si ca ne marche pas, on revient en arriere proprement. Aucun lock-in operationnel impose.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
    },
    {
      label: 'Principe 04',
      title: 'Hybride par conception',
      body: 'IA locale (Ollama, Mistral self-hosted) quand la donnee est sensible. IA cloud quand le ratio cout/qualite l\'impose. Vous choisissez le bon niveau d\'autonomie.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      ),
    },
  ]

  return (
    <section
      id="approche"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="approche-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Notre approche
          </p>
        </div>

        <h2
          id="approche-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Quatre principes,{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            zero ideologie.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Notre metier n&rsquo;est pas de &laquo; faire de l&rsquo;IA &raquo;. C&rsquo;est de
          reduire la friction, simplifier les flux, redonner de la marge de
          manoeuvre humaine la ou la techno a parfois ajoute plus de contraintes
          qu&rsquo;elle n&rsquo;en a supprimees.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {principes.map((p) => (
            <article
              key={p.label}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[rgba(0,129,242,0.4)] sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
                style={{ background: 'linear-gradient(90deg, transparent, #0081f2, transparent)' }}
              />

              <div className="flex items-start gap-5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(0, 129, 242, 0.10)', color: '#1a93fe' }}
                >
                  {p.icon}
                </div>
                <div className="flex-1">
                  <span
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{ color: '#1a93fe' }}
                  >
                    {p.label}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-inari-text-soft">
                    {p.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Engagements (4 cards — Charte Fondatrice §4-§6)
// ---------------------------------------------------------------------------

function EngagementsSection() {
  const engagements: {
    title: string
    body: string
    chip: string
  }[] = [
    {
      title: 'IA contestable, jamais autoritaire',
      body: 'Toute decision automatisee qui affecte une personne doit etre contestable, revisable humainement et documentee. Un mode degrade operable est obligatoire.',
      chip: 'Charte §4',
    },
    {
      title: 'Anti-boite noire',
      body: 'Auditabilite empirique des effets, biais observes documentes, reversibilite testee. L\'explicabilite causale est exigee partout ou elle est techniquement fondee.',
      chip: 'Charte §4',
    },
    {
      title: 'Surveillance interdite par defaut',
      body: 'Pas de monitoring continu, pas de metriques punitives, pas de decision adverse entierement automatisee sans appel. Mesures finalisees, minimisees, temporisees.',
      chip: 'Charte §5',
    },
    {
      title: 'Donnees de productivite collectives',
      body: 'Les donnees produites au travail appartiennent au collectif, pas a un tiers. Chaque individu accede a ses donnees personnelles. Aucune captation par exclusivite tierce.',
      chip: 'Charte §6',
    },
  ]

  return (
    <section
      id="engagements"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="engagements-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Nos engagements
          </p>
        </div>

        <h2
          id="engagements-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Une charte{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            opposable.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas de slogan. Une charte fondatrice qui guide nos choix techniques,
          nos partenariats et nos refus. Elle est versionnee, justifiee, opposable
          y compris a nos financeurs.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {engagements.map((e) => (
            <article
              key={e.title}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-[22px]">
                  {e.title}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    backgroundColor: 'rgba(0, 129, 242, 0.10)',
                    color: '#1a93fe',
                    border: '1px solid rgba(0, 129, 242, 0.30)',
                  }}
                >
                  {e.chip}
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
                {e.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Le projet & l'equipe (Boussole Strategique)
// ---------------------------------------------------------------------------

function EquipeSection() {
  const founder = {
    name: 'Kevin Meunier',
    role: 'Fondateur / Direction',
    bio: 'Pilote la strategie, les partenariats et l\'arbitrage des decisions structurantes. Veut prouver par les faits qu\'une PME peut etre productive sans broyer ses humains, ni dependre d\'une boite noire externe.',
    initials: 'KM',
  }

  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="equipe-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Le projet &amp; la direction
          </p>
        </div>

        <h2
          id="equipe-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Une structure{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            volontairement legere.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Inaricom est une entreprise individuelle. Pas de strate hierarchique
          inutile, pas de delegation cachee. Vous parlez directement a la
          personne qui pilote, decide et engage.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-1 lg:grid-cols-[2fr_3fr]">
          <article
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            <div className="flex items-start gap-5">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-mono text-sm font-medium tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,129,242,0.18), rgba(26,147,254,0.10))',
                  color: '#FFFFFF',
                  border: '1px solid rgba(0, 129, 242, 0.30)',
                }}
              >
                {founder.initials}
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
                  {founder.name}
                </h3>
                <p
                  className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: '#1a93fe' }}
                >
                  {founder.role}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
                  {founder.bio}
                </p>
              </div>
            </div>
          </article>

          {/* Pendant droit : la philosophie de fonctionnement (en attendant
              eventuelle equipe elargie). Equilibre visuel avec la card founder. */}
          <article
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            <p
              className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{ color: '#1a93fe' }}
            >
              Comment on travaille
            </p>
            <h3 className="mt-3 font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
              Petit perimetre, livrables nets, partenaires choisis.
            </h3>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-inari-text-soft">
              <li className="flex gap-3">
                <span aria-hidden="true" style={{ color: '#1a93fe' }}>&middot;</span>
                <span>
                  Chaque mission a un perimetre ecrit, un livrable defini et un
                  critere d&rsquo;arret clair.
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" style={{ color: '#1a93fe' }}>&middot;</span>
                <span>
                  Pour les chantiers necessitant des specialistes (juridique,
                  fiscal, design pousse), nous travaillons avec un reseau de
                  partenaires francophones de confiance, declares en amont.
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" style={{ color: '#1a93fe' }}>&middot;</span>
                <span>
                  Pas de sous-traitance cachee, pas de delegation surprise. Si
                  quelqu&rsquo;un d&rsquo;autre intervient sur votre projet, vous
                  le savez avant.
                </span>
              </li>
            </ul>
          </article>
        </div>

        {/* Vision encadree, citation Boussole */}
        <blockquote
          className="mt-12 rounded-2xl border border-white/[0.08] p-8 lg:p-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(0, 129, 242, 0.05) 0%, rgba(18, 18, 26, 0.10) 100%)',
            backdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          <p className="font-serif text-xl leading-relaxed text-inari-text sm:text-2xl">
            &laquo;&nbsp;L&rsquo;argent est un moyen pour acheter du temps, de la
            clarte et du pouvoir citoyen&nbsp;&mdash; jamais une fin en soi.&nbsp;&raquo;
          </p>
          <footer className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
            Boussole strategique &middot; Phrase-cap interne
          </footer>
        </blockquote>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Stack & souverainete
// ---------------------------------------------------------------------------

function StackSection() {
  const stack: { label: string; value: string; sub: string }[] = [
    {
      label: 'IA locale',
      value: 'Ollama + Mistral',
      sub: 'Modeles open-weights tournant chez vous quand la donnee est sensible',
    },
    {
      label: 'IA cloud (raisonnee)',
      value: 'Claude / GPT',
      sub: 'Uniquement quand le ratio cout/qualite le justifie, jamais par defaut',
    },
    {
      label: 'Hebergement',
      value: 'SwissCenter',
      sub: 'Donnees en Europe, ISO 27001, conformite nLPD/RGPD, aucun cloud US dans la chaine',
    },
    {
      label: 'Code',
      value: 'Open-source-first',
      sub: 'WordPress + WooCommerce + outils OFL. Auditables, reversibles, sans lock-in',
    },
    {
      label: 'Securite',
      value: 'Audit interne continu',
      sub: 'WPScan, headers stricts, CSP enforced, monitoring CVE quotidien',
    },
    {
      label: 'Engagement',
      value: 'Pas de boite noire',
      sub: 'Toute solution livree avec sa documentation, son rollback, ses limites',
    },
  ]

  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="stack-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Stack &amp; souverainete
          </p>
        </div>

        <h2
          id="stack-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl"
        >
          Local-first,{' '}
          <em className="not-italic" style={{ color: '#1a93fe' }}>
            cloud raisonne.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Choisir le bon niveau d&rsquo;autonomie technologique. Limiter les
          dependances inutiles. Maitriser les couts, la confidentialite et la
          resilience. Voici ce sur quoi nous nous appuyons.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((s) => (
            <article
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <p
                className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                style={{ color: '#1a93fe' }}
              >
                {s.label}
              </p>
              <p className="mt-3 font-serif text-xl leading-tight text-inari-white sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-inari-text-soft">
                {s.sub}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function AboutCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="about-cta-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(0, 129, 242, 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="about-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          On parle de votre{' '}
          <em className="not-italic text-inari-text-soft">
            projet&nbsp;?
          </em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Que vous soyez une PME, un independant, un CTO ou un dirigeant
          non-technique&nbsp;: on commence par un echange ecrit, sans
          engagement, pour comprendre ce qui bloque vraiment.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#0081f2', color: '#FFFFFF' }}
          >
            Prendre contact
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="/blog/"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Lire d&rsquo;abord
          </a>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          Reponse sous 48h &middot; Echange ecrit &middot; Pas d&rsquo;engagement
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

function AboutIsland() {
  return (
    <div className="relative text-inari-text" data-theme="bleu" role="region" aria-label="A propos d Inaricom">
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
        <AboutHero />
        <ConstatSection />
        <ApprocheSection />
        <EngagementsSection />
        <EquipeSection />
        <StackSection />
        <AboutCTA />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-about-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AboutIsland />
    </StrictMode>,
  )
}
