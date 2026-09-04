import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AcademicFilter, type AcademicSelection } from '../components/AcademicFilter'
import { AcademicSetup } from '../components/AcademicSetup'
import { CampusBanner } from '../components/CampusBanner'
import { DirectorClassChat } from '../components/ClassChat'
import { DashboardShell } from '../components/DashboardShell'
import { DirectorDirectory } from '../components/DirectorDirectory'
import { DEMO_PROGRAM_ID } from '../data/academics'
import { useAuth } from '../context/AuthContext'
import { addCampusAlert, issueFacultyId } from '../lib/storage'

export function DirectorDashboard() {
  const { user, data, setData, logout, refreshUser } = useAuth()
  const [tab, setTab] = useState<'academic' | 'directory' | 'ids' | 'alerts'>('directory')

  useEffect(() => {
    refreshUser()
  }, [refreshUser])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')
  const [empId, setEmpId] = useState('')
  const [teacherName, setTeacherName] = useState('')
  const [password, setPassword] = useState('teacher123')
  const [facultyRole, setFacultyRole] = useState<'class_teacher' | 'subject_teacher'>('class_teacher')
  const [placement, setPlacement] = useState<AcademicSelection>({
    departmentId: 'dept-mae',
    programId: DEMO_PROGRAM_ID,
    section: 'A',
  })
  const [idError, setIdError] = useState('')

  if (!user || user.role !== 'director') return <Navigate to="/" replace />

  const director = user.data
  const dept = data.departments.find((d) => d.id === placement.departmentId)
  const program = dept?.programs.find((p) => p.id === placement.programId)

  function handleAlert(e: React.FormEvent) {
    e.preventDefault()
    const next = addCampusAlert(data, {
      id: `alert-${Date.now()}`,
      title,
      message,
      createdAt: new Date().toISOString(),
      postedBy: director.name,
    })
    setData(next)
    setTitle('')
    setMessage('')
    setSuccess('Campus-wide alert sent to everyone.')
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleIssueId(e: React.FormEvent) {
    e.preventDefault()
    setIdError('')
    if (!dept || !program) {
      setIdError('Select department, course, and section.')
      return
    }
    if (!placement.section) {
      setIdError('Select a section.')
      return
    }
    const result = issueFacultyId(data, {
      employeeId: empId.toUpperCase(),
      name: teacherName,
      password,
      department: dept.name,
      departmentId: dept.id,
      branch: dept.branch,
      facultyRole,
      courseId: program.id,
      course: program.name,
      section: placement.section,
    })
    if (result.error) {
      setIdError(result.error)
      return
    }
    setData(result.data)
    setEmpId('')
    setTeacherName('')
    setSuccess(
      `Faculty ID ${empId.toUpperCase()} issued for ${program.name} Section ${placement.section}. They will add their subjects on first login.`
    )
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <DashboardShell
      role="Director"
      title="Director Panel"
      subtitle="B.Tech Robotics and AI · Mechanical & Automation Engineering"
      userName={director.name}
      onLogout={logout}
      wide
    >
      <CampusBanner />

      <nav className="tab-bar tab-bar--scroll">
        <button className={`tab-btn ${tab === 'directory' ? 'tab-btn--active' : ''}`} onClick={() => setTab('directory')}>
          Directory
        </button>
        <button className={`tab-btn ${tab === 'academic' ? 'tab-btn--active' : ''}`} onClick={() => setTab('academic')}>
          Academic
        </button>
        <button className={`tab-btn ${tab === 'ids' ? 'tab-btn--active' : ''}`} onClick={() => setTab('ids')}>
          Faculty IDs
        </button>
        <button className={`tab-btn ${tab === 'alerts' ? 'tab-btn--active' : ''}`} onClick={() => setTab('alerts')}>
          Alerts
        </button>
      </nav>

      {success && <div className="alert alert--success">{success}</div>}

      {tab === 'directory' && <DirectorDirectory data={data} />}

      {tab === 'academic' && <AcademicSetup data={data} setData={setData} />}

      {tab === 'alerts' && (
        <div className="post-panel">
          <h2>Campus-wide Alert</h2>
          <p className="post-panel__desc">Public message — everyone sees this on login and in their dashboard.</p>
          <form onSubmit={handleAlert} className="post-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hackathon Alert" required />
            </label>
            <label>
              Message
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} required />
            </label>
            <button type="submit" className="btn btn--primary">Send Public Message</button>
          </form>
          <div className="updates-feed stack-lg">
            {data.campusAlerts.map((alert) => (
              <article key={alert.id} className="update-card">
                <div className="update-card__header">
                  <span className="official-badge">Campus</span>
                </div>
                <h3 className="update-card__title">{alert.title}</h3>
                <p className="update-card__message">{alert.message}</p>
                <footer className="update-card__footer">
                  <span>{alert.postedBy}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'ids' && (
        <div className="manage-panel">
          <h2>Issue Faculty IDs</h2>
          <p className="post-panel__desc">
            Assign department, course, and section. Faculty add their own <strong>subject code</strong> and{' '}
            <strong>subject name</strong> when they complete their profile.
          </p>
          {idError && <div className="alert alert--error">{idError}</div>}
          <form onSubmit={handleIssueId} className="post-form">
            <label>
              Employee ID
              <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="T003" required />
            </label>
            <label>
              Full Name
              <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
            </label>
            <label>
              Role
              <select value={facultyRole} onChange={(e) => setFacultyRole(e.target.value as typeof facultyRole)}>
                <option value="class_teacher">Class Teacher</option>
                <option value="subject_teacher">Subject Teacher</option>
              </select>
            </label>

            <AcademicFilter
              data={data}
              value={placement}
              onChange={setPlacement}
              requireSection
            />

            <label>
              Login Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn--primary">Issue Faculty ID</button>
          </form>
        </div>
      )}

      <DirectorClassChat director={director} data={data} setData={setData} />
    </DashboardShell>
  )
}
