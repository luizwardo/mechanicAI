export type CareId =
  | 'oleo'
  | 'filtro_ar'
  | 'pastilhas'
  | 'alinhamento'
  | 'correia'
  | 'arrefecimento'
  | 'bateria'

export type CareStatus = 'sem_registro' | 'em_dia' | 'proxima' | 'vencida'

export type AccountRole = 'cliente' | 'provedor'

export type RequestStatus = 'nova' | 'aceita' | 'recusada' | 'concluida' | 'cancelada'

export type Screen =
  | 'welcome'
  | 'createAccount'
  | 'login'
  | 'onboarding'
  | 'home'
  | 'care'
  | 'visit'
  | 'register'
  | 'history'
  | 'km'
  | 'providerRequest'
  | 'appointment'

export interface ServiceRequest {
  id: string
  workshopId: string
  clientKey: string
  clientName: string
  vehicleLabel: string
  km: number
  careIds: CareId[]
  date: string
  time?: string
  status: RequestStatus
  clientConfirmed?: boolean
}

export interface CareDefinition {
  id: CareId
  name: string
  plainPhrase: string
  whyItMatters: string
  diyOrShop: 'oficina' | 'voce_ou_oficina'
  diyHint?: string
  intervalKm: number
  intervalMonths: number
  visitQuestions: string[]
}

export interface ServiceRecord {
  id: string
  careId: CareId
  date: string
  km: number
  notes?: string
  value?: number
}

export interface Vehicle {
  brand: string
  model: string
  year: number
  currentKm: number
  lastRevisionKnown: boolean
  lastRevisionDate?: string
  lastRevisionKm?: number
}

export interface AppState {
  vehicle: Vehicle | null
  records: ServiceRecord[]
  selectedCareId: CareId | null
  visitCareIds: CareId[]
  screen: Screen
  toast: string | null
}
