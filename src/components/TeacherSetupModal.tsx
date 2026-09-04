import { useMemo, useState } from 'react'
import { getDepartmentById, getProgramById } from '../lib/academics'
import { saveTeacherTeachingSetup, updateTeacherProfile } from '../lib/storage'
import { formatSubject } from '../lib/subjects'
import type { AppData, ContactProfile, SubjectInfo, Teacher } from '../types'
import { ContactProfileForm } from './ContactProfileForm'

interface DraftAssignment {
  courseId: string
  course: string
  section: string
  subjects: SubjectInfo[]
}

interface TeacherSetupModalProps {
  teacher: Teacher
  data: AppData
  setData: (data: AppData) => void
  onComplete: (teacher: Teacher) => void
}

export function TeacherSetupModal({
  teacher,
  data,
  setData,
  onComplete,
}: TeacherSetupModalProps) {
  const [step, setStep] = useState<'contact' | 'teaching'>('contact')
  const [error, setError] = useState('')
  const [courseId, setCourseId] = useState('')
  const [section, setSection] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [draftSubjects, setDraftSubjects] = useState<SubjectInfo[]>([])
  const [assignments, setAssignments] = useState<DraftAssignment[]>(
    teacher.teachingAssignments.map((a) => ({
      courseId: a.courseId,
      course: a.course,
      section: a.section,
      subjects: a.subjects,
    }))
  )

  const directorPlaced = teacher.teachingAssignments.length > 0 &&
    teacher.teachingAssignments.every((a) => a.subjects.length === 0)

  const availableCourses = useMemo(() => {
    return getDepartmentById(data, teacher.departmentId)?.programs ?? []
  }, [data, teacher.departmentId])

  const activeCourse = courseId ? getProgramById(data, teacher.departmentId, courseId) : undefined
  const lockedAssignment = directorPlaced ? teacher.teachingAssignments[0] : null

  function handleContactSave(profile: ContactProfile) {
    const result = updateTeacherProfile(data, teacher.id, profile)
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    const updated = result.data.teachers.find((t) => t.id === teacher.id)!
    setError('')
    setStep('teaching')
    if (directorPlaced && lockedAssignment) {
      setAssignments([{
        courseId: lockedAssignment.courseId,
        course: lockedAssignment.course,
        section: lockedAssignment.section,
        subjects: [],
      }])
    }
    onComplete(updated)
  }

  function addDraftSubject() {
    const code = subjectCode.trim().toUpperCase()
    const name = subjectName.trim()
    if (!code || !name) {
      setError('Enter both subject code and subject name.')
      return
    }
    setDraftSubjects([...draftSubjects, { code, name }])
    setSubjectCode('')
    setSubjectName('')
    setError('')
  }

  function addAssignment() {
    const subjects = draftSubjects
    const useCourseId = lockedAssignment?.courseId ?? courseId
    const useSection = lockedAssignment?.section ?? section
    const course = lockedAssignment?.course ?? activeCourse?.name

    if (!useCourseId || !useSection || !course) {
      setError('Select course and section.')
      return
    }
    if (subjects.length === 0) {
      setError('Add at least one subject with code and name.')
      return
    }
    const duplicate = assignments.some(
      (a) => a.courseId === useCourseId && a.section === useSection
    )
    if (duplicate && !directorPlaced) {
      setError('This course and section is already added.')
      return
    }
    if (directorPlaced) {
      setAssignments([{ courseId: useCourseId, course, section: useSection, subjects }])
    } else {
      setAssignments([...assignments, { courseId: useCourseId, course, section: useSection, subjects }])
    }
    setSection('')
    setDraftSubjects([])
    setError('')
  }

  function removeAssignment(index: number) {
    if (directorPlaced) return
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  function handleFinish() {
    let toSave = assignments

    if (directorPlaced) {
      const base = assignments[0] ?? {
        courseId: lockedAssignment!.courseId,
        course: lockedAssignment!.course,
        section: lockedAssignment!.section,
        subjects: [] as SubjectInfo[],
      }
      const subjects = base.subjects.length > 0 ? base.subjects : draftSubjects
      if (subjects.length === 0) {
        setError('Add at least one subject with code and name.')
        return
      }
      toSave = [{ ...base, subjects }]
    }

    if (toSave.length === 0) {
      setError('Add your teaching subjects.')
      return
    }
    const result = saveTeacherTeachingSetup(data, teacher.id, toSave)
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    const updated = result.data.teachers.find((t) => t.id === teacher.id)!
    onComplete(updated)
  }

  return (
    <div className="setup-modal-backdrop" role="presentation">
      <div className="setup-modal" role="dialog" aria-modal="true" aria-label="Complete your profile">
        <header className="setup-modal__header">
          <h2>Complete Your Faculty Profile</h2>
          <p>Department: <strong>{teacher.department}</strong> ({teacher.branch})</p>
        </header>

        <div className="setup-modal__steps">
          <span className={step === 'contact' ? 'setup-step setup-step--active' : 'setup-step'}>
            1. Contact
          </span>
          <span className={step === 'teaching' ? 'setup-step setup-step--active' : 'setup-step'}>
            2. Subjects You Teach
          </span>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {step === 'contact' && (
          <div className="setup-modal__body">
            <p className="post-panel__desc">
              Your name and employee ID cannot be changed. Add your college contact details.
            </p>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Employee ID</span>
              <span className="profile-field__value">{teacher.employeeId}</span>
            </div>
            <div className="profile-field profile-field--locked">
              <span className="profile-field__label">Name</span>
              <span className="profile-field__value">{teacher.name}</span>
            </div>
            <ContactProfileForm
              profile={teacher.profile}
              onSave={handleContactSave}
              submitLabel="Continue to Subjects"
            />
          </div>
        )}

        {step === 'teaching' && (
          <div className="setup-modal__body">
            <p className="post-panel__desc">
              Write your own <strong>subject code</strong> and <strong>subject name</strong> for each class you teach.
            </p>

            {lockedAssignment && (
              <div className="profile-field profile-field--locked">
                <span className="profile-field__label">Assigned by Director</span>
                <span className="profile-field__value">
                  {lockedAssignment.course} — Section {lockedAssignment.section}
                </span>
              </div>
            )}

            {!lockedAssignment && (
              <>
                <label>
                  Course
                  <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setSection('') }}>
                    <option value="">Select course...</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                {activeCourse && (
                  <label>
                    Section
                    <select value={section} onChange={(e) => setSection(e.target.value)}>
                      <option value="">Select section...</option>
                      {activeCourse.sections.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}

            <div className="subject-entry">
              <span className="profile-field__label">Add subject</span>
              <div className="subject-entry__row">
                <input
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="Code e.g. RAI301"
                />
                <input
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Subject name e.g. Robotics"
                />
                <button type="button" className="btn btn--ghost btn--sm" onClick={addDraftSubject}>
                  Add
                </button>
              </div>
              {draftSubjects.length > 0 && (
                <ul className="subject-entry__list">
                  {draftSubjects.map((s) => (
                    <li key={s.code}>{formatSubject(s)}</li>
                  ))}
                </ul>
              )}
            </div>

            {!directorPlaced && (
              <button type="button" className="btn btn--ghost" onClick={addAssignment}>
                + Add this class
              </button>
            )}

            {assignments.length > 0 && (
              <div className="assignment-list">
                <h4>Your classes</h4>
                {assignments.map((a, i) => (
                  <div key={`${a.courseId}-${a.section}`} className="assignment-card">
                    <div>
                      <strong>{a.course} — Section {a.section}</strong>
                      <p>{a.subjects.map(formatSubject).join(', ') || 'Add subjects above'}</p>
                    </div>
                    {!directorPlaced && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeAssignment(i)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="btn btn--primary btn--teacher" onClick={handleFinish}>
              Save &amp; Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
