import type { AppData, AttendanceSheet, SessionType, Teacher } from '../types'

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function sheetKey(
  teacherId: string,
  classId: string,
  subjectCode: string,
  date: string,
  sessionType: SessionType
): string {
  return `${teacherId}|${classId}|${subjectCode}|${date}|${sessionType}`
}

export function findSheet(
  data: AppData,
  teacherId: string,
  classId: string,
  subjectCode: string,
  date: string,
  sessionType: SessionType
): AttendanceSheet | undefined {
  const key = sheetKey(teacherId, classId, subjectCode, date, sessionType)
  return data.attendanceSheets.find(
    (s) =>
      sheetKey(s.teacherId, s.classId, s.subjectCode, s.date, s.sessionType) === key
  )
}

export function getSheetsForTeacher(data: AppData, teacherId: string): AttendanceSheet[] {
  return data.attendanceSheets
    .filter((s) => s.teacherId === teacherId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
}

export function getSheetsForDate(data: AppData, teacherId: string, date: string): AttendanceSheet[] {
  return data.attendanceSheets
    .filter((s) => s.teacherId === teacherId && s.date === date)
    .sort((a, b) => a.sessionType.localeCompare(b.sessionType))
}

export function sheetLabel(sheet: AttendanceSheet): string {
  const session = sheet.sessionType === 'theory' ? 'Theory' : 'Lab'
  return `${sheet.subjectCode} · ${session} · Sec ${sheet.section}`
}

export function countPresent(sheet: AttendanceSheet): number {
  return sheet.entries.filter((e) => e.status === 'present').length
}

export function countAbsent(sheet: AttendanceSheet): number {
  return sheet.entries.filter((e) => e.status === 'absent').length
}

export function buildSheetMeta(teacher: Teacher, assignmentIndex: number) {
  const assignment = teacher.teachingAssignments[assignmentIndex]
  if (!assignment) return null
  return {
    classId: assignment.classId,
    course: assignment.course,
    section: assignment.section,
    subjects: assignment.subjects,
    department: teacher.department,
    branch: teacher.branch,
    teacherName: teacher.name,
    employeeId: teacher.employeeId,
    teacherId: teacher.id,
  }
}
