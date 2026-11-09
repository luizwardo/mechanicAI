import { MissionCard } from '../components/Missions'
import { StatusPill } from '../components/Shell'
import { WORKSHOPS } from '../data/workshops'
import {
  buildCareRows,
  nextReminderText,
  statusHint,
  statusLabel,
  suggestedVisitIds,
  type CareRow,
} from '../logic/status'
import type { MissionFlags } from '../logic/progress'
import type { CareId, CareStatus, ServiceRecord, Vehicle } from '../types'

interface HomeProps {
  vehicle: Vehicle
  records: ServiceRecord[]
  accountLabel?: string
  workshopId: string
  onWorkshopChange: (id: string) => void
  upcomingLabel?: string
  onOpenCare: (id: CareId) => void
  onPrepareVisit: (ids: CareId[]) => void
  missions: MissionFlags
  onToggleMissions: () => void
}

function countBy(rows: CareRow[], status: CareStatus) {
  return rows.filter((r) => r.status === status).length
}

function CareButton({
  row,
  onOpen,
}: {
  row: CareRow
  onOpen: (id: CareId) => void
}) {
  return (
    <button type="button" className="care-row care-row-rich" onClick={() => onOpen(row.care.id)}>
      <span className={`care-dot care-dot-${row.status}`} aria-hidden />
      <span className="care-body">
        <span className="care-name">{row.care.name}</span>
        <span className="care-sub">
          {row.status === 'sem_registro'
            ? 'Toque para entender o cuidado'
            : row.last
              ? `Último registro · ${row.last.km.toLocaleString('pt-BR')} km`
              : statusHint(row.status)}
        </span>
      </span>
      <StatusPill status={row.status} label={statusLabel(row.status)} />
    </button>
  )
}

export function Home({
  vehicle,
  records,
  accountLabel,
  workshopId,
  onWorkshopChange,
  upcomingLabel,
  onOpenCare,
  onPrepareVisit,
  missions,
  onToggleMissions,
}: HomeProps) {
  const rows = buildCareRows(vehicle, records)
  const withRecord = rows.filter((r) => r.status !== 'sem_registro')
  const questions = rows.filter((r) => r.status === 'sem_registro')
  const visitIds = suggestedVisitIds(rows)
  const attention = countBy(rows, 'vencida') + countBy(rows, 'proxima')
  const ok = countBy(rows, 'em_dia')
  const unknown = countBy(rows, 'sem_registro')
  const greeting = accountLabel ? `Olá, ${accountLabel}` : 'Seu carro'
  const nextAction = nextReminderText(vehicle, records)
  const spotlight = rows.find((r) => r.status === 'vencida' || r.status === 'proxima')

  return (
    <div className="shell shell-with-hotbar shell-has-dock">
      <header className="topbar">
        <span className="brand-mark" aria-hidden>
          mAI
        </span>
        <div className="topbar-text">
          <p className="eyebrow">Início</p>
          <h1 className="screen-title">{greeting}</h1>
        </div>
      </header>

      <main className="content home-content">
        <section className="home-hero" aria-label="Resumo do veículo">
          <div className="home-hero-main">
            <p className="home-hero-kicker">
              {vehicle.brand} · {vehicle.year}
            </p>
            <h2 className="home-hero-title">{vehicle.model}</h2>
            <div className="home-hero-km">
              <span className="home-km-value">
                {vehicle.currentKm.toLocaleString('pt-BR')}
              </span>
              <span className="home-km-unit">km no painel</span>
            </div>
          </div>

          <div className="home-stats" role="list" aria-label="Resumo dos cuidados">
            <div className="home-stat" role="listitem">
              <strong>{attention}</strong>
              <span>Atenção</span>
            </div>
            <div className="home-stat" role="listitem">
              <strong>{ok}</strong>
              <span>Em dia</span>
            </div>
            <div className="home-stat" role="listitem">
              <strong>{unknown}</strong>
              <span>Sem registro</span>
            </div>
          </div>
        </section>

        <section className="action-card" aria-label="Próxima ação">
          <p className="section-title">Próxima ação</p>
          <p className="action-card-text">{nextAction}</p>
          {!vehicle.lastRevisionKnown && (
            <p className="note">
              Você marcou “não sei” na revisão — nada entra como atrasado sem o seu registro.
            </p>
          )}
          <label className="field">
            <span>Oficina do atendimento</span>
            <select
              value={workshopId}
              onChange={(e) => onWorkshopChange(e.target.value)}
            >
              <option value="">Escolha para onde levar o carro</option>
              {WORKSHOPS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} · {w.neighborhood}
                </option>
              ))}
            </select>
            <small>O pedido chega para a oficina escolhida.</small>
          </label>
          {upcomingLabel && <p className="note">{upcomingLabel}</p>}
          {spotlight && (
            <button
              type="button"
              className="btn btn-ghost action-card-btn"
              onClick={() => onOpenCare(spotlight.care.id)}
            >
              Ver {spotlight.care.name.toLowerCase()}
            </button>
          )}
        </section>

        <MissionCard
          flags={missions}
          hasRecord={records.length > 0}
          onPause={onToggleMissions}
        />

        <div className="home-lists">
          {withRecord.length > 0 && (
            <section className="block">
              <div className="section-head">
                <h2 className="section-title">Com registro</h2>
                <span className="section-count">{withRecord.length}</span>
              </div>
              <ul className="care-list">
                {withRecord.map((row) => (
                  <li key={row.care.id}>
                    <CareButton row={row} onOpen={onOpenCare} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="block">
            <div className="section-head">
              <h2 className="section-title">Ainda é pergunta</h2>
              <span className="section-count">{questions.length}</span>
            </div>
            <p className="helper tight">Sem data anterior, não aparece “atrasado”.</p>
            <ul className="care-list">
              {questions.map((row) => (
                <li key={row.care.id}>
                  <CareButton row={row} onOpen={onOpenCare} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="dock dock-above-hotbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onPrepareVisit(visitIds)}
        >
          Agendar atendimento
          {visitIds.length > 0 ? ` · ${visitIds.length} itens` : ''}
        </button>
      </footer>
    </div>
  )
}
