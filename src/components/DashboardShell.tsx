import type { ReactNode } from 'react'
import { Logo } from './Logo'

interface DashboardShellProps {
  role: 'Student' | 'Faculty' | 'Director'
  title: string
  subtitle?: ReactNode
  userName: string
  onLogout: () => void
  wide?: boolean
  headerExtra?: ReactNode
  children: ReactNode
}

export function DashboardShell({
  role,
  title,
  subtitle,
  userName,
  onLogout,
  wide,
  headerExtra,
  children,
}: DashboardShellProps) {
  return (
    <div className={`dashboard ${wide ? 'dashboard--wide' : ''}`}>
      <div className="dashboard__topbar">
        <Logo size="sm" />
        <span className="role-chip">{role}</span>
      </div>

      <header className="dashboard__header">
        <div className="dashboard__title-block">
          <h1>{title}</h1>
          {subtitle && <p className="dashboard__class">{subtitle}</p>}
        </div>
        <div className="dashboard__user">
          {headerExtra}
          <span className="dashboard__greeting">Hi, {userName}</span>
          <button type="button" onClick={onLogout} className="btn btn--ghost btn--sm">
            Logout
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}
