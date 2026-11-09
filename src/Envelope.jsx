import { useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'

// url() dentro de variável CSS é resolvida a partir do CSS (assets/), não da página: precisa ser absoluta
const IMG = new URL(`${import.meta.env.BASE_URL}envelope/`, document.baseURI).href
const SELO = 1 // o sprite do selo está na mesma escala do selo da foto
const ABERTURA = 88 // graus que a aba sobe

// Envelope translúcido em tela cheia. Entra com fade; tocar no selo: a aba sobe com ele, o convite
// sai do bolso, e o papel dissolve (desfoque -> 0) antes de o convite entrar. onFim: terminou.
export default function Envelope({ onFim }) {
  const [aberto, setAberto] = useState(false)
  const [fit, setFit] = useState('') // área útil do envelope (60..514 x 188..862 da foto) cobrindo a tela

  useEffect(() => {
    const ajusta = () => {
      const W = innerWidth, H = innerHeight
      const sc = Math.max(W / 454, H / 674)
      setFit(`translate(${W / 2 - 287 * sc}px, ${H / 2 - 525 * sc}px) scale(${sc})`)
    }
    ajusta(); addEventListener('resize', ajusta)
    return () => removeEventListener('resize', ajusta)
  }, [])

  // Entrada: o envelope sobe rápido de baixo, para a "mão" do convidado, junto com o som do papel.
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = gsap.fromTo('.env-root', { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power3.out' })
    new Audio(`${import.meta.env.BASE_URL}som/papel.mp3`).play().catch(() => {}) // o toque no link liberou o áudio
    return () => t.kill()
  }, [])

  function abrir() {
    if (aberto) return
    setAberto(true)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return onFim()

    // O selo fica fora do 3D e acompanha a ponta da aba (rotateX com perspectiva 1700, ponto de fuga na dobra).
    const a = { p: 0 }
    const segue = () => {
      const r = (-ABERTURA * a.p * Math.PI) / 180, L = 332, D = 1700
      const s = D / (D + L * Math.sin(-r)) // a ponta recua => encolhe
      gsap.set('.env-seal', { y: L * Math.cos(r) * s - L, scale: SELO * s })
    }
    gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onFim })
      .set('.env-flap', { transformPerspective: 1700 }) // fixa: tween de perspectiva (0->1700) deslocaria a ponta da aba
      .set('.env-seal', { scale: SELO })
      // o selo afunda ao toque (a foto do selo cede lugar ao selo recortado no ponto mais baixo)
      .to('.env-seal', { scale: SELO * 0.95, duration: 0.1, ease: 'power1.out' }, 0)
      .set('.env-patch', { opacity: 0 }, 0.1)
      .to('.env-seal', { scale: SELO, duration: 0.12, ease: 'power1.out' }, 0.1)
      // aba e selo sobem juntos; brilho discreto passa pelo relevo
      .fromTo('.env-shimmer', { xPercent: -110 }, { xPercent: 110, duration: 1.4, ease: 'power1.inOut' }, 0.1)
      .to('.env-flap', { rotationX: -ABERTURA, duration: 1.6 }, 0.15)
      .to(a, { p: 1, duration: 1.6, onUpdate: segue }, 0.15)
      .to('.env-contact', { opacity: 1, scale: 1.25, duration: 0.9, ease: 'power1.out' }, 0.3)
      .to('.env-contact', { opacity: 0, duration: 0.7, ease: 'none' }, 1.3)
      .to(['.env-flap', '.env-seal'], { opacity: 0, duration: 0.4, ease: 'none' }, 1.8)
      // com a aba aberta, o convite sai do bolso (só aparece acima da borda em V do envelope)
      .fromTo('.env-carta', { y: 0 }, { y: -325, duration: 1.3, ease: 'power2.out' }, 1.0)
      // o papel dissolve: desfoque e opacidade vão a 0. Só depois o convite entra (onFim).
      .to('.env-vidro', { opacity: 0, backdropFilter: 'blur(0px)', duration: 0.7, ease: 'power1.inOut' }, 2.6)
      .to('.env-stage', { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, 2.6)
      .timeScale(2.2)
  }

  return (
    <div className="env-root">
      <div className="env-vidro" />
      <div className="env-stage" style={{ '--foto': `url(${IMG}foto.webp)`, '--selo': `url(${IMG}selo.webp)`, '--remendo': `url(${IMG}remendo.webp)` }}>
        <div className="env-fit" style={{ transform: fit }}>
          <div className="env-scene">
            <div className="env-interior" />
            <div className="env-base" />
            <div className="env-contact" />
            <div className="env-glow" />
            <div className="env-carta-clip">
              <div className="env-carta">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" />
                <p>“Assim, eles já não são dois, mas sim uma só carne. Portanto, o que Deus uniu, ninguém separe.”</p>
                <p>Mateus 19:6</p>
              </div>
            </div>
            <div className="env-flap">
              <div className="env-flap-img" />
            </div>
            <div className="env-seal" />
            <div className="env-shimmer" />
            <button className="env-patch" onClick={abrir} aria-label="Abrir o convite" />
          </div>
        </div>
      </div>
    </div>
  )
}
