import { useCallback, useEffect, useState } from 'react'
import {
  authenticate,
  createUser,
  saveSession,
  type Session,
} from './auth/storage'
import { BottomNav, type MainTab } from './components/BottomNav'
import { Toast } from './components/Shell'
import { loadRequests, requestStatusLabel, saveRequests } from './data/requests'
import { WORKSHOPS, type Workshop } from './data/workshops'
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
import { VisitSheet } from './screens/VisitSheet'
import { Welcome } from './screens/Welcome'
import type { AccountRole, AppState, CareId, RequestStatus, ServiceRecord, ServiceRequest, Vehicle } from './types'

const STORAGE_KEY = 'mechanicai-mvp-v2'

function loadState(): Pick<AppState, 'vehicle' | 'records'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { vehicle: null, records: [] }
    const parsed = JSON.parse(raw) as { vehicle: Vehicle | null; records: ServiceRecord[] }
    return { vehicle: parsed.vehicle ?? null, records: parsed.records ?? [] }
  } catch {
    return { vehicle: null, records: [] }
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function App() {
  const initial = loadState()
  const [session, setSession] = useState<Session | null>(() => {
    saveSession(null)
    return null
  })
  const [vehicle, setVehicle] = useState<Vehicle | null>(initial.vehicle)
  const [records, setRecords] = useState<ServiceRecord[]>(initial.records)
  const [screen, setScreen] = useState<AppState['screen']>('welcome')
  const [tab, setTab] = useState<MainTab>('home')
  const [selectedCareId, setSelectedCareId] = useState<CareId | null>(null)
  const [visitCareIds, setVisitCareIds] = useState<CareId[]>([])
  const [authRole, setAuthRole] = useState<AccountRole>('cliente')
  const [workshopId, setWorkshopId] = useState('')
  const [requests, setRequests] = useState<ServiceRequest[]>(() => loadRequests())
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicle, records }))
  }, [vehicle, records])

  useEffect(() => {
    saveRequests(requests)
  }, [requests])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  function enterApp(next: Session, message: string) {
    setSession(next)
    saveSession(next)
    setTab('home')
    setSelectedRequestId(null)
    showToast(message)
    if (next.role === 'provedor') {
      setScreen('home')
      return
    }
    setScreen(vehicle ? 'home' : 'onboarding')
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
    if (!window.confirm('Sair e apagar carro/histórico deste aparelho?')) return
    setVehicle(null)
    setRecords([])
    setVisitCareIds([])
    setSelectedCareId(null)
    setSession(null)
    saveSession(null)
    setTab('home')
    setScreen('welcome')
    localStorage.removeItem(STORAGE_KEY)
  }

  function updateKm() {
    if (!vehicle) return
    const raw = window.prompt('Quilometragem atual do painel', String(vehicle.currentKm))
    if (raw == null) return
    const next = Number(raw.replace(/\D/g, ''))
    if (!next || next < vehicle.currentKm) {
      showToast('Informe um km igual ou maior que o atual.')
      return
    }
    setVehicle({ ...vehicle, currentKm: next })
    showToast('Quilometragem atualizada.')
  }

  function onWorkshopSelect(workshop: Workshop) {
    setWorkshopId(workshop.id)
    showToast(`${workshop.name} selecionada para o atendimento.`)
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
      <Toast message={toast} />

      {screen === 'welcome' && (
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
        />
      )}

      {screen === 'createAccount' && (
        <CreateAccount
          initialRole={authRole}
          onRoleChange={setAuthRole}
          onBack={() => setScreen('welcome')}
          onSubmit={(user) => {
            const err = createUser(user)
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

      {screen === 'login' && (
        <Login
          initialRole={authRole}
          onRoleChange={setAuthRole}
          onBack={() => setScreen('welcome')}
          onSubmit={(email, password, role) => {
            const result = authenticate(email, password, role)
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

      {screen === 'onboarding' && (
        <Onboarding
          onBack={() => {
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

      {showHotbar && providerSession && (
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

      {showHotbar && !providerSession && vehicle && (
        <div className="main-tabs">
          {tab === 'home' && (
            <Home
              vehicle={vehicle}
              records={records}
              workshopId={workshopId}
              onWorkshopChange={setWorkshopId}
              upcomingLabel={upcomingLabel}
              accountLabel={
                session?.mode === 'user'
                  ? session.name
                  : session?.mode === 'guest'
                    ? 'Convidado'
                    : undefined
              }
              onOpenCare={(id) => {
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

          {tab === 'help' && (
            <HelpMenu
              session={session}
              vehicle={vehicle}
              onHistory={() => setScreen('history')}
              onEditCar={() => {
                setScreen('onboarding')
                showToast('Atualize os dados do carro.')
              }}
              onUpdateKm={updateKm}
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

      {screen === 'care' && vehicle && selectedCareId && (
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

      {screen === 'visit' && vehicle && (
        <VisitSheet
          vehicle={vehicle}
          initialIds={visitCareIds}
          workshopId={workshopId}
          onWorkshopChange={setWorkshopId}
          onBack={goHome}
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
            const place = WORKSHOPS.find((w) => w.id === chosen)
            showToast(`Agendado em ${place?.name ?? 'a oficina'} às ${time}.`)
            goHome()
          }}
        />
      )}

      {screen === 'providerRequest' && providerSession && openRequest && (
        <ProviderRequest
          request={openRequest}
          workshopName={providerWorkshop?.name ?? 'Oficina'}
          onBack={goHome}
          onStatus={(status) => setRequestStatus(openRequest.id, status)}
        />
      )}

      {screen === 'register' && vehicle && selectedCareId && (
        <RegisterService
          careId={selectedCareId}
          vehicle={vehicle}
          onBack={() => setScreen('care')}
          onSave={(partial) => {
            const record: ServiceRecord = { ...partial, id: uid() }
            setRecords((prev) => [...prev, record])
            if (record.km > vehicle.currentKm) {
              setVehicle({ ...vehicle, currentKm: record.km })
            }
            showToast('Registro salvo. Agora o lembrete pode existir.')
            goHome()
          }}
        />
      )}

      {screen === 'history' && <History records={records} onBack={goHome} />}
    </div>
  )
}
