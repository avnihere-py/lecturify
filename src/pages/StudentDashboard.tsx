import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UpdateCard } from '../components/UpdateCard'
import { getClassForStudent, isCR, useAuth } from '../context/AuthContext'
import { addUpdate } from '../lib/storage'
import type { UpdateType } from '../types'

const FILTERS: { key: UpdateType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cancellation', label: 'Cancellations' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'exam', label: 'Exams' },
  { key: 'holiday', label: 'Holidays' },
]

const UPDATE_TYPES: { value: UpdateType; label: string }[] = [
  { value: 'cancellation', label: 'Lecture Cancelled' },
  { value: 'schedule', label: 'Schedule Change' },
  { value: 'exam', label: 'Exam Notice' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'general', label: 'General Notice' },
]

export function StudentDashboard() {
  const { user, data, setData, logout } = useAuth()
  const [filter, setFilter] = useState<UpdateType | 'all'>('all')
  const [showPost, setShowPost] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('general')
  const [postSuccess, setPostSuccess] = useState('')

  if (!user || user.role !== 'student') return <Navigate to="/student/login" replace />

  const student = user.data
  const classInfo = getClassForStudent(student, data)
  const cr = isCR(student, data)

  const updates = useMemo(() => {
    const classUpdates = data.updates
      .filter((u) => u.classId === student.classId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (filter === 'all') return classUpdates
    return classUpdates.filter((u) => u.type === filter)
  }, [data.updates, student.classId, filter])

  function handlePost(e: React.FormEvent) {
    e.preventDefault()
    const newUpdate = {
      id: `upd-${Date.now()}`,
      classId: student.classId,
      title,
      message,
      type: updateType,
      postedBy: { id: student.id, name: student.name, role: 'cr' as const },
      createdAt: new Date().toISOString(),
    }
    const next = addUpdate(data, newUpdate)
    setData(next)
    setTitle('')
    setMessage('')
    setShowPost(false)
    setPostSuccess('Update posted on behalf of your class!')
    setTimeout(() => setPostSuccess(''), 3000)
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Official Updates</h1>
          <p className="dashboard__class">
            {classInfo?.name} — Section {classInfo?.section}
            {cr && <span className="cr-badge">You are Class Rep</span>}
          </p>
        </div>
        <div className="dashboard__user">
          <span>Hi, {student.name}</span>
          <button onClick={logout} className="btn btn--ghost btn--sm">Logout</button>
        </div>
      </header>

      <div className="info-banner">
        <span className="info-banner__icon">✓</span>
        Only verified updates from your teacher{cr ? ' or you (as CR)' : ''} appear here — no random messages.
      </div>

      {postSuccess && <div className="alert alert--success">{postSuccess}</div>}

      {cr && (
        <div className="cr-actions">
          {!showPost ? (
            <button className="btn btn--primary" onClick={() => setShowPost(true)}>
              Post Update as Class Rep
            </button>
          ) : (
            <form onSubmit={handlePost} className="post-form post-form--inline">
              <h3>Post Official Update (CR)</h3>
              <label>
                Type
                <select value={updateType} onChange={(e) => setUpdateType(e.target.value as UpdateType)}>
                  {UPDATE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Message
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} required />
              </label>
              <div className="btn-row">
                <button type="submit" className="btn btn--primary">Post</button>
                <button type="button" className="btn btn--ghost" onClick={() => setShowPost(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="updates-feed">
        {updates.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No updates yet for your class.</p>
          </div>
        ) : (
          updates.map((u) => <UpdateCard key={u.id} {...u} />)
        )}
      </div>
    </div>
  )
}
