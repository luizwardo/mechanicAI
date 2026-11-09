import { StatusPill } from '../components/Shell'
import { getCare } from '../data/cares'
import { dayHeading, requestPill, requestStatusLabel, whenLabel } from '../data/requests'
import type { ServiceRequest } from '../types'

interface ProviderInboxProps {
  mode: 'solicitacoes' | 'agenda'
  workshopName: string
  requests: ServiceRequest[]
  onOpen: (id: string) => void
}

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

export function ProviderInbox({ mode, workshopName, requests, onOpen }: ProviderInboxProps) {
  const booked = requests.filter((r) => r.status === 'aceita' || r.status === 'concluida').sort(byTime)
  const visible =
    mode === 'agenda'
      ? booked
      : [...requests].sort((a, b) => {
          const rank = { nova: 0, aceita: 1, concluida: 2, recusada: 3 }
          return rank[a.status] - rank[b.status] || byTime(a, b)
        })
  const days = [...new Set(booked.map((r) => r.date))]

  const novas = requests.filter((r) => r.status === 'nova').length

  return (
    <div className="shell shell-with-hotbar">
      <header className="topbar">
        <span className="brand-mark" aria-hidden>
          mAI
        </span>
        <div className="topbar-text">
          <p className="eyebrow">{mode === 'agenda' ? 'Agenda' : 'Solicitações'}</p>
          <h1 className="screen-title">{workshopName}</h1>
        </div>
      </header>

      <main className="content">
        {mode === 'solicitacoes' && (
          <section className="home-stats" role="list" aria-label="Resumo das solicitações">
            <div className="home-stat" role="listitem">
              <strong>{novas}</strong>
              <span>Novas</span>
            </div>
            <div className="home-stat" role="listitem">
              <strong>{requests.filter((r) => r.status === 'aceita').length}</strong>
              <span>Aceitas</span>
            </div>
            <div className="home-stat" role="listitem">
              <strong>{requests.filter((r) => r.status === 'concluida').length}</strong>
              <span>Concluídas</span>
            </div>
          </section>
        )}

        {mode === 'agenda' ? (
          booked.length === 0 ? (
            <div className="empty">
              <p>Nenhum horário marcado.</p>
              <p className="muted">Os pedidos aceitos aparecem aqui, no horário combinado.</p>
            </div>
          ) : (
            days.map((day) => (
              <section className="block" key={day}>
                <h2 className="section-title">{dayHeading(day)}</h2>
                <ul className="slot-list">
                  {booked
                    .filter((request) => request.date === day)
                    .map((request) => (
                      <li key={request.id}>
                        <button type="button" className="slot-row" onClick={() => onOpen(request.id)}>
                          <span className="slot-time">{request.time ?? '—'}</span>
                          <span className="slot-body">
                            <strong>{request.clientName}</strong>
                            <span>
                              {request.vehicleLabel} · {careLine(request)}
                            </span>
                          </span>
                          <StatusPill
                            status={requestPill(request.status)}
                            label={requestStatusLabel(request.status)}
                          />
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            ))
          )
        ) : visible.length === 0 ? (
          <div className="empty">
            <p>Nenhuma solicitação nesta oficina.</p>
            <p className="muted">Quando um cliente agendar aqui, o pedido aparece nesta lista.</p>
          </div>
        ) : (
          <ul className="workshop-list">
            {visible.map((request) => (
              <li key={request.id}>
                <button type="button" className="workshop-card" onClick={() => onOpen(request.id)}>
                  <div className="workshop-top">
                    <h2>{request.clientName}</h2>
                    <StatusPill status={requestPill(request.status)} label={requestStatusLabel(request.status)} />
                  </div>
                  <p className="muted">
                    {request.vehicleLabel} · {request.km.toLocaleString('pt-BR')} km
                  </p>
                  <p className="workshop-meta">
                    <span>{whenLabel(request)}</span>
                    <span>{careLine(request)}</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
