/** Catálogo local para demo (simula seleção tipo FIPE, sem API). */
export const BRANDS = ['Volkswagen', 'Fiat', 'Chevrolet', 'Ford', 'Hyundai'] as const

export const MODELS: Record<(typeof BRANDS)[number], string[]> = {
  Volkswagen: ['Gol 1.0', 'Polo 1.0', 'Virtus 1.6'],
  Fiat: ['Uno 1.0', 'Argo 1.0', 'Mobi 1.0'],
  Chevrolet: ['Onix 1.0', 'Prisma 1.4', 'Celta 1.0'],
  Ford: ['Ka 1.0', 'Fiesta 1.6', 'EcoSport 1.5'],
  Hyundai: ['HB20 1.0', 'HB20S 1.6', 'Creta 1.6'],
}

export const YEARS = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]

export const DEMO_VEHICLE = {
  brand: 'Volkswagen',
  model: 'Gol 1.0',
  year: 2014,
  currentKm: 87000,
  lastRevisionKnown: false,
} as const
