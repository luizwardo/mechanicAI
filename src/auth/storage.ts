import type { AuthUser } from '../screens/Auth'
import type { AccountRole } from '../types'

const USERS_KEY = 'mechanicai-users-v2'
const SESSION_KEY = 'mechanicai-session-v2'

export type Session =
  | { mode: 'guest'; role: 'cliente' }
  | { mode: 'guest'; role: 'provedor'; workshopId: string }
  | { mode: 'user'; role: 'cliente'; name: string; email: string }
  | { mode: 'user'; role: 'provedor'; name: string; email: string; workshopId: string }

export function loadUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AuthUser[]
  } catch {
    return []
  }
}

export function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
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

export function createUser(user: AuthUser): string | null {
  const users = loadUsers()
  if (users.some((u) => u.email === user.email)) {
    return 'Já existe uma conta com este e-mail neste aparelho.'
  }
  saveUsers([...users, user])
  return null
}

export function authenticate(email: string, password: string, role: AccountRole): AuthUser | string {
  const user = loadUsers().find((u) => u.email === email)
  if (!user) return 'Conta não encontrada. Crie uma conta ou entre como convidado.'
  if (user.password !== password) return 'Senha incorreta.'
  const accountRole = user.role ?? 'cliente'
  if (accountRole !== role) {
    return accountRole === 'provedor'
      ? 'Esta conta é de provedor. Mude o interruptor para Provedor.'
      : 'Esta conta é de cliente. Mude o interruptor para Cliente.'
  }
  return { ...user, role: accountRole }
}
