import { DEFAULT_DEPARTMENTS } from '../data/academics'
import type { AppData, DepartmentInfo } from '../types'
import { normalizeSubjects } from './subjects'

const EMPTY_PROFILE = { collegeEmail: '', phone: '', dateOfBirth: '' }

export function migrateAppData(parsed: Partial<AppData>, seed: AppData): AppData {
  const departments: DepartmentInfo[] =
    parsed.departments?.length ? parsed.departments : seed.departments ?? DEFAULT_DEPARTMENTS

  const classes = (parsed.classes?.length ? parsed.classes : seed.classes).map((c) => {
    const base = seed.classes.find((s) => s.id === c.id)
    return {
      ...c,
      courseId: c.courseId ?? base?.courseId ?? '',
      departmentId: c.departmentId ?? base?.departmentId ?? '',
      branch: c.branch ?? base?.branch ?? 'Engineering',
    }
  })

  const studentSource =
    (parsed.students?.length ?? 0) >= seed.students.length &&
    seed.students.every((s) => parsed.students?.some((p) => p.id === s.id))
      ? parsed.students!
      : seed.students

  const students = studentSource.map((s) => {
    const cls =
      classes.find((c) => c.id === s.classId) ??
      seed.classes.find((c) => c.id === s.classId)
    const base = seed.students.find((b) => b.id === s.id)
    const profile = { ...EMPTY_PROFILE, ...(s.profile ?? base?.profile ?? {}) }
    return {
      ...s,
      branch: s.branch ?? cls?.branch ?? base?.branch ?? 'Engineering',
      department: s.department ?? cls?.department ?? base?.department ?? '',
      departmentId: s.departmentId ?? cls?.departmentId ?? base?.departmentId ?? '',
      course: s.course ?? cls?.name ?? base?.course ?? '',
      courseId: s.courseId ?? cls?.courseId ?? base?.courseId ?? '',
      section: s.section ?? cls?.section ?? base?.section ?? '',
      profile,
      profileComplete:
        s.profileComplete ?? Boolean(profile.collegeEmail && profile.phone && profile.dateOfBirth),
    }
  })

  const teachers = (parsed.teachers?.length ? parsed.teachers : seed.teachers).map((t) => {
    const base = seed.teachers.find((b) => b.id === t.id)
    const dept = departments.find((d) => d.id === t.departmentId)
    const profile = { ...EMPTY_PROFILE, ...(t.profile ?? base?.profile ?? {}) }
    const teachingAssignments = (t.teachingAssignments ?? base?.teachingAssignments ?? []).map(
      (a) => ({
        ...a,
        subjects: normalizeSubjects(a.subjects),
      })
    )
    const raw = t as { facultyRole?: string; teacherRole?: string }
    const facultyRole =
      raw.facultyRole ??
      raw.teacherRole ??
      base?.facultyRole ??
      'class_teacher'
    return {
      ...t,
      departmentId: t.departmentId ?? base?.departmentId ?? dept?.id ?? '',
      branch: t.branch ?? base?.branch ?? dept?.branch ?? 'Engineering',
      facultyRole: facultyRole as 'class_teacher' | 'subject_teacher',
      addedByTeacherId: t.addedByTeacherId ?? base?.addedByTeacherId,
      classIds: t.classIds ?? base?.classIds ?? [],
      teachingAssignments,
      profile,
      profileComplete:
        t.profileComplete ??
        Boolean(
          profile.collegeEmail &&
            profile.phone &&
            profile.dateOfBirth &&
            teachingAssignments.length > 0
        ),
    }
  })

  return {
    ...structuredClone(seed),
    ...parsed,
    departments,
    classes,
    students,
    teachers,
    directors: Array.isArray(parsed.directors) ? parsed.directors : seed.directors ?? [],
    campusAlerts: parsed.campusAlerts ?? seed.campusAlerts,
    updates: parsed.updates ?? seed.updates,
    chatMessages: parsed.chatMessages ?? seed.chatMessages,
    attendanceSheets: parsed.attendanceSheets ?? seed.attendanceSheets ?? [],
  }
}
