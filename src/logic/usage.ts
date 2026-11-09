export interface UsageLog {
  startedAt: number | null
  completions: number
  errors: number
  lastDurationMs: number | null
}

export function emptyUsage(): UsageLog {
  return { startedAt: null, completions: 0, errors: 0, lastDurationMs: null }
}

export function markTaskStart(log: UsageLog, now: number): UsageLog {
  if (log.startedAt != null) return log
  return { ...log, startedAt: now }
}

export function markValidationError(log: UsageLog): UsageLog {
  return { ...log, errors: log.errors + 1 }
}

export function markTaskDone(log: UsageLog, now: number): UsageLog {
  const lastDurationMs = log.startedAt != null ? Math.max(0, now - log.startedAt) : log.lastDurationMs
  return {
    startedAt: null,
    completions: log.completions + 1,
    errors: log.errors,
    lastDurationMs,
  }
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return 'ainda não medida'
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes <= 0) return `${seconds} s`
  return `${minutes} min ${seconds} s`
}

const USAGE_KEY = 'mechanicai-usage-v1'

export function loadUsage(): UsageLog {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (!raw) return emptyUsage()
    const parsed = JSON.parse(raw) as Partial<UsageLog>
    return {
      startedAt: typeof parsed.startedAt === 'number' ? parsed.startedAt : null,
      completions: typeof parsed.completions === 'number' ? parsed.completions : 0,
      errors: typeof parsed.errors === 'number' ? parsed.errors : 0,
      lastDurationMs: typeof parsed.lastDurationMs === 'number' ? parsed.lastDurationMs : null,
    }
  } catch {
    return emptyUsage()
  }
}

export function saveUsage(log: UsageLog) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(log))
}
