import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

import { ParticleNeonGold } from '@/components/backgrounds/ParticleNeonGold'
import { TechDemo } from '@/components/sections/TechDemo'

// ---------------------------------------------------------------------------
// Data — 2 piliers actuels (Hardware + Agents). Fine-tuning en roadmap teaser.
// ---------------------------------------------------------------------------

type Pillar = {
  id: string
  number: string
  title: string
  tagline: string
  description: string
  features: string[]
  href: string
  icon: React.ReactNode
}

const PILLARS: Pillar[] = [
  {
    id: 'hardware',
    number: '01',
    title: 'Hardware IA',
    tagline: 'Jetson Orin · Raspberry Pi 5 · stations dédiées',
    description:
      'Cartes embarquées et stations préconfigurées pour faire tourner vos agents IA en local. Du nano edge (RPi5) à la station GPU full-power (Jetson AGX Orin). Livrés montés, testés, prêts à brancher.',
    features: [
      'Jetson Orin Nano / NX / AGX',
      'Raspberry Pi 5 + kits IA optimisés',
      'Stations IA préconfigurées',
      'Garantie + tests stress en sortie atelier',
    ],
    href: '/shop/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
        <line x1="10" y1="6" x2="18" y2="6" />
        <line x1="10" y1="18" x2="18" y2="18" />
      </svg>
    ),
  },
  {
    id: 'agents',
    number: '02',
    title: 'Agents IA',
    tagline: 'Catalogue d’agents prêts à déployer',
    description:
      'Agents spécialisés métier, déployables sur votre infrastructure ou sur du hardware Inaricom. Modèles open-weight (Mistral, Llama, Qwen), prompts métier, intégrations REST. Livrés avec doc et support.',
    features: [
      'Agent juridique (RGPD / nLPD)',
      'Agent code (review, audit dépendances)',
      'Agent RAG documentaire (recherche interne)',
      'Agent monitoring (corrélation logs sécurité)',
    ],
    href: '/shop/?category=agents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// "Pourquoi local-first" — 4 engagements
// ---------------------------------------------------------------------------

type Commitment = {
  id: string
  number: string
  title: string
  description: string
}

const COMMITMENTS: Commitment[] = [
  {
    id: 'sovereignty',
    number: '01',
    title: 'Souveraineté complète',
    description:
      'Vos données ne quittent jamais votre infrastructure. Zéro appel sortant vers des LLM cloud US ou chinois. Vous contrôlez le hardware, le modèle, les prompts.',
  },
  {
    id: 'compliance',
    number: '02',
    title: 'nLPD / RGPD natif',
    description:
      'Pas de transfert hors UE. Pas de Cloud Act applicable. Conformité par design, pas par contrat. Idéal pour santé, finance, juridique, secteurs réglementés.',
  },
  {
    id: 'open-weight',
    number: '03',
    title: 'Modèles open-weight',
    description:
      'Mistral, Llama, Qwen, DeepSeek. Pas de boîte noire propriétaire. Vous savez ce que tourne, vous pouvez l’auditer, le forker, le fine-tuner.',
  },
  {
    id: 'cost',
    number: '04',
    title: 'Coût maîtrisé',
    description:
      'Investissement hardware ponctuel vs facturation API à la requête. Au-delà de quelques milliers d’appels par mois, le local devient plus économique. Et le coût ne dérape pas.',
  },
]

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function IaHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '100vh' }}
      aria-label="Hero IA souveraine"
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1360px] flex-col px-6 lg:px-10">
        {/* Badge or */}
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.08)',
              borderColor: 'rgba(255, 215, 0, 0.25)',
              color: 'var(--inari-text-soft)',
              fontSize: '14px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
              paddingTop: '10px',
              paddingBottom: '10px',
              boxShadow: '0 0 24px -12px rgba(255, 215, 0, 0.35)',
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
              <rect x="2" y="2" width="12" height="5" rx="1" />
              <rect x="2" y="9" width="12" height="5" rx="1" />
              <circle cx="4" cy="4.5" r="0.5" fill="currentColor" />
              <circle cx="4" cy="11.5" r="0.5" fill="currentColor" />
            </svg>
            <span>Agents IA &middot; Hardware &middot; Local-first</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1" style={{ paddingTop: '40px' }}>
          <div className="w-full" style={{ maxWidth: '800px' }}>
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
              <span className="block">Vos agents IA,</span>
              <span className="block">
                sur{' '}
                <em className="not-italic" style={{ color: '#FFD700' }}>
                  votre mat&eacute;riel.
                </em>
              </span>
              <span className="block text-inari-text-soft">Pas dans le cloud.</span>
            </h1>

            <p
              style={{
                fontSize: '22.4px',
                lineHeight: '1.8',
                color: 'rgba(240, 240, 245, 0.65)',
                marginTop: '32px',
                maxWidth: '38rem',
              }}
            >
              Hardware IA et agents pr&ecirc;ts &agrave; d&eacute;ployer.
              Mod&egrave;les open-weight, infrastructure locale, donn&eacute;es
              chez vous. Pour les PME qui veulent l&rsquo;IA sans le Cloud
              Act.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/shop/"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#FFD700', color: '#0A0A0F' }}
              >
                D&eacute;couvrir le catalogue
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#agents"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                Parler &agrave; un expert
              </a>
            </div>
          </div>
        </div>

        {/* 3 trust signals bas du hero */}
        <div className="pb-12 lg:pb-20">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                ),
                title: 'Open-weight uniquement',
                desc: 'Mistral, Llama, Qwen. Pas de modèles propriétaires fermés.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ),
                title: 'Zéro Cloud Act',
                desc: 'Données hébergées en Europe, modèles tournent chez vous.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
                title: 'Coût prévisible',
                desc: 'Investissement hardware ponctuel, pas de facture API qui dérape.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 sm:p-7"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-inari-text-muted">
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

// ---------------------------------------------------------------------------
// Pillar cards (Hardware + Agents)
// ---------------------------------------------------------------------------

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <a
      href={pillar.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-300 hover:border-[#FFD700] hover:shadow-[0_20px_60px_-15px_rgba(255,215,0,0.18)]"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-20 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        {/* Number + icon row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.14em] text-inari-text-muted">
            {pillar.number}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] text-inari-text-muted transition-colors duration-300 group-hover:border-[#FFD700] group-hover:text-[#FFD700]">
            {pillar.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-5 font-sans text-xl font-medium text-inari-white">
          {pillar.title}
        </h3>

        {/* Tagline */}
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-inari-text-muted">
          {pillar.tagline}
        </p>

        {/* Description */}
        <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
          {pillar.description}
        </p>

        {/* Features list */}
        <ul className="mt-5 flex flex-1 flex-col gap-2">
          {pillar.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-inari-text-soft">
              <svg viewBox="0 0 16 16" fill="none" stroke="#FFD700" strokeWidth="1.5" className="mt-0.5 h-4 w-4 shrink-0">
                <polyline points="3.5 8 6.5 11 12.5 5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#FFD700]">
          <span>Voir les produits</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </div>
      </div>
    </a>
  )
}

function PillarsSection() {
  return (
    <section
      id="agents"
      className="relative overflow-hidden px-6 pb-24 pt-12 lg:px-10 lg:pb-32 lg:pt-16"
      aria-labelledby="ia-pillars-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Notre offre IA
          </p>
        </div>

        {/* H2 */}
        <h2
          id="ia-pillars-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Le hardware{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            et les agents.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Deux briques compl&eacute;mentaires : la machine qui fait tourner
          l&rsquo;IA, et l&rsquo;agent qui rend service. Vous prenez les
          deux, ou seulement ce dont vous avez besoin.
        </p>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PILLARS.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Commitments section ("Pourquoi local-first")
// ---------------------------------------------------------------------------

function CommitmentsSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="ia-commitments-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          {/* Left: sticky title */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
                Pourquoi local-first
              </p>
            </div>

            <h2
              id="ia-commitments-title"
              className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
            >
              Quatre raisons{' '}
              <em className="not-italic text-inari-text-soft">
                concr&egrave;tes.
              </em>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-inari-text-soft sm:text-lg">
              Pas de discours souverainiste. Quatre arguments techniques et
              juridiques qui d&eacute;cident en faveur du local pour une PME
              europ&eacute;enne.
            </p>
          </div>

          {/* Right: list */}
          <div className="flex flex-col">
            {COMMITMENTS.map((c) => (
              <div key={c.id} className="group relative flex gap-6">
                {/* Number + vertical line */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-inari-text-muted transition-colors duration-300 group-hover:border-[#FFD700] group-hover:text-[#FFD700]"
                    style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
                  >
                    <span className="font-mono text-sm font-medium">{c.number}</span>
                  </div>
                  <div className="mt-3 h-full w-px bg-inari-border group-last:hidden" />
                </div>

                {/* Content */}
                <div className="pb-12 group-last:pb-0">
                  <h3 className="font-sans text-lg font-medium text-inari-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-inari-text-soft">
                    {c.description}
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

// ---------------------------------------------------------------------------
// Roadmap teaser ("Bientôt")
// ---------------------------------------------------------------------------

function RoadmapTeaser() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-28"
      aria-labelledby="ia-roadmap-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Bient&ocirc;t
          </p>
        </div>

        <h2
          id="ia-roadmap-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Au-del&agrave; du{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            catalogue.
          </em>
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            {
              tag: 'PACKS INARICOM',
              title: 'Hardware + agents pr&eacute;-install&eacute;s',
              desc: 'Vous recevez la machine d&eacute;j&agrave; configur&eacute;e avec les agents qui correspondent &agrave; votre m&eacute;tier. Plug-and-play, support inclus.',
              eta: 'Q3 2026',
            },
            {
              tag: 'FINE-TUNING',
              title: 'Adaptation sur vos donn&eacute;es',
              desc: 'On affine un mod&egrave;le open-weight sur votre corpus interne (docs, support, code). R&eacute;sultat&nbsp;: un agent qui parle votre m&eacute;tier.',
              eta: 'Q4 2026',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: '#FFD700' }}>
                  {item.tag}
                </span>
                <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                  {item.eta}
                </span>
              </div>
              <h3
                className="mt-5 font-serif text-2xl tracking-tight text-inari-white"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <p
                className="mt-3 text-[15px] leading-relaxed text-inari-text-soft"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function IaCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-28 lg:px-10 lg:py-36"
      aria-labelledby="ia-cta-title"
    >
      {/* Radial glow or */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="ia-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
        >
          Pr&ecirc;t &agrave; d&eacute;ployer{' '}
          <em className="not-italic text-inari-text-soft">
            chez vous&nbsp;?
          </em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Premier &eacute;change pour cadrer votre besoin (cas d&rsquo;usage,
          volume de requ&ecirc;tes, contraintes de conformit&eacute;) et
          choisir hardware + agents qui matchent.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/shop/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#FFD700', color: '#0A0A0F' }}
          >
            Voir le catalogue
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="/contact/"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Parler &agrave; un expert
          </a>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          R&eacute;ponse sous 48h &middot; Devis gratuit &middot; Tarifs publics
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Island root
// ---------------------------------------------------------------------------

function IaIsland() {
  return (
    <main className="relative text-inari-text" data-theme="or">
      {/* Background fixe — ParticleNeonGold (theme or) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <ParticleNeonGold />
      </div>

      <div className="relative z-10">
        <IaHero />
        <PillarsSection />
        <TechDemo />
        <CommitmentsSection />
        <RoadmapTeaser />
        <IaCTA />
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const root = document.getElementById('inari-ia-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <IaIsland />
    </StrictMode>,
  )
}
