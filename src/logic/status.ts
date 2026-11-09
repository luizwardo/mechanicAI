import { CARES } from '../data/cares'
import type { CareDefinition, CareId, CareStatus, ServiceRecord, Vehicle } from '../types'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function monthsBetween(fromIso: string, to = new Date()): number {
  const from = new Date(fromIso)
  const days = (to.getTime() - from.getTime()) / MS_PER_DAY
  return days / 30.44
}

export function latestRecord(records: ServiceRecord[], careId: CareId): ServiceRecord | undefined {
  return records
    .filter((r) => r.careId === careId)
    .sort((a, b) => b.km - a.km || b.date.localeCompare(a.date))[0]
}

/**
 * Regra central do produto: sem data/km informado pela pessoa,
 * o status é "sem registro" — nunca "atrasado" inventado.
 */
export function resolveCareStatus(
  care: CareDefinition,
  vehicle: Vehicle,
  records: ServiceRecord[],
): CareStatus {
  const last = latestRecord(records, care.id)

  if (!last) {
    return 'sem_registro'
  }

  const kmUsed = vehicle.currentKm - last.km
  const monthsUsed = monthsBetween(last.date)

  const kmRatio = kmUsed / care.intervalKm
  const monthRatio = monthsUsed / care.intervalMonths
  const ratio = Math.max(kmRatio, monthRatio)

  if (ratio >= 1) return 'vencida'
  if (ratio >= 0.8) return 'proxima'
  return 'em_dia'
}

export function statusLabel(status: CareStatus): string {
  switch (status) {
    case 'sem_registro':
      return 'Sem registro'
    case 'em_dia':
      return 'Em dia'
    case 'proxima':
      return 'Em breve'
    case 'vencida':
      return 'Na hora de cuidar'
  }
}

export function statusHint(status: CareStatus): string {
  switch (status) {
    case 'sem_registro':
      return 'Ainda não há data ou km. Não marcamos atraso.'
    case 'em_dia':
      return 'Dentro do intervalo de referência.'
    case 'proxima':
      return 'Chegando perto do intervalo. Vale preparar a visita.'
    case 'vencida':
      return 'Com base no que você registrou, já passou o intervalo.'
  }
}

export interface CareRow {
  care: CareDefinition
  status: CareStatus
  last?: ServiceRecord
}

export function buildCareRows(vehicle: Vehicle, records: ServiceRecord[]): CareRow[] {
  return CARES.map((care) => ({
    care,
    status: resolveCareStatus(care, vehicle, records),
    last: latestRecord(records, care.id),
  }))
}

export function suggestedVisitIds(rows: CareRow[]): CareId[] {
  const priority: CareStatus[] = ['vencida', 'proxima', 'sem_registro']
  const picked: CareId[] = []
  for (const st of priority) {
    for (const row of rows) {
      if (row.status === st && picked.length < 3) {
        picked.push(row.care.id)
      }
    }
  }
  return picked
}

export function nextReminderText(vehicle: Vehicle, records: ServiceRecord[]): string {
  const rows = buildCareRows(vehicle, records).filter((r) => r.status !== 'sem_registro')
  if (rows.length === 0) {
    return 'Nenhum lembrete ativo. O aviso só nasce depois que você registrar um cuidado.'
  }
  const urgent = rows.find((r) => r.status === 'vencida')
  if (urgent) {
    return `Próxima ação: falar sobre ${urgent.care.name.toLowerCase()} na oficina.`
  }
  const soon = rows.find((r) => r.status === 'proxima')
  if (soon) {
    return `Em breve: ${soon.care.name}.`
  }
  return 'Seus cuidados com registro estão em dia.'
}
