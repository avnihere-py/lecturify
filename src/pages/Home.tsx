import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth, type LoginPortal } from '../context/AuthContext'

const PORTALS: { id: LoginPortal; label: string }[] = [
  { id: 'student', label: 'Student' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'director', label: 'Director' },
]

const REMEMBER_KEY = 'lecturify-remember'

type DirectorMode = 'signin' | 'signup'

function idPlaceholder(portal: LoginPortal) {
  if (portal === 'director') return 'Director ID'
  if (portal === 'faculty') return 'Employee ID'
  return 'Enrollment No.'
}

function forgotMessage(portal: LoginPortal) {
  if (portal === 'faculty') return 'Ask the Director to reset your faculty password.'
  return 'Password = student + digits 2–4 of enrollment no. (e.g. 04801242026 → student480). Ask Faculty or your Class Rep if you need help.'
}

export function Home() {
  const { loginById, registerDirector } = useAuth()
  const navigate = useNavigate()
  const [portal, setPortal] = useState<LoginPortal>('student')
  const [directorMode, setDirectorMode] = useState<DirectorMode>('signin')
  const [loginId, setLoginId] = useState('')
  const [directorName, setDirectorName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [forgotHint, setForgotHint] = useState('')

  const isDirector = portal === 'director'
  const isSignUp = isDirector && directorMode === 'signup'

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as { id?: string; portal?: string }
      if (parsed.id) setLoginId(parsed.id)
      if (parsed.portal === 'student' || parsed.portal === 'faculty' || parsed.portal === 'director') {
        setPortal(parsed.portal)
      }
      setRemember(true)
    } catch {
      /* ignore */
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setForgotHint('')

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      const result = registerDirector(loginId, directorName, password)
      if (result.error) {
        setError(result.error)
        return
      }
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ id: loginId, portal: 'director' }))
      }
      navigate('/director/dashboard')
      return
    }

    const result = loginById(loginId, password, portal)
    if (result.error) {
      setError(result.error)
      return
    }
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ id: loginId, portal }))
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    if (result.role === 'director') navigate('/director/dashboard')
    else if (result.role === 'teacher') navigate('/teacher/dashboard')
    else navigate('/student/dashboard')
  }

  return (
    <div className="login-screen">
      <div className="login-screen__timetable" aria-hidden />
      <span className="doodle doodle--star-tl">✦</span>
      <span className="doodle doodle--cherry-tr">🍒</span>
      <span className="doodle doodle--butterfly-bl">🦋</span>
      <span className="doodle doodle--star-br">✧</span>
      <span className="doodle doodle--cherry-ml">🍒</span>
      <span className="doodle doodle--butterfly-tr">🦋</span>

      <div className="login-glass">
        <span className="glass-doodle glass-doodle--1">🦋</span>
        <span className="glass-doodle glass-doodle--2">🍒</span>
        <span className="glass-doodle glass-doodle--3">✦</span>

        <Logo size="md" />
        <h1 className="login-glass__tagline">Check your schedule without the hassle</h1>

        <div className="role-pills" role="tablist" aria-label="Login as">
          {PORTALS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={portal === p.id}
              className={`role-pill ${portal === p.id ? 'role-pill--active' : ''}`}
              onClick={() => {
                setPortal(p.id)
                setError('')
                setForgotHint('')
                if (p.id === 'director') setDirectorMode('signin')
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert--error">{error}</div>}
          {forgotHint && <div className="alert alert--success">{forgotHint}</div>}

          {isSignUp && (
            <label className="field">
              <span className="field__icon" aria-hidden>📝</span>
              <input
                type="text"
                placeholder="Full Name"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="field">
            <span className="field__icon" aria-hidden>👤</span>
            <input
              type="text"
              placeholder={idPlaceholder(portal)}
              value={loginId}
              onChange={(e) => setLoginId(isDirector ? e.target.value.toUpperCase() : e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="field__icon" aria-hidden>🔑</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 6 : undefined}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁‍🗨'}
            </button>
          </label>

          {isSignUp && (
            <label className="field">
              <span className="field__icon" aria-hidden>🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
          )}

          {!isSignUp && (
            <div className="login-form__row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              {!isDirector && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setForgotHint(forgotMessage(portal))}
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}

          <button type="submit" className="btn btn--login">
            {isSignUp ? 'Create Director Account' : isDirector ? 'Sign In' : 'Log In'}
            {!isSignUp && !isDirector && <span aria-hidden> 🦋</span>}
          </button>
        </form>

        {isDirector ? (
          <div className="login-glass__footer">
            <p className="login-glass__hint login-glass__hint--director">
              {isSignUp
                ? 'Create your Director ID first, then set up departments, faculty IDs, and campus alerts.'
                : 'Sign in with the demo Director ID below, or create your own account.'}
              <br />
              <span className="login-glass__demo-creds">
                <strong>Demo:</strong> D001 / director123
              </span>
            </p>
            <div className="director-auth-toggle" role="tablist" aria-label="Director access">
              <button
                type="button"
                role="tab"
                aria-selected={directorMode === 'signin'}
                className={`director-auth-btn ${directorMode === 'signin' ? 'director-auth-btn--active' : ''}`}
                onClick={() => {
                  setDirectorMode('signin')
                  setError('')
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={directorMode === 'signup'}
                className={`director-auth-btn ${directorMode === 'signup' ? 'director-auth-btn--active' : ''}`}
                onClick={() => {
                  setDirectorMode('signup')
                  setError('')
                  setForgotHint('')
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <p className="login-glass__hint">
            Login only — accounts are created by the Director, Faculty, or your Class Rep. CRs use the Student login.
            <br />
            <span className="login-glass__demo-creds">
              <strong>Demo Director:</strong> D001 / director123 · <strong>Faculty:</strong> T001 / teacher123
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
