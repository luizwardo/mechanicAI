import { useState } from 'react'
import { Shell } from '../components/Shell'
import { WORKSHOPS } from '../data/workshops'
import type { AccountRole } from '../types'

export interface AuthUser {
  name: string
  email: string
  password: string
  role: AccountRole
  workshopId?: string
}

export function RoleSwitch({
  role,
  onChange,
}: {
  role: AccountRole
  onChange: (role: AccountRole) => void
}) {
  return (
    <div className="role-switch" role="group" aria-label="Tipo de acesso">
      <button
        type="button"
        className={role === 'cliente' ? 'is-on' : ''}
        aria-pressed={role === 'cliente'}
        onClick={() => onChange('cliente')}
      >
        Cliente
      </button>
      <button
        type="button"
        className={role === 'provedor' ? 'is-on' : ''}
        aria-pressed={role === 'provedor'}
        onClick={() => onChange('provedor')}
      >
        Provedor de serviço
      </button>
    </div>
  )
}

interface CreateAccountProps {
  initialRole?: AccountRole
  onRoleChange?: (role: AccountRole) => void
  onBack: () => void
  onSubmit: (user: Omit<AuthUser, 'password'> & { password: string }) => string | null
}

export function CreateAccount({
  initialRole = 'cliente',
  onRoleChange,
  onBack,
  onSubmit,
}: CreateAccountProps) {
  const [role, setRole] = useState<AccountRole>(initialRole)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workshopId, setWorkshopId] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedName || !trimmedEmail || password.length < 4) {
      setError('Preencha nome, e-mail e uma senha com pelo menos 4 caracteres.')
      return
    }
    if (role === 'provedor' && !workshopId) {
      setError('Escolha a oficina desta conta.')
      return
    }
    const result = onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role,
      workshopId: role === 'provedor' ? workshopId : undefined,
    })
    if (result) setError(result)
  }

  return (
    <Shell
      eyebrow="Conta"
      title="Criar conta"
      onBack={onBack}
      footer={
        <button type="button" className="btn btn-primary" onClick={submit}>
          Criar e continuar
        </button>
      }
    >
      <RoleSwitch
        role={role}
        onChange={(next) => {
          setRole(next)
          onRoleChange?.(next)
          setError(null)
        }}
      />
      <p className="helper">
        {role === 'provedor'
          ? 'Conta da oficina, só neste aparelho. Os pedidos dos clientes chegam aqui.'
          : 'Conta de cliente, só neste aparelho.'}
      </p>
      <div className="form-grid">
        <label className="field field-span">
          <span>Nome</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </label>
        <label className="field field-span">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </label>
        <label className="field field-span">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 4 caracteres"
          />
        </label>
        {role === 'provedor' && (
          <label className="field field-span">
            <span>Oficina</span>
            <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
              <option value="">Escolha a oficina</option>
              {WORKSHOPS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} · {w.neighborhood}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </Shell>
  )
}

interface LoginProps {
  initialRole?: AccountRole
  onRoleChange?: (role: AccountRole) => void
  onBack: () => void
  onSubmit: (email: string, password: string, role: AccountRole) => string | null
}

export function Login({ initialRole = 'cliente', onRoleChange, onBack, onSubmit }: LoginProps) {
  const [role, setRole] = useState<AccountRole>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError('Informe e-mail e senha.')
      return
    }
    const result = onSubmit(trimmedEmail, password, role)
    if (result) setError(result)
  }

  return (
    <Shell
      eyebrow="Conta"
      title="Logar"
      onBack={onBack}
      footer={
        <button type="button" className="btn btn-primary" onClick={submit}>
          Entrar
        </button>
      }
    >
      <p className="helper tight">Entrar como</p>
      <RoleSwitch
        role={role}
        onChange={(next) => {
          setRole(next)
          onRoleChange?.(next)
          setError(null)
        }}
      />
      <p className="helper">
        {role === 'provedor'
          ? 'Conta da oficina. As solicitações dos clientes aparecem em seguida.'
          : 'Conta de cliente que você criou neste aparelho.'}
      </p>
      <div className="form-grid">
        <label className="field field-span">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </label>
        <label className="field field-span">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
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
