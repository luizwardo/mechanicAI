import { StatusPill } from '../components/Shell'
import { Shell } from '../components/Shell'
import { getCare } from '../data/cares'
import { latestRecord, resolveCareStatus, statusHint, statusLabel } from '../logic/status'
import type { CareId, ServiceRecord, Vehicle } from '../types'

interface CareDetailProps {
  careId: CareId
  vehicle: Vehicle
  records: ServiceRecord[]
  onBack: () => void
  onAddToVisit: () => void
  onRegister: () => void
}

export function CareDetail({
  careId,
  vehicle,
  records,
  onBack,
  onAddToVisit,
  onRegister,
}: CareDetailProps) {
  const care = getCare(careId)
  if (!care) {
    return (
      <Shell title="Cuidado" onBack={onBack}>
        <p>Item não encontrado.</p>
      </Shell>
    )
  }

  const status = resolveCareStatus(care, vehicle, records)
  const last = latestRecord(records, careId)

  return (
    <Shell
      eyebrow="Cuidado"
      title={care.name}
      onBack={onBack}
      footer={
        <div className="dock-row">
          <button type="button" className="btn btn-primary" onClick={onAddToVisit}>
            Incluir na folha da visita
          </button>
          <button type="button" className="btn btn-ghost" onClick={onRegister}>
            Já fiz — registrar volta
          </button>
        </div>
      }
    >
      <div className="status-banner">
        <StatusPill status={status} label={statusLabel(status)} />
        <p>{statusHint(status)}</p>
      </div>

      <div className="detail-grid">
        <section className="block">
          <h2 className="section-title">Em uma frase</h2>
          <p className="plain">{care.plainPhrase}</p>
          <p className="muted">{care.whyItMatters}</p>
        </section>

        <section className="block">
          <h2 className="section-title">Comigo ou com a oficina?</h2>
          {care.diyOrShop === 'oficina' ? (
            <p>Isso é com a oficina. Leve a pergunta pronta e autorize só o que entender.</p>
          ) : (
            <p>{care.diyHint}</p>
          )}
        </section>

        <section className="block">
          <h2 className="section-title">Referência do manual (demo)</h2>
          <p>
            A cada cerca de <strong>{care.intervalKm.toLocaleString('pt-BR')} km</strong> ou{' '}
            <strong>{care.intervalMonths} meses</strong> — o que chegar primeiro. O mecânico confirma no
            seu motor.
          </p>
        </section>

        {last ? (
          <section className="block">
            <h2 className="section-title">Último registro seu</h2>
            <p>
              {new Date(last.date + 'T12:00:00').toLocaleDateString('pt-BR')} ·{' '}
              {last.km.toLocaleString('pt-BR')} km
              {last.notes ? ` · ${last.notes}` : ''}
            </p>
          </section>
        ) : (
          <section className="block">
            <h2 className="section-title">Ainda sem histórico</h2>
            <p className="note">
              Sem data ou km informado por você, não criamos lembrete de atraso. A pergunta é: já foi
              feito? Em que km? O que o manual pede?
            </p>
          </section>
        )}
      </div>
    </Shell>
  )
}
