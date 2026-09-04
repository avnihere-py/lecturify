import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AddStudentForm } from '../components/AddStudentForm'
import { AddSubjectTeacherForm } from '../components/AddSubjectTeacherForm'
import { AttendanceSheetPanel } from '../components/AttendanceSheetPanel'
import { CampusBanner } from '../components/CampusBanner'
import { TeacherClassChat } from '../components/ClassChat'
import { ContactProfileForm } from '../components/ContactProfileForm'
import { DashboardShell } from '../components/DashboardShell'
import { StudentProfileCard } from '../components/StudentProfileCard'
import { TeacherSetupModal } from '../components/TeacherSetupModal'
import { UpdateCard } from '../components/UpdateCard'
import { formatClassLabel } from '../lib/academics'
import { getClassesForTeacher, isCR } from '../lib/roles'
import { useAuth } from '../context/AuthContext'
import { formatSubject } from '../lib/subjects'
import { addUpdate, assignCR, isTeacherProfileDone, updateTeacherProfile } from '../lib/storage'
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
  const [activeTab, setActiveTab] = useState<'feed' | 'post' | 'attendance' | 'manage' | 'students' | 'faculty' | 'profile'>('feed')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState(0)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('general')
  const [postSuccess, setPostSuccess] = useState('')
  const [crClassId, setCrClassId] = useState('')
  const [crStudentId, setCrStudentId] = useState('')
  const [viewStudentId, setViewStudentId] = useState<string | null>(null)
  const [profileMsg, setProfileMsg] = useState('')
  const [showSetup, setShowSetup] = useState(false)

  if (!user || user.role !== 'teacher') return <Navigate to="/" replace />

  const teacher = user.data
  const needsSetup = !isTeacherProfileDone(teacher)
  const classes = getClassesForTeacher(teacher, data)

  const activeClassId = selectedClass || classes[0]?.id || ''
  const assignment = teacher.teachingAssignments[selectedAssignment]
  const classUpdates = data.updates
    .filter((u) => classes.some((c) => c.id === u.classId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const classStudents = data.students.filter((s) => s.classId === (crClassId || classes[0]?.id))
  const studentsInActiveClass = data.students.filter(
    (s) => s.classId === (assignment?.classId ?? activeClassId)
  )
  const viewedStudent = viewStudentId
    ? data.students.find((s) => s.id === viewStudentId)
    : null

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

  function handleProfileSave(profile: { collegeEmail?: string; phone?: string; dateOfBirth?: string }) {
    const result = updateTeacherProfile(data, teacher.id, profile)
    if (result.error) {
      setProfileMsg(result.error)
      return
    }
    setData(result.data)
    setProfileMsg('Contact info saved.')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  if (needsSetup || showSetup) {
    return (
      <TeacherSetupModal
        teacher={teacher}
        data={data}
        setData={setData}
        onComplete={(updated) => {
          if (isTeacherProfileDone(updated)) setShowSetup(false)
        }}
      />
    )
  }

  const isClassTeacher = teacher.facultyRole === 'class_teacher'
  const subjectTeachers = data.teachers.filter(
    (t) => t.departmentId === teacher.departmentId && t.facultyRole === 'subject_teacher'
  )

  const academicForAdd = assignment
    ? {
        departmentId: teacher.departmentId,
        department: teacher.department,
        branch: teacher.branch,
        courseId: assignment.courseId,
        course: assignment.course,
        teacherId: teacher.id,
      }
    : null

  return (
    <DashboardShell
      role="Faculty"
      title="Teacher Panel"
      subtitle={`${teacher.branch} — ${teacher.department}`}
      userName={teacher.name}
      onLogout={logout}
      wide
    >
      <CampusBanner />

      <nav className="tab-bar tab-bar--scroll">
        {(['feed', 'post', 'attendance', 'students', ...(isClassTeacher ? ['faculty' as const] : []), 'manage', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'feed' && 'Updates'}
            {tab === 'post' && 'Post'}
            {tab === 'attendance' && 'Attendance'}
            {tab === 'students' && 'Students'}
            {tab === 'faculty' && 'Faculty'}
            {tab === 'manage' && 'Manage CR'}
            {tab === 'profile' && 'Profile'}
          </button>
        ))}
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
            Post to one of your assigned classes only.
          </p>
          {postSuccess && <div className="alert alert--success">{postSuccess}</div>}
          <form onSubmit={handlePost} className="post-form">
            <label>
              Class
              <select value={activeClassId} onChange={(e) => setSelectedClass(e.target.value)} required>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatClassLabel({ branch: c.branch, department: c.department, course: c.name, section: c.section })}
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
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Message
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
            </label>
            <button type="submit" className="btn btn--primary btn--teacher">Post Official Update</button>
          </form>
        </div>
      )}

      {activeTab === 'attendance' && (
        <AttendanceSheetPanel teacher={teacher} data={data} setData={setData} />
      )}

      {activeTab === 'students' && (
        <div className="manage-panel">
          <h2>Students</h2>
          <p className="post-panel__desc">Add students to your classes and view their profiles.</p>
          {postSuccess && <div className="alert alert--success">{postSuccess}</div>}

          <label>
            Your class
            <select
              value={selectedAssignment}
              onChange={(e) => {
                setSelectedAssignment(Number(e.target.value))
                setViewStudentId(null)
              }}
            >
              {teacher.teachingAssignments.map((a, i) => (
                <option key={`${a.courseId}-${a.section}`} value={i}>
                  {a.course} — Section {a.section}
                </option>
              ))}
            </select>
          </label>

          {academicForAdd && (
            <AddStudentForm
              academic={academicForAdd}
              data={data}
              setData={setData}
              defaultSection={assignment?.section}
              lockSection
              onSuccess={(msg) => {
                setPostSuccess(msg)
                setTimeout(() => setPostSuccess(''), 4000)
              }}
            />
          )}

          <div className="stack-lg">
            <h3 className="manage-panel__subtitle">Students in this class</h3>
            {studentsInActiveClass.length === 0 ? (
              <p className="text-muted">No students yet.</p>
            ) : (
              studentsInActiveClass.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`profile-list-item ${viewStudentId === s.id ? 'profile-list-item--active' : ''}`}
                  onClick={() => setViewStudentId(s.id)}
                >
                  <StudentProfileCard student={s} isCr={isCR(s, data)} compact />
                </button>
              ))
            )}
          </div>

          {viewedStudent && (
            <div className="stack-md">
              <button type="button" className="cr-modal__back" onClick={() => setViewStudentId(null)}>
                ← Back to list
              </button>
              <StudentProfileCard student={viewedStudent} isCr={isCR(viewedStudent, data)} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="manage-panel">
          <h2>Assign Class Representative</h2>
          <p className="post-panel__desc">
            Pick one student as CR for each class you teach.
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
              <select value={crClassId || classes[0]?.id} onChange={(e) => setCrClassId(e.target.value)}>
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

      {activeTab === 'faculty' && isClassTeacher && (
        <div className="manage-panel">
          <h2>Department Faculty</h2>
          <p className="post-panel__desc">
            Add subject teachers who tutor specific courses in your department.
          </p>
          {postSuccess && <div className="alert alert--success">{postSuccess}</div>}
          <AddSubjectTeacherForm
            classTeacher={teacher}
            data={data}
            setData={setData}
            onSuccess={(msg) => {
              setPostSuccess(msg)
              setTimeout(() => setPostSuccess(''), 4000)
            }}
          />
          <div className="stack-lg">
            <h3 className="manage-panel__subtitle">Subject teachers in {teacher.department}</h3>
            {subjectTeachers.length === 0 ? (
              <p className="text-muted">No subject teachers added yet.</p>
            ) : (
              subjectTeachers.map((t) => (
                <div key={t.id} className="cr-info-card">
                  <strong>{t.name}</strong>
                  <p>{t.employeeId} · Subject Teacher</p>
                  <p className="text-muted">
                    {t.teachingAssignments.map((a) => `${a.course} (${a.subjects.map(formatSubject).join(', ')})`).join(' · ') || 'Setup pending'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="manage-panel profile-panel">
          <h2>My Profile</h2>
          {profileMsg && <div className="alert alert--success">{profileMsg}</div>}

          <div className="profile-card__grid">
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Employee ID</span>
              <span className="profile-field__value">{teacher.employeeId}</span>
            </div>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Name</span>
              <span className="profile-field__value">{teacher.name}</span>
            </div>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Branch</span>
              <span className="profile-field__value">{teacher.branch}</span>
            </div>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Department</span>
              <span className="profile-field__value">{teacher.department}</span>
            </div>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Role</span>
              <span className="profile-field__value">
                {teacher.facultyRole === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}
              </span>
            </div>
          </div>

          <h3 className="manage-panel__subtitle">Teaching assignments</h3>
          {teacher.teachingAssignments.map((a) => (
            <div key={`${a.courseId}-${a.section}`} className="assignment-card">
              <strong>{a.course} — Section {a.section}</strong>
              <p>{a.subjects.map(formatSubject).join(', ')}</p>
            </div>
          ))}
          <button type="button" className="btn btn--ghost" onClick={() => setShowSetup(true)}>
            Edit classes &amp; subjects
          </button>

          <h3 className="manage-panel__subtitle">Contact details</h3>
          <p className="post-panel__desc">Update your college email, phone, and date of birth.</p>
          <ContactProfileForm profile={teacher.profile} onSave={handleProfileSave} />
        </div>
      )}

      <TeacherClassChat teacher={teacher} data={data} setData={setData} classes={classes} />
    </DashboardShell>
  )
}
