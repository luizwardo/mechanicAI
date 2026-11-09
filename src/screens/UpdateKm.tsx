import { useEffect, useState } from 'react'
import { Shell } from '../components/Shell'
import { clearDraft, readDraft, writeDraft } from '../logic/draft'
import { validateKmUpdate } from '../logic/forms'
import type { Vehicle } from '../types'

const KM_DRAFT = 'mechanicai-draft-km'

export function UpdateKm({
  vehicle,
  onBack,
  onInvalid,
  onSave,
}: {
  vehicle: Vehicle
  onBack: () => void
  onInvalid?: () => void
  onSave: (km: number) => void
}) {
  const [km, setKm] = useState(() => readDraft(KM_DRAFT, { km: String(vehicle.currentKm) }).km)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeDraft(KM_DRAFT, { km })
  }, [km])

  function submit() {
    const result = validateKmUpdate(vehicle.currentKm, km)
    if ('error' in result) {
      setError(result.error)
      onInvalid?.()
      return
    }
    clearDraft(KM_DRAFT)
    onSave(result.km)
  }

  return (
    <Shell
      eyebrow="Carro"
      title="Quilometragem"
      onBack={onBack}
      footer={
        <button type="submit" form="km-form" className="btn btn-primary">
          Salvar km
        </button>
      }
    >
      <form
        id="km-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <p className="helper">
          Km atual do painel: {vehicle.currentKm.toLocaleString('pt-BR')}. O novo valor precisa ser igual ou
          maior. Se você voltar, o número digitado continua aqui.
        </p>
        <label className="field">
          <span>Quilometragem atual</span>
          <input
            inputMode="numeric"
            value={km}
            onChange={(e) => {
              setKm(e.target.value)
              setError(null)
            }}
            aria-describedby="km-update-help"
          />
          <small id="km-update-help">Só números, como no painel.</small>
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Shell>
  )
}
