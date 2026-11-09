import type { ReactNode } from 'react'

interface ShellProps {
  title?: string
  onBack?: () => void
  children: ReactNode
  footer?: ReactNode
  eyebrow?: string
}

export function Shell({ title, onBack, children, footer, eyebrow }: ShellProps) {
  return (
    <div className={`shell${footer ? ' shell-has-dock' : ''}`}>
      <header className="topbar">
        {onBack ? (
          <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
            ←
          </button>
        ) : (
          <span className="brand-mark" aria-hidden>
            mAI
          </span>
        )}
        <div className="topbar-text">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h1 className="screen-title">{title}</h1>}
        </div>
      </header>
      <main className="content">{children}</main>
      {footer && <footer className="dock">{footer}</footer>}
    </div>
  )
}

interface ToastProps {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  if (!message) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={`pill pill-${status}`}>{label}</span>
}
