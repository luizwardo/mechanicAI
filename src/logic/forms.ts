import type { Vehicle } from '../types'

export function validateCurrentKm(raw: string): { km: number } | { error: string } {
  const km = Number(raw.replace(/\D/g, ''))
  if (!km || km < 1) return { error: 'Informe a quilometragem de hoje (só números).' }
  return { km }
}

export function validateKmUpdate(currentKm: number, raw: string): { km: number } | { error: string } {
  const parsed = validateCurrentKm(raw)
  if ('error' in parsed) return { error: 'Informe um km igual ou maior que o atual.' }
  if (parsed.km < currentKm) return { error: 'Informe um km igual ou maior que o atual.' }
  return parsed
}

export function validateSchedule(input: { workshopId: string; date: string; careCount: number }): string | null {
  if (!input.workshopId) return 'Escolha a oficina para onde vai levar o carro.'
  if (!input.date) return 'Escolha o dia do atendimento.'
  if (input.careCount < 1) return 'Marque pelo menos um cuidado.'
  return null
}

export function validateService(input: {
  date: string
  kmRaw: string
  currentKm: number
  valueRaw: string
}): { error: string } | { date: string; km: number; value?: number } {
  const km = Number(input.kmRaw.replace(/\D/g, ''))
  if (!input.date || !km) {
    return { error: 'Data e quilometragem são obrigatórias para criar o lembrete.' }
  }
  if (km > input.currentKm) {
    return { error: 'A km do serviço não pode ser maior que a km atual do carro.' }
  }
  const trimmed = input.valueRaw.trim()
  if (!trimmed) return { date: input.date, km }
  const value = Number(trimmed.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) return { error: 'O valor precisa ser um número, ou deixe o campo vazio.' }
  return { date: input.date, km, value }
}

export function validateCar(input: {
  brand: string
  model: string
  year: number
  kmRaw: string
  known: boolean
  revDate: string
  revKmRaw: string
}): { error: string } | { vehicle: Vehicle } {
  const current = validateCurrentKm(input.kmRaw)
  if ('error' in current) return current
  if (!input.known) {
    return {
      vehicle: {
        brand: input.brand,
        model: input.model,
        year: input.year,
        currentKm: current.km,
        lastRevisionKnown: false,
      },
    }
  }
  const lastKm = Number(input.revKmRaw.replace(/\D/g, ''))
  if (!lastKm || !input.revDate) {
    return { error: 'Se você sabe a última revisão, preencha data e km — ou marque “Não sei”.' }
  }
  if (lastKm > current.km) {
    return { error: 'A km da revisão não pode ser maior que a de hoje.' }
  }
  return {
    vehicle: {
      brand: input.brand,
      model: input.model,
      year: input.year,
      currentKm: current.km,
      lastRevisionKnown: true,
      lastRevisionDate: input.revDate,
      lastRevisionKm: lastKm,
    },
  }
}
