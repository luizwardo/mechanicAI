import { useCallback, useEffect, useState } from 'react'
import {
  authenticate,
  createUser,
  loadSession,
  saveSession,
  type Session,
} from './auth/storage'
import { BottomNav, type MainTab } from './components/BottomNav'
import { Toast } from './components/Shell'
import { loadRequests, requestStatusLabel, saveRequests } from './data/requests'
import { DEMO_VEHICLE } from './data/vehicles'
import { WORKSHOPS, type Workshop } from './data/workshops'
import { clearDrafts } from './logic/draft'
import { parseAppState } from './logic/persist'
import { EMPTY_MISSIONS, loadMissions, saveMissions, type MissionFlags } from './logic/progress'
import {
  emptyUsage,
  loadUsage,
  markTaskDone,
  markTaskStart,
  markValidationError,
  saveUsage,
  type UsageLog,
} from './logic/usage'
import { CreateAccount, Login } from './screens/Auth'
import { CareDetail } from './screens/CareDetail'
import { HelpMenu } from './screens/HelpMenu'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { RegisterService } from './screens/RegisterService'
import { ProviderInbox } from './screens/ProviderInbox'
import { ProviderRequest } from './screens/ProviderRequest'
import { Search } from './screens/Search'
import { AppointmentDetail } from './screens/AppointmentDetail'
import { MyAppointments } from './screens/MyAppointments'
import { UpdateKm } from './screens/UpdateKm'
import { VisitSheet } from './screens/VisitSheet'
import { Welcome } from './screens/Welcome'
import type { AccountRole, AppState, CareId, RequestStatus, Screen, ServiceRecord, ServiceRequest, Vehicle } from './types'

const STORAGE_KEY = 'mechanicai-mvp-v2'
const UI_KEY = 'mechanicai-screen-v1'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function pickScreen(session: Session | null, vehicle: Vehicle | null, snap: { screen?: Screen } | null): Screen {
  const clientScreens: Screen[] = ['onboarding', 'home', 'care', 'visit', 'register', 'history', 'km']
  if (!session) {
    if (snap?.screen === 'login' || snap?.screen === 'createAccount') return snap.screen
    return 'welcome'
  }
  if (session.role === 'provedor') {
    return snap?.screen === 'providerRequest' ? 'providerRequest' : 'home'
  }
  if (!vehicle) return 'onboarding'
  if (snap?.screen && clientScreens.includes(snap.screen)) return snap.screen
  return 'home'
}

function readSnap(): { screen?: Screen; tab?: MainTab; selectedCareId?: CareId | null; visitCareIds?: CareId[] } | null {
  try {
    const raw = sessionStorage.getItem(UI_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { screen?: Screen; tab?: MainTab; selectedCareId?: CareId | null; visitCareIds?: CareId[] }
  } catch {
    return null
  }
}

function NetBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])
  if (online) return null
  return (
    <p className="net-banner" role="status">
      Sem rede. Dá para continuar: carro, registros e agendamento ficam neste aparelho.
    </p>
  )
}

export default function App() {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [bootAttempt, setBootAttempt] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [screen, setScreen] = useState<AppState['screen']>('welcome')
  const [tab, setTab] = useState<MainTab>('home')
  const [selectedCareId, setSelectedCareId] = useState<CareId | null>(null)
  const [visitCareIds, setVisitCareIds] = useState<CareId[]>([])
  const [authRole, setAuthRole] = useState<AccountRole>('cliente')
  const [workshopId, setWorkshopId] = useState('')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [missions, setMissions] = useState<MissionFlags>(EMPTY_MISSIONS)
  const [usage, setUsage] = useState<UsageLog>(emptyUsage())

  useEffect(() => {
    const parsed = parseAppState(localStorage.getItem(STORAGE_KEY))
    if (!parsed.ok) {
      setPhase('error')
      return
    }
    const nextSession = loadSession()
    const snap = readSnap()
    setVehicle(parsed.data.vehicle)
    setRecords(parsed.data.records)
    setWorkshopId(parsed.data.workshopId)
    setSession(nextSession)
    setRequests(loadRequests())
    setMissions(loadMissions())
    setUsage(loadUsage())
    setScreen(pickScreen(nextSession, parsed.data.vehicle, snap))
    if (snap?.tab === 'home' || snap?.tab === 'search' || snap?.tab === 'agenda' || snap?.tab === 'help') setTab(snap.tab)
    if (snap?.selectedCareId) setSelectedCareId(snap.selectedCareId)
    if (Array.isArray(snap?.visitCareIds)) setVisitCareIds(snap.visitCareIds)
    setPhase('ready')
  }, [bootAttempt])

  useEffect(() => {
    if (phase !== 'ready') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicle, records, workshopId }))
  }, [phase, vehicle, records, workshopId])

  useEffect(() => {
    if (phase !== 'ready') return
    saveRequests(requests)
  }, [phase, requests])

  useEffect(() => {
    if (phase !== 'ready') return
    saveMissions(missions)
  }, [phase, missions])

  useEffect(() => {
    if (phase !== 'ready') return
    saveUsage(usage)
  }, [phase, usage])

  useEffect(() => {
    if (phase !== 'ready') return
    sessionStorage.setItem(
      UI_KEY,
      JSON.stringify({ screen, tab, selectedCareId, visitCareIds }),
    )
  }, [phase, screen, tab, selectedCareId, visitCareIds])

  useEffect(() => {
    if (phase !== 'ready' || session?.role !== 'cliente' || !vehicle || screen !== 'home') return
    setUsage((log) => markTaskStart(log, Date.now()))
  }, [phase, session, vehicle, screen])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const noteInvalid = useCallback(() => {
    setUsage((log) => markValidationError(log))
  }, [])

  const noteDone = useCallback(() => {
    setUsage((log) => markTaskDone(log, Date.now()))
  }, [])

  function enterApp(next: Session, message: string, hasVehicle = Boolean(vehicle)) {
    setSession(next)
    saveSession(next)
    setTab('home')
    setSelectedRequestId(null)
    showToast(message)
    setScreen(next.role === 'provedor' || hasVehicle ? 'home' : 'onboarding')
  }

  function goHome() {
    setTab('home')
    setScreen('home')
    setSelectedCareId(null)
  }

  function resetAll() {
    const provider = session?.role === 'provedor'
    if (provider) {
      if (!window.confirm('Sair da conta da oficina?')) return
      setSession(null)
      saveSession(null)
      setSelectedRequestId(null)
      setTab('home')
      setScreen('welcome')
      return
    }
    if (!window.confirm('Sair e apagar carro, histórico e missões deste aparelho?')) return
    setVehicle(null)
    setRecords([])
    setVisitCareIds([])
    setSelectedCareId(null)
    setSession(null)
    saveSession(null)
    setMissions({ ...EMPTY_MISSIONS })
    setUsage(emptyUsage())
    clearDrafts()
    setTab('home')
    setScreen('welcome')
    localStorage.removeItem(STORAGE_KEY)
  }

  function onWorkshopSelect(workshop: Workshop) {
    setWorkshopId(workshop.id)
    showToast(`${workshop.name} selecionada para o atendimento.`)
  }

  function toggleMissions() {
    setMissions((prev) => ({ ...prev, paused: !prev.paused }))
  }

  const providerSession =
    session?.role === 'provedor'
      ? {
          name: session.mode === 'user' ? session.name : 'Convidado',
          workshopId: session.workshopId,
        }
      : null
  const showHotbar = screen === 'home' && (!!providerSession || !!vehicle)
  const clientKey = session?.mode === 'user' ? session.email : 'guest'
  const latestRequest = requests.find((r) => r.clientKey === clientKey)
  const latestWorkshop = WORKSHOPS.find((w) => w.id === latestRequest?.workshopId)
  const upcomingLabel = latestRequest
    ? `${requestStatusLabel(latestRequest.status)} · ${latestWorkshop?.name ?? 'Oficina'} · ${new Date(latestRequest.date + 'T12:00:00').toLocaleDateString('pt-BR')}`
    : undefined
  const providerWorkshop = WORKSHOPS.find((w) => w.id === providerSession?.workshopId)
  const providerRequests = providerSession
    ? requests.filter((r) => r.workshopId === providerSession.workshopId)
    : []
  const openRequest = requests.find((r) => r.id === selectedRequestId) ?? null

  function setRequestStatus(id: string, status: RequestStatus) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    const label =
      status === 'aceita' ? 'Pedido aceito.' : status === 'recusada' ? 'Pedido recusado.' : 'Pedido concluído.'
    showToast(label)
    setScreen('home')
  }

  return (
    <div className="phone-frame">
      <NetBanner />
      <Toast message={toast} />

      {phase === 'loading' && (
        <main className="boot" role="status" aria-live="polite">
          <p className="eyebrow">mechanicAI</p>
          <h1>Abrindo seus dados neste aparelho…</h1>
        </main>
      )}

      {phase === 'error' && (
        <main className="boot">
          <p className="eyebrow">Dados</p>
          <h1>Não consegui ler o que estava salvo</h1>
          <p className="helper" role="alert">
            O arquivo neste aparelho está ilegível. Nada novo foi gravado por cima. Você pode tentar de novo
            ou começar sem esses dados.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPhase('loading')
              setBootAttempt((n) => n + 1)
            }}
          >
            Tentar de novo
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              setVehicle(null)
              setRecords([])
              setWorkshopId('')
              setScreen('welcome')
              setPhase('ready')
            }}
          >
            Começar sem os dados antigos
          </button>
        </main>
      )}

      {phase === 'ready' && screen === 'welcome' && (
        <Welcome
          role={authRole}
          workshopId={workshopId || WORKSHOPS[0].id}
          onWorkshopChange={setWorkshopId}
          onRoleChange={(role) => {
            setAuthRole(role)
            if (role === 'provedor' && !workshopId) setWorkshopId(WORKSHOPS[0].id)
          }}
          onCreateAccount={() => setScreen('createAccount')}
          onLogin={() => setScreen('login')}
          onGuest={() => {
            if (authRole === 'provedor') {
              const id = workshopId || WORKSHOPS[0].id
              enterApp(
                { mode: 'guest', role: 'provedor', workshopId: id },
                'Entrando como convidado da oficina.',
              )
              return
            }
            enterApp({ mode: 'guest', role: 'cliente' }, 'Entrando como convidado.')
          }}
          onDemo={() => {
            setVehicle({ ...DEMO_VEHICLE })
            setRecords([])
            if (!workshopId) setWorkshopId(WORKSHOPS[0].id)
            enterApp(
              { mode: 'guest', role: 'cliente' },
              'Demo do Gol 1.0 aberta. Sem registro, nada fica atrasado.',
              true,
            )
          }}
        />
      )}

      {phase === 'ready' && screen === 'createAccount' && (
        <CreateAccount
          initialRole={authRole}
          onRoleChange={setAuthRole}
          onBack={() => setScreen('welcome')}
          onInvalid={noteInvalid}
          onSubmit={async (user) => {
            const err = await createUser(user)
            if (err) return err
            if (user.role === 'provedor' && user.workshopId) {
              enterApp(
                {
                  mode: 'user',
                  role: 'provedor',
                  name: user.name,
                  email: user.email,
                  workshopId: user.workshopId,
                },
                `Oficina pronta. Olá, ${user.name}!`,
              )
              return null
            }
            enterApp(
              { mode: 'user', role: 'cliente', name: user.name, email: user.email },
              `Conta criada. Olá, ${user.name}!`,
            )
            return null
          }}
        />
      )}

      {phase === 'ready' && screen === 'login' && (
        <Login
          initialRole={authRole}
          onRoleChange={setAuthRole}
          onBack={() => setScreen('welcome')}
          onInvalid={noteInvalid}
          onSubmit={async (email, password, role) => {
            const result = await authenticate(email, password, role)
            if (typeof result === 'string') return result
            if (result.role === 'provedor') {
              if (!result.workshopId) return 'Esta conta de oficina está sem oficina vinculada.'
              enterApp(
                {
                  mode: 'user',
                  role: 'provedor',
                  name: result.name,
                  email: result.email,
                  workshopId: result.workshopId,
                },
                `Olá, ${result.name}!`,
              )
              return null
            }
            enterApp(
              { mode: 'user', role: 'cliente', name: result.name, email: result.email },
              `Olá de novo, ${result.name}!`,
            )
            return null
          }}
        />
      )}

      {phase === 'ready' && screen === 'onboarding' && (
        <Onboarding
          initial={vehicle}
          onInvalid={noteInvalid}
          onBack={() => {
            if (vehicle) {
              setTab('help')
              setScreen('home')
              return
            }
            setSession(null)
            saveSession(null)
            setScreen('welcome')
          }}
          onComplete={(v) => {
            setVehicle(v)
            const seeded: ServiceRecord[] =
              v.lastRevisionKnown && v.lastRevisionDate && v.lastRevisionKm != null
                ? [
                    {
                      id: uid(),
                      careId: 'oleo',
                      date: v.lastRevisionDate,
                      km: v.lastRevisionKm,
                      notes: 'Revisão geral informada no cadastro',
                    },
                  ]
                : []
            setRecords(seeded)
            setTab('home')
            setScreen('home')
            showToast(
              v.lastRevisionKnown
                ? 'Carro salvo. Óleo partiu do que você informou.'
                : 'Carro salvo. “Não sei” registrado — sem atraso inventado.',
            )
          }}
        />
      )}

      {phase === 'ready' && showHotbar && providerSession && (
        <div className="main-tabs">
          {tab === 'home' && (
            <ProviderInbox
              mode="solicitacoes"
              workshopName={providerWorkshop?.name ?? 'Oficina'}
              requests={providerRequests}
              onOpen={(id) => {
                setSelectedRequestId(id)
                setScreen('providerRequest')
              }}
            />
          )}
          {tab === 'search' && (
            <ProviderInbox
              mode="agenda"
              workshopName={providerWorkshop?.name ?? 'Oficina'}
              requests={providerRequests}
              onOpen={(id) => {
                setSelectedRequestId(id)
                setScreen('providerRequest')
              }}
            />
          )}
          {tab === 'help' && (
            <HelpMenu
              variant="provedor"
              session={session}
              vehicle={null}
              workshopName={providerWorkshop?.name}
              onHistory={() => undefined}
              onEditCar={() => undefined}
              onUpdateKm={() => undefined}
              onProfile={() => {
                showToast(`${providerSession.name} · ${providerWorkshop?.name ?? 'Oficina'}`)
              }}
              onLogout={resetAll}
            />
          )}
          <BottomNav mode="provedor" active={tab} onChange={setTab} />
        </div>
      )}

      {phase === 'ready' && showHotbar && !providerSession && vehicle && (
        <div className="main-tabs">
          {tab === 'home' && (
            <Home
              vehicle={vehicle}
              records={records}
              workshopId={workshopId}
              onWorkshopChange={setWorkshopId}
              upcomingLabel={upcomingLabel}
              missions={missions}
              onToggleMissions={toggleMissions}
              accountLabel={
                session?.mode === 'user'
                  ? session.name
                  : session?.mode === 'guest'
                    ? 'Convidado'
                    : undefined
              }
              onOpenCare={(id) => {
                setMissions((prev) => ({ ...prev, openedCare: true }))
                setSelectedCareId(id)
                setScreen('care')
              }}
              onPrepareVisit={(ids) => {
                if (!workshopId) {
                  showToast('Escolha a oficina antes de agendar.')
                  return
                }
                setVisitCareIds(ids)
                setScreen('visit')
              }}
            />
          )}

          {tab === 'search' && <Search onSelect={onWorkshopSelect} />}

          {tab === 'agenda' && (
            <MyAppointments
              requests={requests.filter((request) => request.clientKey === clientKey)}
              onOpen={(id) => {
                setSelectedRequestId(id)
                setScreen('appointment')
              }}
            />
          )}

          {tab === 'help' && (
            <HelpMenu
              session={session}
              vehicle={vehicle}
              missionsPaused={missions.paused}
              onToggleMissions={toggleMissions}
              usage={usage}
              onHistory={() => setScreen('history')}
              onEditCar={() => {
                setScreen('onboarding')
                showToast('Atualize os dados do carro. Voltar não apaga o que já está salvo.')
              }}
              onUpdateKm={() => setScreen('km')}
              onProfile={() => {
                if (session?.mode === 'user') {
                  showToast(`Perfil: ${session.name} · ${session.email}`)
                } else {
                  showToast('Você está como convidado. Crie uma conta para salvar o perfil.')
                }
              }}
              onLogout={resetAll}
            />
          )}

          <BottomNav active={tab} onChange={setTab} />
        </div>
      )}

      {phase === 'ready' && screen === 'care' && vehicle && selectedCareId && (
        <CareDetail
          careId={selectedCareId}
          vehicle={vehicle}
          records={records}
          onBack={goHome}
          onAddToVisit={() => {
            setVisitCareIds((prev) =>
              prev.includes(selectedCareId) ? prev : [...prev, selectedCareId],
            )
            setScreen('visit')
          }}
          onRegister={() => setScreen('register')}
        />
      )}

      {phase === 'ready' && screen === 'visit' && vehicle && (
        <VisitSheet
          vehicle={vehicle}
          initialIds={visitCareIds}
          workshopId={workshopId}
          onWorkshopChange={setWorkshopId}
          onBack={goHome}
          onInvalid={noteInvalid}
          onSchedule={({ workshopId: chosen, careIds, date, time }) => {
            const request: ServiceRequest = {
              id: uid(),
              workshopId: chosen,
              clientKey,
              clientName: session?.mode === 'user' ? session.name : 'Convidado',
              vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
              km: vehicle.currentKm,
              careIds,
              date,
              time,
              status: 'nova',
            }
            setRequests((prev) => [request, ...prev])
            setMissions((prev) => ({ ...prev, scheduledVisit: true }))
            noteDone()
            const place = WORKSHOPS.find((w) => w.id === chosen)
            showToast(`Agendado em ${place?.name ?? 'a oficina'} às ${time}.`)
            setSelectedCareId(null)
            setTab('agenda')
            setScreen('home')
          }}
        />
      )}

      {phase === 'ready' && screen === 'appointment' && openRequest && openRequest.clientKey === clientKey && (
        <AppointmentDetail
          request={openRequest}
          onBack={() => {
            setTab('agenda')
            setScreen('home')
          }}
          onCancel={() => {
            setRequests((prev) =>
              prev.map((item) =>
                item.id === openRequest.id ? { ...item, status: 'cancelada', clientConfirmed: false } : item,
              ),
            )
            showToast('Agendamento cancelado.')
            setTab('agenda')
            setScreen('home')
          }}
          onConfirm={() => {
            setRequests((prev) =>
              prev.map((item) => (item.id === openRequest.id ? { ...item, clientConfirmed: true } : item)),
            )
            showToast('Presença confirmada.')
          }}
          onReschedule={(date, time) => {
            setRequests((prev) =>
              prev.map((item) =>
                item.id === openRequest.id ? { ...item, date, time, clientConfirmed: false } : item,
              ),
            )
            showToast('Horário remarcado. A confirmação de presença recomeça.')
          }}
        />
      )}

      {phase === 'ready' && screen === 'providerRequest' && providerSession && openRequest && (
        <ProviderRequest
          request={openRequest}
          workshopName={providerWorkshop?.name ?? 'Oficina'}
          onBack={goHome}
          onStatus={(status) => setRequestStatus(openRequest.id, status)}
        />
      )}

      {phase === 'ready' && screen === 'register' && vehicle && selectedCareId && (
        <RegisterService
          careId={selectedCareId}
          vehicle={vehicle}
          onBack={() => setScreen('care')}
          onInvalid={noteInvalid}
          onSave={(partial) => {
            const record: ServiceRecord = { ...partial, id: uid() }
            setRecords((prev) => [...prev, record])
            if (record.km > vehicle.currentKm) {
              setVehicle({ ...vehicle, currentKm: record.km })
            }
            noteDone()
            showToast('Registro salvo. Agora o lembrete pode existir.')
            goHome()
          }}
        />
      )}

      {phase === 'ready' && screen === 'km' && vehicle && (
        <UpdateKm
          vehicle={vehicle}
          onBack={() => {
            setTab('help')
            setScreen('home')
          }}
          onInvalid={noteInvalid}
          onSave={(km) => {
            setVehicle({ ...vehicle, currentKm: km })
            showToast('Quilometragem atualizada.')
            setTab('help')
            setScreen('home')
          }}
        />
      )}

      {phase === 'ready' && screen === 'history' && <History records={records} onBack={goHome} />}
    </div>
  )
}
