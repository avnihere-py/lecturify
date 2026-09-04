import { useMemo, useState } from 'react'
import { getProgramById } from '../lib/academics'
import { enrollmentPasswordHint, validateEnrollmentNo } from '../lib/passwords'
import { enrollStudent } from '../lib/storage'
import type { AppData, Teacher } from '../types'

interface AcademicContext {
  departmentId: string
  department: string
  branch: string
  courseId: string
  course: string
  teacherId?: string
}

interface AddStudentFormProps {
  academic: AcademicContext
  data: AppData
  setData: (data: AppData) => void
  onSuccess?: (message: string) => void
  submitLabel?: string
  /** If set, CR/teacher can pick section from this list. Defaults to all sections in course. */
  sectionOptions?: string[]
  defaultSection?: string
  lockSection?: boolean
}

export function AddStudentForm({
  academic,
  data,
  setData,
  onSuccess,
  submitLabel = 'Add Student',
  sectionOptions,
  defaultSection,
  lockSection = false,
}: AddStudentFormProps) {
  const [name, setName] = useState('')
  const [enrollNo, setEnrollNo] = useState('')
  const [section, setSection] = useState(defaultSection ?? '')
  const [error, setError] = useState('')

  const course = getProgramById(data, academic.departmentId, academic.courseId)
  const sections = sectionOptions ?? course?.sections ?? []

  const passwordPreview = useMemo(() => enrollmentPasswordHint(enrollNo), [enrollNo])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const enrollErr = validateEnrollmentNo(enrollNo)
    if (enrollErr) {
      setError(enrollErr)
      return
    }
    if (!section) {
      setError('Select a section.')
      return
    }
    const result = enrollStudent(data, {
      enrollNo,
      name,
      departmentId: academic.departmentId,
      department: academic.department,
      branch: academic.branch,
      courseId: academic.courseId,
      course: academic.course,
      section,
      teacherId: academic.teacherId,
    })
    if (result.error) {
      setError(result.error)
      return
    }
    const added = result.student!
    setData(result.data)
    setName('')
    setEnrollNo('')
    onSuccess?.(
      `${added.enrollNo} added to ${academic.course} Section ${section}. Login password: ${added.password}`
    )
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="alert alert--error">{error}</div>}
      <p className="post-panel__desc">
        {academic.branch} · {academic.department} · {academic.course}
      </p>
      <p className="post-panel__desc">
        Password auto-generates as <strong>student</strong> + digits 2–4 of enrollment no.
      </p>

      <label>
        Section
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          disabled={lockSection}
          required
        >
          <option value="">Select section...</option>
          {sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Enrollment Number (11 digits)
        <input
          value={enrollNo}
          onChange={(e) => setEnrollNo(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="04801242026"
          inputMode="numeric"
          pattern="\d{11}"
          minLength={11}
          maxLength={11}
          required
        />
      </label>
      <p className="password-preview">{passwordPreview}</p>
      <label>
        Full Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <button type="submit" className="btn btn--primary">{submitLabel}</button>
    </form>
  )
}

export function academicFromTeacher(teacher: Teacher, assignmentIndex = 0) {
  const assignment = teacher.teachingAssignments[assignmentIndex]
  return {
    departmentId: teacher.departmentId,
    department: teacher.department,
    branch: teacher.branch,
    courseId: assignment?.courseId ?? '',
    course: assignment?.course ?? '',
    teacherId: teacher.id,
  }
}
