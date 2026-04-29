import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

import { MatrixRainRed } from '@/components/backgrounds/MatrixRainRed'
import { VolumetricFog } from '@/components/backgrounds/VolumetricFog'

// ---------------------------------------------------------------------------
// Data — Stats (KPI panic). 4 chiffres choc en bandeau apres le hero.
// ---------------------------------------------------------------------------

type Stat = {
  id: string
  value: string
  label: string
  trend?: string
  source: string
}

const STATS: Stat[] = [
  {
    id: 'ransomware-rise',
    value: '+45%',
    label: 'Attaques ransomware globales',
    trend: 'en 2025 vs 2024',
    source: 'Astra Security 2026',
  },
  {
    id: 'avg-cost-pme',
    value: 'CHF 1.85M',
    label: 'Cout moyen d’une attaque sur PME',
    trend: 'tous secteurs confondus',
    source: 'Verizon DBIR 2026',
  },
  {
    id: 'one-in-five',
    value: '1 sur 5',
    label: 'PME ferment apres un ransomware',
    trend: 'dans les 12 mois',
    source: 'Mastercard Global SMB 2025',
  },
  {
    id: 'global-damage',
    value: '$74 Mds',
    label: 'Cout cybercriminalite previsionnel',
    trend: 'en 2026',
    source: 'Cybersecurity Ventures',
  },
]

// ---------------------------------------------------------------------------
// Data — Attack vectors (Section B-rouge). 6 vecteurs concrets pour PME.
// Remplace l'ancien SERVICES (3 cards generiques) par des scenarios qui
// parlent au dirigeant non-tech.
// ---------------------------------------------------------------------------

type AttackVector = {
  id: string
  category: string
  title: string
  problem: string
  description: string
  service: string
  deliverable: string
  icon: React.ReactNode
}

const ATTACK_VECTORS: AttackVector[] = [
  {
    id: 'phishing',
    category: 'Social engineering',
    title: 'Phishing dirigeant',
    problem:
      'Le DG clique. Le wire transfer part. CHF 350k disparus en 4 minutes.',
    description:
      'Pretexting cible sur dirigeants : LinkedIn + emails + appels. Test de votre sensibilisation et de vos garde-fous (validation double, CFO).',
    service: 'Red Team / phishing campaign',
    deliverable: 'Rapport + replay scenarios + recos formation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M22 6l-10 7L2 6" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
      </svg>
    ),
  },
  {
    id: 'ransomware',
    category: 'Ransomware',
    title: 'Chiffrement infrastructure',
    problem:
      'Lundi 6h. AD chiffre. ERP HS. 14 jours d’arret de production.',
    description:
      'Audit Active Directory + pentest interne. Detection des chemins lateraux, comptes a privileges, partages exposes. Test de votre detection EDR/SIEM.',
    service: 'Audit AD + pentest interne',
    deliverable: 'Plan remediation P0/P1 + scenarios d’intrusion',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <line x1="12" y1="15" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    id: 'supply-chain',
    category: 'Supply chain',
    title: 'Dependance compromise',
    problem:
      'Une lib npm que vous n’avez pas auditee. Backdoor en post-install.',
    description:
      'Audit complet de vos dependances (npm, Composer, pip). Detection CVE actives + packages compromis recents (Axios mars 2026, Shai-Hulud sept 2025).',
    service: 'Audit deps + monitoring CVE',
    deliverable: 'SBOM + plan upgrade + alerting CVE continu',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'cloud-iam',
    category: 'Cloud / SaaS',
    title: 'Compte cloud compromis',
    problem:
      'Un secret expose sur GitHub. Acces full-admin AWS pour 4 jours.',
    description:
      'Audit IAM + secrets management : permissions excessives, cles exposees dans repos, MFA absent, sessions persistantes. Test sur AWS / GCP / Azure / GitHub / Microsoft 365.',
    service: 'Audit IAM + secrets scan',
    deliverable: 'Matrice permissions + plan moindre privilege',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
  },
  {
    id: 'web-app',
    category: 'Web application',
    title: 'App web vulnerable',
    problem:
      'IDOR sur l’API client. 12 000 dossiers exfiltres en 2h.',
    description:
      'Pentest applicatif OWASP Top 10 + API Security. Tests manuels (logique metier) + automatises (Burp / ZAP). Couvre auth, autorisations, injections, XSS, SSRF, IDOR.',
    service: 'Pentest web / API',
    deliverable: 'Rapport tech + COMEX + PoC d’exploitation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'llm-ai',
    category: 'IA / LLM',
    title: 'Agent IA expose',
    problem:
      'Prompt injection sur le chatbot. Donnees clients exfiltrees via system prompt.',
    description:
      'Audit OWASP LLM Top 10 : prompt injection, data leakage, jailbreak, model DoS, supply chain (poids modeles), insecure plugins. Couvre agents RAG + tool-calling.',
    service: 'Audit IA / pentest LLM',
    deliverable: 'Rapport vecteurs + plan hardening prompts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.09-2 3.5V12h3l1 3h-8l1-3h3V9.5C11.4 9.09 10 7.95 10 6a4 4 0 0 1 2-4z" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Data — Audit products (Section A-rouge). 4 produits avec prix HT publics.
// Transparence tarifaire = pilier marketing Inaricom.
// ---------------------------------------------------------------------------

type AuditProduct = {
  id: string
  name: string
  tagline: string
  specs: string[]
  recommendedFor: string
  price: string
  href: string
  badge?: string
  icon: React.ReactNode
}

const AUDIT_PRODUCTS: AuditProduct[] = [
  {
    id: 'pentest-web',
    name: 'Pentest application web',
    tagline: '5 jours · OWASP Top 10',
    specs: [
      'OWASP Top 10 + API Security',
      'Tests manuels + automatises',
      'Rapport tech + synthese COMEX',
      'Re-test 6 semaines offert',
    ],
    recommendedFor: 'PME avec app web exposee, e-commerce, SaaS',
    price: 'CHF 4 800',
    href: '/services-cybersecurite/pentest-web/',
    badge: 'POPULAIRE',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'audit-solidity',
    name: 'Audit Solidity',
    tagline: '10 jours · ToB framework',
    specs: [
      'Slither + Manticore + Echidna',
      'Revue manuelle line-by-line',
      'Scenarios d’attaque PoC',
      'Re-test 6 semaines offert',
    ],
    recommendedFor: 'Projets DeFi, NFT, DAO, smart contracts EVM',
    price: 'CHF 8 500',
    href: '/services-cybersecurite/audit-solidity/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    id: 'red-team',
    name: 'Red Team complete',
    tagline: '4 semaines · MITRE ATT&CK',
    specs: [
      'OSINT + reconnaissance',
      'Phishing + intrusion physique/logique',
      'Lateralisation + exfiltration',
      'Debriefing Purple Team',
    ],
    recommendedFor: 'PME 50+ employes, donnees sensibles, finance',
    price: 'CHF 18 000',
    href: '/services-cybersecurite/red-team/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'audit-llm',
    name: 'Audit IA / LLM',
    tagline: '7 jours · OWASP LLM Top 10',
    specs: [
      'OWASP LLM Top 10 (prompt injection)',
      'Tests jailbreak + data leakage',
      'Audit pipeline RAG + agents',
      'Re-test 6 semaines offert',
    ],
    recommendedFor: 'Apps IA en production, chatbots, RAG',
    price: 'CHF 6 200',
    href: '/services-cybersecurite/audit-ia/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.09-2 3.5V12h3l1 3h-8l1-3h3V9.5C11.4 9.09 10 7.95 10 6a4 4 0 0 1 2-4z" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Data — Methodology steps (Section E-rouge). Existant prereserve, juste
// re-cadrer pour mettre l'accent sur l'architecture du livrable.
// ---------------------------------------------------------------------------

type MethodStep = {
  id: string
  number: string
  title: string
  description: string
  duration: string
}

const METHOD_STEPS: MethodStep[] = [
  {
    id: 'cadrage',
    number: '01',
    title: 'Cadrage & perimetre',
    description:
      'Echange initial pour definir cibles, scope, regles d’engagement, calendrier. Validation legale (RGPD/nLPD). Devis fixe avant demarrage.',
    duration: '1 sem',
  },
  {
    id: 'reconnaissance',
    number: '02',
    title: 'Reconnaissance',
    description:
      'Collecte passive et active : surface d’attaque, technologies, points d’entree, dependances exposees, OSINT social.',
    duration: '~3 j',
  },
  {
    id: 'exploitation',
    number: '03',
    title: 'Exploitation',
    description:
      'Tests manuels et automatises bases sur PTES + OWASP + MITRE ATT&CK. Chaque vulnerabilite documentee avec preuve, impact, reproductibilite.',
    duration: 'core',
  },
  {
    id: 'rapport',
    number: '04',
    title: 'Livrable double',
    description:
      'Rapport technique detaille pour l’equipe IT (CVSS, PoC, remediation par finding) + synthese decisionnelle COMEX (priorisation budget × risque).',
    duration: '~4 j',
  },
  {
    id: 're-test',
    number: '05',
    title: 'Re-test offert',
    description:
      '6 semaines apres remise. Re-test des P0/P1 corriges, validation du plan de remediation. Inclus dans le devis initial.',
    duration: '1 j',
  },
]

// ---------------------------------------------------------------------------
// Data — Comparator (Section C-rouge). 6 axes Inaricom vs SaaS automatique.
// ---------------------------------------------------------------------------

type CompareRow = {
  id: string
  axis: string
  saas: string
  saasDetail?: string
  inaricom: string
  inaricomHighlight?: string
}

const COMPARE_ROWS: CompareRow[] = [
  {
    id: 'false-positives',
    axis: 'Faux positifs',
    saas: '~70-80%',
    saasDetail: 'a trier manuellement par votre IT',
    inaricom: '< 5%',
    inaricomHighlight: 'verifies main par main',
  },
  {
    id: 'cve-coverage',
    axis: 'Couverture',
    saas: 'CVE connues uniquement',
    saasDetail: 'pattern matching sur feeds CVE',
    inaricom: 'CVE + chasse 0-day',
    inaricomHighlight: 'logique metier testee',
  },
  {
    id: 'business-logic',
    axis: 'Logique metier',
    saas: 'Non testee',
    saasDetail: 'IDOR, BAC, race conditions ignores',
    inaricom: 'Testee (PTES)',
    inaricomHighlight: 'IDOR, BAC, workflows',
  },
  {
    id: 'comex',
    axis: 'Synthese COMEX',
    saas: 'Aucune',
    saasDetail: 'rapport technique brut',
    inaricom: 'Synthese decisionnelle',
    inaricomHighlight: 'priorisation budget × risque',
  },
  {
    id: 'cost',
    axis: 'Cout 12 mois',
    saas: 'CHF 6-12k abonnement',
    saasDetail: 'renouvele chaque annee',
    inaricom: 'CHF 4.8-18k one-shot',
    inaricomHighlight: 'devis fixe avant demarrage',
  },
  {
    id: 'retest',
    axis: 'Re-test',
    saas: 'Non',
    saasDetail: 'vous re-payez l’abonnement',
    inaricom: 'Offert (6 semaines)',
    inaricomHighlight: 'verifie correctifs P0/P1',
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
      aria-label="Hero cybersecurite"
    >
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1360px] flex-col px-6 lg:px-10">
        {/* Badge rouge */}
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
              <path d="M8 1L2 4v4c0 4 6 7 6 7s6-3 6-7V4l-6-3z" />
            </svg>
            <span>Red Team &middot; Pentest &middot; Audit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1" style={{ paddingTop: '40px' }}>
          <div className="w-full" style={{ maxWidth: '820px' }}>
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
              <span className="block">La cybers&eacute;curit&eacute;</span>
              <span className="block">
                n&rsquo;a jamais &eacute;t&eacute;{' '}
                <em className="not-italic" style={{ color: '#FF3A40' }}>
                  aussi critique.
                </em>
              </span>
              <span className="block text-inari-text-soft">Vous testez avant ou vous attendez&nbsp;?</span>
            </h1>

            <p
              style={{
                fontSize: '22.4px',
                lineHeight: '1.7',
                color: 'rgba(240, 240, 245, 0.65)',
                marginTop: '32px',
                maxWidth: '40rem',
              }}
            >
              <strong style={{ color: '#FF3A40', fontWeight: 600 }}>27 % des PME francophones</strong>{' '}
              ont subi une attaque en 2025. <strong style={{ color: '#FF3A40', fontWeight: 600 }}>104 ransomwares</strong>{' '}
              ont ete reportes a l&rsquo;OFCS en Suisse. Pentest, Red Team, audit
              de code&nbsp;: methodologie offensive transparente, double livrable
              technique + COMEX.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#tarifs"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
              >
                Voir les tarifs publics
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#methodologie"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.20] px-6 py-3 font-sans text-sm font-medium text-inari-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ background: 'rgba(18, 18, 26, 0.45)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                Notre m&eacute;thodologie
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// StatsBar (KPI panic) — 4 chiffres choc apres le hero.
// ---------------------------------------------------------------------------

function StatsBar() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden px-6 pb-16 pt-4 lg:px-10 lg:pb-20"
      aria-labelledby="cybersec-stats-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p
            id="cybersec-stats-title"
            className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted"
          >
            Le terrain en chiffres &middot; 2025-2026
          </p>
        </div>

        {/* Grid 4 KPI */}
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.id}
              className="relative flex flex-col p-6 sm:p-7"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              {/* Glow top */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-25"
                style={{ background: 'linear-gradient(90deg, transparent, #E31E24, transparent)' }}
              />

              <p
                className="font-mono text-3xl font-semibold leading-none tracking-tight sm:text-4xl"
                style={{ color: '#FF3A40' }}
              >
                {s.value}
              </p>
              <p className="mt-3 text-[15px] font-medium leading-snug text-inari-white">
                {s.label}
              </p>
              {s.trend && (
                <p className="mt-1 text-[13px] leading-snug text-inari-text-soft">
                  {s.trend}
                </p>
              )}
              <p className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                {s.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Attack vectors section (B-rouge) — 6 cas concrets par vecteur d'attaque.
// ---------------------------------------------------------------------------

function AttackVectorCard({ v }: { v: AttackVector }) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#E31E24] hover:shadow-[0_20px_60px_-15px_rgba(227,30,36,0.15)] sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #E31E24, transparent)' }}
      />

      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
        style={{ backgroundColor: 'rgba(227, 30, 36, 0.08)', color: '#FF3A40' }}
      >
        {v.icon}
      </div>

      {/* Category */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
        {v.category}
      </p>

      {/* Title */}
      <h3 className="mt-1 font-sans text-lg font-medium text-inari-white">
        {v.title}
      </h3>

      {/* Problem (red accent quote) */}
      <p
        className="mt-3 text-[15px] font-medium leading-snug"
        style={{ color: '#FF3A40' }}
      >
        &ldquo;{v.problem}&rdquo;
      </p>

      {/* Description */}
      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-inari-text-soft">
        {v.description}
      </p>

      {/* Service + Deliverable */}
      <div className="mt-5 flex flex-col gap-1.5 border-t border-white/[0.06] pt-4">
        <div className="flex items-baseline gap-2">
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            Service
          </span>
          <span className="text-[13px] text-inari-text-soft">{v.service}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            Livrable
          </span>
          <span className="text-[13px] text-inari-text-soft">{v.deliverable}</span>
        </div>
      </div>

      {/* Radial glow bottom (hover) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(227, 30, 36, 0.06), transparent 70%)',
        }}
      />
    </div>
  )
}

function AttackVectorsSection() {
  return (
    <section
      id="vecteurs"
      className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-10 lg:pb-28 lg:pt-16"
      aria-labelledby="cybersec-vectors-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Vecteurs d&rsquo;attaque
          </p>
        </div>

        {/* H2 */}
        <h2
          id="cybersec-vectors-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Six menaces concretes.{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>
            Six tests.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas de menace abstraite. Six scenarios qui touchent concretement les
          PME francophones aujourd&rsquo;hui, avec le service Inaricom et le
          livrable correspondants.
        </p>

        {/* Grid 3x2 desktop, 2x3 tablet, 1x6 mobile */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ATTACK_VECTORS.map((v) => (
            <AttackVectorCard key={v.id} v={v} />
          ))}
        </div>

        {/* Sub CTA */}
        <div className="mt-10">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-inari-text-soft transition hover:text-[#E31E24]"
          >
            <span>Votre vecteur n&rsquo;est pas list&eacute;&nbsp;? On en parle.</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Audit pricing section (A-rouge) — 4 produits avec prix HT publics.
// ---------------------------------------------------------------------------

function AuditProductCard({ product }: { product: AuditProduct }) {
  return (
    <a
      href={product.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#E31E24] hover:shadow-[0_20px_60px_-15px_rgba(227,30,36,0.15)] sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #E31E24, transparent)' }}
      />

      {/* Header: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300"
          style={{ backgroundColor: 'rgba(227, 30, 36, 0.08)', color: '#FF3A40' }}
        >
          {product.icon}
        </div>
        {product.badge && (
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
            style={{
              backgroundColor: 'rgba(227, 30, 36, 0.10)',
              color: '#FF3A40',
              border: '1px solid rgba(227, 30, 36, 0.30)',
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
        {product.tagline}
      </p>

      {/* Title */}
      <h3 className="mt-2 font-sans text-lg font-medium leading-tight text-inari-white">
        {product.name}
      </h3>

      {/* Specs */}
      <ul className="mt-4 flex flex-col gap-1.5 border-t border-white/[0.06] pt-4">
        {product.specs.map((s) => (
          <li
            key={s}
            className="flex items-start gap-2 text-[13px] leading-relaxed text-inari-text-soft"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="#E31E24"
              strokeWidth="1.5"
              className="mt-1 h-3 w-3 shrink-0 opacity-60"
            >
              <polyline points="3.5 8 6.5 11 12.5 5" />
            </svg>
            {s}
          </li>
        ))}
      </ul>

      {/* Recommended for */}
      <p className="mt-4 text-[12px] leading-snug text-inari-text-muted">
        <span className="font-mono uppercase tracking-[0.14em]">Pour</span>{' '}
        {product.recommendedFor}
      </p>

      <div className="flex-1" />

      {/* Price + CTA */}
      <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-4">
        <div>
          <p
            className="font-mono text-2xl font-semibold leading-none tracking-tight"
            style={{ color: '#FF3A40' }}
          >
            {product.price}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            HT &middot; devis fixe
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#E31E24]">
          <span>Fiche</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </span>
      </div>

      {/* Radial glow bottom (hover) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(227, 30, 36, 0.06), transparent 70%)',
        }}
      />
    </a>
  )
}

function AuditPricingSection() {
  return (
    <section
      id="tarifs"
      className="relative overflow-hidden px-6 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-14"
      aria-labelledby="cybersec-pricing-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Tarifs publics
          </p>
        </div>

        {/* H2 */}
        <h2
          id="cybersec-pricing-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Quatre audits.{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>
            Quatre prix publics.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas de devis cach&eacute;, pas de tarification a la decouverte. Vous
          savez ce que vous payez, le devis est fixe avant demarrage.
        </p>

        {/* Grid 4-col desktop, 2-col tablet */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIT_PRODUCTS.map((p) => (
            <AuditProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          Tarifs HT &middot; re-test 6 semaines offert &middot; reponse sous 48h
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Methodology section (E-rouge) — Stepper 5 etapes, deliverable architecture.
// ---------------------------------------------------------------------------

function MethodologySection() {
  return (
    <section
      id="methodologie"
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="cybersec-method-title"
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
              id="cybersec-method-title"
              className="mt-5 font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
            >
              Cinq &eacute;tapes.{' '}
              <em className="not-italic text-inari-text-soft">
                Double livrable.
              </em>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-inari-text-soft sm:text-lg">
              M&eacute;thodologie offensive transparente bas&eacute;e sur PTES,
              OWASP et MITRE ATT&amp;CK. Devis fixe avant d&eacute;marrage,
              re-test offert apres remediation.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {['PTES', 'OWASP', 'MITRE ATT&CK', 'OWASP LLM'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-soft"
                  style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: stepper */}
          <div className="flex flex-col">
            {METHOD_STEPS.map((step) => (
              <div key={step.id} className="group relative flex gap-6">
                {/* Number + vertical line */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
                    style={{
                      backgroundColor: 'rgba(227, 30, 36, 0.08)',
                      color: '#FF3A40',
                    }}
                  >
                    <span className="font-mono text-sm font-medium">{step.number}</span>
                  </div>
                  <div className="mt-3 h-full w-px bg-inari-border group-last:hidden" />
                </div>

                {/* Content */}
                <div className="pb-12 group-last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-sans text-lg font-medium text-inari-white">
                      {step.title}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                      {step.duration}
                    </span>
                  </div>
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
// Comparator section (C-rouge) — Inaricom Red Team vs SaaS automatique.
// ---------------------------------------------------------------------------

function ComparatorRow({ row }: { row: CompareRow }) {
  return (
    <div className="grid gap-3 border-b border-white/[0.06] py-5 last:border-0 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-baseline sm:gap-6 sm:py-6">
      {/* Axis */}
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-inari-text-muted sm:text-[12px]">
        {row.axis}
      </p>

      {/* SaaS cell */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted sm:hidden">
          SaaS automatique
        </span>
        <p className="text-[15px] leading-snug text-inari-text-muted">
          {row.saas}
        </p>
        {row.saasDetail && (
          <p className="text-[11px] leading-snug text-inari-text-muted opacity-60">
            {row.saasDetail}
          </p>
        )}
      </div>

      {/* Inaricom cell */}
      <div className="flex flex-col gap-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] sm:hidden"
          style={{ color: '#FF3A40' }}
        >
          Inaricom Red Team
        </span>
        <p className="text-[15px] leading-snug text-inari-text-soft">
          {row.inaricom}
        </p>
        {row.inaricomHighlight && (
          <p
            className="text-[11px] font-medium leading-snug"
            style={{ color: '#FF3A40' }}
          >
            {row.inaricomHighlight}
          </p>
        )}
      </div>
    </div>
  )
}

function ComparatorSection() {
  return (
    <section
      id="comparatif"
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="cybersec-comparator-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Inaricom vs SaaS automatique
          </p>
        </div>

        {/* H2 */}
        <h2
          id="cybersec-comparator-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Pourquoi un humain.{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>
            Vraiment.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Les scanners SaaS (Acunetix, Qualys, Tenable...) couvrent 30 % de la
          surface d&rsquo;attaque reelle d&rsquo;une PME. Pour le reste —
          logique m&eacute;tier, IDOR, BAC, race conditions, post-exploitation
          — il faut un humain qui pense comme un attaquant.
        </p>

        {/* Comparator card */}
        <div
          className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] p-5 sm:p-7 lg:p-9"
          style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
        >
          {/* Header (desktop only) */}
          <div className="hidden border-b border-white/[0.10] pb-5 sm:grid sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-6 sm:items-end">
            <div />
            <div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', color: 'var(--inari-text-muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <p className="mt-3 font-sans text-base font-medium text-inari-text-soft">
                SaaS automatique
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                Acunetix, Qualys, Tenable...
              </p>
            </div>
            <div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(227, 30, 36, 0.08)', color: '#FF3A40' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="mt-3 font-sans text-base font-medium text-inari-white">
                Inaricom Red Team
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#FF3A40' }}>
                Humains + methodologie
              </p>
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {COMPARE_ROWS.map((row) => (
              <ComparatorRow key={row.id} row={row} />
            ))}
          </div>
        </div>

        {/* Footer note + CTA */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-relaxed text-inari-text-soft">
          Vous pensez qu&rsquo;un scan automatique suffit&nbsp;?{' '}
          <a
            href="/contact/"
            className="font-medium underline-offset-4 transition hover:underline"
            style={{ color: '#FF3A40' }}
          >
            &Eacute;crivez-nous &rarr;
          </a>
        </p>
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
      {/* Radial glow rouge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(227, 30, 36, 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="cybersec-cta-title"
          className="font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
        >
          Pr&ecirc;t a savoir{' '}
          <em className="not-italic text-inari-text-soft">
            ce qui est expos&eacute;&nbsp;?
          </em>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Premier &eacute;change par &eacute;crit pour cadrer votre besoin
          (perimetre, contraintes, calendrier) et choisir le bon audit.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
          >
            D&eacute;marrer un audit
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="#tarifs"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-7 py-3.5 font-sans text-sm font-medium text-inari-text transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
          >
            Voir les tarifs publics
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
    <div className="relative text-inari-text" data-theme="rouge" role="region" aria-label="Contenu cybersecurite">
      {/* Background fixe — fumee theme + matrix rain en surcouche */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <VolumetricFog />
        <MatrixRainRed />
      </div>

      <div className="relative z-10">
        <CybersecHero />
        <StatsBar />
        <AttackVectorsSection />
        <AuditPricingSection />
        <MethodologySection />
        <ComparatorSection />
        <CybersecCTA />
      </div>
    </div>
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
