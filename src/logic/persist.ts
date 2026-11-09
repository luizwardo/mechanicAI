import type { CareId, ServiceRecord, Vehicle } from '../types'

const CARE_IDS: CareId[] = [
  'oleo',
  'filtro_ar',
  'pastilhas',
  'alinhamento',
  'correia',
  'arrefecimento',
  'bateria',
]

export interface SavedApp {
  vehicle: Vehicle | null
  records: ServiceRecord[]
  workshopId: string
}

export function parseAppState(raw: string | null): { ok: true; data: SavedApp } | { ok: false } {
  if (raw == null) return { ok: true, data: { vehicle: null, records: [], workshopId: '' } }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { ok: false }
    const bag = parsed as Record<string, unknown>
    const vehicle = bag.vehicle == null ? null : parseVehicle(bag.vehicle)
    if (bag.vehicle != null && !vehicle) return { ok: false }
    if (!Array.isArray(bag.records)) return { ok: false }
    const records = bag.records.map(parseRecord).filter((record): record is ServiceRecord => record != null)
    if (records.length !== bag.records.length) return { ok: false }
    const workshopId = typeof bag.workshopId === 'string' ? bag.workshopId : ''
    return { ok: true, data: { vehicle, records, workshopId } }
  } catch {
    return { ok: false }
  }
}

function parseVehicle(value: unknown): Vehicle | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.brand !== 'string' || typeof item.model !== 'string') return null
  if (typeof item.year !== 'number' || typeof item.currentKm !== 'number') return null
  if (typeof item.lastRevisionKnown !== 'boolean') return null
  return {
    brand: item.brand,
    model: item.model,
    year: item.year,
    currentKm: item.currentKm,
    lastRevisionKnown: item.lastRevisionKnown,
    lastRevisionDate: typeof item.lastRevisionDate === 'string' ? item.lastRevisionDate : undefined,
    lastRevisionKm: typeof item.lastRevisionKm === 'number' ? item.lastRevisionKm : undefined,
  }
}

function parseRecord(value: unknown): ServiceRecord | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || typeof item.date !== 'string' || typeof item.km !== 'number') return null
  if (typeof item.careId !== 'string' || !CARE_IDS.includes(item.careId as CareId)) return null
  return {
    id: item.id,
    careId: item.careId as CareId,
    date: item.date,
    km: item.km,
    notes: typeof item.notes === 'string' ? item.notes : undefined,
    value: typeof item.value === 'number' ? item.value : undefined,
  }
}
