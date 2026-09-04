import { useEffect, useMemo, useState } from 'react'
import {
  countAbsent,
  countPresent,
  findSheet,
  getSheetsForDate,
  getSheetsForTeacher,
  sheetLabel,
  todayDateString,
} from '../lib/attendance'
import { saveAttendanceSheet } from '../lib/storage'
import { formatSubject } from '../lib/subjects'
import type {
  AppData,
  AttendanceEntry,
  AttendanceSheet,
  AttendanceStatus,
  SessionType,
  Teacher,
} from '../types'

interface AttendanceSheetPanelProps {
  teacher: Teacher
  data: AppData
  setData: (data: AppData) => void
}

export function AttendanceSheetPanel({ teacher, data, setData }: AttendanceSheetPanelProps) {
  const [assignmentIndex, setAssignmentIndex] = useState(0)
  const [subjectCode, setSubjectCode] = useState('')
  const [sessionType, setSessionType] = useState<SessionType>('theory')
  const [date, setDate] = useState(todayDateString())
  const [entries, setEntries] = useState<AttendanceEntry[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const assignment = teacher.teachingAssignments[assignmentIndex]
  const students = useMemo(
    () =>
      data.students
        .filter((s) => s.classId === assignment?.classId)
        .sort((a, b) => a.enrollNo.localeCompare(b.enrollNo)),
    [data.students, assignment?.classId]
  )

  const selectedSubject = assignment?.subjects.find((s) => s.code === subjectCode)

  const existingSheet = useMemo(() => {
    if (!assignment || !subjectCode) return undefined
    return findSheet(data, teacher.id, assignment.classId, subjectCode, date, sessionType)
  }, [data, teacher.id, assignment, subjectCode, date, sessionType])

  const isLocked = existingSheet?.locked ?? false
  const isViewingExisting = Boolean(existingSheet)
  const pastSheets = useMemo(() => getSheetsForTeacher(data, teacher.id), [data, teacher.id])
  const sheetsToday = useMemo(
    () => getSheetsForDate(data, teacher.id, date),
    [data, teacher.id, date]
  )

  const isCurrentSelection = (sheet: AttendanceSheet) =>
    existingSheet?.id === sheet.id

  useEffect(() => {
    if (!assignment) return
    const firstSubject = assignment.subjects[0]
    if (firstSubject && !assignment.subjects.some((s) => s.code === subjectCode)) {
      setSubjectCode(firstSubject.code)
    }
  }, [assignment, subjectCode])

  useEffect(() => {
    if (!assignment || !subjectCode) return
    const sheet = findSheet(data, teacher.id, assignment.classId, subjectCode, date, sessionType)
    if (sheet) {
      setEntries(sheet.entries)
      return
    }
    setEntries(
      students.map((s) => ({
        studentId: s.id,
        enrollNo: s.enrollNo,
        name: s.name,
        status: 'present' as AttendanceStatus,
      }))
    )
  }, [assignment, subjectCode, date, sessionType, students, data, teacher.id])

  function loadSheet(sheet: AttendanceSheet) {
    const idx = teacher.teachingAssignments.findIndex((a) => a.classId === sheet.classId)
    if (idx >= 0) setAssignmentIndex(idx)
    setSubjectCode(sheet.subjectCode)
    setSessionType(sheet.sessionType)
    setDate(sheet.date)
    setError('')
    setMessage('')
  }

  function startNewSheet() {
    setError('')
    setMessage('')
    const otherSession: SessionType = sessionType === 'theory' ? 'lab' : 'theory'
    if (assignment && subjectCode) {
      const alt = findSheet(data, teacher.id, assignment.classId, subjectCode, date, otherSession)
      if (!alt) {
        setSessionType(otherSession)
        setMessage(`Switched to ${otherSession === 'theory' ? 'Theory' : 'Lab'} — fill attendance and save.`)
        setTimeout(() => setMessage(''), 4000)
        return
      }
    }
    for (const a of teacher.teachingAssignments) {
      for (const sub of a.subjects) {
        for (const sess of ['theory', 'lab'] as SessionType[]) {
          const taken = findSheet(data, teacher.id, a.classId, sub.code, date, sess)
          if (!taken) {
            const idx = teacher.teachingAssignments.findIndex((x) => x.classId === a.classId)
            setAssignmentIndex(idx >= 0 ? idx : 0)
            setSubjectCode(sub.code)
            setSessionType(sess)
            setMessage(`Ready for new attendance: ${sub.code} · ${sess === 'theory' ? 'Theory' : 'Lab'}.`)
            setTimeout(() => setMessage(''), 4000)
            return
          }
        }
      }
    }
    setMessage('All subject sessions for this date are already recorded. Pick another date.')
    setTimeout(() => setMessage(''), 4000)
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    if (isLocked) return
    setEntries((prev) => prev.map((e) => (e.studentId === studentId ? { ...e, status } : e)))
  }

  function markAll(status: AttendanceStatus) {
    if (isLocked) return
    setEntries((prev) => prev.map((e) => ({ ...e, status })))
  }

  function handleSave(lock: boolean) {
    setError('')
    setMessage('')
    if (!assignment || !selectedSubject) {
      setError('Select a class and subject from your profile.')
      return
    }
    if (students.length === 0) {
      setError('No students in this class to mark attendance.')
      return
    }

    const result = saveAttendanceSheet(data, {
      teacherId: teacher.id,
      teacherName: teacher.name,
      employeeId: teacher.employeeId,
      department: teacher.department,
      branch: teacher.branch,
      classId: assignment.classId,
      course: assignment.course,
      section: assignment.section,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      sessionType,
      date,
      entries,
      lock,
    })

    if (result.error) {
      setError(result.error)
      return
    }

    setData(result.data)
    setMessage(
      lock
        ? 'Attendance locked. Use “Add another attendance” for Theory/Lab or another class on the same day.'
        : 'Draft saved. Lock when finished, then you can add another sheet for a different session.'
    )
    setTimeout(() => setMessage(''), 5000)
  }

  if (teacher.teachingAssignments.length === 0) {
    return (
      <div className="manage-panel">
        <h2>Attendance Sheet</h2>
        <p className="text-muted">Complete your teaching profile with classes and subjects first.</p>
      </div>
    )
  }

  const presentCount = entries.filter((e) => e.status === 'present').length
  const absentCount = entries.filter((e) => e.status === 'absent').length

  return (
    <div className="manage-panel attendance-panel">
      <h2>Attendance Sheet</h2>
      <p className="post-panel__desc">
        You can save <strong>multiple sheets per day</strong> — e.g. Theory in the morning and Lab in the afternoon, or different subjects.
        Each combination of date + class + subject + session is separate. Locked sheets can be viewed but not edited.
      </p>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {sheetsToday.length > 0 && (
        <div className="attendance-today">
          <span className="attendance-today__label">Recorded on {date}:</span>
          <div className="attendance-today__chips">
            {sheetsToday.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                className={`attendance-today__chip ${isCurrentSelection(sheet) ? 'attendance-today__chip--active' : ''} ${sheet.locked ? 'attendance-today__chip--locked' : ''}`}
                onClick={() => loadSheet(sheet)}
              >
                {sheetLabel(sheet)}
                {sheet.locked ? ' · Locked' : ' · Draft'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="attendance-sheet">
        <header className="attendance-sheet__header">
          <div className="attendance-sheet__title-row">
            <div className="attendance-sheet__title">Official Attendance Record</div>
            {isLocked && (
              <button type="button" className="btn btn--ghost btn--sm attendance-sheet__new-btn" onClick={startNewSheet}>
                + Add another attendance
              </button>
            )}
          </div>
          <div className="attendance-sheet__meta">
            <div><span>Teacher</span><strong>{teacher.name}</strong></div>
            <div><span>Employee ID</span><strong>{teacher.employeeId}</strong></div>
            <div><span>Department</span><strong>{teacher.department}</strong></div>
            <div><span>Branch</span><strong>{teacher.branch}</strong></div>
          </div>
        </header>

        <div className="attendance-sheet__controls post-form">
          <label>
            Class / Course
            <select
              value={assignmentIndex}
              onChange={(e) => setAssignmentIndex(Number(e.target.value))}
            >
              {teacher.teachingAssignments.map((a, i) => (
                <option key={`${a.classId}-${i}`} value={i}>
                  {a.course} — Section {a.section}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subject
            <select value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)}>
              {assignment?.subjects.map((s) => (
                <option key={s.code} value={s.code}>{formatSubject(s)}</option>
              ))}
            </select>
          </label>

          <label>
            Session
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
            >
              <option value="theory">Theory</option>
              <option value="lab">Lab</option>
            </select>
          </label>

          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {isLocked && (
          <div className="attendance-sheet__locked">
            <span className="official-badge">Locked</span>
            View only — change session to Lab/Theory, subject, or class above to open a new sheet, or click{' '}
            <strong>Add another attendance</strong>.
          </div>
        )}

        {!isViewingExisting && !isLocked && (
          <div className="attendance-sheet__new-hint">
            New sheet — not saved yet. Theory and Lab count as separate attendance for the same day.
          </div>
        )}

        <div className="attendance-sheet__summary">
          <span>Present: <strong>{presentCount}</strong></span>
          <span>Absent: <strong>{absentCount}</strong></span>
          <span>Total: <strong>{entries.length}</strong></span>
          {!isLocked && (
            <div className="attendance-sheet__bulk">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => markAll('present')}>
                All Present
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => markAll('absent')}>
                All Absent
              </button>
            </div>
          )}
        </div>

        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Enrollment No.</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted">No students in this class.</td>
                </tr>
              ) : (
                entries.map((entry, i) => (
                  <tr key={entry.studentId} className={entry.status === 'absent' ? 'attendance-table__row--absent' : ''}>
                    <td>{i + 1}</td>
                    <td className="attendance-table__enroll">{entry.enrollNo}</td>
                    <td>{entry.name}</td>
                    <td>
                      <input
                        type="radio"
                        name={`att-${entry.studentId}`}
                        checked={entry.status === 'present'}
                        onChange={() => setStatus(entry.studentId, 'present')}
                        disabled={isLocked}
                        aria-label={`${entry.name} present`}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`att-${entry.studentId}`}
                        checked={entry.status === 'absent'}
                        onChange={() => setStatus(entry.studentId, 'absent')}
                        disabled={isLocked}
                        aria-label={`${entry.name} absent`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLocked && (
          <div className="attendance-sheet__actions">
            <button type="button" className="btn btn--ghost" onClick={() => handleSave(false)}>
              Save Draft
            </button>
            <button type="button" className="btn btn--primary btn--teacher" onClick={() => handleSave(true)}>
              Save &amp; Lock Sheet
            </button>
          </div>
        )}
      </div>

      {pastSheets.length > 0 && (
        <section className="stack-lg">
          <h3 className="manage-panel__subtitle">All saved sheets (view only when locked)</h3>
          <div className="attendance-history">
            {pastSheets.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                className={`attendance-history__card attendance-history__card--clickable ${isCurrentSelection(sheet) ? 'attendance-history__card--active' : ''}`}
                onClick={() => loadSheet(sheet)}
              >
                <header>
                  <strong>{sheet.date}</strong>
                  <span className={`attendance-history__tag attendance-history__tag--${sheet.sessionType}`}>
                    {sheet.sessionType === 'theory' ? 'Theory' : 'Lab'}
                  </span>
                  {sheet.locked ? (
                    <span className="official-badge">Locked</span>
                  ) : (
                    <span className="attendance-history__tag attendance-history__tag--draft">Draft</span>
                  )}
                </header>
                <p>
                  {sheet.subjectCode} — {sheet.subjectName} · {sheet.course} Sec {sheet.section}
                </p>
                <p className="text-muted">
                  Present {countPresent(sheet)} / {sheet.entries.length} · Absent {countAbsent(sheet)}
                  {sheet.locked ? ' · Tap to view' : ' · Tap to edit'}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
