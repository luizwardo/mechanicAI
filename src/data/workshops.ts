export interface Workshop {
  id: string
  name: string
  neighborhood: string
  city: string
  specialty: string
  rating: number
  distanceKm: number
  fidelized: true
  phone: string
}

/** Oficinas fidelizadas (mock para demo — sem API). */
export const WORKSHOPS: Workshop[] = [
  {
    id: 'of-1',
    name: 'Oficina do Gustavo',
    neighborhood: 'Pedra Branca',
    city: 'Palhoça',
    specialty: 'Revisão e freios',
    rating: 4.8,
    distanceKm: 1.2,
    fidelized: true,
    phone: '(48) 99999-1001',
  },
  {
    id: 'of-2',
    name: 'Motor Fácil UniSul',
    neighborhood: 'Pedra Branca',
    city: 'Palhoça',
    specialty: 'Óleo, filtros e alinhamento',
    rating: 4.6,
    distanceKm: 0.8,
    fidelized: true,
    phone: '(48) 99999-1002',
  },
  {
    id: 'of-3',
    name: 'Auto Center Bairro',
    neighborhood: 'Campinas',
    city: 'São José',
    specialty: 'Suspensão e correia',
    rating: 4.5,
    distanceKm: 4.1,
    fidelized: true,
    phone: '(48) 99999-1003',
  },
  {
    id: 'of-4',
    name: 'Freios & Cia',
    neighborhood: 'Kobrasol',
    city: 'São José',
    specialty: 'Freios e pastilhas',
    rating: 4.7,
    distanceKm: 5.3,
    fidelized: true,
    phone: '(48) 99999-1004',
  },
  {
    id: 'of-5',
    name: 'Elétrica do Marinho',
    neighborhood: 'Centro',
    city: 'Palhoça',
    specialty: 'Bateria e elétrica',
    rating: 4.4,
    distanceKm: 3.0,
    fidelized: true,
    phone: '(48) 99999-1005',
  },
  {
    id: 'of-6',
    name: 'Revisão Clara',
    neighborhood: 'Trindade',
    city: 'Florianópolis',
    specialty: 'Explicação leiga + revisão',
    rating: 4.9,
    distanceKm: 12.5,
    fidelized: true,
    phone: '(48) 99999-1006',
  },
]

export function searchWorkshops(query: string): Workshop[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...WORKSHOPS].sort((a, b) => a.distanceKm - b.distanceKm)
  return WORKSHOPS.filter((w) => {
    const hay = `${w.name} ${w.neighborhood} ${w.city} ${w.specialty}`.toLowerCase()
    return hay.includes(q)
  }).sort((a, b) => a.distanceKm - b.distanceKm)
}
