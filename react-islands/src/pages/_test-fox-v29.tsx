import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { FoxAnimationV29 } from '@/components/hero/FoxAnimationV29'

// Page de test isolee pour FoxAnimationV29.
// Section plein viewport, fond noir, data-theme="neutre" par defaut.
// 5 boutons togglent data-theme sur la section pour valider les couleurs live
// (primary + companions + comets recoivent le lerp v28).

type ThemeName = 'rouge' | 'or' | 'vert' | 'bleu' | 'neutre'

const THEMES: Array<{ key: ThemeName; label: string }> = [
  { key: 'rouge', label: 'rouge' },
  { key: 'or', label: 'or' },
  { key: 'vert', label: 'vert' },
  { key: 'bleu', label: 'bleu' },
  { key: 'neutre', label: 'neutre' },
]

function TestFoxV29Page() {
  const [theme, setTheme] = useState<ThemeName>('neutre')

  return (
    <main className="min-h-screen bg-inari-black text-inari-text">
      <header className="fixed left-0 right-0 top-0 z-20 flex flex-wrap items-center gap-3 border-b border-inari-border bg-inari-black/80 px-6 py-3 backdrop-blur">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-inari-text-muted">
          test · FoxAnimationV29
        </span>
        <span className="font-mono text-[11px] text-inari-text-soft">
          theme = <code className="text-inari-accent">{theme}</code>
        </span>
        <div className="ml-auto flex items-center gap-2">
          {THEMES.map((t) => {
            const active = t.key === theme
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={`rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-inari-accent bg-inari-accent/15 text-inari-accent'
                    : 'border-inari-border bg-inari-black-alt text-inari-text-soft hover:border-inari-accent/60 hover:text-inari-text'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </header>

      <section
        data-theme={theme}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-inari-black"
      >
        <FoxAnimationV29 />
        <div className="relative z-10 max-w-xl px-6 pt-20 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inari-text-muted">
            data-theme="{theme}"
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-inari-white">
            Fox v29 · comet rain
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-inari-text-soft">
            Trace v28 fidele (stitch + revealed line + sparks + materialize) avec
            un essaim de particules qui surgit hors champ avant chaque beam.
            Les 5 boutons rebasculent le theme — lignes, sparks, comets et
            companions heritent du lerp v28.
          </p>
        </div>
      </section>
    </main>
  )
}

const root = document.getElementById('test-fox-v29-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <TestFoxV29Page />
    </StrictMode>,
  )
}
