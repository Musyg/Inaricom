/**
 * Fallback CSS-only pour <Suspense fallback={<BackgroundSkeleton />}>.
 *
 * Affiche un dégradé radial subtil utilisant `var(--glow-soft)` qui mappe
 * automatiquement sur le theme courant via les CSS custom properties posées
 * par snippet 347 sur `[data-theme="X"]` / `body.theme-X`.
 *
 * Apparait instantanément (CSS pur, aucun JS), évite l'écran noir vide
 * pendant le chargement des chunks lazy backgrounds (3-6 KB par chunk +
 * Three.js 184 KB gz pour le theme vert). Le background lazy mount
 * APRES par dessus avec son propre fade-in 800ms via useMountFadeIn().
 *
 * Ordre visuel :
 *   1. Page mount → BackgroundSkeleton apparait instantanément (gradient theme)
 *   2. Chunks JS chargent en arrière-plan
 *   3. Background lazy mount → fade-in 800ms par dessus le skeleton
 *   4. Skeleton invisible derrière le canvas final
 */
export function BackgroundSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{
        // var(--glow-soft) est posée par snippet 347 selon [data-theme] :
        //   rouge   : rgba(227,30,36, 0.25)
        //   or      : rgba(255,215,0, 0.25)
        //   bleu    : rgba(0,129,242, 0.25)
        //   vert    : rgba(16,185,129, 0.25)
        //   neutre  : rgba(239,235,232, 0.08)
        // Fallback : rouge default 0.04 (très subtil) si tokens pas chargés.
        background:
          'radial-gradient(ellipse at top, var(--glow-soft, rgba(227,30,36,0.04)), transparent 60%)',
        zIndex: 0,
      }}
    />
  )
}
