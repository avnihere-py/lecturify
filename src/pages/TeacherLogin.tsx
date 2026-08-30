import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export function TeacherLogin() {
  const { loginTeacher } = useAuth()
  const navigate = useNavigate()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const err = loginTeacher(employeeId, password)
    if (err) {
      setError(err)
      return
    }
    navigate('/teacher/dashboard')
  }

  return (
    <AuthLayout variant="teacher">
      <div className="auth-card">
        <h2 className="auth-card__title">Teacher Login</h2>
        <p className="auth-card__desc">Sign in with your employee ID</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Employee ID
            <input
              type="text"
              placeholder="e.g. T001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
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
          <p>T001 / teacher123</p>
        </details>
      </div>
    </AuthLayout>
  )
}
