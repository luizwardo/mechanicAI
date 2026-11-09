export interface MissionFlags {
  paused: boolean
  openedCare: boolean
  scheduledVisit: boolean
}

export interface MissionStep {
  id: 'entender' | 'agendar' | 'registrar'
  title: string
  detail: string
  done: boolean
}

export const EMPTY_MISSIONS: MissionFlags = {
  paused: false,
  openedCare: false,
  scheduledVisit: false,
}

export function missionSteps(flags: MissionFlags, hasRecord: boolean): MissionStep[] {
  return [
    {
      id: 'entender',
      title: 'Entender um cuidado',
      detail: 'Abra um item e leia a explicação em linguagem leiga.',
      done: flags.openedCare,
    },
    {
      id: 'agendar',
      title: 'Agendar com perguntas',
      detail: 'Escolha a oficina, o dia e pelo menos um cuidado.',
      done: flags.scheduledVisit,
    },
    {
      id: 'registrar',
      title: 'Registrar a volta',
      detail: 'Salve data e km depois do serviço. O lembrete só nasce aqui.',
      done: hasRecord,
    },
  ]
}

export function completedMissionCount(steps: MissionStep[]): number {
  return steps.filter((step) => step.done).length
}

export function allMissionsDone(steps: MissionStep[]): boolean {
  return steps.length > 0 && steps.every((step) => step.done)
}

const MISSIONS_KEY = 'mechanicai-missions-v1'

export function loadMissions(): MissionFlags {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY)
    if (!raw) return { ...EMPTY_MISSIONS }
    const parsed = JSON.parse(raw) as Partial<MissionFlags>
    return {
      paused: Boolean(parsed.paused),
      openedCare: Boolean(parsed.openedCare),
      scheduledVisit: Boolean(parsed.scheduledVisit),
    }
  } catch {
    return { ...EMPTY_MISSIONS }
  }
}

export function saveMissions(flags: MissionFlags) {
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(flags))
}
