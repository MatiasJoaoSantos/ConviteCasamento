const LOCAL = 'Águas de Minas Eventos, Rua Esmeraldas, 113 - Pedra Azul, Contagem-MG'
const RSVP = 'https://forms.gle/JNCUWHWJMvHRPKZh6'
const PRESENTES = 'https://noivos.casar.com/sarah-e-matias'
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCAL)}`
// ponytail: fim do evento chutado (23h); ajustar quando souber.
const AGENDA = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
  action: 'TEMPLATE', text: 'Casamento Sarah e João', dates: '20261213T163000/20261213T230000',
  ctz: 'America/Sao_Paulo', location: LOCAL,
})

const Icone = ({ children }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

// Linhas aparecem de cima para baixo, em cascata (ver .convite > * no CSS).
export default function Convite() {
  return (
    <section className="convite">
      <img className="logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="JS" />
      <blockquote className="verso">
        “Assim, eles já não são dois, mas sim uma só carne. Portanto, o que Deus uniu, ninguém separe.”
        <cite>Mateus 19:6</cite>
      </blockquote>
      <p className="bencao">Com a bênção de Deus e de seus pais</p>
      <h1><i>S</i>arah <i>S</i>thefany <small>&amp;</small> <i>J</i>oão <i>M</i>atias</h1>
      <p className="convidam">Te convidamos para o nosso casamento</p>
      <div className="data">
        <time dateTime="2026-12-13T16:30" aria-label="Domingo, 13 de dezembro de 2026, às 16h30">
          <span className="mes">dezembro</span>
          <span className="dia">
            <span>Às 16h30</span>
            <span className="num"><strong>13</strong><span>2026</span></span>
            <span>Domingo</span>
          </span>
        </time>
        <a href={AGENDA} target="_blank" rel="noreferrer">Adicionar ao Google Agenda</a>
      </div>
      <div className="acoes">
        <a href={MAPS} target="_blank" rel="noreferrer">
          <Icone><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Icone>
          <span>Local</span>
        </a>
        <a href={RSVP} target="_blank" rel="noreferrer">
          <Icone><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12l1.5 1.5L14 10M9 17h6" /></Icone>
          <span>Confirme sua presença</span>
        </a>
        <a href={PRESENTES} target="_blank" rel="noreferrer">
          <Icone><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-4-5-4-5-1.5C7 8 9 8 12 8zM12 8c1.5-4 5-4 5-1.5C17 8 15 8 12 8z" /></Icone>
          <span>Lista de presentes</span>
        </a>
      </div>
    </section>
  )
}
