/**
 * TechDemo : section "demo technique vivante" de la homepage Inaricom.
 *
 * 3 scenarios : Audit Red Team / Detection IA / Pentest API. Chaque scenario
 * adopte son propre data-theme (default rouge / or / bleu) localement, ce qui
 * fait basculer automatiquement les couleurs accent (var(--inari-red)) du
 * terminal et de l onglet actif.
 *
 * Strategie d animation :
 *   - typewriter pur React, sans deps externes
 *   - chaque char ajoute via setTimeout enchaine (cancelable au cleanup)
 *   - vitesse adaptable selon le type de ligne (commande tapee plus lentement)
 *   - IntersectionObserver pour demarrer auto quand 30 % visible
 *   - key={scenario.id} sur Terminal pour reset complet au switch d onglet
 *
 * Posture visuelle : glassmorphism container, mono Geist Mono, fond sombre
 * legerement translucide pour laisser respirer le background du Hero.
 *
 * IMPORTANT : les scenarios sont des demos narratives, ils ne sont pas
 * representatifs d un audit reel. Aucune commande exploitable.
 */

import { useEffect, useRef, useState } from 'react';
import {
    DEMO_SCENARIOS,
    type DemoLine,
    type DemoScenario,
    type LineType,
} from './demo-scenarios';

// ---------------------------------------------------------------------------
// Vitesse de typing par type de ligne (ms par char)
// ---------------------------------------------------------------------------
const SPEED_MS: Record<LineType, number> = {
    command: 32,
    output: 2,
    info: 2,
    warn: 2,
    ok: 2,
    critical: 4,
    ai: 6,
    blank: 0,
};

// Pause par defaut entre chaque ligne (ms)
const INTERLINE_PAUSE_MS = 90;

// ---------------------------------------------------------------------------
// Couleur Tailwind par type de ligne
// ---------------------------------------------------------------------------
const TYPE_COLOR_CLASS: Record<LineType, string> = {
    command: 'text-inari-text',
    output: 'text-inari-text-soft',
    info: 'text-inari-text-muted',
    warn: 'text-amber-400',
    ok: 'text-emerald-400',
    critical: 'text-rose-400',
    ai: 'text-inari-accent',
    blank: '',
};

// ---------------------------------------------------------------------------
// Prefix visuel par type
// ---------------------------------------------------------------------------
function linePrefix(type: LineType): string {
    switch (type) {
        case 'command':
            return '$ ';
        case 'info':
            return '[INFO]    ';
        case 'warn':
            return '[WARN]    ';
        case 'ok':
            return '[OK]      ';
        case 'critical':
            return '[CRITIQUE] ';
        case 'ai':
            return '> ';
        default:
            return '';
    }
}

// ===========================================================================
// Sub-composant : Terminal
// ===========================================================================
interface TerminalProps {
    scenario: DemoScenario;
    isPlaying: boolean;
    onDone: () => void;
}

function Terminal({ scenario, isPlaying, onDone }: TerminalProps) {
    // Index courant dans la liste des lignes
    const [lineIdx, setLineIdx] = useState(0);
    // Index courant du char DANS la ligne en cours de typing
    const [charIdx, setCharIdx] = useState(0);
    // Quand toutes les lignes sont jouees
    const [done, setDone] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    // === Typewriter loop ===
    useEffect(() => {
        if (!isPlaying || done) return;
        if (lineIdx >= scenario.lines.length) {
            setDone(true);
            onDone();
            return;
        }

        const currentLine: DemoLine = scenario.lines[lineIdx];
        const fullText = currentLine.text;

        // Cas ligne vide ou type sans typing : on passe direct a la suivante
        if (currentLine.type === 'blank' || fullText.length === 0) {
            timeoutRef.current = window.setTimeout(() => {
                setLineIdx((i) => i + 1);
                setCharIdx(0);
            }, currentLine.pauseAfterMs ?? 60);
            return cleanup;
        }

        // Si la ligne n est pas encore finie : on tape le char suivant
        if (charIdx < fullText.length) {
            const speed = SPEED_MS[currentLine.type] ?? 6;
            timeoutRef.current = window.setTimeout(() => {
                setCharIdx((c) => c + 1);
            }, speed);
            return cleanup;
        }

        // Ligne finie : pause inter-ligne (avec extra si pauseAfterMs)
        const interPause =
            INTERLINE_PAUSE_MS + (currentLine.pauseAfterMs ?? 0);
        timeoutRef.current = window.setTimeout(() => {
            setLineIdx((i) => i + 1);
            setCharIdx(0);
        }, interPause);
        return cleanup;

        function cleanup() {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [lineIdx, charIdx, isPlaying, scenario.lines, done, onDone]);

    // Auto-scroll vers le bas a chaque nouvelle ligne / char
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [lineIdx, charIdx]);

    return (
        <div
            ref={scrollRef}
            className="relative h-[460px] overflow-y-auto rounded-b-2xl bg-inari-black-alt/80 px-5 py-5 font-mono text-[13px] leading-relaxed sm:text-sm"
            // role + aria-live pour accessibilite : SR-friendly
            role="log"
            aria-live="polite"
            aria-busy={!done}
        >
            {scenario.lines.slice(0, lineIdx + 1).map((line, idx) => {
                const isCurrent = idx === lineIdx;
                const renderedText = isCurrent
                    ? line.text.slice(0, charIdx)
                    : line.text;
                const showCaret = isCurrent && !done;
                const prefix = linePrefix(line.type);

                if (line.type === 'blank' && !isCurrent) {
                    return <div key={idx} className="h-4" aria-hidden="true" />;
                }

                if (line.type === 'command') {
                    return (
                        <div key={idx} className={`${TYPE_COLOR_CLASS.command}`}>
                            <span className="text-inari-accent">$</span>{' '}
                            <span>{renderedText}</span>
                            {showCaret && <Caret />}
                        </div>
                    );
                }

                return (
                    <div key={idx} className={TYPE_COLOR_CLASS[line.type]}>
                        {prefix && (
                            <span className="opacity-90">{prefix}</span>
                        )}
                        <span>{renderedText}</span>
                        {showCaret && <Caret />}
                    </div>
                );
            })}
        </div>
    );
}

// Curseur clignotant (caret terminal)
function Caret() {
    return (
        <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-[1em] w-[0.6ch] -translate-y-[1px] animate-pulse bg-inari-accent align-middle"
        />
    );
}

// ===========================================================================
// Composant principal : TechDemo
// ===========================================================================
export function TechDemo() {
    const [activeId, setActiveId] = useState<string>(DEMO_SCENARIOS[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasAutoStarted, setHasAutoStarted] = useState(false);

    const sectionRef = useRef<HTMLDivElement>(null);

    const active =
        DEMO_SCENARIOS.find((s) => s.id === activeId) ?? DEMO_SCENARIOS[0];

    // Auto-start a 30 % visible
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || hasAutoStarted) return;
        const obs = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setIsPlaying(true);
                        setHasAutoStarted(true);
                        obs.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.3 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasAutoStarted]);

    const handleSwitch = (id: string) => {
        if (id === activeId) return;
        setActiveId(id);
        setIsPlaying(true);
    };

    const handleReplay = () => {
        setIsPlaying(true);
        // Pour forcer le remount du Terminal (typewriter reset), on bump la key
        // a travers un compteur :
        setReplayNonce((n) => n + 1);
    };

    const [replayNonce, setReplayNonce] = useState(0);
    const terminalKey = `${active.id}-${replayNonce}`;

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32"
            aria-labelledby="techdemo-title"
        >
            {/* Subtle radial highlight derriere le terminal pour le faire popper */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 30%, rgba(227, 30, 36, 0.08), transparent 60%)',
                }}
            />

            <div className="mx-auto max-w-[1360px]">
                {/* Eyebrow */}
                <div className="flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="h-px w-10 bg-inari-border"
                    />
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-inari-text-muted">
                        D&eacute;mo technique
                    </p>
                </div>

                {/* H2 */}
                <h2
                    id="techdemo-title"
                    className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-inari-white sm:text-5xl lg:text-6xl"
                >
                    Voyez ce que fait{' '}
                    <em className="not-italic text-inari-accent">
                        un audit Inaricom
                    </em>
                    , pas ce qu&rsquo;il promet.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-inari-text-soft sm:text-lg">
                    Trois extraits authentiques de notre m&eacute;thodologie :
                    reconnaissance offensive, d&eacute;tection IA locale,
                    audit d&rsquo;API. D&eacute;mos simul&eacute;es,
                    techniques r&eacute;elles.
                </p>

                {/* Tabs scenarios */}
                <div
                    role="tablist"
                    aria-label="Sc&eacute;narios de d&eacute;mo"
                    className="mt-10 flex flex-wrap gap-2 sm:gap-3"
                >
                    {DEMO_SCENARIOS.map((s) => {
                        const isActive = s.id === active.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => handleSwitch(s.id)}
                                className={[
                                    'group inline-flex flex-col items-start rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-inari-black',
                                    isActive
                                        ? 'border-white/[0.15] bg-white/[0.06]'
                                        : 'border-white/[0.08] bg-transparent hover:border-white/[0.12] hover:bg-white/[0.04]',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'font-sans text-sm font-medium',
                                        isActive
                                            ? 'text-inari-white'
                                            : 'text-inari-text',
                                    ].join(' ')}
                                >
                                    {s.label}
                                </span>
                                <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted">
                                    {s.tagline}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Terminal container */}
                <div
                    className="mt-8 overflow-hidden rounded-2xl border border-inari-border bg-inari-black-alt/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md"
                >
                    {/* Barre de fenetre style mac (decorative) */}
                    <div className="flex items-center justify-between border-b border-inari-border bg-inari-black-light/60 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <span className="block h-3 w-3 rounded-full bg-rose-400/60" />
                            <span className="block h-3 w-3 rounded-full bg-amber-400/60" />
                            <span className="block h-3 w-3 rounded-full bg-emerald-400/60" />
                        </div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
                            inaricom-shell &mdash; {active.id}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReplay}
                                className="rounded border border-white/[0.08] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted transition hover:border-[#E31E24] hover:text-[#E31E24] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E31E24]"
                                aria-label="Rejouer la d&eacute;mo"
                            >
                                Rejouer
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPlaying((p) => !p)}
                                className="rounded border border-white/[0.08] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inari-text-muted transition hover:border-[#E31E24] hover:text-[#E31E24] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E31E24]"
                                aria-pressed={!isPlaying}
                                aria-label={
                                    isPlaying
                                        ? 'Mettre en pause'
                                        : 'Reprendre'
                                }
                            >
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                        </div>
                    </div>

                    {/* Le terminal lui-meme */}
                    <Terminal
                        key={terminalKey}
                        scenario={active}
                        isPlaying={isPlaying}
                        onDone={() => {
                            /* hook reserve pour effets futurs (ex: confetti) */
                        }}
                    />
                </div>

                {/* Footer disclosure + CTA */}
                <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-inari-text-muted">
                        D&eacute;mo simul&eacute;e &middot; Aucune cible r&eacute;elle &middot;
                        Output narratif
                    </p>
                    <a
                        href="/services-cybersecurite/"
                        className="group inline-flex items-center gap-2 font-sans text-sm text-inari-text transition hover:text-inari-accent"
                    >
                        Lancer un vrai audit
                        <span
                            aria-hidden="true"
                            className="transition group-hover:translate-x-0.5"
                        >
                            &rarr;
                        </span>
                    </a>
                </div>
            </div>
        </section>
    );
}
