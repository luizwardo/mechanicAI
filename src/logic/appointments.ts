import type { ServiceRequest } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export function appointmentStart(request: Pick<ServiceRequest, 'date' | 'time'>): Date | null {
  if (!request.time || !/^\d{2}:\d{2}$/.test(request.time)) return null
  const [hour, minute] = request.time.split(':').map(Number)
  const [year, month, day] = request.date.split('-').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null
  const start = new Date(year, month - 1, day, hour, minute, 0, 0)
  if (Number.isNaN(start.getTime())) return null
  return start
}

export type ConfirmWindow =
  | { state: 'open' }
  | { state: 'done' }
  | { state: 'closed'; reason: string }

export function confirmWindow(request: ServiceRequest, now = new Date()): ConfirmWindow {
  if (request.status === 'cancelada') return { state: 'closed', reason: 'Agendamento cancelado.' }
  if (request.status === 'recusada') return { state: 'closed', reason: 'A oficina recusou este horário.' }
  if (request.status === 'concluida') return { state: 'closed', reason: 'Este atendimento já foi concluído.' }
  if (request.clientConfirmed) return { state: 'done' }
  const start = appointmentStart(request)
  if (!start) return { state: 'closed', reason: 'Este agendamento não tem horário.' }
  if (now.getTime() >= start.getTime()) return { state: 'closed', reason: 'O horário já passou.' }
  const opensAt = start.getTime() - DAY_MS
  if (now.getTime() < opensAt) {
    const when = new Date(opensAt).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    return { state: 'closed', reason: `A confirmação abre 24 h antes, a partir de ${when}.` }
  }
  return { state: 'open' }
}

export function manageBlock(request: ServiceRequest, now = new Date()): string | null {
  if (request.status === 'cancelada') return 'Este agendamento já foi cancelado.'
  if (request.status === 'concluida') return 'Este atendimento já foi concluído.'
  if (request.status === 'recusada') return 'A oficina recusou este horário.'
  const start = appointmentStart(request)
  if (start && now.getTime() >= start.getTime()) return 'O horário já passou.'
  return null
}

export function validateReschedule(
  request: ServiceRequest,
  date: string,
  time: string,
  now = new Date(),
): string | null {
  const blocked = manageBlock(request, now)
  if (blocked) return blocked
  if (!date || !time) return 'Escolha o dia e o horário.'
  if (date === request.date && time === request.time) return 'Escolha outro dia ou horário.'
  const start = appointmentStart({ date, time })
  if (!start || start.getTime() <= now.getTime()) return 'O novo horário precisa ser no futuro.'
  return null
}
