import { useState } from 'react'
import { Shell } from '../components/Shell'
import { getCare } from '../data/cares'
import type { CareId, ServiceRecord, Vehicle } from '../types'

interface RegisterServiceProps {
  careId: CareId
  vehicle: Vehicle
  onBack: () => void
  onSave: (record: Omit<ServiceRecord, 'id'>) => void
}

export function RegisterService({ careId, vehicle, onBack, onSave }: RegisterServiceProps) {
  const care = getCare(careId)
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [km, setKm] = useState(String(vehicle.currentKm))
  const [notes, setNotes] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const kmNum = Number(km.replace(/\D/g, ''))
    if (!date || !kmNum) {
      setError('Data e quilometragem são obrigatórias para criar o lembrete.')
      return
    }
    if (kmNum > vehicle.currentKm) {
      setError('A km do serviço não pode ser maior que a km atual do carro.')
      return
    }
    const valueNum = value.trim() ? Number(value.replace(',', '.')) : undefined
    onSave({
      careId,
      date,
      km: kmNum,
      notes: notes.trim() || undefined,
      value: valueNum && !Number.isNaN(valueNum) ? valueNum : undefined,
    })
  }

  return (
    <Shell
      eyebrow="Volta da oficina"
      title={care?.name ?? 'Registrar'}
      onBack={onBack}
      footer={
        <button type="button" className="btn btn-primary" onClick={submit}>
          Salvar registro
        </button>
      }
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
    </Shell>
  )
}
