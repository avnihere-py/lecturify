import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export function DirectorLogin() {
  const { loginDirector } = useAuth()
  const navigate = useNavigate()
  const [directorId, setDirectorId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const err = loginDirector(directorId, password)
    if (err) {
      setError(err)
      return
    }
    navigate('/director/dashboard')
  }

  return (
    <AuthLayout variant="teacher">
      <div className="auth-card">
        <h2 className="auth-card__title">Director Login</h2>
        <p className="auth-card__desc">Sign in with your director ID</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Director ID
            <input
              type="text"
              placeholder="e.g. D001"
              value={directorId}
              onChange={(e) => setDirectorId(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary btn--teacher">Login</button>
        </form>

        <details className="demo-hint">
          <summary>Demo credentials</summary>
          <p>D001 / director123</p>
        </details>
      </div>
    </AuthLayout>
  )
}
