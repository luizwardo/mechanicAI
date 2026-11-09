import { useEffect, useState } from 'react'
import { Shell } from '../components/Shell'
import { WORKSHOPS } from '../data/workshops'
import { clearDraft, readDraft, writeDraft } from '../logic/draft'
import type { AccountRole } from '../types'

const SIGNUP_DRAFT = 'mechanicai-draft-signup'
const LOGIN_DRAFT = 'mechanicai-draft-login'

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
  onInvalid?: () => void
  onSubmit: (user: {
    name: string
    email: string
    password: string
    role: AccountRole
    workshopId?: string
  }) => Promise<string | null>
}

export function CreateAccount({
  initialRole = 'cliente',
  onRoleChange,
  onBack,
  onInvalid,
  onSubmit,
}: CreateAccountProps) {
  const saved = readDraft(SIGNUP_DRAFT, {
    role: initialRole,
    name: '',
    email: '',
    password: '',
    workshopId: '',
  })
  const [role, setRole] = useState<AccountRole>(saved.role)
  const [name, setName] = useState(saved.name)
  const [email, setEmail] = useState(saved.email)
  const [password, setPassword] = useState(saved.password)
  const [workshopId, setWorkshopId] = useState(saved.workshopId)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    writeDraft(SIGNUP_DRAFT, { role, name, email, password, workshopId })
  }, [role, name, email, password, workshopId])

  async function submit() {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedName || !trimmedEmail || password.length < 4) {
      setError('Preencha nome, e-mail e uma senha com pelo menos 4 caracteres.')
      onInvalid?.()
      return
    }
    if (role === 'provedor' && !workshopId) {
      setError('Escolha a oficina desta conta.')
      onInvalid?.()
      return
    }
    setBusy(true)
    const result = await onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role,
      workshopId: role === 'provedor' ? workshopId : undefined,
    })
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    clearDraft(SIGNUP_DRAFT)
  }

  return (
    <Shell
      eyebrow="Conta"
      title="Criar conta"
      onBack={onBack}
      footer={
        <button type="submit" form="signup-form" className="btn btn-primary" disabled={busy}>
          {busy ? 'Salvando…' : 'Criar e continuar'}
        </button>
      }
    >
      <form
        id="signup-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
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
            ? 'Conta da oficina, só neste aparelho. A senha fica protegida por um código, não em texto.'
            : 'Conta de cliente, só neste aparelho. A senha não fica visível no armazenamento.'}
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
      </form>
    </Shell>
  )
}

interface LoginProps {
  initialRole?: AccountRole
  onRoleChange?: (role: AccountRole) => void
  onBack: () => void
  onInvalid?: () => void
  onSubmit: (email: string, password: string, role: AccountRole) => Promise<string | null>
}

export function Login({ initialRole = 'cliente', onRoleChange, onBack, onInvalid, onSubmit }: LoginProps) {
  const saved = readDraft(LOGIN_DRAFT, { role: initialRole, email: '', password: '' })
  const [role, setRole] = useState<AccountRole>(saved.role)
  const [email, setEmail] = useState(saved.email)
  const [password, setPassword] = useState(saved.password)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    writeDraft(LOGIN_DRAFT, { role, email, password })
  }, [role, email, password])

  async function submit() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError('Informe e-mail e senha.')
      onInvalid?.()
      return
    }
    setBusy(true)
    const result = await onSubmit(trimmedEmail, password, role)
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    clearDraft(LOGIN_DRAFT)
  }

  return (
    <Shell
      eyebrow="Conta"
      title="Logar"
      onBack={onBack}
      footer={
        <button type="submit" form="login-form" className="btn btn-primary" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      }
    >
      <form
        id="login-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
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
      </form>
    </Shell>
  )
}
