import { Shell, StatusPill } from '../components/Shell'
import { getCare } from '../data/cares'
import { requestPill, requestStatusLabel, whenLabel } from '../data/requests'
import type { RequestStatus, ServiceRequest } from '../types'

interface ProviderRequestProps {
  request: ServiceRequest
  workshopName: string
  onBack: () => void
  onStatus: (status: RequestStatus) => void
}

export function ProviderRequest({ request, workshopName, onBack, onStatus }: ProviderRequestProps) {
  return (
    <Shell
      eyebrow={workshopName}
      title={request.clientName}
      onBack={onBack}
      footer={
        request.status === 'nova' ? (
          <div className="dock-row">
            <button type="button" className="btn btn-primary" onClick={() => onStatus('aceita')}>
              Aceitar
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onStatus('recusada')}>
              Recusar
            </button>
          </div>
        ) : request.status === 'aceita' ? (
          <button type="button" className="btn btn-primary" onClick={() => onStatus('concluida')}>
            Marcar como feito
          </button>
        ) : undefined
      }
    >
      <div className="status-banner">
        <StatusPill status={requestPill(request.status)} label={requestStatusLabel(request.status)} />
        <p>
          {whenLabel(request)} · {request.vehicleLabel} · {request.km.toLocaleString('pt-BR')} km
        </p>
      </div>

      <section className="block">
        <h2 className="section-title">O que o cliente pediu</h2>
        <ul className="q-list">
          {request.careIds.map((id) => (
            <li key={id}>{getCare(id)?.name ?? id}</li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2 className="section-title">Perguntas que ele leva</h2>
        <ol className="q-list">
          <li>É urgente fazer agora?</li>
          <li>Quanto tempo o carro fica?</li>
          <li>O que está incluso no valor?</li>
        </ol>
      </section>
    </Shell>
  )
}
