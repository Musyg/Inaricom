import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BackgroundSkeleton } from '@/components/backgrounds/BackgroundSkeleton'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds — meme pattern que audit-web/cybersec/ia.
const MatrixRainRed = lazy(() =>
  import('@/components/backgrounds/MatrixRainRed').then((m) => ({ default: m.MatrixRainRed })),
)
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)

// ===========================================================================
// DATA
// ===========================================================================

// --- Stats (4 chiffres choc, contexte infra) -----------------------------

type Stat = {
  id: string
  value: string
  label: string
  trend?: string
  source: string
}

const STATS: Stat[] = [
  {
    id: 'mttd',
    value: '204 j',
    label: 'temps moyen pour détecter une intrusion',
    trend: 'avant qu’elle soit visible',
    source: 'IBM 2024',
  },
  {
    id: 'ad-compromised',
    value: '9 sur 10',
    label: 'audits Active Directory révèlent un chemin vers Domain Admin',
    trend: 'PME et ETI confondues',
    source: 'CrowdStrike 2025',
  },
  {
    id: 'ransom',
    value: '1.85 M$',
    label: 'coût moyen d’une attaque ransomware',
    trend: 'rançon + downtime + remédiation',
    source: 'Sophos 2025',
  },
  {
    id: 'lockheed-coverage',
    value: '7 / 7',
    label: 'étapes de la Cyber Kill Chain testées',
    trend: 'reconnaissance → exfiltration',
    source: 'méthodologie Inaricom',
  },
]

// --- Cyber Kill Chain (7 etapes Lockheed Martin) -------------------------

type KillChainStep = {
  id: string
  index: string
  title: string
  /** Niveau 1 : ce que comprend un dirigeant */
  business: string
  /** Niveau 2 : exemples concrets pour techs */
  technical: string
  /** Reference discrete (level 3) */
  jargon: string
}

const KILL_CHAIN: KillChainStep[] = [
  {
    id: 'recon',
    index: '01',
    title: 'Reconnaissance',
    business:
      'On apprend tout ce qu’il y a à savoir sur vous, sans rien toucher : noms d’employés, technologies utilisées, mots de passe déjà fuités sur le dark web.',
    technical:
      'OSINT passif (LinkedIn, GitHub, Shodan), énumération DNS, fingerprinting des services exposés, recherche dans les bases de leaks.',
    jargon: 'OSINT, DNS enum, Shodan, leakwatch',
  },
  {
    id: 'weaponize',
    index: '02',
    title: 'Préparation de l’arme',
    business:
      'On fabrique l’outil sur-mesure pour vous : une pièce jointe Word piégée, un faux site qui imite votre messagerie, un payload qui passe sous votre antivirus.',
    technical:
      'Création de macros Office obfusquées, payloads C2 (Sliver, Mythic, Havoc), bypass AMSI/EDR, signatures de domaines look-alike.',
    jargon: 'Sliver, Mythic, AMSI bypass, typosquatting',
  },
  {
    id: 'delivery',
    index: '03',
    title: 'Diffusion',
    business:
      'On livre l’arme à votre équipe : un e-mail qui ressemble parfaitement à celui de votre comptable, un faux SMS de votre banque, une clé USB qu’on laisse traîner.',
    technical:
      'Phishing ciblé (spear-phishing), smishing, USB drop, exploit kits via watering hole, abus de plateformes légitimes (Dropbox, OneDrive).',
    jargon: 'Spear-phishing, watering hole, USB drop',
  },
  {
    id: 'exploit',
    index: '04',
    title: 'Exploitation',
    business:
      'Quelqu’un clique. Le code malveillant s’exécute sur son poste. À cet instant, on a un pied dans votre maison.',
    technical:
      'Exécution de code via macro Office, exploit navigateur, vulnérabilité non patchée (CVE récent), abus de fonctionnalité légitime (LOLBins).',
    jargon: 'CVE-2025-*, LOLBins, browser RCE',
  },
  {
    id: 'install',
    index: '05',
    title: 'Installation (Persistance)',
    business:
      'On s’installe pour rester. Même si vous redémarrez le PC, même si vous changez le mot de passe : on est toujours là, prêts à revenir.',
    technical:
      'Tâches planifiées, services Windows, clés de registre Run, abus d’outils légitimes (PsExec, WMI), création de comptes locaux dormants.',
    jargon: 'Scheduled tasks, registry Run, WMI persistence',
  },
  {
    id: 'c2',
    index: '06',
    title: 'Commande & Contrôle (C2)',
    business:
      'On pilote depuis l’extérieur. Le poste compromis nous parle discrètement, en se faisant passer pour du trafic web normal. Votre antivirus ne voit rien.',
    technical:
      'Beaconing HTTPS chiffré, domain fronting, DNS tunneling, abus de Slack/Discord/Telegram comme canaux C2 furtifs.',
    jargon: 'C2 beacon, domain fronting, DNS tunnel',
  },
  {
    id: 'actions',
    index: '07',
    title: 'Objectifs finaux',
    business:
      'Là, on simule l’attaquant final : on prend le contrôle de tout le domaine, on accède aux données sensibles, on simule une exfiltration. Aucune donnée réelle ne sort — on documente juste qu’on aurait pu.',
    technical:
      'Pivot latéral, escalade vers Domain Admin (DCSync, Kerberoasting), accès aux partages, exfiltration simulée vers serveur de test.',
    jargon: 'DCSync, Kerberoasting, lateral movement',
  },
]

// --- Surface d'attaque infra (4 zones) -----------------------------------

type Surface = {
  id: string
  title: string
  /** Niveau 1 : ce que comprend un dirigeant */
  business: string
  /** Niveau 2 : exemples concrets */
  examples: string[]
  /** Reference technique discrete */
  jargon: string
}

const SURFACES: Surface[] = [
  {
    id: 'perimeter',
    title: 'Le périmètre extérieur',
    business:
      'Tout ce qu’un attaquant voit depuis Internet sans rien savoir de vous : votre site, votre VPN, vos serveurs mail, votre webmail. La première porte d’entrée.',
    examples: [
      'Service oublié encore connecté à Internet (test, ancien projet)',
      'VPN avec une vulnérabilité publique non patchée',
      'Webmail qui accepte n’importe quel mot de passe sans blocage',
      'Serveur de fichiers visible depuis Internet par erreur',
    ],
    jargon: 'External pentest, VPN exploits, exposed services',
  },
  {
    id: 'ad',
    title: 'Active Directory / LDAP',
    business:
      'C’est l’annuaire central de votre entreprise : qui peut faire quoi sur quels postes. Si on prend le contrôle, on contrôle tout. C’est la cible n°1 des ransomwares.',
    examples: [
      'Compte admin avec un mot de passe deviné en quelques heures',
      'Configuration héritée qui permet à n’importe qui de devenir admin',
      'Mot de passe d’un service qu’on peut casser hors-ligne',
      'Chemin caché qui mène d’un employé lambda à Domain Admin',
    ],
    jargon: 'Kerberoasting, AS-REP roasting, BloodHound paths',
  },
  {
    id: 'endpoints',
    title: 'Postes de travail',
    business:
      'Ordinateurs des employés. C’est par là que rentrent 9 attaques sur 10 : un clic sur un mauvais e-mail, une pièce jointe piégée, un site web compromis.',
    examples: [
      'Macro Office qui passe sous votre antivirus',
      'Navigateur non à jour exploité via une publicité piégée',
      'Antivirus contourné par un payload sur-mesure',
      'Outil légitime de Windows utilisé pour exécuter du code malveillant',
    ],
    jargon: 'Office macros, browser RCE, EDR bypass, LOLBins',
  },
  {
    id: 'cloud',
    title: 'Cloud & SaaS',
    business:
      'Microsoft 365, Google Workspace, AWS, Azure. Vos données sont chez eux. Une mauvaise configuration et toute l’entreprise est lisible depuis n’importe où.',
    examples: [
      'Bucket S3 public qui contient des sauvegardes',
      'Compte M365 sans 2FA récupéré via mot de passe leaké',
      'Permissions Azure trop larges qui exposent les abonnements',
      'OAuth d’une appli tierce avec accès en lecture/écriture aux mails',
    ],
    jargon: 'S3 misconfig, OAuth abuse, IAM privilege escalation',
  },
]

// --- Post-exploitation (ce qu'on fait apres etre rentre) ----------------

type PostExploit = {
  title: string
  description: string
}

const POST_EXPLOIT: PostExploit[] = [
  {
    title: 'On bouge latéralement',
    description:
      'Du premier poste compromis vers les serveurs voisins, en réutilisant les sessions ouvertes et les mots de passe en mémoire. Sans déclencher d’alerte.',
  },
  {
    title: 'On monte en privilèges',
    description:
      'Du compte d’un employé lambda jusqu’à Domain Admin (qui peut tout faire sur l’infra Windows). On documente le chemin exact pour que vous puissiez le couper.',
  },
  {
    title: 'On installe une persistance furtive',
    description:
      'On laisse des "portes dérobées" qui survivent à un redémarrage, à un changement de mot de passe, à une réinstallation de l’antivirus. Pour montrer qu’on aurait pu revenir.',
  },
  {
    title: 'On simule une exfiltration',
    description:
      'On récupère des données sensibles et on les "sort" vers un serveur de test à nous. Aucune donnée réelle ne quitte votre infra. On prouve juste qu’on aurait pu.',
  },
  {
    title: 'On teste votre détection',
    description:
      'On regarde ce que votre EDR, votre SIEM, vos outils de monitoring ont vu. La plupart du temps : très peu. On vous donne la liste exacte des angles morts.',
  },
]

// --- Comparator (External vs Internal vs Red Team) -----------------------

type ComparatorRow = {
  scenario: string
  external: string
  internal: string
  redteam: string
}

const COMPARATOR: ComparatorRow[] = [
  {
    scenario: 'Point de départ',
    external: 'Internet, zéro accès',
    internal: 'Sur le réseau, un poste donné',
    redteam: 'Phishing réel + intrusion bâtiment',
  },
  {
    scenario: 'Durée',
    external: '5 jours',
    internal: '8 jours',
    redteam: '4 à 8 semaines',
  },
  {
    scenario: 'Cible',
    external: 'Tout ce qui est exposé',
    internal: 'Domain Admin + données',
    redteam: 'Objectif sur-mesure',
  },
  {
    scenario: 'Détection testée',
    external: 'Non',
    internal: 'Partiellement',
    redteam: 'Oui (EDR + SOC + équipe)',
  },
  {
    scenario: 'Cas d’usage',
    external: 'Hygiène de base',
    internal: 'Maturité moyenne',
    redteam: 'Avant audit ISO / NIS2',
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
    id: 'external',
    name: 'External Pentest',
    price: '3 500 €',
    duration: '5 jours',
    description: 'Tester ce qui est exposé sur Internet — comme un attaquant qui ne sait rien de vous.',
    features: [
      'Énumération complète du périmètre exposé',
      'Test des services : VPN, webmail, sites publics',
      'OSINT (ce qui circule sur vous publiquement)',
      'Rapport technique + synthèse direction',
      'Retest 30 jours inclus',
    ],
    cta: 'Demander un devis',
  },
  {
    id: 'internal',
    name: 'Internal Pentest',
    price: '7 500 €',
    duration: '8 jours',
    description: 'Simule un attaquant déjà entré (clic phishing, USB, prestataire malveillant). Le scénario réaliste.',
    features: [
      'Compromis Domain Admin si chemin existe',
      'Cartographie complète Active Directory (BloodHound)',
      'Test EDR / antivirus / segmentation réseau',
      'Liste prioritisée des chemins à fermer',
      'Rapport technique + synthèse direction + retest 30 jours',
    ],
    highlight: true,
    cta: 'Le plus demandé',
  },
  {
    id: 'redteam',
    name: 'Red Team Full Scope',
    price: 'Sur devis',
    duration: '4-8 semaines',
    description: 'Scénario d’attaque complet : phishing réel + intrusion physique + exfiltration. Pour tester votre SOC en conditions réelles.',
    features: [
      'Phishing ciblé sur employés réels',
      'Intrusion physique simulée (bâtiment, badges)',
      'Pivot, persistance, exfiltration de bout en bout',
      'Test détection EDR + SIEM + équipe SOC',
      'Restitution post-mortem avec votre équipe',
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
    q: 'Est-ce que ça peut casser quelque chose en production ?',
    a: 'Non. On exclut les actions destructives (suppression, déni de service) du scope par défaut. Et on travaille en concertation avec votre équipe IT pour les phases sensibles. C’est documenté dans la convention de pentest signée avant le démarrage.',
  },
  {
    level: 1,
    q: 'Pourquoi pas juste installer un EDR / antivirus moderne ?',
    a: 'Un EDR détecte les patterns connus. Un attaquant motivé contourne — on le démontre dans 9 missions sur 10. L’EDR est nécessaire mais pas suffisant. Le pentest vous dit où il aveugle.',
  },
  {
    level: 1,
    q: 'Combien de temps avant que vous trouviez quelque chose ?',
    a: 'En général, sur Internal Pentest, on a un chemin vers Domain Admin entre le jour 2 et le jour 5. Sur External Pentest, le délai dépend de votre exposition — parfois rien (bonne hygiène), parfois beaucoup en quelques heures.',
  },
  {
    level: 1,
    q: 'Quelle différence avec un audit ISO 27001 ou NIS2 ?',
    a: 'L’audit ISO/NIS2 vérifie des cases : politiques, procédures, sauvegardes documentées. Le pentest vérifie la réalité technique : ce qu’on peut casser. Les deux sont complémentaires — pas substituables.',
  },
  {
    level: 1,
    q: 'Et si on n’a pas de DSI / RSSI en interne ?',
    a: 'On peut accompagner le dirigeant directement. La synthèse direction est rédigée pour être lue sans bagage technique : 5 priorités, budget estimé, calendrier. Et on reste joignables pour aider à prioriser après livraison.',
  },
  {
    level: 2,
    q: 'Vous utilisez quels outils / frameworks ?',
    a: 'Sliver, Mythic et Havoc côté C2. BloodHound + SharpHound pour la cartographie AD. Impacket suite pour les attaques Kerberos. CrackMapExec, Responder, Mimikatz côté Windows. Nmap, Burp, Nuclei côté périmètre. Outils internes pour bypass EDR récent (sur demande).',
  },
  {
    level: 2,
    q: 'Comment vous bypassez un EDR moderne (Crowdstrike, SentinelOne, Defender) ?',
    a: 'Plusieurs angles : payloads sur-mesure compilés en C/Rust avec syscalls directs (bypass EDR userland hooks), abus de LOLBins signés Microsoft, BYOVD pour kill l’EDR, ou simplement passer par des actions légitimes (RDP, PowerShell signed, WMI). On documente précisément ce qui passe et ce qui est bloqué.',
  },
  {
    level: 2,
    q: 'Vous testez quoi côté cloud (Azure / AWS / GCP) ?',
    a: 'Énumération IAM, escalade de privilèges via misconfig (Lambda, role assumption, OAuth scopes trop larges), persistance cloud (refresh tokens, app registrations dormantes), accès cross-tenant. Côté Microsoft 365 : abus OAuth, légacy auth, Graph API permissions, Azure AD Connect compromise.',
  },
]

// ===========================================================================
// HERO + STATS (meme structure qu'audit-web pour coherence visuelle)
// ===========================================================================

function AuditInfraHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Hero audit infrastructure"
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
              <rect x="2" y="3" width="12" height="4" rx="0.5" />
              <rect x="2" y="9" width="12" height="4" rx="0.5" />
              <circle cx="4.5" cy="5" r="0.5" fill="currentColor" />
              <circle cx="4.5" cy="11" r="0.5" fill="currentColor" />
            </svg>
            <span>Infrastructure &middot; Posture offensive</span>
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
              <span className="block">Votre réseau, c’est une forteresse.</span>
              <span className="block">
                Ou{' '}
                <em className="not-italic" style={{ color: '#FF3A40' }}>
                  un labyrinthe ouvert{' ?'}
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
              On joue l’attaquant — du repérage à l’exfiltration simulée. On suit{' '}
              <strong style={{ color: '#FF3A40', fontWeight: 600 }}>la Cyber Kill Chain de bout en bout</strong>{' '}
              pour mesurer ce qu’un vrai groupe motivé pourrait faire chez vous, et ce que vos défenses voient (ou ne voient pas).
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
                href="#kill-chain"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.20] px-6 py-3 font-sans text-sm font-medium transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{
                  background: 'rgba(18, 18, 26, 0.45)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  color: '#FFFFFF',
                }}
              >
                Voir la Kill Chain
              </a>
            </div>
          </div>
        </div>

        {/* Stats inline en bas du hero (meme pattern qu'audit-web) */}
        <div style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
            <p id="audit-infra-stats-title" className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">
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
// KILL CHAIN — section signature animee (IntersectionObserver)
// ===========================================================================

/**
 * Card d'une etape de la kill chain. Devient "active" quand elle entre dans
 * le viewport (50% visible). Etat actif = halo rouge + bordure animee.
 */
function KillChainCard({ step }: { step: KillChainStep }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)

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
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative pl-12 transition-all duration-700 sm:pl-16"
      style={{ opacity: active ? 1 : 0.35, transform: active ? 'translateX(0)' : 'translateX(-8px)' }}
    >
      {/* Numero d'etape sur la timeline */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-[13px] font-medium transition-all duration-500 sm:h-12 sm:w-12 sm:text-[14px]"
        style={{
          borderColor: active ? '#FF3A40' : 'rgba(255,255,255,0.15)',
          background: active ? 'rgba(227, 30, 36, 0.15)' : 'rgba(18, 18, 26, 0.6)',
          color: active ? '#FF3A40' : 'rgba(240, 240, 245, 0.5)',
          boxShadow: active ? '0 0 24px rgba(227, 30, 36, 0.4), inset 0 0 12px rgba(227, 30, 36, 0.2)' : 'none',
        }}
      >
        {step.index}
      </div>

      <div
        className="rounded-2xl border p-6 transition-all duration-500"
        style={{
          background: 'rgba(18, 18, 26, 0.10)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderColor: active ? 'rgba(227, 30, 36, 0.35)' : 'rgba(255, 255, 255, 0.08)',
          boxShadow: active ? '0 16px 48px -16px rgba(227, 30, 36, 0.25)' : 'none',
        }}
      >
        <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">
          {step.title}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-inari-text-soft">{step.business}</p>
        {showTechnical ? (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Concrètement, côté technique</p>
            <p className="mt-2 text-[14px] leading-relaxed text-inari-text">{step.technical}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
              Référence : {step.jargon}
            </p>
          </div>
        ) : null}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowTechnical((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowTechnical((v) => !v)
            }
          }}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted transition hover:text-inari-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3A40] focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
        >
          {showTechnical ? 'Masquer le détail technique' : 'Voir le détail technique'}
          <span aria-hidden="true">{showTechnical ? '−' : '+'}</span>
        </div>
      </div>
    </div>
  )
}

function KillChainSection() {
  return (
    <section
      id="kill-chain"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="kill-chain-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Notre méthode &middot; Cyber Kill Chain
          </p>
        </div>
        <h2
          id="kill-chain-title"
          className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl"
        >
          Sept étapes,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>une seule logique</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Le modèle Lockheed Martin décompose une intrusion en sept moments. On les couvre tous, dans
          l’ordre. À chaque étape, on documente ce qu’on a fait, ce que vos défenses ont détecté (ou pas),
          et comment fermer le passage.
        </p>

        {/* Timeline avec ligne verticale rouge */}
        <div className="relative mt-14">
          {/* Ligne verticale connectant tous les points */}
          <div
            aria-hidden="true"
            className="absolute left-5 top-5 bottom-5 w-px sm:left-6"
            style={{
              background: 'linear-gradient(180deg, rgba(227, 30, 36, 0.4) 0%, rgba(227, 30, 36, 0.15) 50%, rgba(227, 30, 36, 0.4) 100%)',
            }}
          />
          <div className="flex flex-col gap-6">
            {KILL_CHAIN.map((step) => (
              <KillChainCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// SURFACE D'ATTAQUE INFRA (4 zones cliquables)
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
      aria-controls={`infra-surface-detail-${surface.id}`}
    >
      <h3 className="font-serif text-xl font-medium leading-tight text-inari-white sm:text-2xl">{surface.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-inari-text-soft">{surface.business}</p>
      <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
        {active ? 'Voir moins' : 'Ce qu’on essaie ici'}
        <span aria-hidden="true" className="transition group-hover:translate-x-0.5">{active ? '−' : '→'}</span>
      </p>
    </div>
  )
}

function SurfaceDetail({ surface }: { surface: Surface }) {
  return (
    <div
      id={`infra-surface-detail-${surface.id}`}
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
      id="surface-infra"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="surface-infra-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            La surface d’attaque infra
          </p>
        </div>
        <h2 id="surface-infra-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Quatre zones,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>quatre logiques d’attaque</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Chaque zone a ses faiblesses spécifiques et ses chemins privilégiés. Cliquez pour voir des exemples
          concrets de ce qu’on essaie d’exploiter dans chacune.
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
// POST-EXPLOITATION ("ce qu'on fait apres etre rentre")
// ===========================================================================

function PostExploitSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="post-exploit-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Post-exploitation &middot; ce qui arrive vraiment après
          </p>
        </div>
        <h2 id="post-exploit-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Une fois rentré,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>on ne s’arrête pas là</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Un attaquant motivé ne s’arrête pas au premier accès. Il pivote, il monte en privilèges, il s’installe
          durablement, il exfiltre. Notre mission : reproduire cette logique, sans rien casser, et documenter chaque
          mouvement pour vous montrer où couper.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {POST_EXPLOIT.map((item, i) => (
            <article
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
                Étape {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-serif text-xl font-medium leading-tight text-inari-white">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-inari-text-soft">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// COMPARATOR (External vs Internal vs Red Team)
// ===========================================================================

function ComparatorSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="comparator-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Choisir le bon scope
          </p>
        </div>
        <h2 id="comparator-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          External, Internal, ou{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>Red Team complet</em> ?
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Trois scopes, trois niveaux de réalisme et de profondeur. La plupart des PME commencent par External, montent
          en Internal une fois leur périmètre durci. Le Red Team Full Scope est pour ceux qui veulent tester l’ensemble
          de leur dispositif (technique + humain + détection).
        </p>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}>
          <div className="hidden grid-cols-4 gap-4 border-b border-white/[0.06] px-6 py-4 lg:grid">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">Critère</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">External</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">Internal</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF3A40]">Red Team</div>
          </div>
          {COMPARATOR.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 border-b border-white/[0.04] px-6 py-5 last:border-b-0 lg:grid-cols-4 lg:gap-4 lg:py-4"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted lg:text-[12px]">{row.scenario}</div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted lg:hidden">External · </span>
                <span className="text-[14px] leading-relaxed text-inari-text">{row.external}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted lg:hidden">Internal · </span>
                <span className="text-[14px] leading-relaxed text-inari-text">{row.internal}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF3A40] lg:hidden">Red Team · </span>
                <span className="text-[14px] leading-relaxed text-inari-white">{row.redteam}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===========================================================================
// PRICING (3 tiers infra)
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
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">Plus technique &middot; pour RSSI / DSI</p>
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
          Voir où votre infra{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>plie réellement</em>.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-relaxed text-inari-text-soft">
          Un échange de 30 minutes pour cadrer le bon scope, le bon timing, et le budget juste. Sans engagement.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-4 font-sans text-base font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
          >
            Demander un devis infra
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

function AuditInfraIsland() {
  return (
    <div className="relative text-inari-text" data-theme="rouge" role="region" aria-label="Audit infrastructure Inaricom">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-inari-black" style={{ zIndex: 0 }}>
        <Suspense fallback={<BackgroundSkeleton />}>
          <VolumetricFog />
          <MatrixRainRed />
        </Suspense>
      </div>

      <div className="relative z-10">
        <AuditInfraHero />
        <KillChainSection />
        <SurfaceSection />
        <PostExploitSection />
        <ComparatorSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-audit-infra-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AuditInfraIsland />
    </StrictMode>,
  )
}
