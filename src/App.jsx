import { useEffect, useState } from 'react'
import useLayout from './useLayout'
import Vinheta from './Vinheta'
import Dialogos from './Dialogos'
import Convite from './Convite'
import Envelope from './Envelope'

export default function App() {
  const layout = useLayout()
  const [etapa, setEtapa] = useState('dialogos')
  // o chat fica por baixo enquanto o envelope sobe; sai de cena quando o envelope já cobriu a tela
  const [chat, setChat] = useState(true)
  useEffect(() => {
    if (etapa === 'dialogos') return
    const t = setTimeout(() => setChat(false), 700)
    return () => clearTimeout(t)
  }, [etapa])
  return (
    <main className={`page ${layout}`}>
      <Vinheta />
      {chat && etapa !== 'convite' && <Dialogos onFim={() => etapa === 'dialogos' && setEtapa('envelope')} />}
      {etapa === 'envelope' && <Envelope onFim={() => setEtapa('convite')} />}
      {etapa === 'convite' && <Convite />}
    </main>
  )
}
