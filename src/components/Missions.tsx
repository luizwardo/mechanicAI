import { allMissionsDone, completedMissionCount, missionSteps, type MissionFlags } from '../logic/progress'

export function MissionCard({
  flags,
  hasRecord,
  onPause,
}: {
  flags: MissionFlags
  hasRecord: boolean
  onPause: () => void
}) {
  const steps = missionSteps(flags, hasRecord)
  const done = completedMissionCount(steps)
  const finished = allMissionsDone(steps)

  if (flags.paused) {
    return (
      <section className="mission-card" aria-label="Missões pausadas">
        <h2 className="section-title">Missões pausadas</h2>
        <p className="helper tight">O progresso continua salvo. Nada é cobrado e não existe ranking.</p>
        <button type="button" className="btn btn-ghost" onClick={onPause}>
          Retomar missões
        </button>
      </section>
    )
  }

  return (
    <section className="mission-card" aria-label="Missões desta visita">
      <div className="section-head">
        <h2 className="section-title">Missões desta visita</h2>
        <span className="section-count">
          {done}/{steps.length}
        </span>
      </div>
      <p className="helper tight">
        Opcional. Ajuda a chegar na oficina sabendo o que perguntar. Pausar não apaga nada e não existe
        ranking.
      </p>
      <progress value={done} max={steps.length} aria-label="Progresso pessoal das missões">
        {done} de {steps.length}
      </progress>
      <ul className="mission-list">
        {steps.map((step) => (
          <li key={step.id} data-done={step.done}>
            <strong>{step.done ? 'Feito' : 'A fazer'}</strong>
            <span>
              {step.title}. {step.detail}
            </span>
          </li>
        ))}
      </ul>
      {finished && (
        <p className="mission-medal">Medalha pessoal: visita compreendida. Só você vê isso.</p>
      )}
      <button type="button" className="btn btn-ghost" onClick={onPause}>
        Pausar missões
      </button>
    </section>
  )
}
