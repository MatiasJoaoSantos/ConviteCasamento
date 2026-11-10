import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL
const FALAS = [
  'Opa!',
  'Ce ta bão?',
  'Seguinte...',
  'Ce tá recebendo esse convite porque nós gosta demais do cê',
  'Vão na nossa festa sô?',
  'Peraí... Xô parar de falar gíria e fazer um convite bonitinho',
]
const DIGITANDO_MS = 900 // "digitando..." antes de cada balão
const PAUSA_MS = 500 // respiro depois que o balão aparece

// Conversa de WhatsApp: balões à esquerda, empilhados, sem sumir. Depois da última fala surge o "link";
// tocar nele chama onFim (o envelope sobe).
export default function Dialogos({ onFim }) {
  const [n, setN] = useState(0) // balões já enviados
  const [link, setLink] = useState(false)
  const fim = useRef(null)

  useEffect(() => {
    if (n > FALAS.length) return
    const t = setTimeout(() => (n === FALAS.length ? setLink(true) : setN(n + 1)), DIGITANDO_MS + (n ? PAUSA_MS : 0))
    return () => clearTimeout(t)
  }, [n])
  // n chega a FALAS.length: mais uma rodada de "digitando" e então o link
  useEffect(() => { fim.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [n, link])

  const digitando = !link && n <= FALAS.length

  return (
    <div className="dialogos">
      <div className="chat">
        {FALAS.slice(0, n).map((f, i) => (
          <div key={i} className="msg">
            {i === 0 ? <img className="avatar" src={`${BASE}perfil.webp`} alt="" /> : <span className="avatar" />}
            <p className={i === 0 ? 'balao primeiro' : 'balao'}>{f}</p>
          </div>
        ))}
        {link && (
          <div className="msg">
            <span className="avatar" />
            <p className="balao"><button className="link" onClick={onFim}>convite</button></p>
          </div>
        )}
        {digitando && (
          <div className="msg">
            {n === 0 ? <img className="avatar" src={`${BASE}perfil.webp`} alt="" /> : <span className="avatar" />}
            <p className={n === 0 ? 'balao primeiro' : 'balao'} aria-label="digitando"><i className="ponto" /><i className="ponto" /><i className="ponto" /></p>
          </div>
        )}
        <div ref={fim} />
      </div>
    </div>
  )
}
