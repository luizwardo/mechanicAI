import { useEffect, useState } from 'react'
import { Shell } from '../components/Shell'
import { getCare } from '../data/cares'
import { clearDraft, readDraft, writeDraft } from '../logic/draft'
import { validateService } from '../logic/forms'
import type { CareId, ServiceRecord, Vehicle } from '../types'

interface RegisterServiceProps {
  careId: CareId
  vehicle: Vehicle
  onBack: () => void
  onInvalid?: () => void
  onSave: (record: Omit<ServiceRecord, 'id'>) => void
}

export function RegisterService({ careId, vehicle, onBack, onInvalid, onSave }: RegisterServiceProps) {
  const care = getCare(careId)
  const today = new Date().toISOString().slice(0, 10)
  const draftKey = `mechanicai-draft-register-${careId}`
  const saved = readDraft(draftKey, { date: today, km: String(vehicle.currentKm), notes: '', value: '' })
  const [date, setDate] = useState(saved.date)
  const [km, setKm] = useState(saved.km)
  const [notes, setNotes] = useState(saved.notes)
  const [value, setValue] = useState(saved.value)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeDraft(draftKey, { date, km, notes, value })
  }, [draftKey, date, km, notes, value])

  function submit() {
    const result = validateService({ date, kmRaw: km, currentKm: vehicle.currentKm, valueRaw: value })
    if ('error' in result) {
      setError(result.error)
      onInvalid?.()
      return
    }
    clearDraft(draftKey)
    onSave({
      careId,
      date: result.date,
      km: result.km,
      notes: notes.trim() || undefined,
      value: result.value,
    })
  }

  return (
    <Shell
      eyebrow="Volta da oficina"
      title={care?.name ?? 'Registrar'}
      onBack={onBack}
      footer={
        <button type="submit" form="register-form" className="btn btn-primary">
          Salvar registro
        </button>
      }
    >
      <form
        id="register-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
      <p className="helper">
        O lembrete só existe depois deste passo. Sem data ou km, o app não inventa vencimento.
      </p>

      <div className="form-grid">
        <label className="field">
          <span>Data do serviço</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
        </label>

        <label className="field">
          <span>Km no dia do serviço</span>
          <input inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} />
        </label>

        <label className="field">
          <span>Valor em R$ (opcional)</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex.: 350"
          />
        </label>

        <label className="field field-span">
          <span>Observação (opcional)</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: trocaram óleo 5W40 e filtro"
          />
        </label>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      </form>
    </Shell>
  )
}
