import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { enrollStudent } from '../lib/storage'
import { enrollmentPasswordHint, generateStudentPassword } from '../lib/passwords'

export function StudentEnroll() {
  const { data, setData, loginStudent } = useAuth()
  const navigate = useNavigate()
  const [enrollNo, setEnrollNo] = useState('')
  const [name, setName] = useState('')
  const [classId, setClassId] = useState(data.classes[0]?.id ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const cls = data.classes.find((c) => c.id === classId)
    if (!cls) {
      setError('Select a valid class.')
      return
    }

    const result = enrollStudent(data, {
      enrollNo,
      name,
      departmentId: cls.departmentId,
      department: cls.department,
      branch: cls.branch,
      courseId: cls.courseId,
      course: cls.name,
      section: cls.section,
      teacherId: cls.teacherId,
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    const autoPassword = generateStudentPassword(enrollNo)
    setSuccess(`Enrollment successful! Your password is ${autoPassword}. Logging you in...`)
    const loginErr = loginStudent(enrollNo, autoPassword)
    if (!loginErr) {
      setTimeout(() => navigate('/student/dashboard'), 800)
    }
  }

  return (
    <AuthLayout variant="student">
      <div className="auth-card">
        <h2 className="auth-card__title">Student Enrollment</h2>
        <p className="auth-card__desc">Register with your college enrollment number</p>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

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
            Full Name
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Class
            <select value={classId} onChange={(e) => setClassId(e.target.value)} required>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Section {c.section}
                </option>
              ))}
            </select>
          </label>
          <p className="password-preview">{enrollmentPasswordHint(enrollNo)}</p>
          <button type="submit" className="btn btn--primary">Enroll &amp; Login</button>
        </form>

        <p className="auth-card__footer">
          Already enrolled? <Link to="/student/login">Login here</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
