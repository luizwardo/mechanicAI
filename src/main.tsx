import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

for (const key of [
  'mechanicai-mvp-v1',
  'mechanicai-users-v1',
  'mechanicai-session-v1',
  'mechanicai-requests-v1',
]) {
  localStorage.removeItem(key)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
