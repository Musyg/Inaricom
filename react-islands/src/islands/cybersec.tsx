import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

import { MatrixRainRed } from '@/components/backgrounds/MatrixRainRed'
import { TechDemo } from '@/components/sections/TechDemo'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type Service = {
  id: string
  number: string
  title: string
  tagline: string
  description: string
  features: string[]
  href: string
  icon: React.ReactNode
}

const SERVICES: Service[] = [
  {
    id: 'pentest',
    number: '01',
    title: 'Pentest applicatif & infra',
    tagline: 'Tests d’intrusion web, mobile, API, réseau',
    description:
      'Simulation d’attaque réaliste sur votre périmètre : applications web, API REST/GraphQL, mobile, infrastructure réseau. Rapport technique + synthèse COMEX.',
    features: [
      'OWASP Top 10 & OWASP API Security',
      'Tests manuels + outils automatisés',
      'Rapport avec preuves d’exploitation',
      'Recommandations priorisées',
    ],
    href: '/services-cybersecurite/pentest/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'redteam',
    number: '02',
    title: 'Red Team',
    tagline: 'Simulation d’attaque avancée, multi-vecteurs',
    description:
      'Attaque coordonnée simulant un adversaire réel : reconnaissance OSINT, social engineering, intrusion physique et logique, latéralisation. Test de votre détection et réponse.',
    features: [
      'Scénarios MITRE ATT&CK alignés',
      'Phishing ciblé + pretexting',
      'Mouvement latéral & escalade',
      'Debriefing Purple Team',
    ],
    href: '/services-cybersecurite/red-team/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'audit-code',
    number: '03',
    title: 'Audit de code & configuration',
    tagline: 'Revue manuelle de votre code source et infra',
    description:
      'Analyse statique et manuelle de votre code, pipelines CI/CD, configurations cloud et on-premise. Détection de vulnérabilités avant qu’elles n’arrivent en production.',
    features: [
      'Revue de code sécurité manuelle',
      'Audit CI/CD & supply chain',
      'Configuration cloud (AWS, Azure, GCP)',
      'Hardening système & réseau',
    ],
    href: '/services-cybersecurite/audit-code/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" opacity="0.3" />
      </svg>
    ),
  },
]

type MethodStep = {
  id: string
  number: string
  title: string
  description: string
}

const METHOD_STEPS: MethodStep[] = [
  {
    id: 'cadrage',
    number: '01',
    title: 'Cadrage & périmètre',
    description:
      'Échange initial pour définir les cibles, le scope, les règles d’engagement et le calendrier. Devis fixé avant démarrage.',
  },
  {
    id: 'reconnaissance',
    number: '02',
    title: 'Reconnaissance & cartographie',
    description:
      'Collecte passive et active d’informations : surface d’attaque, technologies, points d’entrée, dépendances exposées.',
  },
  {
    id: 'exploitation',
    number: '03',
    title: 'Tests d’exploitation',
    description:
      'Tentatives d’intrusion manuelles et automatisées. Chaque vulnérabilité est documentée avec preuve, impact, reproductibilité.',
  },
  {
    id: 'rapport',
    number: '04',
    title: 'Rapport & restitution',
    description:
      'Double livrable : rapport technique détaillé pour l’équipe IT + synthèse décisionnelle pour le COMEX. Debriefing oral inclus.',
  },
  {
    id: 'remediation',
    number: '05',
    title: 'Accompagnement remédiation',
    description:
      'Suivi des correctifs, retest des vulnérabilités critiques, validation du plan de remédiation. Jusqu’à fermeture des P0/P1.',
  },
]

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function CybersecHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: '100vh' }}
      aria-label="Hero Cybersécurité"
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1360px] flex-col px-6 lg:px-10">
        {/* Badge */}
        <div className="flex justify-center" style={{ paddingTop: '14px' }}>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border px-5"
            style={{
              backgroundColor: 'rgba(227, 30, 36, 0.08)',
              borderColor: 'rgba(227, 30, 36, 0.25)',
              color: 'var(--inari-text-soft)',
              fontSize: '14px',
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase' as const,
              fontWeight: 500,
              paddingTop: '10px',
              paddingBottom: '10px',
              boxShadow: '0 0 24px -12px rgba(227, 30, 36, 0.35)',
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
              <path d="M8 14s6-3 6-7.5V3.5L8 1 2 3.5V6.5C2 11 8 14 8 14z" />
            </svg>
            <span>Red Team &middot; Pentest &middot; Audit</span>
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
              <span className="block">Votre surface d&rsquo;attaque,</span>
              <span className="block">
                test&eacute;e{' '}
                <em className="not-italic" style={{ color: '#E31E24' }}>
                  avant qu&rsquo;un autre
                </em>
              </span>
              <span className="block text-inari-text-soft">ne le fasse.</span>
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
              Pentest, Red Team, audit de code. M&eacute;thodologie
              offensive transparente, r&eacute;sultats document&eacute;s
              avec preuves. Pour les PME qui veulent savoir, pas juste
              se rassurer.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/contact/"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
              >
                Demander un audit
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-6 py-3 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                Voir nos offres
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'OWASP · PTES · MITRE ATT&CK',
                desc: 'Frameworks de référence, pas de méthodologie maison opaque.',
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
                title: 'Double livrable',
                desc: 'Rapport technique IT + synthèse décisionnelle COMEX.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
                title: 'Tarifs publics',
                desc: 'Grilles EUR / CHF affichées. Pas de devis-surprise.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 sm:p-7"
                style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
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
// Services cards
// ---------------------------------------------------------------------------

function ServiceCard({ service }: { service: Service }) {
  return (
    <a
      href={service.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-300 hover:border-[#E31E24] hover:shadow-[0_20px_60px_-15px_rgba(227,30,36,0.15)]"
      style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-20 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #E31E24, transparent)' }}
      />

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        {/* Number + icon row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.14em] text-inari-text-muted">
            {service.number}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] text-inari-text-muted transition-colors duration-300 group-hover:border-[#E31E24] group-hover:text-[#E31E24]">
            {service.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-5 font-sans text-xl font-medium text-inari-white">
          {service.title}
        </h3>

        {/* Tagline */}
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-inari-text-muted">
          {service.tagline}
        </p>

        {/* Description */}
        <p className="mt-4 text-[15px] leading-relaxed text-inari-text-soft">
          {service.description}
        </p>

        {/* Features list */}
        <ul className="mt-5 flex flex-1 flex-col gap-2">
          {service.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-inari-text-soft">
              <svg viewBox="0 0 16 16" fill="none" stroke="#E31E24" strokeWidth="1.5" className="mt-0.5 h-4 w-4 shrink-0">
                <polyline points="3.5 8 6.5 11 12.5 5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#E31E24]">
          <span>En savoir plus</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </div>
      </div>
    </a>
  )
}

function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden px-6 pb-24 pt-12 lg:px-10 lg:pb-32 lg:pt-16"
      aria-labelledby="services-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Nos offres
          </p>
        </div>

        {/* H2 */}
        <h2
          id="services-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Trois niveaux de{' '}
          <em className="not-italic" style={{ color: '#E31E24' }}>
            profondeur.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Du test d&rsquo;intrusion cibl&eacute; au Red Team complet.
          Chaque mission est cadr&eacute;e, document&eacute;e, et livr&eacute;e
          avec des preuves exploitables.
        </p>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Methodology timeline
// ---------------------------------------------------------------------------

function MethodologySection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="method-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          {/* Left: sticky title */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
                M&eacute;thodologie
              </p>
            </div>

            <h2
              id="method-title"
              className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
            >
              Processus{' '}
              <em className="not-italic text-inari-text-soft">
                transparent.
              </em>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-inari-text-soft sm:text-lg">
              Cinq &eacute;tapes de la prise de contact &agrave; la fermeture
              des vuln&eacute;rabilit&eacute;s. Vous savez exactement o&ugrave;
              on en est &agrave; chaque instant.
            </p>
          </div>

          {/* Right: timeline */}
          <div className="flex flex-col">
            {METHOD_STEPS.map((step) => (
              <div key={step.id} className="group relative flex gap-6">
                {/* Number + vertical line */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-inari-text-muted transition-colors duration-300 group-hover:border-[#E31E24] group-hover:text-[#E31E24]"
                    style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
                  >
                    <span className="font-mono text-sm font-medium">{step.number}</span>
                  </div>
                  <div className="mt-3 h-full w-px bg-inari-border group-last:hidden" />
                </div>

                {/* Content */}
                <div className="pb-12 group-last:pb-0">
                  <h3 className="font-sans text-lg font-medium text-inari-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-inari-text-soft">
                    {step.description}
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
// Final CTA
// ---------------------------------------------------------------------------

function CybersecCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-28 lg:px-10 lg:py-36"
      aria-labelledby="cybersec-cta-title"
    >
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(227, 30, 36, 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="cybersec-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
        >
          Testez votre{' '}
          <em className="not-italic text-inari-text-soft">
            r&eacute;silience.
          </em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Premier &eacute;change sans engagement pour cadrer votre
          p&eacute;rim&egrave;tre, estimer l&rsquo;effort, et choisir
          le bon niveau de test.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
          >
            Planifier un audit
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="/blog/"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Lire nos articles s&eacute;curit&eacute;
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

function CybersecIsland() {
  return (
    <main className="relative text-inari-text" data-theme="rouge">
      {/* Background fixe */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <MatrixRainRed />
      </div>

      <div className="relative z-10">
        <CybersecHero />
        <ServicesSection />
        <TechDemo />
        <MethodologySection />
        <CybersecCTA />
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const root = document.getElementById('inari-cybersec-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <CybersecIsland />
    </StrictMode>,
  )
}
