import { useState } from 'react'
import { BRANDS, MODELS, YEARS } from '../data/vehicles'
import type { Vehicle } from '../types'
import { Shell } from '../components/Shell'

interface OnboardingProps {
  onBack: () => void
  onComplete: (vehicle: Vehicle) => void
}

export function Onboarding({ onBack, onComplete }: OnboardingProps) {
  const [brand, setBrand] = useState<(typeof BRANDS)[number]>('Volkswagen')
  const [model, setModel] = useState(MODELS.Volkswagen[0])
  const [year, setYear] = useState(2014)
  const [km, setKm] = useState('87000')
  const [known, setKnown] = useState<'nao' | 'sim'>('nao')
  const [revKm, setRevKm] = useState('')
  const [revDate, setRevDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleBrand(next: (typeof BRANDS)[number]) {
    setBrand(next)
    setModel(MODELS[next][0])
  }

  function submit() {
    const currentKm = Number(km.replace(/\D/g, ''))
    if (!currentKm || currentKm < 1) {
      setError('Informe a quilometragem de hoje (só números).')
      return
    }
    if (known === 'sim') {
      const lastKm = Number(revKm.replace(/\D/g, ''))
      if (!lastKm || !revDate) {
        setError('Se você sabe a última revisão, preencha data e km — ou marque “Não sei”.')
        return
      }
      if (lastKm > currentKm) {
        setError('A km da revisão não pode ser maior que a de hoje.')
        return
      }
      onComplete({
        brand,
        model,
        year,
        currentKm,
        lastRevisionKnown: true,
        lastRevisionDate: revDate,
        lastRevisionKm: lastKm,
      })
      return
    }
    onComplete({
      brand,
      model,
      year,
      currentKm,
      lastRevisionKnown: false,
    })
  }

  return (
    <Shell title="Seu carro" eyebrow="Começo" onBack={onBack} footer={
      <button type="button" className="btn btn-primary" onClick={submit}>
        Continuar
      </button>
    }>
      <p className="helper">
        Marca, modelo e km de hoje. Se não lembrar da última revisão, diga “Não sei” — a gente não inventa
        atraso.
      </p>

      <div className="form-grid">
        <label className="field">
          <span>Marca</span>
          <select
            value={brand}
            onChange={(e) => handleBrand(e.target.value as (typeof BRANDS)[number])}
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Modelo</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS[brand].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ano</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
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
            value={km}
            onChange={(e) => setKm(e.target.value)}
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
              checked={known === 'nao'}
              onChange={() => {
                setKnown('nao')
                setError(null)
              }}
            />
            <span>Não sei</span>
          </label>
          <label className="choice">
            <input
              type="radio"
              name="known"
              checked={known === 'sim'}
              onChange={() => setKnown('sim')}
            />
            <span>Sei a data e o km</span>
          </label>
        </div>
      </fieldset>

      {known === 'sim' && (
        <div className="form-grid">
          <label className="field">
            <span>Data da última revisão</span>
            <input type="date" value={revDate} onChange={(e) => setRevDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Km naquela revisão</span>
            <input
              inputMode="numeric"
              value={revKm}
              onChange={(e) => setRevKm(e.target.value)}
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
    </Shell>
  )
}
