import { WORKSHOPS } from '../data/workshops'
import type { AccountRole } from '../types'
import { RoleSwitch } from './Auth'

interface WelcomeProps {
  role: AccountRole
  workshopId: string
  onWorkshopChange: (id: string) => void
  onRoleChange: (role: AccountRole) => void
  onCreateAccount: () => void
  onLogin: () => void
  onGuest: () => void
  onDemo: () => void
}

export function Welcome({
  role,
  workshopId,
  onWorkshopChange,
  onRoleChange,
  onCreateAccount,
  onLogin,
  onGuest,
  onDemo,
}: WelcomeProps) {
  return (
    <div className="shell shell-has-dock welcome">
      <div className="welcome-layout welcome-auth">
        <div className="welcome-hero">
          <div className="welcome-logo" aria-hidden>
            mAI
          </div>
          <p className="eyebrow">Gestão veicular · leiga</p>
          <h1 className="brand">Bem-vindo ao mechanicAI</h1>
          <p className="lead">
            Organize o cuidado do carro em linguagem simples — com conta ou só dando uma olhada.
          </p>
        </div>
        <ul className="welcome-points welcome-points-compact">
          <li>Histórico no celular</li>
          <li>Oficinas fidelizadas</li>
          <li>Próximo passo claro</li>
        </ul>
      </div>
      <footer className="dock">
        <RoleSwitch role={role} onChange={onRoleChange} />
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          {role === 'provedor' ? 'Logar como provedor' : 'Logar'}
        </button>
        {role === 'provedor' && (
          <label className="field">
            <span>Oficina do convidado</span>
            <select value={workshopId} onChange={(e) => onWorkshopChange(e.target.value)}>
              {WORKSHOPS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} · {w.neighborhood}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" className="btn btn-ghost" onClick={onCreateAccount}>
          Criar conta
        </button>
        <button type="button" className="btn btn-ghost" onClick={onGuest}>
          Entrar como convidado
        </button>
        {role === 'cliente' && (
          <button type="button" className="btn btn-ghost" onClick={onDemo}>
            Abrir demo (Gol 1.0 · 87 mil km)
          </button>
        )}
      </footer>
    </div>
  )
}
