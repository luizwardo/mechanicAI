import { useEffect, useState } from 'react'
import { Shell } from '../components/Shell'
import { BRANDS, MODELS, YEARS } from '../data/vehicles'
import { clearDraft, readDraft, writeDraft } from '../logic/draft'
import { validateCar } from '../logic/forms'
import type { Vehicle } from '../types'

const CAR_DRAFT = 'mechanicai-draft-car'

interface CarDraft {
  brand: (typeof BRANDS)[number]
  model: string
  year: number
  km: string
  known: 'nao' | 'sim'
  revKm: string
  revDate: string
}

interface OnboardingProps {
  initial?: Vehicle | null
  onBack: () => void
  onInvalid?: () => void
  onComplete: (vehicle: Vehicle) => void
}

function seedFrom(initial?: Vehicle | null): CarDraft {
  const brand = BRANDS.includes(initial?.brand as (typeof BRANDS)[number])
    ? (initial!.brand as (typeof BRANDS)[number])
    : 'Volkswagen'
  return {
    brand,
    model: initial?.model && MODELS[brand].includes(initial.model) ? initial.model : MODELS[brand][0],
    year: initial?.year ?? 2014,
    km: initial ? String(initial.currentKm) : '',
    known: initial?.lastRevisionKnown ? 'sim' : 'nao',
    revKm: initial?.lastRevisionKm != null ? String(initial.lastRevisionKm) : '',
    revDate: initial?.lastRevisionDate ?? '',
  }
}

export function Onboarding({ initial, onBack, onInvalid, onComplete }: OnboardingProps) {
  const [draft, setDraft] = useState<CarDraft>(() => readDraft(CAR_DRAFT, seedFrom(initial)))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeDraft(CAR_DRAFT, draft)
  }, [draft])

  function patch(partial: Partial<CarDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }))
    setError(null)
  }

  function handleBrand(next: (typeof BRANDS)[number]) {
    patch({ brand: next, model: MODELS[next][0] })
  }

  function submit() {
    const result = validateCar({
      brand: draft.brand,
      model: draft.model,
      year: draft.year,
      kmRaw: draft.km,
      known: draft.known === 'sim',
      revDate: draft.revDate,
      revKmRaw: draft.revKm,
    })
    if ('error' in result) {
      setError(result.error)
      onInvalid?.()
      return
    }
    clearDraft(CAR_DRAFT)
    onComplete(result.vehicle)
  }

  return (
    <Shell
      title="Seu carro"
      eyebrow="Começo"
      onBack={onBack}
      footer={
        <button type="submit" form="car-form" className="btn btn-primary">
          Continuar
        </button>
      }
    >
      <form
        id="car-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <p className="helper">
          Marca, modelo e km de hoje. Se não lembrar da última revisão, diga “Não sei” — a gente não inventa
          atraso. Voltar guarda o que você já digitou.
        </p>

        <div className="form-grid">
          <label className="field">
            <span>Marca</span>
            <select value={draft.brand} onChange={(e) => handleBrand(e.target.value as (typeof BRANDS)[number])}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Modelo</span>
            <select value={draft.model} onChange={(e) => patch({ model: e.target.value })}>
              {MODELS[draft.brand].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Ano</span>
            <select value={draft.year} onChange={(e) => patch({ year: Number(e.target.value) })}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Quilometragem de hoje</span>
            <input
              inputMode="numeric"
              value={draft.km}
              onChange={(e) => patch({ km: e.target.value })}
              placeholder="Ex.: 87000"
              aria-describedby="km-help"
            />
            <small id="km-help">Olhe no painel do carro.</small>
          </label>
        </div>

        <fieldset className="choice-group">
          <legend>Última revisão geral</legend>
          <div className="choice-row">
            <label className="choice">
              <input
                type="radio"
                name="known"
                checked={draft.known === 'nao'}
                onChange={() => patch({ known: 'nao' })}
              />
              <span>Não sei</span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="known"
                checked={draft.known === 'sim'}
                onChange={() => patch({ known: 'sim' })}
              />
              <span>Sei a data e o km</span>
            </label>
          </div>
        </fieldset>

        {draft.known === 'sim' && (
          <div className="form-grid">
            <label className="field">
              <span>Data da última revisão</span>
              <input type="date" value={draft.revDate} onChange={(e) => patch({ revDate: e.target.value })} />
            </label>
            <label className="field">
              <span>Km naquela revisão</span>
              <input
                inputMode="numeric"
                value={draft.revKm}
                onChange={(e) => patch({ revKm: e.target.value })}
                placeholder="Ex.: 80000"
              />
            </label>
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Shell>
  )
}
