import type { CareDefinition } from '../types'

/** Intervalos de referência (hipótese de trabalho / demo — não substituem manual oficial). */
export const CARES: CareDefinition[] = [
  {
    id: 'oleo',
    name: 'Óleo e filtro do motor',
    plainPhrase:
      'É o “sangue” do motor: lubrifica e limpa. Trocar no prazo evita desgaste caro.',
    whyItMatters: 'Óleo velho deixa o motor mais quente e mais ruidoso.',
    diyOrShop: 'oficina',
    intervalKm: 10000,
    intervalMonths: 12,
    visitQuestions: [
      'É urgente fazer agora, ou posso marcar para outra semana?',
      'Quanto tempo o carro fica na oficina?',
      'O valor inclui óleo, filtro e mão de obra?',
    ],
  },
  {
    id: 'filtro_ar',
    name: 'Filtro de ar',
    plainPhrase:
      'É o “nariz” do motor: limpa o ar que entra. Sujo, o carro gasta mais e anda pior.',
    whyItMatters: 'Filtro entupido reduz desempenho e aumenta consumo.',
    diyOrShop: 'voce_ou_oficina',
    diyHint: 'Em muitos carros dá para trocar em casa com cuidado. Se não tiver certeza, peça na oficina.',
    intervalKm: 15000,
    intervalMonths: 12,
    visitQuestions: [
      'O filtro atual está muito sujo?',
      'Vocês têm o código certo para o meu motor?',
      'Dá para trocar junto com o óleo?',
    ],
  },
  {
    id: 'pastilhas',
    name: 'Pastilhas de freio',
    plainPhrase:
      'São as peças que apertam o disco para o carro parar. No fim da vida, o freio “chia” ou fica mole.',
    whyItMatters: 'Freio gasto aumenta a distância de parada — risco na direção.',
    diyOrShop: 'oficina',
    intervalKm: 30000,
    intervalMonths: 24,
    visitQuestions: [
      'Ainda dá para usar, ou já precisa trocar?',
      'Os discos também precisam ser trocados?',
      'O valor inclui as quatro rodas ou só as da frente?',
    ],
  },
  {
    id: 'alinhamento',
    name: 'Alinhamento e balanceamento',
    plainPhrase:
      'Deixa as rodas “apontando” certo. Se o volante puxa ou treme, vale checar.',
    whyItMatters: 'Desalinhado gasta pneu de um lado e deixa a direção cansativa.',
    diyOrShop: 'oficina',
    intervalKm: 10000,
    intervalMonths: 12,
    visitQuestions: [
      'Vocês checam alinhamento e balanceamento juntos?',
      'Meus pneus estão gastando de forma estranha?',
      'Quanto tempo leva e preciso esperar no local?',
    ],
  },
  {
    id: 'correia',
    name: 'Correia dentada (quando o motor usa)',
    plainPhrase:
      'Sincroniza o motor. Se romper, o prejuízo pode ser grande. Nem todo carro tem — confirme no seu.',
    whyItMatters: 'Rompimento pode danificar o motor. O mecânico confirma se o seu modelo usa.',
    diyOrShop: 'oficina',
    intervalKm: 60000,
    intervalMonths: 48,
    visitQuestions: [
      'O meu motor usa correia dentada ou corrente?',
      'Já está na hora pela quilometragem?',
      'O kit inclui tensionadores e bomba d’água?',
    ],
  },
  {
    id: 'arrefecimento',
    name: 'Água / fluido do radiador',
    plainPhrase:
      'Evita o motor superaquecer. Nível baixo ou fluido escuro pedem atenção.',
    whyItMatters: 'Superaquecimento pode fundir o motor.',
    diyOrShop: 'voce_ou_oficina',
    diyHint: 'Você pode olhar o nível com o motor frio. Completar e trocar o fluido costuma ser com a oficina.',
    intervalKm: 40000,
    intervalMonths: 24,
    visitQuestions: [
      'O nível está baixo ou o fluido precisa ser trocado?',
      'Há vazamento?',
      'Posso completar em casa com o produto certo?',
    ],
  },
  {
    id: 'bateria',
    name: 'Bateria',
    plainPhrase:
      'Liga o carro e alimenta os elétricos. Velha, o motor de arranque “engasga” ou não parte.',
    whyItMatters: 'Bateria fraca deixa você parado — às vezes sem aviso longo.',
    diyOrShop: 'oficina',
    intervalKm: 50000,
    intervalMonths: 36,
    visitQuestions: [
      'A bateria ainda está boa no teste?',
      'Qual a amperagem correta para o meu carro?',
      'A troca inclui a garantia escrita?',
    ],
  },
]

export function getCare(id: string): CareDefinition | undefined {
  return CARES.find((c) => c.id === id)
}
