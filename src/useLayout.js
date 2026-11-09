import { useSyncExternalStore } from 'react'

// Aparelho de toque (celular/tablet) => 'vertical'; mouse (desktop) => 'horizontal'.
// Decide pelo aparelho, não pela largura da janela: janela estreita/zoom no desktop continua horizontal.
// Para testar: ?layout=vertical ou ?layout=horizontal na URL.
const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
const forcado = new URLSearchParams(location.search).get('layout')

export default function useLayout() {
  const toque = useSyncExternalStore(
    (cb) => (mq.addEventListener('change', cb), () => mq.removeEventListener('change', cb)),
    () => mq.matches,
  )
  return forcado || (toque ? 'vertical' : 'horizontal')
}
