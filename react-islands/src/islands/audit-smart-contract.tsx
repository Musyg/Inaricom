import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BackgroundSkeleton } from '@/components/backgrounds/BackgroundSkeleton'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds — meme pattern que audit-web/audit-infra.
const MatrixRainRed = lazy(() =>
  import('@/components/backgrounds/MatrixRainRed').then((m) => ({ default: m.MatrixRainRed })),
)
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)

// ===========================================================================
// DATA
// ===========================================================================

// --- Stats (4 chiffres choc, contexte smart contract) -------------------

type Stat = {
  id: string
  value: string
  label: string
  trend?: string
  source: string
}

const STATS: Stat[] = [
  {
    id: 'stolen-2025',
    value: '2.2 Md$',
    label: 'volés en DeFi en 2025',
    trend: 'sur ~ 75 protocoles',
    source: 'Chainalysis 2026',
  },
  {
    id: 'avg-loss',
    value: '14 M$',
    label: 'perte moyenne par exploit DeFi',
    trend: 'fonds rarement récupérés',
    source: 'PeckShield 2025',
  },
  {
    id: 'audit-bugs',
    value: '8 / 10',
    label: 'audits revelent au moins une faille critique',
    trend: 'avant deploiement mainnet',
    source: 'industrie 2024-2025',
  },
  {
    id: 'tools-stack',
    value: '5+',
    label: 'outils combinés sur chaque audit',
    trend: 'static + fuzzing + manual',
    source: 'méthodologie Inaricom',
  },
]

// --- Hacks marquants 2024-2026 (dataviz timeline) ------------------------

type Hack = {
  id: string
  date: string
  protocol: string
  amount: string
  /** Niveau 1 : explication accessible */
  what: string
  /** Niveau 2 : root cause technique */
  rootCause: string
  /** Categorie pour code couleur */
  category: 'oracle' | 'access' | 'logic' | 'signature' | 'reentrancy' | 'crypto'
  categoryLabel: string
}

const HACKS: Hack[] = [
  {
    id: 'bybit',
    date: 'Févr. 2025',
    protocol: 'Bybit (cold wallet)',
    amount: '1.5 Md$',
    what:
      'Le plus gros vol crypto de l’histoire. Les attaquants ont piégé une opération de signature multi-sig en faisant signer aux dirigeants une transaction qu’ils croyaient anodine.',
    rootCause:
      'UI compromise du portefeuille Safe → les signataires ont vu une transaction légitime alors qu’ils signaient en réalité un upgrade du contrat vers une version malveillante.',
    category: 'signature',
    categoryLabel: 'Signature blind',
  },
  {
    id: 'curve',
    date: 'Juil. 2024',
    protocol: 'Curve Finance',
    amount: '73 M$',
    what:
      'Plusieurs pools de Curve drainés à cause d’un bug dans le compilateur Vyper, pas dans le code lui-même. Personne n’avait pensé à tester contre les versions de compilateur.',
    rootCause:
      'Reentrancy guard du compilateur Vyper (versions 0.2.15-0.3.0) cassé : les locks réentrance n’étaient pas posés correctement → réentrance possible sur des fonctions censées être protégées.',
    category: 'reentrancy',
    categoryLabel: 'Reentrancy',
  },
  {
    id: 'euler',
    date: 'Mars 2023',
    protocol: 'Euler Finance',
    amount: '197 M$',
    what:
      'Un attaquant a exploité une fonction "donateToReserves" mal pensée pour créer artificiellement des dettes, puis liquider ses propres positions à profit massif.',
    rootCause:
      'Logique métier brisée : la fonction donateToReserves manipulait le solde sans recalculer la santé du compte → ratio dette/collatéral incohérent → liquidation profitable du donor.',
    category: 'logic',
    categoryLabel: 'Logique métier',
  },
  {
    id: 'mango',
    date: 'Oct. 2022',
    protocol: 'Mango Markets',
    amount: '117 M$',
    what:
      'Un trader a fait monter artificiellement le prix du token MNGO via un autre protocole, puis a utilisé ses MNGO comme collatéral pour emprunter tous les fonds disponibles.',
    rootCause:
      'Oracle de prix dépendait d’un seul DEX peu liquide → manipulable avec ~10M$ → MNGO collateralisé à un prix gonflé → emprunts massifs liquidables seulement après la chute.',
    category: 'oracle',
    categoryLabel: 'Oracle manipulation',
  },
  {
    id: 'nomad',
    date: 'Août 2022',
    protocol: 'Nomad Bridge',
    amount: '190 M$',
    what:
      'Une mise à jour du contrat a accidentellement marqué TOUS les messages comme valides. Pendant 4h, n’importe qui pouvait drainer le pont en copiant-collant une transaction valide.',
    rootCause:
      'Initializer du contrat Replica a posé acceptableRoot à 0x0 (valeur par défaut) → tout message dont le merkle proof rendait 0x0 passait → drain par friendly forks.',
    category: 'access',
    categoryLabel: 'Access control',
  },
  {
    id: 'ronin',
    date: 'Mars 2022',
    protocol: 'Ronin Bridge (Axie)',
    amount: '624 M$',
    what:
      'Le pont entre Ronin et Ethereum n’était sécurisé que par 9 validateurs. Les attaquants ont compromis 5 d’entre eux (4 via phishing, 1 récupéré via une backdoor d’AxieDAO).',
    rootCause:
      'Threshold multisig 5/9 + clés détenues par une équipe restreinte → social engineering ciblé sur 4 dev + abus d’une délégation laissée à AxieDAO depuis nov 2021 → 5 signatures.',
    category: 'crypto',
    categoryLabel: 'Crypto / clés privées',
  },
]

// --- Surface d attaque smart contract ------------------------------------

type Surface = {
  id: string
  title: string
  business: string
  examples: string[]
  jargon: string
}

const SURFACES: Surface[] = [
  {
    id: 'logic',
    title: 'Logique métier',
    business:
      'La logique économique du contrat : qui peut emprunter, à quel taux, avec quel collatéral. La majorité des hacks DeFi viennent d’une logique mal pensée, pas d’un bug bas niveau.',
    examples: [
      'Calcul de récompenses qui peut être appelé plusieurs fois pour cumuler',
      'Pondération qui ignore qui détient combien à quel moment',
      'Liquidation qui peut être déclenchée par soi-même à profit',
      'Snapshot qui permet de "double-voter" via un transfert juste avant',
    ],
    jargon: 'Business logic flaws, accounting errors',
  },
  {
    id: 'math',
    title: 'Math & arrondis',
    business:
      'Tout ce qui touche aux calculs : conversions de tokens, intérêts, parts d’une pool. Un seul `*` mal placé peut multiplier le bug par 1000.',
    examples: [
      'Division avant multiplication qui perd la précision',
      'Overflow / underflow sur des montants extrêmes',
      'Conversion entre tokens à décimales différentes (USDC 6 vs WETH 18)',
      'Arrondi qui favorise toujours le contrat (ou toujours l’utilisateur)',
    ],
    jargon: 'Integer overflow, rounding errors, decimal mismatch',
  },
  {
    id: 'oracle',
    title: 'Oracles de prix',
    business:
      'Les contrats DeFi ont besoin de connaître le prix des tokens. Si on peut manipuler ce prix, même brièvement, on peut vider tout le protocole. C’est la cause numéro 1 des gros hacks.',
    examples: [
      'Oracle qui dépend d’un seul DEX peu liquide',
      'Prix moyenné sur trop peu de blocs (manipulable en 1 transaction)',
      'Liquidation déclenchée à un prix flash-loan-able',
      'Échange illiquide accepté comme oracle "off-chain"',
    ],
    jargon: 'Spot vs TWAP, flash-loan oracle, Chainlink fallback',
  },
  {
    id: 'access',
    title: 'Access control & upgrade',
    business:
      'Qui peut pauser le contrat, le mettre à jour, retirer les fonds, changer les paramètres. Si une seule clé compromise donne un contrôle total : attaquant content, utilisateurs furieux.',
    examples: [
      'Fonction admin sans modifier `onlyOwner`',
      'Multisig 2-of-3 où les 3 clés sont sur le même laptop',
      'Proxy upgradable sans timelock (changement instantané)',
      'Initializer rappelable plusieurs fois',
    ],
    jargon: 'OnlyOwner missing, proxy upgradeability, multisig threshold',
  },
]

// --- Toolchain (notre stack d'outils sur chaque audit) -------------------

type Tool = {
  name: string
  category: string
  what: string
  why: string
}

const TOOLS: Tool[] = [
  {
    name: 'Slither',
    category: 'Static analysis',
    what: 'Analyseur statique Solidity développé par Trail of Bits. Lit le code et détecte des patterns connus de vulnérabilités sans exécuter.',
    why: 'Capture les bugs "évidents" en quelques secondes : reentrancy, shadowing, mauvaise visibilité, modifiers manquants. Premier filet, jamais suffisant seul.',
  },
  {
    name: 'Echidna',
    category: 'Fuzzing',
    what: 'Fuzzer property-based pour Solidity. On définit des invariants (« le total supply ne doit jamais dépasser X »), Echidna essaie des millions d’entrées pour les casser.',
    why: 'Trouve des bugs économiques que la lecture humaine rate : combinaisons d’appels, valeurs limites, états intermédiaires incohérents.',
  },
  {
    name: 'Foundry (forge fuzz / invariant)',
    category: 'Fuzz + invariants',
    what: 'Framework de tests moderne : forge fuzz teste des fonctions individuelles avec des entrées aléatoires, forge invariant teste l’état global du contrat sur des séquences d’appels.',
    why: 'Permet d’écrire des invariants rapides à itérer pendant l’audit, et de prouver formellement certaines propriétés (avec halmos / kontrol pour les preuves symboliques).',
  },
  {
    name: 'Manual review (l’étape qui compte)',
    category: 'Audit humain',
    what: 'Lecture ligne à ligne par 2 auditeurs en parallèle, raisonnement sur les invariants économiques, modélisation des scénarios d’attaque.',
    why: 'Les outils trouvent les patterns connus. Les humains trouvent les bugs spécifiques au protocole : logique économique, edge cases métier, interactions inter-contrats.',
  },
  {
    name: 'Mythril / Manticore',
    category: 'Symbolic execution',
    what: 'Exploration symbolique du bytecode : génère mathématiquement toutes les exécutions possibles pour prouver ou réfuter des propriétés.',
    why: 'Utilisé sur les fonctions critiques (auth, transferts) pour avoir une garantie mathématique, pas juste un échantillon de tests.',
  },
]

// --- Pricing -------------------------------------------------------------

type PricingTier = {
  id: string
  name: string
  price: string
  duration: string
  description: string
  features: string[]
  highlight?: boolean
  cta: string
}

const PRICING: PricingTier[] = [
  {
    id: 'review',
    name: 'Code Review',
    price: '5 000 €',
    duration: '5 jours',
    description: 'Lecture experte d’un contrat ou d’un module. Pour valider un développement ou défricher avant un audit complet.',
    features: [
      'Lecture manuelle ligne à ligne',
      'Slither + analyse statique de base',
      'Liste priorisée des findings (Critical → Info)',
      'Recommandations de remédiation',
      'Pas de fuzzing extensif (voir Full Audit)',
    ],
    cta: 'Demander un devis',
  },
  {
    id: 'full',
    name: 'Full Audit',
    price: '12 000 €',
    duration: '15 jours',
    description: 'Audit complet, multi-outils, double-auditeur. Le standard pour un déploiement mainnet sérieux.',
    features: [
      'Manual review par 2 auditeurs en parallèle',
      'Fuzzing Echidna + Foundry invariants',
      'Modélisation des invariants économiques',
      'Rapport public publiable (style Trail of Bits)',
      'Retest 30 jours inclus + remédiation review',
    ],
    highlight: true,
    cta: 'Le plus demandé',
  },
  {
    id: 'continuous',
    name: 'Continuous Audit',
    price: 'Sur devis',
    duration: 'Mensuel',
    description: 'Pour les protocoles vivants. Chaque PR critique passe par notre review avant merge. SLA dédié.',
    features: [
      'Review de chaque PR sur les contrats critiques',
      'Réponse <24h sur questions sécurité',
      'Mise à jour des invariants à chaque release',
      'Retainer monitoring on-chain (alertes anomalies)',
      'Tarif dégressif selon volume de PR',
    ],
    cta: 'Discuter du scope',
  },
]

// --- FAQ -----------------------------------------------------------------

type FAQItem = {
  q: string
  a: string
  level: 1 | 2
}

const FAQ: FAQItem[] = [
  {
    level: 1,
    q: 'Pourquoi un audit avant déploiement mainnet ?',
    a: 'Une fois le contrat déployé sur mainnet, les bugs ne sont plus corrigeables (sauf upgradeable, et alors les utilisateurs vous regardent de travers). Un audit en amont coûte une fraction du coût d’un hack. Sur 2025, perte moyenne par exploit DeFi : 14 M$. Audit Full : 12 000 €. Le ratio parle de lui-même.',
  },
  {
    level: 1,
    q: 'Vous garantissez qu’il n’y aura pas de hack après audit ?',
    a: 'Non, et personne de sérieux ne le garantit. Un audit dit "voici tous les bugs qu’on a trouvés en X jours, voici les recommandations de remédiation". Mais on s’engage sur la méthodologie et la qualité. La preuve : le rapport est publiable, les findings sont traçables, le code des tests est livré.',
  },
  {
    level: 1,
    q: 'Combien de temps avant qu’on ait un rapport ?',
    a: 'Code Review : J+5 ouvrés après réception des sources. Full Audit : J+15 ouvrés (J+10 audit + J+3 rédaction + J+2 retest après remédiation). Si urgence absolue, on peut prioriser.',
  },
  {
    level: 1,
    q: 'Et si vous trouvez quelque chose de critique en cours d’audit ?',
    a: 'On vous prévient immédiatement (PoC en privé, pas de divulgation publique). Si le contrat est déjà déployé, on coordonne avec votre équipe pour une réponse responsable : pause / migration / disclosure timeline. C’est documenté dans la convention d’audit.',
  },
  {
    level: 1,
    q: 'Vous auditez quels langages / chaînes ?',
    a: 'Solidity (Ethereum, L2s EVM-compatibles, BSC, Polygon, Arbitrum, Optimism, Base) en priorité. Vyper sur demande. Cairo (StarkNet) et Move (Aptos, Sui) sur scope adapté avec un partenaire spécialisé.',
  },
  {
    level: 2,
    q: 'Foundry vs Hardhat pour le fuzzing — votre préférence ?',
    a: 'Foundry pour 95% des cas : `forge fuzz` est plus rapide, `forge invariant` permet du stateful fuzzing natif, et l’écosystème (halmos, kontrol pour symbolic) s’intègre nativement. Hardhat reste utile pour des scripts off-chain et des intégrations TypeScript existantes. Si l’équipe est full Hardhat, on s’adapte.',
  },
  {
    level: 2,
    q: 'Vous écrivez les invariants vous-mêmes ou en collaboration ?',
    a: 'Les deux. On démarre par notre liste générique (sums conserved, monotonic deposits, no negative balances), puis on co-construit les invariants spécifiques au protocole avec votre équipe. C’est souvent là qu’on découvre les ambiguïtés du modèle économique avant même d’avoir lancé le fuzzing.',
  },
  {
    level: 2,
    q: 'Comment vous traitez les oracles dans l’audit ?',
    a: 'Triple check : (1) source de l’oracle (Chainlink agrégé, TWAP UniV3 sur quelle pool, custom on-chain ?), (2) attaque flash-loan possible sur la liquidité de la source, (3) fallback si l’oracle stale ou en pause. On simule un manipulateur avec ~5-50M$ de capital flash-loan-able pour mesurer le bias maximal achetable.',
  },
]

// ===========================================================================
// HERO + STATS (meme structure qu'audit-web/audit-infra)
// ===========================================================================

function AuditSCHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Hero audit smart contract"
    >
      <div className="relative z-10 mx-auto flex max-w-[1360px] flex-col px-6 lg:px-10">
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
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5l5.5 3v5L8 14.5l-5.5-5v-5L8 1.5z" />
              <path d="M8 6.5v3" />
              <circle cx="8" cy="11" r="0.5" fill="currentColor" />
            </svg>
            <span>Smart Contract &middot; Audit forensique</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex" style={{ paddingTop: '40px' }}>
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
              <span className="block">Une fois déployé,</span>
              <span className="block">
                un bug coûte{' '}
                <em className="not-italic" style={{ color: '#FF3A40' }}>
                  des millions.
                </em>
              </span>
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
              On audite votre code{' '}
              <strong style={{ color: '#FF3A40', fontWeight: 600 }}>avant qu’un attaquant ne le fasse pour vous</strong>{' '}
              — manual review double-auditeur, fuzzing Echidna et Foundry, modélisation
              des invariants économiques. Rapport publiable, retest inclus.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#tarifs"
                className="group inline-flex items-center gap-2 rounded-md px-6 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
              >
                Voir les formules
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
              </a>
              <a
                href="#hacks"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.20] px-6 py-3 font-sans text-sm font-medium transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{
                  background: 'rgba(18, 18, 26, 0.45)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  color: '#FFFFFF',
                }}
              >
                Les hacks marquants
              </a>
            </div>
          </div>
        </div>

        {/* Stats inline en bas du hero */}
        <div style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">
              Le contexte 2025
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="rounded-xl border border-white/[0.08] p-4"
                style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
              >
                <div className="flex items-center gap-4">
                  <p
                    className="font-serif flex-shrink-0"
                    style={{ fontSize: 'clamp(24px, 2.4vw, 34px)', lineHeight: '1', color: '#FF3A40', fontWeight: 400, letterSpacing: '-0.02em' }}
                  >
                    {stat.value}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-inari-text">
                      {stat.label}
                      {stat.trend ? (
                        <>
                          <br />
                          <span className="text-[12px]" style={{ color: '#FF3A40' }}>{stat.trend}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-center font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-inari-text-soft">
                  {stat.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// HACKS TIMELINE — section signature dataviz
// ===========================================================================

const CATEGORY_COLORS: Record<Hack['category'], string> = {
  oracle: '#FF3A40',
  access: '#FFB347',
  logic: '#FF6B6B',
  signature: '#E31E24',
  reentrancy: '#FF8C42',
  crypto: '#B8161B',
}

function HackCard({ hack }: { hack: Hack }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [showRoot, setShowRoot] = useState(false)
  const color = CATEGORY_COLORS[hack.category]

  useEffect(() => {
    if (!ref.current) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setActive(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true)
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-700 sm:p-7"
      style={{
        background: 'rgba(18, 18, 26, 0.10)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderColor: active ? 'rgba(227, 30, 36, 0.25)' : 'rgba(255, 255, 255, 0.08)',
        opacity: active ? 1 : 0.4,
        transform: active ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      {/* Barre verticale categorie a gauche */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: `linear-gradient(180deg, ${color} 0%, transparent 100%)` }}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">{hack.date}</p>
          <h3 className="mt-2 font-serif text-2xl font-medium leading-tight text-inari-white sm:text-[28px]">
            {hack.protocol}
          </h3>
        </div>
        <div className="text-right">
          <p
            className="font-serif"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: '1', color, fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            {hack.amount}
          </p>
          <p
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color }}
          >
            {hack.categoryLabel}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-inari-text-soft">{hack.what}</p>

      {showRoot ? (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Cause technique racine</p>
          <p className="mt-2 text-[14px] leading-relaxed text-inari-text">{hack.rootCause}</p>
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowRoot((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShowRoot((v) => !v)
          }
        }}
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted transition hover:text-inari-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3A40] focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
      >
        {showRoot ? 'Masquer la cause technique' : 'Voir la cause technique'}
        <span aria-hidden="true">{showRoot ? '−' : '+'}</span>
      </div>
    </article>
  )
}

function HacksTimelineSection() {
  return (
    <section
      id="hacks"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="hacks-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Hacks DeFi marquants &middot; 2022-2025
          </p>
        </div>
        <h2 id="hacks-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Six failles,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>2.7 milliards de dollars</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Chacun de ces hacks pouvait être évité. La majorité étaient identifiables dans un audit
          si on cherchait au bon endroit. C’est pour ça qu’on existe.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {HACKS.map((h) => (
            <HackCard key={h.id} hack={h} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// SURFACE D'ATTAQUE
// ===========================================================================

function SurfaceCard({ surface, active, onSelect }: { surface: Surface; active: boolean; onSelect: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`group w-full cursor-pointer rounded-2xl border p-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3A40] focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black ${
        active ? 'border-[#FF3A40]' : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
      style={{
        background: active ? 'rgba(227, 30, 36, 0.06)' : 'rgba(18, 18, 26, 0.10)',
        backdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: active ? '0 16px 48px rgba(227, 30, 36, 0.12)' : 'none',
      }}
      aria-expanded={active}
      aria-controls={`sc-surface-detail-${surface.id}`}
    >
      <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">{surface.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-inari-text-soft">{surface.business}</p>
      <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
        {active ? 'Voir moins' : 'Ce qu’on cherche ici'}
        <span aria-hidden="true" className="transition group-hover:translate-x-0.5">{active ? '−' : '→'}</span>
      </p>
    </div>
  )
}

function SurfaceDetail({ surface }: { surface: Surface }) {
  return (
    <div
      id={`sc-surface-detail-${surface.id}`}
      className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-white/[0.08] p-7"
      style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Exemples concrets</p>
      <ul className="mt-4 space-y-3">
        {surface.examples.map((ex, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-inari-text">
            <span aria-hidden="true" className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF3A40]" />
            <span>{ex}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
        Référence technique : {surface.jargon}
      </p>
    </div>
  )
}

function SurfaceSection() {
  const [activeId, setActiveId] = useState<string>(SURFACES[0].id)
  const active = SURFACES.find((s) => s.id === activeId) ?? SURFACES[0]
  return (
    <section
      id="surface-sc"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="surface-sc-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            La surface d’attaque smart contract
          </p>
        </div>
        <h2 id="surface-sc-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Quatre familles,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>quatre fois plus de bugs</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          On attaque chaque famille avec une méthode adaptée. Cliquez pour voir
          ce qu’on cherche concrètement dans chaque zone.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SURFACES.map((s) => (
            <SurfaceCard key={s.id} surface={s} active={s.id === activeId} onSelect={() => setActiveId(s.id)} />
          ))}
        </div>
        <SurfaceDetail surface={active} />
      </div>
    </section>
  )
}

// ===========================================================================
// TOOLCHAIN (notre stack d'outils)
// ===========================================================================

function ToolchainSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="toolchain-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Notre stack d’audit
          </p>
        </div>
        <h2 id="toolchain-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Cinq couches,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>une seule ne suffit jamais</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Les outils trouvent ce qui est connu. Le cerveau humain trouve ce qui est spécifique. On combine les deux,
          systématiquement, pour ne laisser passer ni les bugs banals ni les bugs uniques au protocole.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TOOLS.map((tool, i) => (
            <article
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">{tool.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: '#FF3A40' }}>
                  {tool.category}
                </p>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-inari-text">{tool.what}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-inari-text-soft">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">Pourquoi · </span>
                {tool.why}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// PRICING
// ===========================================================================

function PricingSection() {
  return (
    <section
      id="tarifs"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="pricing-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Trois formules &middot; transparence totale
          </p>
        </div>
        <h2 id="pricing-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Tarifs publics,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>pas de mauvaise surprise</em>.
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING.map((tier) => (
            <article
              key={tier.id}
              className="relative overflow-hidden rounded-2xl border p-7 sm:p-8"
              style={{
                background: tier.highlight ? 'rgba(227, 30, 36, 0.06)' : 'rgba(18, 18, 26, 0.10)',
                backdropFilter: 'blur(16px) saturate(180%)',
                borderColor: tier.highlight ? '#FF3A40' : 'rgba(255,255,255,0.08)',
                boxShadow: tier.highlight ? '0 24px 64px -16px rgba(227, 30, 36, 0.25)' : 'none',
              }}
            >
              {tier.highlight ? (
                <div
                  className="absolute right-5 top-5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ background: 'rgba(227, 30, 36, 0.15)', color: '#FF3A40' }}
                >
                  Le plus demandé
                </div>
              ) : null}
              <h3 className="font-serif text-2xl font-medium leading-tight text-inari-white">{tier.name}</h3>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">{tier.duration}</p>
              <p
                className="mt-6 font-serif"
                style={{ fontSize: 'clamp(36px, 3.5vw, 52px)', lineHeight: '1', color: '#FF3A40', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                {tier.price}
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-inari-text-soft">{tier.description}</p>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-inari-text">
                    <span aria-hidden="true" className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF3A40]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/contact/"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 font-sans text-sm font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={
                  tier.highlight
                    ? { backgroundColor: '#E31E24', color: '#FFFFFF' }
                    : { background: 'rgba(18, 18, 26, 0.6)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.20)' }
                }
              >
                {tier.cta} <span aria-hidden="true">&rarr;</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// FAQ
// ===========================================================================

function FAQItemRow({ item, defaultOpen }: { item: FAQItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3A40] focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
        aria-expanded={open}
      >
        <span className="text-[16px] font-medium leading-snug text-inari-white sm:text-[18px]">{item.q}</span>
        <span aria-hidden="true" className="font-mono text-2xl text-inari-text-muted" style={{ color: open ? '#FF3A40' : undefined }}>
          {open ? '−' : '+'}
        </span>
      </div>
      {open ? (
        <div className="pb-5 text-[15px] leading-relaxed text-inari-text-soft">{item.a}</div>
      ) : null}
    </div>
  )
}

function FAQSection() {
  const level1 = FAQ.filter((f) => f.level === 1)
  const level2 = FAQ.filter((f) => f.level === 2)
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Ce qu’on nous demande souvent
          </p>
        </div>
        <h2 id="faq-title" className="mt-5 font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Vos questions,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>nos réponses</em>.
        </h2>

        <div className="mt-10 rounded-2xl border border-white/[0.08] p-7" style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Pour tous</p>
          <div className="mt-4">
            {level1.map((item, i) => (
              <FAQItemRow key={i} item={item} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.08] p-7" style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Plus technique &middot; pour devs / lead</p>
          <div className="mt-4">
            {level2.map((item, i) => (
              <FAQItemRow key={i} item={item} defaultOpen={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// CTA FINAL
// ===========================================================================

function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="final-cta-title"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <h2 id="final-cta-title" className="font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Auditer votre code{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>avant un attaquant motivé</em>.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-relaxed text-inari-text-soft">
          Un échange de 30 minutes pour cadrer le scope, le timing, et le tarif. Sans engagement, en NDA si besoin.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-4 font-sans text-base font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
          >
            Demander un devis audit
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="/cybersecurite/"
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.20] px-7 py-4 font-sans text-base font-medium transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{
              background: 'rgba(18, 18, 26, 0.45)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: '#FFFFFF',
            }}
          >
            Voir tous nos audits
          </a>
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// MOUNT
// ===========================================================================

function AuditSCIsland() {
  return (
    <div className="relative text-inari-text" data-theme="rouge" role="region" aria-label="Audit smart contract Inaricom">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-inari-black" style={{ zIndex: 0 }}>
        <Suspense fallback={<BackgroundSkeleton />}>
          <VolumetricFog />
          <MatrixRainRed />
        </Suspense>
      </div>

      <div className="relative z-10">
        <AuditSCHero />
        <HacksTimelineSection />
        <SurfaceSection />
        <ToolchainSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-audit-smart-contract-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AuditSCIsland />
    </StrictMode>,
  )
}
