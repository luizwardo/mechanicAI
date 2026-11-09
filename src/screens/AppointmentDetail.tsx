import { useState } from 'react'
import { Shell } from '../components/Shell'
import { getCare } from '../data/cares'
import { requestStatusLabel, whenLabel } from '../data/requests'
import { WORKSHOPS } from '../data/workshops'
import { confirmWindow, manageBlock, validateReschedule } from '../logic/appointments'
import type { ServiceRequest } from '../types'

const SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '11:00', '13:30', '14:30', '16:00', '17:30']

export function AppointmentDetail({
  request,
  onBack,
  onCancel,
  onConfirm,
  onReschedule,
}: {
  request: ServiceRequest
  onBack: () => void
  onCancel: () => void
  onConfirm: () => void
  onReschedule: (date: string, time: string) => void
}) {
  const workshop = WORKSHOPS.find((item) => item.id === request.workshopId)
  const cares = request.careIds.map((id) => getCare(id)?.name ?? id).join(' · ')
  const windowState = confirmWindow(request)
  const blocked = manageBlock(request)
  const [rescheduling, setRescheduling] = useState(false)
  const [askingCancel, setAskingCancel] = useState(false)
  const [date, setDate] = useState(request.date)
  const [time, setTime] = useState(request.time ?? '09:00')
  const [error, setError] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  function saveReschedule() {
    const invalid = validateReschedule(request, date, time)
    if (invalid) {
      setError(invalid)
      return
    }
    onReschedule(date, time)
    setRescheduling(false)
    setError(null)
  }

  return (
    <Shell
      eyebrow="Agendamento"
      title={workshop?.name ?? 'Oficina'}
      onBack={onBack}
      footer={
        blocked ? undefined : askingCancel ? (
          <div className="dock-row">
            <button type="button" className="btn btn-primary" onClick={onCancel}>
              Cancelar horário
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setAskingCancel(false)}>
              Manter agendamento
            </button>
          </div>
        ) : rescheduling ? (
          <button type="submit" form="reschedule-form" className="btn btn-primary">
            Salvar novo horário
          </button>
        ) : (
          <div className="dock-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={windowState.state !== 'open'}
              onClick={onConfirm}
            >
              {windowState.state === 'done' ? 'Presença confirmada' : 'Confirmar presença'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRescheduling(true)}>
              Remarcar
            </button>
            <button
              type="button"
              className="btn btn-ghost danger-outline"
              onClick={() => {
                setAskingCancel(true)
                setError(null)
              }}
            >
              Cancelar
            </button>
          </div>
        )
      }
    >
      <p className="plain">{whenLabel(request)}</p>
      <p className="helper tight">
        {workshop?.neighborhood ?? 'Oficina'} · {cares}
      </p>
      <p className="note">
        Situação: {requestStatusLabel(request.status)}
        {request.clientConfirmed ? ' · Presença confirmada' : ''}
      </p>

      {windowState.state === 'closed' && <p className="helper">{windowState.reason}</p>}
      {windowState.state === 'open' && (
        <p className="helper">Falta menos de 24 h. Confirme se você vai levar o carro nesse horário.</p>
      )}
      {windowState.state === 'done' && (
        <p className="helper">A oficina já sabe que você confirmou a presença.</p>
      )}
      {askingCancel && (
        <p className="error" role="alert">
          Cancelar tira este horário da agenda. A oficina deixa de esperar o carro.
        </p>
      )}

      {rescheduling && (
        <form
          id="reschedule-form"
          onSubmit={(event) => {
            event.preventDefault()
            saveReschedule()
          }}
        >
          <div className="form-grid">
            <label className="field">
              <span>Novo dia</span>
              <input type="date" value={date} min={today} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="field">
              <span>Novo horário</span>
              <select value={time} onChange={(event) => setTime(event.target.value)}>
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" className="text-btn" onClick={() => setRescheduling(false)}>
            Voltar sem remarcar
          </button>
        </form>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </Shell>
  )
}
