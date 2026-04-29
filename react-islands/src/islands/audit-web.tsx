import { StrictMode, Suspense, lazy, useState } from 'react'
import { BackgroundSkeleton } from '@/components/backgrounds/BackgroundSkeleton'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

// Lazy backgrounds — meme pattern que cybersec/ia : reduit l eval JS initial,
// le hero rend immediatement et les canvas montent en arriere-plan via Suspense.
const MatrixRainRed = lazy(() =>
  import('@/components/backgrounds/MatrixRainRed').then((m) => ({ default: m.MatrixRainRed })),
)
const VolumetricFog = lazy(() =>
  import('@/components/backgrounds/VolumetricFog').then((m) => ({ default: m.VolumetricFog })),
)

// ---------------------------------------------------------------------------
// Data — Stats (4 chiffres choc apres hero)
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
    id: 'sites-attacked',
    value: '1 sur 3',
    label: 'sites web attaqués en 2025',
    trend: 'PME francophones',
    source: 'ANSSI 2026',
  },
  {
    id: 'breach-cost',
    value: '4.45 M$',
    label: 'coût moyen d’une fuite de données',
    trend: 'tous secteurs',
    source: 'IBM 2024',
  },
  {
    id: 'sites-vuln',
    value: '100 %',
    label: 'des sites scannés ont des failles',
    trend: 'la plupart corrigeables',
    source: 'Positive Tech 2025',
  },
  {
    id: 'retest-included',
    value: '0',
    label: 'retest oublié ou facturable',
    trend: '30 jours inclus',
    source: 'engagement Inaricom',
  },
]

// ---------------------------------------------------------------------------
// Data — Surface d attaque (4 zones cliquables, niveau 1 + 2)
// ---------------------------------------------------------------------------

type Surface = {
  id: string
  title: string
  /** Niveau 1 : ce que comprend un dirigeant */
  business: string
  /** Niveau 2 : exemples concrets pour techs (sans WSTG / CWE) */
  examples: string[]
  /** Reference technique discrete (level 3, en small) */
  jargon: string
}

const SURFACES: Surface[] = [
  {
    id: 'public',
    title: 'Pages publiques',
    business:
      'Tout ce qui est accessible sans connexion : formulaires de contact, barre de recherche, page de login, blog. C’est la première porte que tente un attaquant.',
    examples: [
      'Injection de code dans la barre de recherche',
      'Manipulation de formulaires pour contourner les vérifications',
      'Vol de données d’autres utilisateurs via une URL piégée',
      'Brute force sur la page de connexion',
    ],
    jargon: 'XSS, SQLi, CSRF, brute force',
  },
  {
    id: 'auth',
    title: 'Espace client / connexion',
    business:
      'Mots de passe, sessions, "mot de passe oublié", double authentification. C’est là que les attaquants tentent d’usurper un compte.',
    examples: [
      'Prendre la main sur le compte d’un autre utilisateur',
      'Contourner la double authentification',
      'Voler une session active sans le mot de passe',
      'Forcer la réinitialisation du mot de passe d’un admin',
    ],
    jargon: 'Broken auth, session fixation, IDOR sur comptes',
  },
  {
    id: 'data',
    title: 'Données échangées',
    business:
      'Commandes, paiements, profils, transferts de fichiers. Ce que votre site reçoit, traite et renvoie. La cible privilégiée des attaquants motivés par l’argent.',
    examples: [
      'Modifier le prix d’une commande au moment de payer',
      'Accéder aux données d’un autre client en changeant un numéro dans l’URL',
      'Extraire la base utilisateurs en exploitant une faille de logique métier',
      'Contourner les limites de quantité ou de remise',
    ],
    jargon: 'IDOR, business logic, mass assignment, race conditions',
  },
  {
    id: 'files',
    title: 'Fichiers et téléversements',
    business:
      'Photos de profil, PDF de devis, factures, exports Excel. Si on peut téléverser, on peut souvent téléverser autre chose que ce qui est attendu.',
    examples: [
      'Téléverser un fichier piegé qui prend la main sur le serveur',
      'Lire des fichiers internes du serveur via un import mal controlé',
      'Stocker du code malveillant dans une image qui s’exécute côté visiteur',
      'Accéder aux fichiers d’un autre utilisateur',
    ],
    jargon: 'Unrestricted file upload, path traversal, stored XSS via fichier',
  },
]

// ---------------------------------------------------------------------------
// Data — Methodologie (5 etapes)
// ---------------------------------------------------------------------------

type MethodStep = {
  num: string
  title: string
  body: string
  duration: string
}

const METHOD: MethodStep[] = [
  {
    num: '01',
    title: 'On cartographie votre site',
    body:
      'On liste toutes les pages, formulaires, fonctionnalités, points d’échange de données. Sans cartographie complète, on rate des angles d’attaque.',
    duration: '1–2 jours',
  },
  {
    num: '02',
    title: 'On cherche les failles connues',
    body:
      'Outils automatisés pour balayer rapidement les vulnérabilités documentées publiquement (CVE, mauvaises configurations courantes). Étape utile mais insuffisante seule.',
    duration: '1 jour',
  },
  {
    num: '03',
    title: 'On exploite à la main',
    body:
      'C’est ici que se joue la différence avec un scanner. On confirme que chaque faille est réellement exploitable, on la reproduit, on capture des preuves.',
    duration: '3–7 jours',
  },
  {
    num: '04',
    title: 'On chaîne les attaques',
    body:
      'Une faille mineure + une autre faille mineure = parfois une brèche critique. Les scénarios réels enchainent toujours plusieurs étapes. C’est ce qu’on reproduit.',
    duration: '1–2 jours',
  },
  {
    num: '05',
    title: 'On rédige deux livrables',
    body:
      'Un rapport technique détaillé pour vos développeurs (preuve, capture, code corrigé suggéré), et une synthèse 4 pages pour la direction (risque business, plan d’action, prix indicatif fix).',
    duration: '2–3 jours',
  },
]

// ---------------------------------------------------------------------------
// Data — Comparator (6 lignes scanner auto vs Inaricom)
// ---------------------------------------------------------------------------

type CompareRow = {
  criterion: string
  scanner: boolean
  inaricom: boolean
}

const COMPARE: CompareRow[] = [
  { criterion: 'Trouve des failles connues publiquement (CVE)', scanner: true, inaricom: true },
  { criterion: 'Confirme que la faille est réellement exploitable', scanner: false, inaricom: true },
  { criterion: 'Détecte les failles de logique métier (spécifiques à votre site)', scanner: false, inaricom: true },
  { criterion: 'Combine plusieurs failles pour reproduire un scénario réel', scanner: false, inaricom: true },
  { criterion: 'Fournit une preuve reproductible (PoC) que vos devs peuvent rejouer', scanner: false, inaricom: true },
  { criterion: 'Vérifie que les correctifs sont efficaces (retest 30 jours)', scanner: false, inaricom: true },
]

// ---------------------------------------------------------------------------
// Data — Pricing (3 paliers)
// ---------------------------------------------------------------------------

type PricingTier = {
  id: string
  name: string
  price: string
  duration: string
  best_for: string
  features: string[]
  cta: string
  highlighted?: boolean
}

const PRICING: PricingTier[] = [
  {
    id: 'quick',
    name: 'Quick Audit',
    price: '2 900 € / 2 800 CHF',
    duration: '3–5 jours',
    best_for: 'Sites vitrines, MVPs, prototypes en pré-lancement',
    features: [
      'Scan automatisé + revue manuelle express',
      'Top 10 vulnérabilités les plus courantes (OWASP)',
      'Rapport technique + synthèse direction',
      'Retest 30 jours inclus',
    ],
    cta: 'Lancer un Quick Audit',
  },
  {
    id: 'standard',
    name: 'Pentest Standard',
    price: '6 500 € / 6 300 CHF',
    duration: '7–12 jours',
    best_for: 'Sites e-commerce, espaces clients, applications métier',
    features: [
      'Méthodologie complète (cartographie + scan + exploitation manuelle)',
      'Test de logique métier spécifique à votre site',
      'Chaînage d’attaques sur scénarios réels',
      'Rapport technique + synthèse direction détaillés',
      'Retest 30 jours inclus + 1 session de débriefing',
    ],
    cta: 'Lancer un Pentest Standard',
    highlighted: true,
  },
  {
    id: 'redteam',
    name: 'Pentest + Red Team Web',
    price: 'sur devis',
    duration: '15–30 jours',
    best_for: 'Plateformes critiques, applications financières ou santé',
    features: [
      'Tout le Pentest Standard',
      'Scénarios d’attaque ciblée (phishing, social engineering web)',
      'Test du processus de détection et de réaction',
      'Recommandations stratégiques pour le COMEX',
      'Suivi 90 jours post-audit',
    ],
    cta: 'Demander un devis',
  },
]

// ---------------------------------------------------------------------------
// Data — FAQ (niveau 1 + niveau 2 dépliable)
// ---------------------------------------------------------------------------

type FAQItem = {
  q: string
  a: string
  level: 1 | 2
}

const FAQ: FAQItem[] = [
  // Niveau 1 — pour dirigeants
  {
    level: 1,
    q: 'Combien de temps prend un audit web ?',
    a: 'Entre 3 jours (Quick Audit, sites vitrines) et 30 jours (Red Team complet). Pour un Pentest Standard, comptez 2 à 3 semaines entre le coup d’envoi et la livraison du rapport, retest inclus.',
  },
  {
    level: 1,
    q: 'Combien ça coûte vraiment ?',
    a: 'Tarifs publics affichés sur cette page (2 900 € à sur devis). Pas de pricing opaque, pas de "contactez-nous pour un devis" : nos prix sont transparents. Le devis Red Team dépend du périmètre, on annonce une fourchette en moins de 48h.',
  },
  {
    level: 1,
    q: 'Vous avez besoin de quoi de notre côté ?',
    a: 'Une URL accessible (production ou staging), des comptes de test (utilisateur normal + admin si possible), et l’autorisation écrite de tester (on fournit le modèle). Si vous avez de la doc technique, c’est un bonus.',
  },
  {
    level: 1,
    q: 'Notre RGPD / nLPD est-il OK avec un audit ?',
    a: 'Oui. On signe un NDA avant tout, on n’extrait jamais de données réelles, et on travaille sur env. de staging quand possible. Notre process est conforme RGPD (UE) et nLPD (Suisse). On peut aussi vous fournir un certificat d’audit à produire en cas d’incident réglementaire.',
  },
  {
    level: 1,
    q: 'Qu’est-ce qu’on reçoit à la fin ?',
    a: 'Deux livrables : (1) un rapport technique de 50 à 80 pages avec chaque faille, sa preuve d’exploitation reproductible, le code corrigé suggéré ; (2) une synthèse 4 pages pour le COMEX avec score de risque par enjeu business et plan d’action priorité.',
  },
  // Niveau 2 — pour techs (visibles dépliés)
  {
    level: 2,
    q: 'Vous suivez OWASP Top 10 et WSTG ?',
    a: 'Oui, OWASP Top 10 (édition 2021, mise à jour 2025 trackrée) couvert en intégralité sur tous les paliers. WSTG (Web Security Testing Guide) suivi sur Pentest Standard et Red Team. Notre process est aligné PTES également, et MITRE ATT&CK pour les scénarios Red Team.',
  },
  {
    level: 2,
    q: 'Vous testez les API REST et GraphQL ?',
    a: 'Oui sur les deux paliers Pentest Standard et Red Team. API REST : test des endpoints, IDOR, mass assignment, BOLA. GraphQL : introspection, batching attacks, complexity DoS, autorisations sur queries/mutations. On utilise Postman, Burp Suite, et des outils comme InQL pour GraphQL.',
  },
  {
    level: 2,
    q: 'DAST seul ou DAST + SAST + IAST ?',
    a: 'L’audit web est avant tout DAST (test de l’application en cours d’exécution, en black-box ou grey-box). Pour SAST (revue du code source) on a un service complémentaire (Audit Smart Contract pour Solidity / Cairo / Rust, Audit Code pour applications web sensibles). IAST (instrumentation runtime) sur demande pour Red Team.',
  },
]

// ===========================================================================
// SECTIONS — composants
// ===========================================================================

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function AuditWebHero() {
  // Hero a sa taille typographique d'origine (titre 72px, paragraphe 22.4px).
  // Le min-h-screen est volontairement supprime : on laisse le hero prendre
  // sa hauteur naturelle de contenu pour que les chiffres-cles remontent et
  // soient visibles des l'arrivee sur la page (sans scroll).
  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Hero audit web"
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
              <path d="M3 5h10v8H3z" />
              <path d="M3 5l5 4 5-4" />
            </svg>
            <span>S&eacute;curit&eacute; web &middot; M&eacute;thode offensive</span>
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
              <span className="block">Votre site web tient debout.</span>
              <span className="block">
                Sous{' '}
                <em className="not-italic" style={{ color: '#FF3A40' }}>
                  une vraie attaque ?
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
              Un audit n&rsquo;est pas un scan automatique. C&rsquo;est{' '}
              <strong style={{ color: '#FF3A40', fontWeight: 600 }}>quelqu&rsquo;un qui essaie vraiment de casser votre site</strong>{' '}
              comme le ferait un attaquant — pour qu&rsquo;on trouve les failles avant lui. M&eacute;thodologie
              offensive transparente, double livrable rapport technique + synth&egrave;se direction.
            </p>

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
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.20] px-6 py-3 font-sans text-sm font-medium transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
                style={{
                  background: 'rgba(18, 18, 26, 0.45)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  color: '#FFFFFF',
                }}
              >
                Notre m&eacute;thodologie
              </a>
            </div>
          </div>
        </div>

        {/* Stats juste en dessous du contenu hero (pas de mt-auto, pas de
            min-h-screen : le bloc remonte naturellement dans le viewport). */}
        <div style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
            <p id="audit-web-stats-title" className="font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted">
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
                {/* Top : chiffre a gauche + label/trend a droite */}
                <div className="flex items-center gap-4">
                  <p
                    className="font-serif flex-shrink-0"
                    style={{ fontSize: 'clamp(24px, 2.4vw, 34px)', lineHeight: '1', color: '#FF3A40', fontWeight: 400, letterSpacing: '-0.02em' }}
                  >
                    {stat.value}
                  </p>
                  <div className="min-w-0 flex-1">
                    {/* Label + trend dans un meme <p> avec <br/> : partagent le
                        meme leading donc collent visuellement (zero gap entre
                        les 2 lignes). Trend en rouge pour categoriser. */}
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
                {/* Bottom : source centree, gros ecart respiratoire (mt-6) pour
                    bien separer la reference du bloc label/trend. */}
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

// ---------------------------------------------------------------------------
// Surface d attaque (4 cards interactives)
// ---------------------------------------------------------------------------

function SurfaceCard({ surface, active, onSelect }: { surface: Surface; active: boolean; onSelect: () => void }) {
  // Note : role=button + tabIndex sur un <div> (pas <button>) parce que le
  // snippet 347 force `button { background: var(--inari-red) !important }`
  // sur tout le site (CTAs WooCommerce). Les cards ne sont PAS des CTAs.
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
      aria-controls={`surface-detail-${surface.id}`}
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
  // Largeur max ~ 2 cards superieures + centre. Aligne sous le grid 2-cols
  // donc visuellement "ancre" a la card active sans s etirer en pleine largeur.
  return (
    <div
      id={`surface-detail-${surface.id}`}
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
        R&eacute;f&eacute;rence technique : {surface.jargon}
      </p>
    </div>
  )
}

function SurfaceSection() {
  const [activeId, setActiveId] = useState<string>(SURFACES[0].id)
  const active = SURFACES.find((s) => s.id === activeId) ?? SURFACES[0]

  return (
    <section
      id="surface"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="surface-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            La surface d&rsquo;attaque
          </p>
        </div>
        <h2 id="surface-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          L&agrave; o&ugrave; on regarde{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>sur votre site</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Quatre zones que les attaquants ciblent en priorit&eacute;. Cliquez pour voir des exemples concrets de
          ce qu&rsquo;on essaie d&rsquo;exploiter dans chaque zone.
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

// ---------------------------------------------------------------------------
// Methodology
// ---------------------------------------------------------------------------

function MethodologySection() {
  return (
    <section
      id="methodologie"
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="method-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Comment on proc&egrave;de
          </p>
        </div>
        <h2 id="method-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Cinq &eacute;tapes,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>aucune ombre</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Notre m&eacute;thode est align&eacute;e sur les standards du m&eacute;tier (OWASP Top 10, PTES,
          WSTG sur les paliers premium), mais ce qui fait la diff&eacute;rence c&rsquo;est ce qu&rsquo;on
          fait avec.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-5 md:grid-cols-2">
          {METHOD.map((step) => (
            <article
              key={step.num}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#FF3A40' }}>
                {step.num}
              </span>
              <h3 className="mt-3 font-serif text-lg font-medium leading-tight text-inari-white">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-inari-text-soft">{step.body}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
                {step.duration}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Comparator (scanner auto vs Inaricom)
// ---------------------------------------------------------------------------

function ComparatorSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="compare-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Scanner automatique vs audit Inaricom
          </p>
        </div>
        <h2 id="compare-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Pourquoi un humain{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>change tout</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Un scanner trouve des indices. Un attaquant exploite. Un audit Inaricom fait les deux,
          dans cet ordre, sans s&rsquo;arr&ecirc;ter à la premi&egrave;re alerte rouge.
        </p>
        <div
          className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08]"
          style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
        >
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-inari-text-muted sm:grid-cols-[1fr_140px_140px] sm:px-10">
            <span>Crit&egrave;re</span>
            <span className="text-center">Scanner auto</span>
            <span className="text-center" style={{ color: '#FF3A40' }}>Inaricom</span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-t border-white/[0.06] px-6 py-5 text-[15px] sm:grid-cols-[1fr_140px_140px] sm:px-10"
            >
              <span className="text-inari-text">{row.criterion}</span>
              <span className="text-center" aria-label={row.scanner ? 'Oui' : 'Non'}>
                {row.scanner ? (
                  <span style={{ color: '#10B981', fontSize: '20px' }}>&#10003;</span>
                ) : (
                  <span style={{ color: 'rgba(240, 240, 245, 0.25)', fontSize: '20px' }}>&times;</span>
                )}
              </span>
              <span className="text-center" aria-label={row.inaricom ? 'Oui' : 'Non'}>
                {row.inaricom ? (
                  <span style={{ color: '#FF3A40', fontSize: '20px' }}>&#10003;</span>
                ) : (
                  <span style={{ color: 'rgba(240, 240, 245, 0.25)', fontSize: '20px' }}>&times;</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Deliverables (mockup 2 livrables)
// ---------------------------------------------------------------------------

function DeliverablesSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28"
      aria-labelledby="deliverables-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Ce que vous recevez
          </p>
        </div>
        <h2 id="deliverables-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Deux livrables.{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>Deux publics</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Un audit qui finit dans un PDF que personne ne lit ne sert à rien. On adapte le format au
          lecteur : technique pour vos d&eacute;veloppeurs, business pour votre direction.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              tag: 'Pour vos développeurs',
              title: 'Rapport technique',
              size: '50 à 80 pages',
              items: [
                'Chaque faille avec score de gravité',
                'Preuve d’exploitation (PoC) reproductible étape par étape',
                'Captures d’écran du test réel',
                'Code corrigé suggéré (Java, PHP, Node, Python…)',
                'Plan de remediation par priorité',
              ],
            },
            {
              tag: 'Pour votre direction',
              title: 'Synthèse direction',
              size: '4 pages',
              items: [
                'Score de risque par enjeu business (chiffre d’affaires, conformité, image)',
                'Plan d’action priorité sur 3 mois',
                'Coût indicatif des correctifs',
                'Checklist conformité RGPD / nLPD',
                'Recommandations stratégiques (stack, fournisseurs, formation)',
              ],
            },
          ].map((d, i) => (
            <article
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-7 sm:p-8"
              style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#FF3A40' }}>
                {d.tag}
              </p>
              <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-inari-white sm:text-3xl">
                {d.title}
              </h3>
              <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.18em] text-inari-text-muted">
                {d.size}
              </p>
              <ul className="mt-6 space-y-3">
                {d.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed text-inari-text">
                    <span aria-hidden="true" className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF3A40]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Pricing (3 paliers)
// ---------------------------------------------------------------------------

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
            Tarifs publics
          </p>
        </div>
        <h2 id="pricing-title" className="mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Trois formules,{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>un prix affich&eacute;</em>.
        </h2>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-inari-text-soft">
          Pas de "contactez-nous pour un devis" sur les paliers Quick et Standard. Vous savez ce que vous
          payez avant de discuter. Le Red Team Web est sur devis car le p&eacute;rim&egrave;tre varie trop
          d&rsquo;un projet à l&rsquo;autre.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING.map((tier) => (
            <article
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl border p-7 sm:p-8 ${
                tier.highlighted ? 'border-[#FF3A40]' : 'border-white/[0.08]'
              }`}
              style={{
                background: tier.highlighted ? 'rgba(227, 30, 36, 0.06)' : 'rgba(18, 18, 26, 0.10)',
                backdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: tier.highlighted ? '0 16px 48px rgba(227, 30, 36, 0.12)' : 'none',
              }}
            >
              {tier.highlighted ? (
                <span className="absolute right-6 top-6 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ background: 'rgba(227, 30, 36, 0.15)', color: '#FF3A40' }}>
                  Le plus demand&eacute;
                </span>
              ) : null}
              <h3 className="font-serif text-2xl font-medium leading-tight text-inari-white">
                {tier.name}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-inari-text-soft">{tier.best_for}</p>
              <p
                className="mt-6 font-serif"
                style={{ fontSize: '32px', lineHeight: '1.1', color: '#FF3A40', fontWeight: 400 }}
              >
                {tier.price}
              </p>
              <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.18em] text-inari-text-muted">
                {tier.duration}
              </p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-inari-text">
                    <span aria-hidden="true" className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#FF3A40]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta-final"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 font-sans text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black ${
                  tier.highlighted ? 'hover:brightness-110' : 'hover:bg-white/[0.08]'
                }`}
                style={
                  tier.highlighted
                    ? { backgroundColor: '#E31E24', color: '#FFFFFF' }
                    : {
                        background: 'rgba(18, 18, 26, 0.45)',
                        backdropFilter: 'blur(16px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.20)',
                        color: '#FFFFFF',
                      }
                }
              >
                {tier.cta}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQ (niveau 1 visible + niveau 2 dépliable)
// ---------------------------------------------------------------------------

function FAQItemRow({ item, defaultOpen }: { item: FAQItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  // <div role=button> au lieu de <button> : meme raison que SurfaceCard,
  // le snippet 347 force le bg-rouge sur tout <button> (CTAs WooCommerce).
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
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Vos questions
          </p>
        </div>
        <h2 id="faq-title" className="mt-5 font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          Ce qu&rsquo;on{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>vous r&eacute;pond</em> avant de signer.
        </h2>
        <div
          className="mt-10 rounded-2xl border border-white/[0.08] px-7 sm:px-10"
          style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
        >
          {level1.map((item, i) => (
            <FAQItemRow key={`l1-${i}`} item={item} defaultOpen={i === 0} />
          ))}
        </div>

        <div className="mt-12 flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-inari-border" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
            Pour aller plus loin (techs)
          </p>
        </div>
        <div
          className="mt-6 rounded-2xl border border-white/[0.08] px-7 sm:px-10"
          style={{ background: 'rgba(18, 18, 26, 0.10)', backdropFilter: 'blur(16px) saturate(180%)' }}
        >
          {level2.map((item, i) => (
            <FAQItemRow key={`l2-${i}`} item={item} defaultOpen={false} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function FinalCTA() {
  return (
    <section
      id="cta-final"
      className="relative overflow-hidden px-6 pb-28 pt-20 lg:px-10 lg:pb-36"
      aria-labelledby="cta-title"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <h2 id="cta-title" className="font-serif text-3xl leading-[1.1] tracking-tight text-inari-white sm:text-4xl lg:text-5xl">
          D&eacute;crire{' '}
          <em className="not-italic" style={{ color: '#FF3A40' }}>votre site web</em>.
        </h2>
        <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-inari-text-soft">
          Donnez-nous l&rsquo;URL, dites-nous ce qui vous inqui&egrave;te. R&eacute;ponse sous 48h avec
          un p&eacute;rim&egrave;tre, un d&eacute;lai, un prix. Pas de tunnel commercial.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-md px-7 py-4 font-sans text-base font-medium transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black"
            style={{ backgroundColor: '#E31E24', color: '#FFFFFF' }}
          >
            Lancer la conversation
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5">&rarr;</span>
          </a>
          <a
            href="/accueil-cybersecurite"
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

function AuditWebIsland() {
  return (
    <div className="relative text-inari-text" data-theme="rouge" role="region" aria-label="Audit web Inaricom">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-inari-black" style={{ zIndex: 0 }}>
        <Suspense fallback={<BackgroundSkeleton />}>
          <VolumetricFog />
          <MatrixRainRed />
        </Suspense>
      </div>

      <div className="relative z-10">
        <AuditWebHero />
        <SurfaceSection />
        <MethodologySection />
        <ComparatorSection />
        <DeliverablesSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </div>
    </div>
  )
}

const root = document.getElementById('inari-audit-web-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AuditWebIsland />
    </StrictMode>,
  )
}
