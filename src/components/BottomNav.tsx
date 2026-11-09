export type MainTab = 'home' | 'search' | 'agenda' | 'help'

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  mode?: 'cliente' | 'provedor'
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.18 : 0}
      />
    </svg>
  )
}

function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconMenu({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 1.9}
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconAgenda({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      />
      <path
        d="M8 3.5v3M16 3.5v3M4 10h16"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BottomNav({ active, onChange, mode = 'cliente' }: BottomNavProps) {
  const homeLabel = mode === 'provedor' ? 'Solicitações' : 'Início'
  const midLabel = mode === 'provedor' ? 'Agenda' : 'Pesquisa'
  return (
    <nav className="hotbar" aria-label="Navegação principal">
      <button
        type="button"
        className={`hotbar-item${active === 'home' ? ' is-active' : ''}`}
        aria-current={active === 'home' ? 'page' : undefined}
        onClick={() => onChange('home')}
      >
        <IconHome active={active === 'home'} />
        <span>{homeLabel}</span>
      </button>
      <button
        type="button"
        className={`hotbar-item${active === 'search' ? ' is-active' : ''}`}
        aria-current={active === 'search' ? 'page' : undefined}
        onClick={() => onChange('search')}
      >
        {mode === 'provedor' ? (
          <IconAgenda active={active === 'search'} />
        ) : (
          <IconSearch active={active === 'search'} />
        )}
        <span>{midLabel}</span>
      </button>
      {mode === 'cliente' && (
        <button
          type="button"
          className={`hotbar-item${active === 'agenda' ? ' is-active' : ''}`}
          aria-current={active === 'agenda' ? 'page' : undefined}
          onClick={() => onChange('agenda')}
        >
          <IconAgenda active={active === 'agenda'} />
          <span>Agendamentos</span>
        </button>
      )}
      <button
        type="button"
        className={`hotbar-item${active === 'help' ? ' is-active' : ''}`}
        aria-current={active === 'help' ? 'page' : undefined}
        onClick={() => onChange('help')}
      >
        <IconMenu active={active === 'help'} />
        <span>Ajuda</span>
      </button>
    </nav>
  )
}
