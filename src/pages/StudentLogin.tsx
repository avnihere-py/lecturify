import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
        <p className="auth-card__desc">Sign in with your enrollment number</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Enrollment Number
            <input
              type="text"
              placeholder="e.g. EN2021001"
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
          <p>Don't have an account? <Link to="/student/enroll">Enroll now</Link></p>
          <details className="demo-hint">
            <summary>Demo credentials</summary>
            <p>EN2021001 / student123</p>
          </details>
        </div>
      </div>
    </AuthLayout>
  )
}
