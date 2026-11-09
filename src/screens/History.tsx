import { Shell } from '../components/Shell'
import { getCare } from '../data/cares'
import type { ServiceRecord } from '../types'

interface HistoryProps {
  records: ServiceRecord[]
  onBack: () => void
}

export function History({ records, onBack }: HistoryProps) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km)

  return (
    <Shell eyebrow="Histórico" title="O que já foi feito" onBack={onBack}>
      {sorted.length === 0 ? (
        <div className="empty">
          <p>Ainda não há registros.</p>
          <p className="muted">
            Depois da oficina, grave data e km. É isso que libera o lembrete da próxima referência.
          </p>
        </div>
      ) : (
        <ul className="history-list">
          {sorted.map((r) => {
            const care = getCare(r.careId)
            return (
              <li key={r.id} className="history-item">
                <h3>{care?.name ?? r.careId}</h3>
                <p>
                  {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')} ·{' '}
                  {r.km.toLocaleString('pt-BR')} km
                </p>
                {r.notes && <p className="muted">{r.notes}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </Shell>
  )
}
