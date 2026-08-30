import { Link } from 'react-router-dom'
import { Logo } from './Logo'

interface AuthLayoutProps {
  children: React.ReactNode
  backTo?: string
  variant?: 'student' | 'teacher'
}

export function AuthLayout({ children, backTo = '/', variant = 'student' }: AuthLayoutProps) {
  return (
    <div className={`auth-page auth-page--${variant}`}>
      <div className="auth-page__decor auth-page__decor--top" />
      <div className="auth-page__decor auth-page__decor--bottom" />
      <div className="auth-page__container">
        <Link to={backTo} className="back-link">← Back</Link>
        <Logo size="md" />
        {children}
      </div>
    </div>
  )
}
