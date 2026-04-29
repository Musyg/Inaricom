import { useEffect, useState } from 'react'

/**
 * Retourne `true` après que React ait monté ET peint un premier frame avec
 * la valeur initiale `false`. Utiliser pour faire un fade-in opacity sur
 * les composants qui apparaissent brutalement au mount (canvas backgrounds
 * notamment).
 *
 * Pattern :
 *   const visible = useMountFadeIn()
 *   <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 800ms ease-out' }}>
 *
 * Double RAF : le 1er rAF s'execute apres que React ait posé le DOM, le
 * 2eme apres que le browser ait peint (donc le frame opacity:0 est passé
 * sur la stage). Le setState declenche un re-render qui passe a opacity:1
 * et le transition CSS se déclenche.
 */
export function useMountFadeIn(): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  return visible
}
