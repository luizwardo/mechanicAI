import { useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import { CARES, getCare } from '../data/cares'
import { WORKSHOPS } from '../data/workshops'
import { clearDraft, readDraft, writeDraft } from '../logic/draft'
import { validateSchedule } from '../logic/forms'
import type { CareId, Vehicle } from '../types'

interface VisitSheetProps {
  vehicle: Vehicle
  initialIds: CareId[]
  workshopId: string
  onWorkshopChange: (id: string) => void
  onBack: () => void
  onInvalid?: () => void
  onSchedule: (input: { workshopId: string; careIds: CareId[]; date: string; time: string }) => void
}

const SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '11:00', '13:30', '14:30', '16:00', '17:30']

export function VisitSheet({
  vehicle,
  initialIds,
  workshopId,
  onWorkshopChange,
  onBack,
  onInvalid,
  onSchedule,
}: VisitSheetProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [ids, setIds] = useState<CareId[]>(() => {
    const fallback = initialIds.length > 0 ? initialIds : (['oleo', 'pastilhas', 'correia'] as CareId[])
    const saved = readDraft('mechanicai-draft-visit', {
      ids: fallback,
      date: today,
      time: '09:00',
    })
    const known = new Set(CARES.map((care) => care.id))
    const savedIds = Array.isArray(saved.ids) ? saved.ids.filter((id): id is CareId => known.has(id)) : []
    const merged = [...savedIds, ...initialIds].filter((id, index, all) => all.indexOf(id) === index)
    return merged.length > 0 ? merged : fallback
  })
  const [date, setDate] = useState(() => readDraft('mechanicai-draft-visit', { date: today, ids, time: '09:00' }).date)
  const [time, setTime] = useState(
    () => readDraft('mechanicai-draft-visit', { time: '09:00', ids, date: today }).time,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeDraft('mechanicai-draft-visit', { ids, date, time })
  }, [ids, date, time])

  const selected = useMemo(() => ids.map((id) => getCare(id)).filter(Boolean), [ids])
  const workshop = WORKSHOPS.find((w) => w.id === workshopId)

  function toggle(id: CareId) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function schedule() {
    const invalid = validateSchedule({ workshopId, date, careCount: ids.length })
    if (invalid) {
      setError(invalid)
      onInvalid?.()
      return
    }
    const lines = [
      `mechanicAI — atendimento`,
      workshop ? workshop.name : 'Oficina',
      `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      `Km atual: ${vehicle.currentKm.toLocaleString('pt-BR')}`,
      `Data: ${date} às ${time}`,
      '',
      'Quero orçamento de:',
      ...selected.map((c) => `• ${c!.name}`),
    ]
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(lines.join('\n'))
    }
    clearDraft('mechanicai-draft-visit')
    onSchedule({ workshopId, careIds: ids, date, time })
  }

  return (
    <Shell
      eyebrow="Agendar"
      title="Atendimento"
      onBack={onBack}
      footer={
        <button type="submit" form="visit-form" className="btn btn-primary">
          Confirmar agendamento
        </button>
      }
    >
      <form
        id="visit-form"
        onSubmit={(event) => {
          event.preventDefault()
          schedule()
        }}
      >
      <div className="visit-layout">
        <div className="visit-main">
          <div className="visit-header">
            <p className="plain">
              {vehicle.model} {vehicle.year} · {vehicle.currentKm.toLocaleString('pt-BR')} km
            </p>
            <p className="helper tight">
              Escolha a oficina e o dia. O pedido fica na lista dessa oficina.
            </p>
          </div>

          <div className="form-grid">
            <label className="field field-span">
              <span>Oficina</span>
              <select
                value={workshopId}
                onChange={(e) => {
                  onWorkshopChange(e.target.value)
                  setError(null)
                }}
              >
                <option value="">Escolha para onde levar o carro</option>
                {WORKSHOPS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} · {w.neighborhood}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Dia</span>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="field">
              <span>Horário</span>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <section className="block">
            <h2 className="section-title">Pedir orçamento de</h2>
            <ul className="check-list">
              {CARES.map((care) => (
                <li key={care.id}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={ids.includes(care.id)}
                      onChange={() => toggle(care.id)}
                    />
                    <span>{care.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="block">
            <h2 className="section-title">Três perguntas fixas</h2>
            <ol className="q-list">
              <li>É urgente fazer agora?</li>
              <li>Quanto tempo o carro fica?</li>
              <li>O que está incluso no valor?</li>
            </ol>
          </section>
        </div>

        {selected.length > 0 && (
          <section className="block">
            <h2 className="section-title">Perguntas por item</h2>
            <div className="q-grid">
              {selected.map((care) => (
                <div key={care!.id} className="q-card">
                  <h3>{care!.name}</h3>
                  <ul>
                    {care!.visitQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      </form>
    </Shell>
  )
}
