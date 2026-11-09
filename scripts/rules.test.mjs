import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'

const require = createRequire(import.meta.url)
const { CARES } = require('../dist-test/data/cares.js')
const { confirmWindow, validateReschedule } = require('../dist-test/logic/appointments.js')
const { validateCar, validateKmUpdate, validateSchedule, validateService } = require('../dist-test/logic/forms.js')
const { parseAppState } = require('../dist-test/logic/persist.js')
const { hashPassword, isPasswordHash, passwordMatches } = require('../dist-test/logic/password.js')
const { allMissionsDone, completedMissionCount, missionSteps } = require('../dist-test/logic/progress.js')
const { resolveCareStatus } = require('../dist-test/logic/status.js')
const { emptyUsage, formatDuration, markTaskDone, markTaskStart, markValidationError } = require('../dist-test/logic/usage.js')

const vehicle = {
  brand: 'Volkswagen',
  model: 'Gol 1.0',
  year: 2014,
  currentKm: 87000,
  lastRevisionKnown: false,
}

const today = new Date().toISOString().slice(0, 10)

test('não marca atraso sem registro', () => {
  assert.equal(resolveCareStatus(CARES[0], vehicle, []), 'sem_registro')
})

test('classifica pelo km informado', () => {
  const oleo = CARES[0]
  assert.equal(resolveCareStatus(oleo, vehicle, [{ id: '1', careId: 'oleo', date: today, km: 87000 }]), 'em_dia')
  assert.equal(resolveCareStatus(oleo, vehicle, [{ id: '1', careId: 'oleo', date: today, km: 79000 }]), 'proxima')
  assert.equal(resolveCareStatus(oleo, vehicle, [{ id: '1', careId: 'oleo', date: today, km: 77000 }]), 'vencida')
})

test('valida quilometragem, agenda e registro', () => {
  assert.deepEqual(validateKmUpdate(87000, ''), { error: 'Informe um km igual ou maior que o atual.' })
  assert.deepEqual(validateKmUpdate(87000, '88000'), { km: 88000 })
  assert.match(validateSchedule({ workshopId: '', date: today, careCount: 1 }), /oficina/)
  assert.equal(validateSchedule({ workshopId: 'a', date: today, careCount: 2 }), null)
  assert.equal('error' in validateService({ date: '', kmRaw: '', currentKm: 87000, valueRaw: '' }), true)
  assert.deepEqual(validateService({ date: today, kmRaw: '80.000', currentKm: 87000, valueRaw: '350,50' }), {
    date: today,
    km: 80000,
    value: 350.5,
  })
  assert.deepEqual(
    validateCar({
      brand: 'Fiat',
      model: 'Uno 1.0',
      year: 2016,
      kmRaw: '45000',
      known: false,
      revDate: '',
      revKmRaw: '',
    }),
    {
      vehicle: {
        brand: 'Fiat',
        model: 'Uno 1.0',
        year: 2016,
        currentKm: 45000,
        lastRevisionKnown: false,
      },
    },
  )
})

test('guarda só o hash da senha', async () => {
  const hash = await hashPassword('ana@email.com', 'segredo')
  assert.equal(isPasswordHash(hash), true)
  assert.equal(hash.includes('segredo'), false)
  assert.equal(await passwordMatches(hash, 'ana@email.com', 'segredo'), true)
  assert.equal(await passwordMatches(hash, 'ana@email.com', 'outra'), false)
})

test('missão pausada não apaga o progresso', () => {
  const steps = missionSteps({ paused: true, openedCare: true, scheduledVisit: false }, false)
  assert.equal(completedMissionCount(steps), 1)
  assert.equal(allMissionsDone(steps), false)
  assert.equal(allMissionsDone(missionSteps({ paused: false, openedCare: true, scheduledVisit: true }, true)), true)
})

test('mede conclusão, erro e tempo sem dado pessoal', () => {
  let log = markTaskStart(emptyUsage(), 1000)
  log = markTaskStart(log, 9000)
  log = markValidationError(log)
  log = markTaskDone(log, 4000)
  assert.deepEqual(log, { startedAt: null, completions: 1, errors: 1, lastDurationMs: 3000 })
  assert.equal(formatDuration(3000), '3 s')
  assert.equal(JSON.stringify(log).includes('@'), false)
})

test('recusa json inválido e aceita carro vazio', () => {
  assert.deepEqual(parseAppState('{'), { ok: false })
  assert.deepEqual(parseAppState(null), { ok: true, data: { vehicle: null, records: [], workshopId: '' } })
})

function booking(date, time, extra = {}) {
  return {
    id: 'a',
    workshopId: 'of-1',
    clientKey: 'guest',
    clientName: 'Convidado',
    vehicleLabel: 'Gol',
    km: 87000,
    careIds: ['oleo'],
    date,
    time,
    status: 'nova',
    ...extra,
  }
}

test('confirma presença só nas 24 h anteriores', () => {
  const soon = booking('2026-11-11', '10:00')
  const now = new Date(2026, 10, 10, 12, 0, 0)
  assert.equal(confirmWindow(soon, now).state, 'open')
  const later = booking('2026-11-13', '10:00')
  const closed = confirmWindow(later, now)
  assert.equal(closed.state, 'closed')
  assert.match(closed.reason, /24 h antes/)
  assert.equal(confirmWindow(booking('2026-11-09', '09:00'), now).reason, 'O horário já passou.')
  assert.equal(confirmWindow(booking('2026-11-11', '10:00', { clientConfirmed: true }), now).state, 'done')
  assert.equal(validateReschedule(soon, '2026-11-11', '10:00', now), 'Escolha outro dia ou horário.')
  assert.equal(validateReschedule(soon, '2026-11-12', '11:00', now), null)
})
