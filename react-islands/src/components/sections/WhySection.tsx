import { type ReactNode } from 'react'

type Point = {
  id: string
  number: string
  title: string
  description: string
  icon: ReactNode
}

const POINTS: Point[] = [
  {
    id: 'local-first',
    number: '01',
    title: 'Local-first, zéro boîte noire',
    description:
      'Vos données restent chez vous. IA self-hosted, modèles open-weight, hébergement européen. Aucune dépendance cloud US.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'pme-friendly',
    number: '02',
    title: 'Conçu pour les PME',
    description:
      'Tarifs publics, périmètres clairs, livrables lisibles. Rapport technique pour l’équipe IT + synthèse décisionnelle pour le COMEX.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'methodologie',
    number: '03',
    title: 'Méthodologie offensive transparente',
    description:
      'OWASP, PTES, MITRE ATT&CK. Chaque vulnérabilité documentée avec preuve, impact, recommandation. Pas de rapport générique.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'convergence',
    number: '04',
    title: 'IA + sécurité, pas IA ou sécurité',
    description:
      'Pentest d’applications LLM, audit de pipelines ML, détection d’anomalies par IA. Les deux disciplines se renforcent.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
]

function WhyPoint({ point }: { point: Point }) {
  return (
    <div className="group relative flex gap-6">
      {/* Numero + ligne verticale */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-inari-text-muted transition-colors duration-300 group-hover:border-inari-accent group-hover:text-inari-accent"
          style={{ background: 'rgba(18, 18, 26, 0.18)', backdropFilter: 'blur(16px) saturate(180%)' }}
        >
          {point.icon}
        </div>
        <div className="mt-3 h-full w-px bg-inari-border group-last:hidden" />
      </div>

      {/* Contenu */}
      <div className="pb-12 group-last:pb-0">
        <div className="flex items-center gap-3">
          <span className="shrink-0 font-mono text-xs tracking-[0.14em] text-inari-accent">
            {point.number}
          </span>
          <h3 className="font-sans text-lg font-medium text-inari-white">
            {point.title}
          </h3>
        </div>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-inari-text-soft">
          {point.description}
        </p>
      </div>
    </div>
  )
}

export function WhySection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="why-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          {/* Colonne gauche : titre sticky */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
                Pourquoi Inaricom
              </p>
            </div>

            <h2
              id="why-title"
              className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
            >
              Ce qui nous{' '}
              <em className="not-italic text-inari-text-soft">
                diff&eacute;rencie.
              </em>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-inari-text-soft sm:text-lg">
              Pas de discours commercial. Quatre engagements concrets
              qui structurent chaque mission.
            </p>
          </div>

          {/* Colonne droite : 4 points */}
          <div className="flex flex-col">
            {POINTS.map((p) => (
              <WhyPoint key={p.id} point={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
