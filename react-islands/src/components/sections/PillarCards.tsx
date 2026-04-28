import { type ReactNode, useState } from 'react'

type Pillar = {
  id: string
  theme: string
  label: string
  tagline: string
  description: string
  href: string
  cta: string
  rgb: string
  icon: ReactNode
}

const PILLARS: Pillar[] = [
  {
    id: 'securite',
    theme: 'rouge',
    label: 'Cybersécurité',
    tagline: 'Red Team · Pentest · Audit',
    description:
      'Tests d’intrusion, audit de code, Red Team. Méthodologie offensive transparente avec double livrable : rapport technique + synthèse COMEX.',
    href: '/services-cybersecurite/',
    cta: 'Découvrir nos audits',
    rgb: '227, 30, 36',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'ia',
    theme: 'or',
    label: 'IA souveraine',
    tagline: 'Local-first · Ollama · Self-hosted',
    description:
      'Déploiement IA locale, fine-tuning sur vos données, sans dépendance cloud. Mistral, LLaMA, Whisper : tout tourne chez vous.',
    href: '/services-ia/',
    cta: 'Explorer les solutions IA',
    rgb: '255, 215, 0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.09-2 3.5V12h3l1 3h-8l1-3h3V9.5C11.4 9.09 10 7.95 10 6a4 4 0 014-4z" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    id: 'ressources',
    theme: 'vert',
    label: 'Ressources',
    tagline: 'Blog · Guides · Outils',
    description:
      'Articles techniques, guides pratiques, outils open-source. Contenu gratuit pour monter en compétence sur la sécurité et l’IA.',
    href: '/blog/',
    cta: 'Lire le blog',
    rgb: '16, 185, 129',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
]

function PillarCard({ pillar }: { pillar: Pillar }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={pillar.href}
      data-theme={pillar.theme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        background: 'rgba(18, 18, 26, 0.10)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderColor: hovered ? `rgb(${pillar.rgb})` : 'rgba(255, 255, 255, 0.08)',
        boxShadow: hovered ? `0 20px 60px -15px rgba(${pillar.rgb}, 0.15)` : 'none',
      }}
    >
      {/* Glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${pillar.rgb}, ${hovered ? 0.6 : 0.15}), transparent)`,
        }}
      />

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        {/* Icon + theme badge */}
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
            style={{
              backgroundColor: `rgba(${pillar.rgb}, ${hovered ? 0.15 : 0.08})`,
              color: `rgb(${pillar.rgb})`,
            }}
          >
            {pillar.icon}
          </div>
          <span
            className="font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300"
            style={{
              color: hovered
                ? `rgb(${pillar.rgb})`
                : 'var(--inari-text-soft)',
            }}
          >
            {pillar.tagline}
          </span>
        </div>

        {/* Title */}
        <h3
          className="mt-6 font-serif text-2xl tracking-tight text-inari-white sm:text-[28px]"
          style={{ lineHeight: '1.15' }}
        >
          {pillar.label}
        </h3>

        {/* Description */}
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-inari-text-soft">
          {pillar.description}
        </p>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm font-medium transition-colors duration-300"
          style={{ color: `rgb(${pillar.rgb})` }}
        >
          <span>{pillar.cta}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </div>
      </div>

      {/* Radial glow bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(${pillar.rgb}, 0.06), transparent 70%)`,
        }}
      />
    </a>
  )
}

export function PillarCards() {
  return (
    <section
      className="relative overflow-hidden px-6 pb-24 pt-12 lg:px-10 lg:pb-32 lg:pt-16"
      aria-labelledby="pillars-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Nos expertises
          </p>
        </div>

        {/* H2 */}
        <h2
          id="pillars-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
        >
          Trois piliers,{' '}
          <em className="not-italic text-inari-text-soft">
            une convergence.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Cybersécurité offensive, IA souveraine, ressources ouvertes.
          Chaque pilier renforce les autres.
        </p>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
