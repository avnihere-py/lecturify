import { formatClassLabel } from '../lib/academics'
import type { Student } from '../types'

interface StudentProfileCardProps {
  student: Student
  isCr?: boolean
  compact?: boolean
}

export function StudentProfileCard({ student, isCr, compact }: StudentProfileCardProps) {
  const classLabel = formatClassLabel({
    branch: student.branch,
    department: student.department,
    course: student.course,
    section: student.section,
  })

  if (compact) {
    return (
      <div className="profile-card profile-card--compact">
        <div className="profile-card__header">
          <strong>{student.name}</strong>
          {isCr && <span className="cr-badge">CR</span>}
        </div>
        <p className="profile-card__meta">{student.enrollNo} · Section {student.section}</p>
      </div>
    )
  }

  return (
    <article className="profile-card">
      <header className="profile-card__header">
        <div>
          <h3>{student.name}</h3>
          {isCr && <span className="cr-badge">Class Representative</span>}
        </div>
        {!student.profileComplete && (
          <span className="profile-badge profile-badge--pending">Profile incomplete</span>
        )}
      </header>

      <div className="profile-card__grid">
        <div className="profile-field profile-field--locked">
          <span className="profile-field__label">Enrollment No.</span>
          <span className="profile-field__value">{student.enrollNo}</span>
        </div>
        <div className="profile-field profile-field--locked">
          <span className="profile-field__label">Branch</span>
          <span className="profile-field__value">{student.branch}</span>
        </div>
        <div className="profile-field profile-field--locked">
          <span className="profile-field__label">Department</span>
          <span className="profile-field__value">{student.department}</span>
        </div>
        <div className="profile-field profile-field--locked">
          <span className="profile-field__label">Course</span>
          <span className="profile-field__value">{student.course}</span>
        </div>
        <div className="profile-field profile-field--locked">
          <span className="profile-field__label">Section</span>
          <span className="profile-field__value">{student.section}</span>
        </div>
        <div className="profile-field profile-field--locked profile-field--full">
          <span className="profile-field__label">Class</span>
          <span className="profile-field__value">{classLabel}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field__label">College Email</span>
          <span className="profile-field__value">
            {student.profile.collegeEmail || '—'}
          </span>
        </div>
        <div className="profile-field">
          <span className="profile-field__label">Phone</span>
          <span className="profile-field__value">{student.profile.phone || '—'}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field__label">Date of Birth</span>
          <span className="profile-field__value">
            {student.profile.dateOfBirth
              ? new Date(student.profile.dateOfBirth).toLocaleDateString()
              : '—'}
          </span>
        </div>
      </div>
    </article>
  )
}
