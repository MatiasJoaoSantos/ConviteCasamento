import pecas from './vinhetaPecas'

// Peças (flores, folhas, galhos) geradas por scripts/vinheta.py a partir do modelo. Cada metade fica colada na sua borda
// (altura da tela), e as peças entram uma a uma, em atraso fixo, compondo a moldura aos poucos.
const atraso = (i) => ((i * 7919) % 100) / 100 * 0.8

export default function Vinheta() {
  return (
    <div className="vinheta" aria-hidden="true">
      {[0, 1].map((lado) => (
        <div key={lado} className={lado ? 'lado dir' : 'lado esq'}>
          {pecas.map((p, i) => p.lado === lado && (
            <img key={p.n} src={`${import.meta.env.BASE_URL}vinheta/${p.n}.webp`} alt="" draggable="false"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`,
                '--ox': lado ? 1 : -1, '--oy': 0, animationDelay: `${atraso(i)}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
