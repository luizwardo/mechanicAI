export function readDraft<T extends object>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<T>
    if (!parsed || typeof parsed !== 'object') return fallback
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

export function writeDraft(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* rascunho é conveniência; a tarefa segue sem ele */
  }
}

export function clearDraft(key: string) {
  sessionStorage.removeItem(key)
}

export const DRAFT_KEYS = [
  'mechanicai-draft-visit',
  'mechanicai-draft-car',
  'mechanicai-draft-km',
  'mechanicai-draft-signup',
  'mechanicai-draft-login',
] as const

export function clearDrafts() {
  for (const key of DRAFT_KEYS) clearDraft(key)
  const extra: string[] = []
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i)
    if (key?.startsWith('mechanicai-draft-register')) extra.push(key)
  }
  for (const key of extra) clearDraft(key)
  sessionStorage.removeItem('mechanicai-screen-v1')
}
