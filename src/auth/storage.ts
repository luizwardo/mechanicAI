import { hashPassword, isPasswordHash, passwordMatches } from '../logic/password'
import type { AccountRole } from '../types'

const USERS_KEY = 'mechanicai-users-v2'
const SESSION_KEY = 'mechanicai-session-v2'

export interface StoredUser {
  name: string
  email: string
  passwordHash: string
  role: AccountRole
  workshopId?: string
}

export type Session =
  | { mode: 'guest'; role: 'cliente' }
  | { mode: 'guest'; role: 'provedor'; workshopId: string }
  | { mode: 'user'; role: 'cliente'; name: string; email: string }
  | { mode: 'user'; role: 'provedor'; name: string; email: string; workshopId: string }

export function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap(normalizeUser)
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed || (parsed.role !== 'cliente' && parsed.role !== 'provedor')) return null
    if (parsed.mode !== 'guest' && parsed.mode !== 'user') return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function createUser(user: {
  name: string
  email: string
  password: string
  role: AccountRole
  workshopId?: string
}): Promise<string | null> {
  const users = loadUsers()
  if (users.some((item) => item.email === user.email)) {
    return 'Já existe uma conta com este e-mail neste aparelho.'
  }
  let passwordHash: string
  try {
    passwordHash = await hashPassword(user.email, user.password)
  } catch {
    return 'Não foi possível proteger a senha neste aparelho. Tente de novo.'
  }
  saveUsers([
    ...users,
    {
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      workshopId: user.workshopId,
    },
  ])
  return null
}

export async function authenticate(
  email: string,
  password: string,
  role: AccountRole,
): Promise<StoredUser | string> {
  const users = loadUsers()
  const index = users.findIndex((item) => item.email === email)
  if (index < 0) return 'Conta não encontrada. Crie uma conta ou entre como convidado.'
  const user = users[index]
  let matches = false
  try {
    matches = await passwordMatches(user.passwordHash, email, password)
  } catch {
    return 'Não foi possível conferir a senha. Tente de novo.'
  }
  if (!matches) return 'Senha incorreta.'
  if (!isPasswordHash(user.passwordHash)) {
    try {
      const passwordHash = await hashPassword(email, password)
      const next = users.slice()
      next[index] = { ...user, passwordHash }
      saveUsers(next)
      user.passwordHash = passwordHash
    } catch {
      return 'Não foi possível proteger a senha salva. Tente de novo.'
    }
  }
  const accountRole = user.role ?? 'cliente'
  if (accountRole !== role) {
    return accountRole === 'provedor'
      ? 'Esta conta é de provedor. Mude o interruptor para Provedor.'
      : 'Esta conta é de cliente. Mude o interruptor para Cliente.'
  }
  return { ...user, role: accountRole }
}

function normalizeUser(value: unknown): StoredUser[] {
  if (!value || typeof value !== 'object') return []
  const item = value as Record<string, unknown>
  if (typeof item.name !== 'string' || typeof item.email !== 'string') return []
  const passwordHash =
    typeof item.passwordHash === 'string'
      ? item.passwordHash
      : typeof item.password === 'string'
        ? item.password
        : ''
  if (!passwordHash) return []
  const role = item.role === 'provedor' ? 'provedor' : 'cliente'
  return [
    {
      name: item.name,
      email: item.email,
      passwordHash,
      role,
      workshopId: typeof item.workshopId === 'string' ? item.workshopId : undefined,
    },
  ]
}
