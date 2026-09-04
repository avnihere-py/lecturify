import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export function StudentLogin() {
  const { loginStudent } = useAuth()
  const navigate = useNavigate()
  const [enrollNo, setEnrollNo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const err = loginStudent(enrollNo, password)
    if (err) {
      setError(err)
      return
    }
    navigate('/student/dashboard')
  }

  return (
    <AuthLayout variant="student">
      <div className="auth-card">
        <h2 className="auth-card__title">Student Login</h2>
          <p className="auth-card__desc">
            Log in with 11-digit enrollment no. Password: student + digits 2–4 (e.g. student480).
          </p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Enrollment Number
            <input
              type="text"
              placeholder="e.g. 04801242026"
              value={enrollNo}
              onChange={(e) => setEnrollNo(e.target.value)}
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
          <button type="submit" className="btn btn--primary">Login</button>
        </form>

        <div className="auth-card__footer">
          <p className="text-muted">No self-registration. Ask Faculty or your Class Rep for an account.</p>
          <details className="demo-hint">
            <summary>Demo credentials</summary>
            <p>04801242026 / student480 (Neha — CR)</p>
            <p>05801242026 / student580 (Priya Sharma)</p>
            <p>06801242026 / student680 (Amit Patel)</p>
          </details>
        </div>
      </div>
    </AuthLayout>
  )
}
