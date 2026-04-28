import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

import { ParticleNeonGold } from '@/components/backgrounds/ParticleNeonGold'
import { VolumetricFog } from '@/components/backgrounds/VolumetricFog'

// ---------------------------------------------------------------------------
// Data — 6 cas d'usage par metier (Section B). Hardware + agent suggeres
// par cas, langage cible PME/TPE/independants francophones.
// ---------------------------------------------------------------------------

type UseCase = {
  id: string
  metier: string
  problem: string
  description: string
  hardware: string
  agent: string
  icon: React.ReactNode
}

const USE_CASES: UseCase[] = [
  {
    id: 'juridique',
    metier: 'Cabinet juridique',
    problem: 'Vos contrats clients ne finissent pas chez OpenAI.',
    description:
      'Analyse de jurisprudence, redaction de clauses, scan RGPD/nLPD sur tout le corpus client. Sans transfert hors cabinet, sans Cloud Act applicable.',
    hardware: 'Raspberry Pi 5 + AI Kit',
    agent: 'Agent juridique',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="4" y1="7" x2="20" y2="7" />
        <path d="M7 7l-3 6a3 3 0 0 0 6 0l-3-6" />
        <path d="M17 7l-3 6a3 3 0 0 0 6 0l-3-6" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    ),
  },
  {
    id: 'comptable',
    metier: 'Cabinet comptable',
    problem: 'Bilans clients analyses en local, conformite by design.',
    description:
      'Synthese de bilans, detection d’anomalies, comparaison sectorielle. Donnees comptables clients jamais transmises a un tiers.',
    hardware: 'Jetson Orin Nano',
    agent: 'Agent RAG documentaire',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <rect x="8" y="6" width="8" height="3" rx="0.5" />
        <line x1="8" y1="13" x2="9" y2="13" />
        <line x1="12" y1="13" x2="13" y2="13" />
        <line x1="15" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="9" y2="17" />
        <line x1="12" y1="17" x2="13" y2="17" />
        <line x1="15" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    id: 'dev',
    metier: 'Dev solo / Agence',
    problem: 'Code review et audit deps sans fuite IP.',
    description:
      'Review du code client, detection de CVE dans les dependances, generation de tests. Le code prive reste prive, jamais d’envoi vers Copilot ou un LLM cloud.',
    hardware: 'Mac Studio M3 / Station RTX',
    agent: 'Agent code',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    id: 'medical',
    metier: 'Cabinet medical',
    problem: 'Donnees patients RGPD, le local est obligatoire.',
    description:
      'Pre-redaction de comptes-rendus, recherche dans la litterature medicale interne, anonymisation automatique. Aucune fuite vers un LLM cloud.',
    hardware: 'Station IA RTX 5090',
    agent: 'Agent RAG + redaction',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: 'industriel',
    metier: 'Atelier industriel',
    problem: 'Vision par ordinateur sur ligne de prod, latence ms.',
    description:
      'Detection de defauts visuels, comptage piece, controle qualite temps reel. Aucune dependance reseau — la prod ne s’arrete jamais a cause du cloud.',
    hardware: 'Jetson AGX Orin',
    agent: 'Agent vision',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M2 20h20" />
        <path d="M3 20V8l5 4V8l5 4V8l5 4v8" />
        <line x1="8" y1="14" x2="8" y2="14.01" />
        <line x1="13" y1="14" x2="13" y2="14.01" />
        <line x1="18" y1="14" x2="18" y2="14.01" />
      </svg>
    ),
  },
  {
    id: 'direction',
    metier: 'Direction / RSSI / DPO',
    problem: 'Veille reglementaire interne sur donnees sensibles.',
    description:
      'Veille NIS2/DORA, synthese de politiques internes, monitoring de conformite continue. Le corpus reste audite, on sait ce qui est lu, ecrit, indexe.',
    hardware: 'Station IA preconfiguree',
    agent: 'Agent RAG + monitoring',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 11h18" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Data — 4 produits phares avec prix HT publics (Section A).
// Tarifs CHF HT, indicatifs (ordres de grandeur — a confirmer prod).
// ---------------------------------------------------------------------------

type Product = {
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

const PRODUCTS: Product[] = [
  {
    id: 'rpi5-ai-kit',
    name: 'Raspberry Pi 5 + AI Kit',
    tagline: 'Edge IA · entree de gamme',
    specs: [
      '8 GB RAM, Hailo-8L 13 TOPS',
      'Consommation ~5 W',
      'Modeles jusqu’a 7B (Q4)',
      'Livre monte + teste atelier',
    ],
    recommendedFor: 'Cabinet juridique, IoT, prototypes',
    price: 'CHF 250',
    href: '/shop/rpi5-ai-kit/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="8" y="8" width="8" height="8" rx="0.5" />
        <line x1="3" y1="9" x2="5" y2="9" />
        <line x1="3" y1="12" x2="5" y2="12" />
        <line x1="3" y1="15" x2="5" y2="15" />
        <line x1="19" y1="9" x2="21" y2="9" />
        <line x1="19" y1="12" x2="21" y2="12" />
        <line x1="19" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    id: 'jetson-orin-nano',
    name: 'Jetson Orin Nano Super',
    tagline: 'Edge IA · sweet spot dev',
    specs: [
      '8 GB RAM, 67 TOPS',
      'Consommation 7-15 W',
      'Modeles jusqu’a 13B (Q4)',
      'CUDA + TensorRT inclus',
    ],
    recommendedFor: 'Comptable, vision, dev embarque',
    price: 'CHF 480',
    href: '/shop/jetson-orin-nano/',
    badge: 'POPULAIRE',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <rect x="6" y="9" width="12" height="6" rx="0.5" />
        <line x1="2" y1="9" x2="0.5" y2="9" />
        <line x1="2" y1="12" x2="0.5" y2="12" />
        <line x1="2" y1="15" x2="0.5" y2="15" />
        <line x1="22" y1="9" x2="23.5" y2="9" />
        <line x1="22" y1="12" x2="23.5" y2="12" />
        <line x1="22" y1="15" x2="23.5" y2="15" />
        <circle cx="9" cy="12" r="0.5" fill="currentColor" />
        <circle cx="12" cy="12" r="0.5" fill="currentColor" />
        <circle cx="15" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'station-rtx5090',
    name: 'Station IA RTX 5090',
    tagline: 'Flagship local · 70B',
    specs: [
      'RTX 5090 32 GB VRAM',
      '64 GB RAM DDR5',
      'Modeles 70B Q4 fluides',
      'Linux + Ollama preconfigure',
    ],
    recommendedFor: 'Medical, dev intensif, agences',
    price: 'CHF 4 500',
    href: '/shop/station-rtx5090/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="6" y="2" width="12" height="20" rx="1" />
        <line x1="9" y1="6" x2="15" y2="6" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <circle cx="12" cy="13" r="1.5" />
        <line x1="9" y1="18" x2="15" y2="18" />
      </svg>
    ),
  },
  {
    id: 'mac-studio-m3',
    name: 'Mac Studio M3 Ultra',
    tagline: 'Unified memory · silencieux',
    specs: [
      'M3 Ultra, 96 GB unified',
      'Consommation ~150 W',
      'Modeles 70B FP8',
      'Compatible MLX + llama.cpp',
    ],
    recommendedFor: 'Creation, dev solo, boutique',
    price: 'CHF 6 200',
    href: '/shop/mac-studio-m3-ultra/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="4" y="6" width="16" height="12" rx="1.5" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Data — 4 couches de la stack ouverte (Section E — ArchitectureDiagram)
// Ordre top-down (lecture) : donnees -> agents -> modeles -> hardware
// ---------------------------------------------------------------------------

type StackLayer = {
  id: string
  number: string
  title: string
  description: string
  examples: string
  icon: React.ReactNode
}

const STACK_LAYERS: StackLayer[] = [
  {
    id: 'data',
    number: '01',
    title: 'Vos données',
    description: 'Documents internes, code, dossiers clients. Jamais hors de votre poste.',
    examples: 'PDF · DB · code · logs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 'agents',
    number: '02',
    title: 'Vos agents Inaricom',
    description: 'Logique métier au-dessus du modèle. Vous voyez le code, vous l’adaptez.',
    examples: 'juridique · code · RAG · monitoring',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    id: 'models',
    number: '03',
    title: 'Modèles open-weight',
    description: 'Poids publics, architecture documentee. Pas de boîte noire propriétaire.',
    examples: 'Mistral · Llama · Qwen · DeepSeek',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="2" />
        <circle cx="5" cy="6" r="1.5" />
        <circle cx="19" cy="6" r="1.5" />
        <circle cx="5" cy="18" r="1.5" />
        <circle cx="19" cy="18" r="1.5" />
        <line x1="6.3" y1="7" x2="10.5" y2="11" />
        <line x1="17.7" y1="7" x2="13.5" y2="11" />
        <line x1="6.3" y1="17" x2="10.5" y2="13" />
        <line x1="17.7" y1="17" x2="13.5" y2="13" />
      </svg>
    ),
  },
  {
    id: 'hardware',
    number: '04',
    title: 'Votre hardware',
    description: 'Machine physique chez vous. Pas de cloud entre vos données et le modele.',
    examples: 'Pi5 · Jetson · Station · Mac Studio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Data — 6 axes de comparaison Cloud API vs Local Inaricom (Section C)
// ---------------------------------------------------------------------------

type CompareRow = {
  id: string
  axis: string
  cloud: string
  cloudDetail?: string
  inaricom: string
  inaricomHighlight?: string
}

const COMPARE_ROWS: CompareRow[] = [
  {
    id: 'cost',
    axis: 'Cout 12 mois',
    cloud: '~CHF 4 800',
    cloudDetail: 'recurrent · 10k req/mois',
    inaricom: 'CHF 480 - 4 500',
    inaricomHighlight: 'CAPEX une fois',
  },
  {
    id: 'data',
    axis: 'Donnees',
    cloud: 'Cloud Act US applicable',
    cloudDetail: 'transit + stockage tiers',
    inaricom: 'Hebergees chez vous',
    inaricomHighlight: 'zero appel sortant',
  },
  {
    id: 'latency',
    axis: 'Latence',
    cloud: '200-400 ms',
    cloudDetail: 'depend du reseau internet',
    inaricom: '< 50 ms',
    inaricomHighlight: 'reponse instantanee',
  },
  {
    id: 'compliance',
    axis: 'Conformite',
    cloud: 'Par contrat fournisseur',
    cloudDetail: 'CGV + DPA + sous-traitants',
    inaricom: 'By design',
    inaricomHighlight: 'nLPD / RGPD natif',
  },
  {
    id: 'audit',
    axis: 'Audit modele',
    cloud: 'Boite noire',
    cloudDetail: 'poids et architecture prives',
    inaricom: 'Open-weight',
    inaricomHighlight: 'auditable, forkable',
  },
  {
    id: 'uptime',
    axis: 'Pannes',
    cloud: 'Dependance fournisseur',
    cloudDetail: 'panne API = arret total',
    inaricom: 'Autonomie totale',
    inaricomHighlight: 'pas de SPOF externe',
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
                &Eacute;crire &agrave; un expert
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
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: '#FFD700' }}
                >
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
// Use case cards (B — 6 cas d'usage par metier)
// ---------------------------------------------------------------------------

function UseCaseCard({ uc }: { uc: UseCase }) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#FFD700] hover:shadow-[0_20px_60px_-15px_rgba(255,215,0,0.15)] sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top (themed) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      {/* Icon (filled gold tint, theme-or) */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
        style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: '#FFD700' }}
      >
        {uc.icon}
      </div>

      {/* Metier */}
      <h3 className="mt-5 font-sans text-lg font-medium text-inari-white">
        {uc.metier}
      </h3>

      {/* Problem (gold accent) */}
      <p
        className="mt-2 text-[15px] font-medium leading-snug"
        style={{ color: '#FFD700' }}
      >
        &ldquo;{uc.problem}&rdquo;
      </p>

      {/* Description */}
      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-inari-text-soft">
        {uc.description}
      </p>

      {/* Stack badges (hardware + agent) */}
      <div className="mt-5 flex flex-col gap-1.5 border-t border-white/[0.06] pt-4">
        <div className="flex items-baseline gap-2">
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            Hardware
          </span>
          <span className="text-[13px] text-inari-text-soft">{uc.hardware}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            Agent
          </span>
          <span className="text-[13px] text-inari-text-soft">{uc.agent}</span>
        </div>
      </div>

      {/* Radial glow bottom (hover) — homepage parity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(255, 215, 0, 0.06), transparent 70%)',
        }}
      />
    </div>
  )
}

function UseCasesSection() {
  return (
    <section
      id="cas-usage"
      className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-10 lg:pb-28 lg:pt-16"
      aria-labelledby="ia-use-cases-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Cas d&rsquo;usage
          </p>
        </div>

        {/* H2 */}
        <h2
          id="ia-use-cases-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          L&rsquo;IA qui parle{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            votre m&eacute;tier.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Six cas concrets ou l&rsquo;IA locale change la donne. Hardware
          choisi, agent pr&eacute;-configur&eacute;, donn&eacute;es qui ne
          quittent jamais votre poste.
        </p>

        {/* Cards grid 3x2 desktop, 2x3 tablet, 1x6 mobile */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <UseCaseCard key={uc.id} uc={uc} />
          ))}
        </div>

        {/* Sub CTA */}
        <div className="mt-10">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-inari-text-soft transition hover:text-[#FFD700]"
          >
            <span>Votre cas n&rsquo;est pas list&eacute;&nbsp;? On en parle.</span>
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
// Product showcase (A — 4 produits phares avec prix HT publics)
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] p-7 transition-all duration-300 hover:border-[#FFD700] hover:shadow-[0_20px_60px_-15px_rgba(255,215,0,0.15)] sm:p-8"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Glow top (themed) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 opacity-15 group-hover:opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      {/* Header: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300"
          style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: '#FFD700' }}
        >
          {product.icon}
        </div>
        {product.badge && (
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.10)',
              color: '#FFD700',
              border: '1px solid rgba(255, 215, 0, 0.30)',
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
              stroke="#FFD700"
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price + CTA */}
      <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-4">
        <div>
          <p
            className="font-mono text-2xl font-semibold leading-none tracking-tight"
            style={{ color: '#FFD700' }}
          >
            {product.price}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
            HT, livr&eacute; mont&eacute;
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-inari-text-muted transition-colors duration-300 group-hover:text-[#FFD700]">
          <span>Fiche</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </span>
      </div>

      {/* Radial glow bottom (hover) — homepage parity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(255, 215, 0, 0.06), transparent 70%)',
        }}
      />
    </a>
  )
}

function ProductShowcase() {
  return (
    <section
      id="produits"
      className="relative overflow-hidden px-6 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-14"
      aria-labelledby="ia-products-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Catalogue
          </p>
        </div>

        {/* H2 */}
        <h2
          id="ia-products-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Le hardware.{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            Avec les prix.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Quatre machines, quatre prix HT publics. Pas de devis cach&eacute;,
          pas de tarification &agrave; la performance. Vous savez ce que vous
          payez.
        </p>

        {/* Grid 4-col desktop, 2-col tablet, 1-col mobile */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
          Tarifs HT, hors transport &middot; Livraison 4-6 semaines &middot;
          Stock en cours
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Architecture diagram (E — Stack ouverte vs Cloud opaque)
// ---------------------------------------------------------------------------

function StackLayerRow({ layer }: { layer: StackLayer }) {
  return (
    <div
      className="group flex items-stretch gap-3 overflow-hidden rounded-xl border border-white/[0.08] p-4 transition-colors duration-300 hover:border-[#FFD700]/30"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      {/* Gold accent left */}
      <div
        aria-hidden="true"
        className="w-0.5 shrink-0 rounded-full"
        style={{ background: '#FFD700', opacity: 0.4 }}
      />

      {/* Icon (filled gold tint) */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg"
        style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: '#FFD700' }}
      >
        {layer.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.14em] text-inari-text-muted">
            {layer.number}
          </span>
          <h4 className="font-sans text-sm font-medium text-inari-white">
            {layer.title}
          </h4>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-inari-text-soft">
          {layer.description}
        </p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
          {layer.examples}
        </p>
      </div>
    </div>
  )
}

function CloudOpaqueBox() {
  const drawbacks = [
    'Cloud Act applicable (donnees US)',
    'Boite noire — modele non auditable',
    'Donnees parfois reutilisees pour training',
    'Cout API a la requete (derapant)',
  ]
  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] p-7"
      style={{
        background:
          'linear-gradient(180deg, rgba(60, 60, 75, 0.10), rgba(40, 40, 55, 0.10))',
        backdropFilter: 'blur(8px) saturate(40%)',
      }}
    >
      {/* Diffuse "?" cloud */}
      <div className="flex flex-col items-center text-center">
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.10]"
          style={{ filter: 'blur(0.3px)' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-inari-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.55 }}
          >
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h4 className="mt-5 font-sans text-base font-medium text-inari-text-soft">
          Mod&egrave;le propri&eacute;taire ferm&eacute;
        </h4>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-inari-text-muted">
          Vous envoyez vos donn&eacute;es a un fournisseur tiers. Ce qui se
          passe ensuite vous &eacute;chappe.
        </p>
      </div>

      {/* Drawbacks list */}
      <ul className="mt-6 flex flex-col gap-2.5 border-t border-white/[0.06] pt-5">
        {drawbacks.map((d) => (
          <li
            key={d}
            className="flex items-start gap-2 text-[13px] leading-snug text-inari-text-muted"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50"
            >
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
            {d}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ArchitectureDiagram() {
  return (
    <section
      id="architecture"
      className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
      aria-labelledby="ia-architecture-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Architecture
          </p>
        </div>

        {/* H2 */}
        <h2
          id="ia-architecture-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          La stack.{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            Sans bo&icirc;te noire.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Quatre couches que vous contr&ocirc;lez de bout en bout. &Agrave;
          droite&nbsp;: ce que vous quittez quand vous adoptez le local.
        </p>

        {/* Diagram grid : left = stack inaricom, center = blocked, right = cloud */}
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          {/* Left: Inaricom stack */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: '#FFD700' }}>
              Stack Inaricom &middot; transparente
            </p>
            <div className="flex flex-col gap-2.5">
              {STACK_LAYERS.map((layer) => (
                <StackLayerRow key={layer.id} layer={layer} />
              ))}
            </div>
          </div>

          {/* Center: blocked indicator (vertical desktop, horizontal mobile) */}
          <div className="flex flex-row items-center justify-center gap-3 lg:flex-col lg:gap-4 lg:px-2">
            {/* Connector line — left or top */}
            <div
              aria-hidden="true"
              className="h-px w-16 lg:h-16 lg:w-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(255, 215, 0, 0.40))',
              }}
            />
            <div
              aria-hidden="true"
              className="hidden lg:block lg:h-16 lg:w-px"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.40))',
              }}
            />

            {/* Lock badge */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.40)',
                  background: 'rgba(18, 18, 26, 0.50)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  boxShadow: '0 0 32px -8px rgba(255, 215, 0, 0.28)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  style={{ color: '#FFD700' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p
                className="max-w-[100px] text-center font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.14em]"
                style={{ color: '#FFD700' }}
              >
                Aucun
                <br />
                transfert
              </p>
            </div>

            {/* Connector line — right or bottom */}
            <div
              aria-hidden="true"
              className="h-px w-16 lg:hidden"
              style={{
                background:
                  'linear-gradient(to left, transparent, rgba(255, 215, 0, 0.40))',
              }}
            />
            <div
              aria-hidden="true"
              className="hidden lg:block lg:h-16 lg:w-px"
              style={{
                background:
                  'linear-gradient(to top, transparent, rgba(255, 215, 0, 0.40))',
              }}
            />
          </div>

          {/* Right: Cloud opaque */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
              LLM Cloud &middot; opaque
            </p>
            <CloudOpaqueBox />
          </div>
        </div>

        {/* Caption below */}
        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-soft">
          Vos donn&eacute;es ne traversent jamais cette ligne.
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Comparator section (C — Cloud API vs Local Inaricom, 6 axes)
// ---------------------------------------------------------------------------

function ComparatorRow({ row }: { row: CompareRow }) {
  return (
    <div className="grid gap-3 border-b border-white/[0.06] py-5 last:border-0 sm:grid-cols-[1.1fr_1fr_1fr] sm:items-baseline sm:gap-6 sm:py-6">
      {/* Axis */}
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-inari-text-muted sm:text-[12px]">
        {row.axis}
      </p>

      {/* Cloud cell */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted sm:hidden">
          Cloud API
        </span>
        <p className="text-[15px] leading-snug text-inari-text-muted">
          {row.cloud}
        </p>
        {row.cloudDetail && (
          <p className="text-[11px] leading-snug text-inari-text-muted opacity-60">
            {row.cloudDetail}
          </p>
        )}
      </div>

      {/* Inaricom cell */}
      <div className="flex flex-col gap-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] sm:hidden"
          style={{ color: '#FFD700' }}
        >
          Local Inaricom
        </span>
        <p className="text-[15px] leading-snug text-inari-text-soft">
          {row.inaricom}
        </p>
        {row.inaricomHighlight && (
          <p
            className="text-[11px] font-medium leading-snug"
            style={{ color: '#FFD700' }}
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
      aria-labelledby="ia-comparator-title"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Arbitrages
          </p>
        </div>

        {/* H2 */}
        <h2
          id="ia-comparator-title"
          className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl"
        >
          Cloud API ou local.{' '}
          <em className="not-italic" style={{ color: '#FFD700' }}>
            Vos arbitrages.
          </em>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
          Pas de discours souverainiste. Six axes factuels que vous pouvez
          confronter a votre contexte (volume de requ&ecirc;tes, sensibilit&eacute;
          donn&eacute;es, latence cible).
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
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
              </div>
              <p className="mt-3 font-sans text-base font-medium text-inari-text-soft">
                LLM Cloud
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                OpenAI &middot; Anthropic &middot; Mistral cloud
              </p>
            </div>
            <div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', color: '#FFD700' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <p className="mt-3 font-sans text-base font-medium text-inari-white">
                Local Inaricom
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#FFD700' }}>
                Hardware + agent chez vous
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
          L&rsquo;arbitrage d&eacute;pend de votre contexte.{' '}
          <a
            href="/contact/"
            className="font-medium underline-offset-4 transition hover:underline"
            style={{ color: '#FFD700' }}
          >
            &Eacute;crivez-nous &rarr;
          </a>
        </p>
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
            &Eacute;crire &agrave; un expert
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
    <div className="relative text-inari-text" data-theme="or" role="region" aria-label="Contenu IA souveraine">
      {/* Background fixe — fumee theme + particules en surcouche */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-inari-black"
        style={{ zIndex: 0 }}
      >
        <VolumetricFog />
        <ParticleNeonGold />
      </div>

      <div className="relative z-10">
        <IaHero />
        <UseCasesSection />
        <ProductShowcase />
        <ArchitectureDiagram />
        <ComparatorSection />
        <RoadmapTeaser />
        <IaCTA />
      </div>
    </div>
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
