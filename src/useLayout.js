import { useSyncExternalStore } from 'react'

// 'vertical' (celular/tablet ou qualquer janela mais alta que larga) ou 'horizontal' (desktop, janela deitada).
// Só o toque não basta: alguns celulares/navegadores (modo "site para computador", mouse conectado) não se
// declaram touch, caíam no layout de desktop e o convite saía minúsculo. A proporção da tela decide junto.
// Para testar: ?layout=vertical ou ?layout=horizontal na URL.
const mqs = [matchMedia('(hover: none) and (pointer: coarse)'), matchMedia('(orientation: portrait)')]
const forcado = new URLSearchParams(location.search).get('layout')

export default function useLayout() {
  const vertical = useSyncExternalStore(
    (cb) => (mqs.forEach((m) => m.addEventListener('change', cb)), () => mqs.forEach((m) => m.removeEventListener('change', cb))),
    () => mqs.some((m) => m.matches),
  )
  return forcado || (vertical ? 'vertical' : 'horizontal')
}
