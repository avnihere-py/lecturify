import { useEffect, useMemo, useState } from 'react'
import { DEMO_CLASS_ID } from '../data/demoStudents'
import { DEMO_PROGRAM_ID } from '../data/academics'
import { getDepartmentById, getProgramById } from '../lib/academics'
import { getStudentsForClass, getStudentsForFilter, getTeachersForFilter } from '../lib/directory'
import { formatSubject } from '../lib/subjects'
import { isCR } from '../lib/roles'
import type { AppData, Student } from '../types'
import { AcademicFilter, type AcademicSelection } from './AcademicFilter'
import { StudentProfileCard } from './StudentProfileCard'

interface DirectorDirectoryProps {
  data: AppData
}

function DirectoryStudentRow({ student, data }: { student: Student; data: AppData }) {
  const [open, setOpen] = useState(false)
  const cr = isCR(student, data)

  return (
    <article className={`directory-student-row ${open ? 'directory-student-row--open' : ''}`}>
      <div
        className="directory-student-row__head"
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
        aria-expanded={open}
      >
        <span className="directory-student-row__arrow" aria-hidden>{open ? '▾' : '▸'}</span>
        <span className="directory-student-row__enroll">{student.enrollNo || '—'}</span>
        <span className="directory-student-row__name">{student.name || 'Unnamed'}</span>
        {cr && <span className="cr-badge">CR</span>}
      </div>
      {open && (
        <div className="directory-student-row__body">
          <div className="directory-card directory-card--inline directory-card--compact">
            <div><span>Password</span><strong>{student.password}</strong></div>
            <div><span>Section</span><strong>{student.section}</strong></div>
            <div><span>Profile</span><strong>{student.profileComplete ? 'Complete' : 'Incomplete'}</strong></div>
          </div>
          <StudentProfileCard student={student} isCr={cr} />
        </div>
      )}
    </article>
  )
}

function defaultSelection(data: AppData): AcademicSelection {
  const dept = getDepartmentById(data, 'dept-mae') ?? data.departments[0]
  const program =
    (dept && getProgramById(data, dept.id, DEMO_PROGRAM_ID)) ?? dept?.programs[0]
  return {
    departmentId: dept?.id ?? '',
    programId: program?.id ?? '',
    section: '',
  }
}

export function DirectorDirectory({ data }: DirectorDirectoryProps) {
  const [selection, setSelection] = useState<AcademicSelection>(() => defaultSelection(data))
  const [view, setView] = useState<'all' | 'faculty' | 'students'>('students')

  useEffect(() => {
    const dept = selection.departmentId ? getDepartmentById(data, selection.departmentId) : undefined
    const program =
      selection.departmentId && selection.programId
        ? getProgramById(data, selection.departmentId, selection.programId)
        : undefined
    if (!dept || !program) {
      setSelection(defaultSelection(data))
    }
  }, [data, selection.departmentId, selection.programId])

  const teachers = useMemo(
    () => getTeachersForFilter(data, selection),
    [data, selection]
  )
  const students = useMemo(() => {
    let list = getStudentsForFilter(data, selection)
    if (list.length === 0 && selection.programId === DEMO_PROGRAM_ID) {
      list = getStudentsForClass(data, DEMO_CLASS_ID)
    }
    if (list.length === 0) {
      list = data.students.filter(
        (s) => s.departmentId === 'dept-mae' || s.classId === DEMO_CLASS_ID
      )
    }
    return [...list].sort((a, b) => (a.enrollNo ?? '').localeCompare(b.enrollNo ?? ''))
  }, [data, selection])

  const hasFilter = Boolean(selection.departmentId && selection.programId)

  return (
    <div className="manage-panel directory-panel">
      <h2>College Directory</h2>
      <p className="post-panel__desc">
        Each row shows <strong>enrollment number</strong> and <strong>name</strong>. Click a row to open that student&apos;s full profile.
      </p>

      <AcademicFilter
        data={data}
        value={selection}
        onChange={setSelection}
        allowAllSections
        requireSection={false}
      />

      {hasFilter && (
        <>
          <div className="directory-view-toggle">
            {(['all', 'faculty', 'students'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`filter-btn ${view === v ? 'filter-btn--active' : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'all' && `All (${teachers.length + students.length})`}
                {v === 'faculty' && `Faculty (${teachers.length})`}
                {v === 'students' && `Students (${students.length})`}
              </button>
            ))}
          </div>

          {(view === 'all' || view === 'faculty') && (
            <section className="directory-section">
              <h3 className="manage-panel__subtitle">Faculty</h3>
              {teachers.length === 0 ? (
                <p className="text-muted">No faculty in this selection.</p>
              ) : (
                teachers.map((t) => (
                  <article key={t.id} className="directory-card">
                    <header className="directory-card__head">
                      <strong>{t.name}</strong>
                      <span className="directory-card__badge">
                        {t.facultyRole === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}
                      </span>
                    </header>
                    <div className="directory-card__grid">
                      <div><span>Employee ID</span><strong>{t.employeeId}</strong></div>
                      <div><span>Password</span><strong>{t.password}</strong></div>
                      <div><span>Department</span><strong>{t.department}</strong></div>
                      <div><span>Branch</span><strong>{t.branch}</strong></div>
                      <div className="directory-card__full">
                        <span>Classes</span>
                        <strong>
                          {t.teachingAssignments.map((a) => `${a.course} · Sec ${a.section}`).join(' · ') || '—'}
                        </strong>
                      </div>
                      <div className="directory-card__full">
                        <span>Subjects (self-defined)</span>
                        <strong>
                          {t.teachingAssignments.flatMap((a) => a.subjects.map(formatSubject)).join(' · ') ||
                            'Pending setup'}
                        </strong>
                      </div>
                      <div><span>College Email</span><strong>{t.profile.collegeEmail || '—'}</strong></div>
                      <div><span>Phone</span><strong>{t.profile.phone || '—'}</strong></div>
                      <div><span>Date of Birth</span><strong>{t.profile.dateOfBirth || '—'}</strong></div>
                      <div><span>Profile</span><strong>{t.profileComplete ? 'Complete' : 'Incomplete'}</strong></div>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {(view === 'all' || view === 'students') && (
            <section className="directory-section">
              <h3 className="manage-panel__subtitle">
                Students ({students.length})
              </h3>
              {students.length === 0 ? (
                <p className="text-muted">No students in this selection.</p>
              ) : (
                <div className="directory-student-list">
                  <div className="directory-student-list__header" aria-hidden>
                    <span className="directory-student-list__header-spacer" />
                    <span>Enrollment No.</span>
                    <span>Name</span>
                  </div>
                  {students.map((s) => (
                    <DirectoryStudentRow key={s.id} student={s} data={data} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
