import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CampusBanner } from '../components/CampusBanner'
import { StudentClassChat } from '../components/ClassChat'
import { ContactProfileForm } from '../components/ContactProfileForm'
import { CrTools } from '../components/CrTools'
import { DashboardShell } from '../components/DashboardShell'
import { StudentProfileCard } from '../components/StudentProfileCard'
import { UpdateCard } from '../components/UpdateCard'
import { isCR } from '../lib/roles'
import { useAuth } from '../context/AuthContext'
import { addUpdate, updateStudentProfile } from '../lib/storage'
import type { UpdateType } from '../types'

const FILTERS: { key: UpdateType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cancellation', label: 'Cancellations' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'exam', label: 'Exams' },
  { key: 'holiday', label: 'Holidays' },
]

export function StudentDashboard() {
  const { user, data, setData, logout } = useAuth()
  const [filter, setFilter] = useState<UpdateType | 'all'>('all')
  const [postSuccess, setPostSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed')
  const [profileMsg, setProfileMsg] = useState('')

  if (!user || user.role !== 'student') return <Navigate to="/" replace />

  const student = user.data
  const cr = isCR(student, data)

  const updates = useMemo(() => {
    const classUpdates = data.updates
      .filter((u) => u.classId === student.classId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (filter === 'all') return classUpdates
    return classUpdates.filter((u) => u.type === filter)
  }, [data.updates, student.classId, filter])

  function handleCrPost(payload: { title: string; message: string; type: UpdateType }) {
    const newUpdate = {
      id: `upd-${Date.now()}`,
      classId: student.classId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      postedBy: { id: student.id, name: student.name, role: 'cr' as const },
      createdAt: new Date().toISOString(),
    }
    const next = addUpdate(data, newUpdate)
    setData(next)
    setPostSuccess('Update posted on behalf of your class!')
    setTimeout(() => setPostSuccess(''), 3000)
  }

  function handleProfileSave(profile: { collegeEmail?: string; phone?: string; dateOfBirth?: string }) {
    const result = updateStudentProfile(data, student.id, profile)
    if (result.error) {
      setProfileMsg(result.error)
      return
    }
    setData(result.data)
    setProfileMsg('Profile updated successfully.')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  return (
    <DashboardShell
      role="Student"
      title="Official Updates"
      subtitle={
        <>
          {student.course} — Section {student.section}
          {cr && <span className="cr-badge">You are Class Rep</span>}
        </>
      }
      userName={student.name}
      onLogout={logout}
      headerExtra={
        cr ? (
          <CrTools
            student={student}
            data={data}
            setData={setData}
            onPost={handleCrPost}
          />
        ) : undefined
      }
    >
      <CampusBanner />

      <nav className="tab-bar tab-bar--scroll">
        <button
          className={`tab-btn ${activeTab === 'feed' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Updates
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
          {!student.profileComplete && <span className="tab-badge">!</span>}
        </button>
      </nav>

      {activeTab === 'feed' && (
        <>
          <div className="info-banner">
            <span className="info-banner__icon">✓</span>
            Only verified updates from your teacher{cr ? ' or you (as CR)' : ''} appear here.
          </div>

          {!student.profileComplete && (
            <div className="alert alert--warn">
              Please complete your profile — add college email, phone, and date of birth in{' '}
              <button type="button" className="inline-link" onClick={() => setActiveTab('profile')}>
                My Profile
              </button>
              .
            </div>
          )}

          {postSuccess && <div className="alert alert--success">{postSuccess}</div>}

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
        </>
      )}

      {activeTab === 'profile' && (
        <div className="manage-panel profile-panel">
          <h2>My Profile</h2>
          {profileMsg && (
            <div className={`alert ${profileMsg.includes('success') ? 'alert--success' : 'alert--error'}`}>
              {profileMsg}
            </div>
          )}

          <StudentProfileCard student={student} isCr={cr} />

          <h3 className="manage-panel__subtitle">Update contact details</h3>
          <p className="post-panel__desc">
            Branch, department, course, section, enrollment number, and name cannot be changed.
          </p>
          <ContactProfileForm profile={student.profile} onSave={handleProfileSave} />
        </div>
      )}

      <StudentClassChat student={student} isCr={cr} data={data} setData={setData} />
    </DashboardShell>
  )
}
