import { useMemo, useState } from 'react'
import type { Workshop } from '../data/workshops'
import { searchWorkshops } from '../data/workshops'

interface SearchProps {
  onSelect?: (workshop: Workshop) => void
}

export function Search({ onSelect }: SearchProps) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchWorkshops(query), [query])

  return (
    <div className="shell shell-with-hotbar">
      <header className="topbar">
        <span className="brand-mark" aria-hidden>
          mAI
        </span>
        <div className="topbar-text">
          <p className="eyebrow">Pesquisa</p>
          <h1 className="screen-title">Oficinas fidelizadas</h1>
        </div>
      </header>

      <main className="content">
        <label className="field search-field">
          <span className="visually-hidden">Buscar oficina</span>
          <div className="search-input-wrap">
            <span className="search-glyph" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, bairro, cidade ou serviço"
              autoComplete="off"
            />
          </div>
        </label>

        <p className="helper tight">
          Só aparecem oficinas parceiras do mechanicAI. Toque para ver o contato.
        </p>

        {results.length === 0 ? (
          <div className="empty">
            <p>Nenhuma oficina encontrada.</p>
            <p className="muted">Tente outro bairro ou especialidade.</p>
          </div>
        ) : (
          <ul className="workshop-list">
            {results.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  className="workshop-card"
                  onClick={() => onSelect?.(w)}
                >
                  <div className="workshop-top">
                    <h2>{w.name}</h2>
                    <span className="pill pill-em_dia">Fidelizada</span>
                  </div>
                  <p className="muted">
                    {w.neighborhood} · {w.city}
                  </p>
                  <p className="workshop-meta">
                    <span>{w.specialty}</span>
                    <span>★ {w.rating.toFixed(1)}</span>
                    <span>{w.distanceKm.toLocaleString('pt-BR')} km</span>
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
