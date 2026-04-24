import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { ParticleNeonGold } from '@/components/backgrounds/ParticleNeonGold'

// Page de test isolée pour ParticleNeonGold.
// 5 sections côte à côte, 1 seule a data-theme="or" → canvas attendu.
// Les 4 autres ne doivent rendre AUCUN canvas (return null).

type ThemeName = 'rouge' | 'or' | 'vert' | 'bleu'

function TestSection({
  theme,
  label,
  description,
}: {
  theme?: ThemeName
  label: string
  description: string
}) {
  const themeAttrs = theme ? { 'data-theme': theme } : {}
  return (
    <section
      {...themeAttrs}
      className="relative flex flex-col overflow-hidden bg-inari-black p-6"
      style={{ minHeight: '80vh' }}
    >
      <ParticleNeonGold />
      <div className="relative z-10 flex flex-1 flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inari-text-muted">
          {theme ? `data-theme="${theme}"` : '(pas de data-theme)'}
        </p>
        <h2 className="font-serif text-xl leading-tight text-inari-white">{label}</h2>
        <p className="text-xs leading-relaxed text-inari-text-soft">{description}</p>
      </div>
      <div className="relative z-10 mt-4">
        <span
          className="inline-flex items-center gap-2 rounded-sm border border-inari-border bg-inari-black-alt px-2 py-1 font-mono text-[10px] text-inari-accent"
        >
          accent = var(--inari-red)
        </span>
      </div>
    </section>
  )
}

function TestParticleNeonPage() {
  return (
    <main className="min-h-screen bg-inari-black text-inari-text">
      <header className="border-b border-inari-border px-6 py-5">
        <h1 className="font-serif text-2xl text-inari-white">
          Test · ParticleNeonGold <span className="text-inari-accent">(thème or uniquement)</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-inari-text-soft">
          Attendu : animation visible uniquement dans la colonne{' '}
          <code className="font-mono text-inari-accent">data-theme="or"</code>. Les 4 autres
          colonnes ne rendent aucun canvas.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-px bg-inari-border lg:grid-cols-5">
        <TestSection
          theme="rouge"
          label="Cybersec / Red Team"
          description="Canvas attendu absent"
        />
        <TestSection
          theme="or"
          label="IA"
          description="Canvas attendu, couleur = #FFD700, 5 centres multi-origines"
        />
        <TestSection theme="vert" label="Blog" description="Canvas attendu absent" />
        <TestSection theme="bleu" label="Institutionnel" description="Canvas attendu absent" />
        <TestSection
          label="Homepage (neutre, défaut)"
          description="Pas de data-theme — canvas attendu absent"
        />
      </div>
    </main>
  )
}

const root = document.getElementById('test-particle-neon-root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <TestParticleNeonPage />
    </StrictMode>,
  )
}
