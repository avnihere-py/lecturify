import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UpdateCard } from '../components/UpdateCard'
import { getClassesForTeacher, useAuth } from '../context/AuthContext'
import { addUpdate, assignCR } from '../lib/storage'
import type { UpdateType } from '../types'

const UPDATE_TYPES: { value: UpdateType; label: string }[] = [
  { value: 'cancellation', label: 'Lecture Cancelled' },
  { value: 'schedule', label: 'Schedule Change' },
  { value: 'exam', label: 'Exam Notice' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'general', label: 'General Notice' },
]

export function TeacherDashboard() {
  const { user, data, setData, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'feed' | 'post' | 'manage'>('feed')
  const [selectedClass, setSelectedClass] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('general')
  const [postSuccess, setPostSuccess] = useState('')
  const [crClassId, setCrClassId] = useState('')
  const [crStudentId, setCrStudentId] = useState('')

  if (!user || user.role !== 'teacher') return <Navigate to="/teacher/login" replace />

  const teacher = user.data
  const classes = getClassesForTeacher(teacher, data)

  const activeClassId = selectedClass || classes[0]?.id || ''
  const classUpdates = data.updates
    .filter((u) => classes.some((c) => c.id === u.classId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const classStudents = data.students.filter((s) => s.classId === (crClassId || classes[0]?.id))

  function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!activeClassId) return
    const newUpdate = {
      id: `upd-${Date.now()}`,
      classId: activeClassId,
      title,
      message,
      type: updateType,
      postedBy: { id: teacher.id, name: teacher.name, role: 'teacher' as const },
      createdAt: new Date().toISOString(),
    }
    const next = addUpdate(data, newUpdate)
    setData(next)
    setTitle('')
    setMessage('')
    setPostSuccess('Update posted successfully! All students in this class will see it.')
    setTimeout(() => setPostSuccess(''), 3000)
  }

  function handleAssignCR(e: React.FormEvent) {
    e.preventDefault()
    const classId = crClassId || classes[0]?.id
    if (!classId || !crStudentId) return
    const next = assignCR(data, classId, crStudentId)
    setData(next)
    setCrStudentId('')
  }

  return (
    <div className="dashboard dashboard--teacher">
      <header className="dashboard__header">
        <div>
          <h1>Teacher Panel</h1>
          <p className="dashboard__class">{teacher.department}</p>
        </div>
        <div className="dashboard__user">
          <span>{teacher.name}</span>
          <button onClick={logout} className="btn btn--ghost btn--sm">Logout</button>
        </div>
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'feed' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Updates
        </button>
        <button
          className={`tab-btn ${activeTab === 'post' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          Post Update
        </button>
        <button
          className={`tab-btn ${activeTab === 'manage' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage CR
        </button>
      </nav>

      {activeTab === 'feed' && (
        <div className="updates-feed">
          {classUpdates.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <p>No updates posted yet.</p>
            </div>
          ) : (
            classUpdates.map((u) => <UpdateCard key={u.id} {...u} />)
          )}
        </div>
      )}

      {activeTab === 'post' && (
        <div className="post-panel">
          <h2>Post Official Update</h2>
          <p className="post-panel__desc">
            Only teachers and assigned Class Reps can post here. Students see only these verified updates.
          </p>

          {postSuccess && <div className="alert alert--success">{postSuccess}</div>}

          <form onSubmit={handlePost} className="post-form">
            <label>
              Class
              <select value={activeClassId} onChange={(e) => setSelectedClass(e.target.value)} required>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Section {c.section}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Update Type
              <select value={updateType} onChange={(e) => setUpdateType(e.target.value as UpdateType)}>
                {UPDATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                type="text"
                placeholder="e.g. Lecture Cancelled — DBMS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Message
              <textarea
                placeholder="Write the official update for your class..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </label>
            <button type="submit" className="btn btn--primary btn--teacher">Post Official Update</button>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="manage-panel">
          <h2>Assign Class Representative</h2>
          <p className="post-panel__desc">
            Select a student as CR. They can post official updates on your behalf when you're unavailable.
          </p>

          {classes.map((cls) => {
            const currentCR = data.students.find((s) => s.id === cls.crStudentId)
            return (
              <div key={cls.id} className="cr-info-card">
                <strong>{cls.name} — Section {cls.section}</strong>
                <p>
                  Current CR:{' '}
                  {currentCR ? (
                    <span className="cr-name">⭐ {currentCR.name} ({currentCR.enrollNo})</span>
                  ) : (
                    <span className="text-muted">Not assigned</span>
                  )}
                </p>
              </div>
            )
          })}

          <form onSubmit={handleAssignCR} className="post-form">
            <label>
              Class
              <select
                value={crClassId || classes[0]?.id}
                onChange={(e) => setCrClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Section {c.section}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Select Student as CR
              <select value={crStudentId} onChange={(e) => setCrStudentId(e.target.value)} required>
                <option value="">Choose a student...</option>
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.enrollNo})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn--primary btn--teacher">Assign as CR</button>
          </form>
        </div>
      )}
    </div>
  )
}
