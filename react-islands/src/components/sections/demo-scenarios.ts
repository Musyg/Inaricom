/**
 * Scenarios pour la section TechDemo.
 *
 * Chaque scenario est une sequence de "lignes" qui defilent dans le terminal.
 * Une ligne peut etre :
 *   - "command"   : ligne tapee par l'operateur (avec prompt $)
 *   - "output"    : sortie standard
 *   - "info"      : info neutre [INFO] (gris)
 *   - "warn"      : avertissement [WARN] (jaune)
 *   - "ok"        : resultat positif [OK] (vert)
 *   - "critical"  : alerte critique [CRITIQUE] (rouge)
 *   - "ai"        : sortie IA prefixee > (accent thematique)
 *   - "blank"     : ligne vide (pour respiration)
 *
 * Le typewriter joue les lignes l'une apres l'autre. Vitesse adaptable
 * selon le type de ligne (les commandes tapees plus lentement, les outputs
 * en flash quasi-instantane pour rester fluide).
 *
 * IMPORTANT : ces scenarios sont des DEMOS NARRATIVES, ils ne sont pas
 * representatifs d'un audit reel. Aucune commande n'est reellement
 * exploitable, aucun resultat n'est tire d'un vrai client. Le but est de
 * demontrer la posture et le ton de Inaricom, pas de fournir un tutoriel.
 */

export type LineType =
    | 'command'
    | 'output'
    | 'info'
    | 'warn'
    | 'ok'
    | 'critical'
    | 'ai'
    | 'blank';

export interface DemoLine {
    type: LineType;
    text: string;
    /** Pause additionnelle (ms) APRES cette ligne, pour rythmer la demo */
    pauseAfterMs?: number;
}

export interface DemoScenario {
    id: string;
    label: string;
    /** Couleur de theme pour cet onglet : default=rouge, or=IA, bleu=institut */
    dataTheme: 'default' | 'or' | 'bleu' | 'vert';
    /** Sous-titre descriptif court sous l'onglet */
    tagline: string;
    /** Total approximatif (ms) pour info, calcule cote UI */
    lines: DemoLine[];
}

// ---------------------------------------------------------------------------
// Scenario 1 : Audit Red Team externe
// ---------------------------------------------------------------------------
const redteam: DemoScenario = {
    id: 'redteam',
    label: 'Audit Red Team',
    dataTheme: 'default',
    tagline: 'Reconnaissance externe + correlation IA',
    lines: [
        { type: 'command', text: 'inaricom-audit init --target=acme-pme.example --scope=external', pauseAfterMs: 250 },
        { type: 'info', text: 'Demarrage de l audit reconnaissance' },
        { type: 'info', text: 'Cible : acme-pme.example' },
        { type: 'info', text: 'Scope : surface externe uniquement', pauseAfterMs: 400 },
        { type: 'blank', text: '' },
        { type: 'command', text: 'nmap -sS -T4 --top-ports=200 acme-pme.example', pauseAfterMs: 200 },
        { type: 'output', text: 'PORT     STATE  SERVICE    VERSION' },
        { type: 'output', text: '22/tcp   open   ssh        OpenSSH 7.6 (obsolete)' },
        { type: 'output', text: '80/tcp   open   http       nginx 1.14' },
        { type: 'output', text: '443/tcp  open   https      nginx 1.14' },
        { type: 'critical', text: '3306/tcp open   mysql      MySQL 5.7 - expose au public', pauseAfterMs: 500 },
        { type: 'blank', text: '' },
        { type: 'warn', text: 'OpenSSH 7.6 : 4 CVE non patchees (CVE-2018-15473 inclus)' },
        { type: 'critical', text: 'MySQL accessible sans firewall - exfiltration BDD possible', pauseAfterMs: 600 },
        { type: 'blank', text: '' },
        { type: 'command', text: 'inaricom-ai correlate --findings=last --intel=cti-feeds', pauseAfterMs: 300 },
        { type: 'ai', text: 'Risque global : ELEVE (score 8.4 / 10)' },
        { type: 'ai', text: 'Vecteur principal : exfiltration BDD via 3306' },
        { type: 'ai', text: 'Recommandation #1 : isoler MySQL (firewall + IP allowlist)' },
        { type: 'ai', text: 'Recommandation #2 : mise a jour OpenSSH' },
        { type: 'ai', text: 'Priorite : P0 sous 48h', pauseAfterMs: 800 },
        { type: 'blank', text: '' },
        { type: 'ok', text: 'Rapport detaille genere : audit-acme-2026-04-25.pdf' },
    ],
};

// ---------------------------------------------------------------------------
// Scenario 2 : Detection IA d'anomalies dans les logs
// ---------------------------------------------------------------------------
const aidetect: DemoScenario = {
    id: 'aidetect',
    label: 'Detection IA',
    dataTheme: 'or',
    tagline: 'Analyse locale des logs, modele souverain',
    lines: [
        { type: 'command', text: 'inaricom-detect --logs=/var/log/auth.log --window=24h', pauseAfterMs: 250 },
        { type: 'info', text: 'Chargement de 12847 evenements' },
        { type: 'info', text: 'Modele : inari-detect-v2 (local, ne sort pas du serveur)' },
        { type: 'info', text: 'Feature : pas d envoi vers cloud externe', pauseAfterMs: 500 },
        { type: 'blank', text: '' },
        { type: 'output', text: 'Inference en cours...' },
        { type: 'output', text: '[##############################] 100 %', pauseAfterMs: 300 },
        { type: 'blank', text: '' },
        { type: 'ai', text: 'Anomalie #1 : 47 tentatives SSH depuis 185.x.x.x en 3 min' },
        { type: 'ai', text: 'Anomalie #2 : connexion legitime admin a 03:12 (heure inhabituelle)' },
        { type: 'ai', text: 'Anomalie #3 : elevation de privilege sur compte support', pauseAfterMs: 500 },
        { type: 'blank', text: '' },
        { type: 'critical', text: 'Pattern de credential stuffing detecte (confiance : 94 %)', pauseAfterMs: 400 },
        { type: 'warn', text: 'Compte support marque a auditer manuellement', pauseAfterMs: 400 },
        { type: 'blank', text: '' },
        { type: 'ai', text: 'Action #1 : bloquer 185.x.x.x via fail2ban' },
        { type: 'ai', text: 'Action #2 : forcer rotation des mots de passe' },
        { type: 'ai', text: 'Action #3 : MFA obligatoire sur compte support', pauseAfterMs: 700 },
        { type: 'blank', text: '' },
        { type: 'ok', text: 'Toutes les recommandations sont appliquables sans coupure de service' },
    ],
};

// ---------------------------------------------------------------------------
// Scenario 3 : Pentest API
// ---------------------------------------------------------------------------
const apitest: DemoScenario = {
    id: 'apitest',
    label: 'Pentest API',
    dataTheme: 'bleu',
    tagline: 'Test de surface API + priorisation IA',
    lines: [
        { type: 'command', text: 'inaricom-api-pentest --target=api.acme.com --auth=bearer-token', pauseAfterMs: 250 },
        { type: 'info', text: 'Decouverte de la specification (OpenAPI 3.1)' },
        { type: 'info', text: '47 endpoints documentes detectes', pauseAfterMs: 400 },
        { type: 'blank', text: '' },
        { type: 'ok', text: 'GET  /v1/users         : authentification OK' },
        { type: 'ok', text: 'GET  /v1/payments      : authentification OK' },
        { type: 'warn', text: 'GET  /v1/orders/:id    : IDOR detecte' },
        { type: 'output', text: '       └─ /v1/orders/123 accessible avec token user 456' },
        { type: 'critical', text: 'POST /v1/internal/exec : endpoint admin SANS authentification', pauseAfterMs: 600 },
        { type: 'blank', text: '' },
        { type: 'command', text: 'inaricom-ai prioritize --findings=last', pauseAfterMs: 300 },
        { type: 'ai', text: 'P0 : /v1/internal/exec - patch immediat requis' },
        { type: 'ai', text: 'P1 : /v1/orders IDOR - ajouter ACL par utilisateur' },
        { type: 'ai', text: 'P2 : 3 endpoints sans rate-limit - DoS possible', pauseAfterMs: 500 },
        { type: 'blank', text: '' },
        { type: 'ai', text: 'Estimation correctif : 1.5 j developpeur senior' },
        { type: 'ai', text: 'Tests de regression fournis avec le rapport', pauseAfterMs: 700 },
        { type: 'blank', text: '' },
        { type: 'ok', text: 'Rapport pret pour comite securite' },
    ],
};

export const DEMO_SCENARIOS: DemoScenario[] = [redteam, aidetect, apitest];
