import type { Session } from '../auth/storage'
import { formatDuration, type UsageLog } from '../logic/usage'
import type { Vehicle } from '../types'

interface HelpMenuProps {
  session: Session | null
  vehicle: Vehicle | null
  variant?: 'cliente' | 'provedor'
  workshopName?: string
  onHistory: () => void
  onEditCar: () => void
  onUpdateKm: () => void
  onProfile: () => void
  onLogout: () => void
  missionsPaused?: boolean
  onToggleMissions?: () => void
  usage?: UsageLog
}

export function HelpMenu({
  session,
  vehicle,
  variant = 'cliente',
  workshopName,
  onHistory,
  onEditCar,
  onUpdateKm,
  onProfile,
  onLogout,
  missionsPaused = false,
  onToggleMissions,
  usage,
}: HelpMenuProps) {
  const accountName =
    session?.mode === 'user' ? session.name : session?.mode === 'guest' ? 'Convidado' : '—'
  const accountEmail = session?.mode === 'user' ? session.email : 'Sem e-mail (convidado)'

  return (
    <div className="shell shell-with-hotbar">
      <header className="topbar">
        <span className="brand-mark" aria-hidden>
          mAI
        </span>
        <div className="topbar-text">
          <p className="eyebrow">{variant === 'provedor' ? 'Oficina' : 'Ajuda'}</p>
          <h1 className="screen-title">{variant === 'provedor' ? 'Conta da oficina' : 'Conta e ajustes'}</h1>
        </div>
      </header>

      <main className="content">
        <section className="profile-card">
          <div className="avatar" aria-hidden>
            {accountName.slice(0, 1).toUpperCase()}
          </div>
          <div className="profile-text">
            <h2>{accountName}</h2>
            <p className="muted">{variant === 'provedor' && workshopName ? workshopName : accountEmail}</p>
          </div>
        </section>

        <section className="block">
          <h2 className="section-title">Perfil</h2>
          <ul className="menu-list">
            <li>
              <button type="button" className="menu-row" onClick={onProfile}>
                <span>Dados do perfil</span>
                <span className="menu-chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
            {variant === 'cliente' && (
              <li>
                <button type="button" className="menu-row" onClick={onHistory}>
                  <span>Histórico de serviços</span>
                  <span className="menu-chevron" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            )}
          </ul>
        </section>

        {variant === 'cliente' && (
        <section className="block">
          <h2 className="section-title">Carro</h2>
          {vehicle ? (
            <p className="helper tight">
              {vehicle.brand} {vehicle.model} · {vehicle.year} ·{' '}
              {vehicle.currentKm.toLocaleString('pt-BR')} km
            </p>
          ) : (
            <p className="helper tight">Nenhum carro cadastrado.</p>
          )}
          <ul className="menu-list">
            <li>
              <button type="button" className="menu-row" onClick={onEditCar}>
                <span>Configurações do carro</span>
                <span className="menu-chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
            <li>
              <button type="button" className="menu-row" onClick={onUpdateKm} disabled={!vehicle}>
                <span>Atualizar quilometragem</span>
                <span className="menu-chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          </ul>
        </section>
        )}

        <section className="block">
          <h2 className="section-title">Sobre</h2>
          <ul className="menu-list">
            <li>
              <div className="menu-row static">
                <span>Como usamos seus dados</span>
                <span className="muted tiny">Só neste aparelho. Senha em código, sem texto puro.</span>
              </div>
            </li>
            {variant === 'cliente' && onToggleMissions && (
              <li>
                <button
                  type="button"
                  className="menu-row"
                  aria-pressed={!missionsPaused}
                  onClick={onToggleMissions}
                >
                  <span>{missionsPaused ? 'Retomar missões' : 'Pausar missões'}</span>
                  <span className="muted tiny">{missionsPaused ? 'Pausadas' : 'Ativas'}</span>
                </button>
              </li>
            )}
            {variant === 'cliente' && usage && (
              <li>
                <div className="menu-row static">
                  <span>Indicadores deste aparelho</span>
                  <span className="muted tiny">
                    {usage.completions} conclusões · {usage.errors} erros · {formatDuration(usage.lastDurationMs)}
                  </span>
                </div>
              </li>
            )}
            <li>
              <a className="menu-row" href={`${import.meta.env.BASE_URL}portfolio.html`}>
                <span>Portfólio e QR Code</span>
                <span className="menu-chevron" aria-hidden>
                  ›
                </span>
              </a>
            </li>
            <li>
              <div className="menu-row static">
                <span>Versão</span>
                <span className="muted tiny">0.1.0 demo</span>
              </div>
            </li>
          </ul>
        </section>

        <button type="button" className="btn btn-ghost danger-outline" onClick={onLogout}>
          {variant === 'provedor' ? 'Sair' : 'Sair / recomeçar'}
        </button>
      </main>
    </div>
  )
}
