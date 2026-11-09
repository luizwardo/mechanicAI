import { StatusPill } from '../components/Shell'
import { getCare } from '../data/cares'
import { dayHeading, requestPill, requestStatusLabel } from '../data/requests'
import { WORKSHOPS } from '../data/workshops'
import type { ServiceRequest } from '../types'

function careLine(request: ServiceRequest) {
  return request.careIds.map((id) => getCare(id)?.name ?? id).join(' · ')
}

function byTime(a: ServiceRequest, b: ServiceRequest) {
  const date = a.date.localeCompare(b.date)
  if (date !== 0) return date
  if (!a.time) return 1
  if (!b.time) return -1
  return a.time.localeCompare(b.time)
}

export function MyAppointments({
  requests,
  onOpen,
}: {
  requests: ServiceRequest[]
  onOpen: (id: string) => void
}) {
  const mine = [...requests].sort(byTime)
  const days = [...new Set(mine.map((request) => request.date))]

  return (
    <div className="shell shell-with-hotbar">
      <header className="topbar">
        <span className="brand-mark" aria-hidden>
          mAI
        </span>
        <div className="topbar-text">
          <p className="eyebrow">Cliente</p>
          <h1 className="screen-title">Meus agendamentos</h1>
        </div>
      </header>

      <main className="content">
        {mine.length === 0 ? (
          <div className="empty">
            <p>Nenhum agendamento ainda.</p>
            <p className="muted">No Início, escolha a oficina e confirme o atendimento. Ele aparece aqui.</p>
          </div>
        ) : (
          days.map((day) => (
            <section className="block" key={day}>
              <h2 className="section-title">{dayHeading(day)}</h2>
              <ul className="slot-list">
                {mine
                  .filter((request) => request.date === day)
                  .map((request) => {
                    const workshop = WORKSHOPS.find((item) => item.id === request.workshopId)
                    return (
                      <li key={request.id}>
                        <button type="button" className="slot-row" onClick={() => onOpen(request.id)}>
                          <span className="slot-time">{request.time ?? '—'}</span>
                          <span className="slot-body">
                            <strong>{workshop?.name ?? 'Oficina'}</strong>
                            <span>{workshop?.neighborhood ?? 'Horário combinado'}</span>
                            <span>
                              {careLine(request)}
                              {request.clientConfirmed ? ' · Presença confirmada' : ''}
                            </span>
                          </span>
                          <StatusPill
                            status={requestPill(request.status)}
                            label={requestStatusLabel(request.status)}
                          />
                        </button>
                      </li>
                    )
                  })}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  )
}
