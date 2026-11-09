import type { CareId, RequestStatus, ServiceRequest } from '../types'

const REQUESTS_KEY = 'mechanicai-requests-v2'

function dayOffset(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function sim(
  id: string,
  workshopId: string,
  day: number,
  time: string,
  status: RequestStatus,
  clientName: string,
  vehicleLabel: string,
  km: number,
  careIds: CareId[],
): ServiceRequest {
  return {
    id,
    workshopId,
    clientKey: `demo:${id}`,
    clientName,
    vehicleLabel,
    km,
    careIds,
    date: dayOffset(day),
    time,
    status,
  }
}

/** Horários de demonstração. O pedido real do cliente entra na mesma lista. */
export function demoRequests(): ServiceRequest[] {
  return [
    sim('sim-1a', 'of-1', -1, '15:00', 'concluida', 'Beatriz Nunes', 'Volkswagen Polo 2018', 62000, ['oleo', 'filtro_ar']),
    sim('sim-1b', 'of-1', 0, '08:30', 'aceita', 'Ana Souza', 'Hyundai HB20 2020', 41000, ['oleo', 'filtro_ar']),
    sim('sim-1c', 'of-1', 0, '10:00', 'aceita', 'Carlos Lima', 'Chevrolet Onix 2019', 53000, ['pastilhas']),
    sim('sim-1d', 'of-1', 0, '14:30', 'nova', 'Marina Alves', 'Volkswagen Gol 2016', 78000, ['alinhamento']),
    sim('sim-1e', 'of-1', 0, '16:30', 'recusada', 'Lucas Pires', 'Fiat Mobi 2017', 39000, ['arrefecimento']),
    sim('sim-1f', 'of-1', 1, '09:00', 'aceita', 'Pedro Martins', 'Fiat Argo 2021', 22000, ['oleo', 'filtro_ar']),
    sim('sim-1g', 'of-1', 1, '11:30', 'nova', 'Júlia Ferreira', 'Hyundai Creta 2022', 18000, ['bateria']),
    sim('sim-1h', 'of-1', 2, '16:00', 'aceita', 'Ricardo Teixeira', 'Ford Ka 2016', 74000, ['correia']),

    sim('sim-2a', 'of-2', -1, '11:00', 'concluida', 'Paulo Henrique', 'Chevrolet Celta 2014', 91000, ['pastilhas']),
    sim('sim-2b', 'of-2', 0, '09:00', 'aceita', 'Fernanda Dias', 'Fiat Uno 2015', 68000, ['oleo']),
    sim('sim-2c', 'of-2', 0, '13:30', 'nova', 'Diego Ramos', 'Volkswagen Virtus 2020', 34000, ['alinhamento']),
    sim('sim-2d', 'of-2', 1, '08:00', 'aceita', 'Camila Rocha', 'Ford Fiesta 2013', 99000, ['oleo', 'filtro_ar']),

    sim('sim-3a', 'of-3', 0, '10:30', 'aceita', 'Rafael Costa', 'Chevrolet Prisma 2018', 57000, ['correia']),
    sim('sim-3b', 'of-3', 0, '15:00', 'nova', 'Aline Barbosa', 'Hyundai HB20S 2019', 46000, ['alinhamento']),
    sim('sim-3c', 'of-3', 1, '09:30', 'aceita', 'Bruno Vieira', 'Ford EcoSport 2017', 81000, ['pastilhas']),

    sim('sim-4a', 'of-4', -1, '14:00', 'concluida', 'Helena Cruz', 'Fiat Argo 2019', 44000, ['pastilhas']),
    sim('sim-4b', 'of-4', 0, '08:00', 'aceita', 'Thiago Mendes', 'Volkswagen Gol 2012', 112000, ['pastilhas']),
    sim('sim-4c', 'of-4', 0, '11:00', 'nova', 'Sofia Andrade', 'Chevrolet Onix 2021', 27000, ['pastilhas']),
    sim('sim-4d', 'of-4', 1, '15:30', 'aceita', 'Eduardo Lopes', 'Hyundai Creta 2018', 63000, ['pastilhas', 'alinhamento']),

    sim('sim-5a', 'of-5', 0, '09:30', 'aceita', 'Patrícia Melo', 'Fiat Mobi 2020', 31000, ['bateria']),
    sim('sim-5b', 'of-5', 0, '14:00', 'nova', 'Gustavo Reis', 'Ford Ka 2018', 52000, ['bateria']),
    sim('sim-5c', 'of-5', 1, '10:30', 'aceita', 'Larissa Pinto', 'Chevrolet Celta 2013', 88000, ['bateria']),

    sim('sim-6a', 'of-6', 0, '08:30', 'aceita', 'Vanessa Cardoso', 'Volkswagen Polo 2019', 36000, ['oleo', 'filtro_ar']),
    sim('sim-6b', 'of-6', 0, '13:00', 'nova', 'André Silveira', 'Hyundai HB20 2016', 71000, ['arrefecimento']),
    sim('sim-6c', 'of-6', 2, '09:00', 'aceita', 'Clara Monteiro', 'Fiat Uno 2014', 84000, ['oleo']),
  ]
}

function readStored(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ServiceRequest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadRequests(): ServiceRequest[] {
  const byId = new Map(demoRequests().map((request) => [request.id, request]))
  for (const request of readStored()) byId.set(request.id, request)
  return [...byId.values()]
}

export function saveRequests(requests: ServiceRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export function requestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case 'nova':
      return 'Nova'
    case 'aceita':
      return 'Aceita'
    case 'recusada':
      return 'Recusada'
    case 'concluida':
      return 'Concluída'
    case 'cancelada':
      return 'Cancelada'
  }
}

export function dayHeading(iso: string): string {
  const target = new Date(`${iso}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  const label = target.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function whenLabel(request: Pick<ServiceRequest, 'date' | 'time'>): string {
  const date = new Date(`${request.date}T12:00:00`).toLocaleDateString('pt-BR')
  return request.time ? `${date} · ${request.time}` : date
}

export function requestPill(status: RequestStatus): string {
  switch (status) {
    case 'nova':
      return 'proxima'
    case 'aceita':
      return 'em_dia'
    case 'recusada':
      return 'vencida'
    case 'concluida':
      return 'sem_registro'
    case 'cancelada':
      return 'cancelada'
  }
}
