import { DEFAULT_DEPARTMENTS } from '../data/academics'
import { DEMO_CLASS_ID } from '../data/demoStudents'
import { DEMO_DIRECTOR } from '../data/demoDirector'
import type { AppData, Student } from '../types'

function enrichStudent(student: Student, data: AppData): Student {
  const cls = data.classes.find((c) => c.id === student.classId)
  if (!cls) return student
  return {
    ...student,
    branch: student.branch || cls.branch,
    department: student.department || cls.department,
    departmentId: student.departmentId || cls.departmentId,
    course: student.course || cls.name,
    courseId: student.courseId || cls.courseId,
    section: student.section || cls.section,
  }
}

function demoRosterMatches(data: AppData, seed: AppData): boolean {
  const current = data.students.filter((s) => s.classId === DEMO_CLASS_ID)
  const expected = seed.students.filter((s) => s.classId === DEMO_CLASS_ID)
  if (current.length !== expected.length) return false
  return expected.every((s) =>
    current.some((c) => c.id === s.id && c.enrollNo === s.enrollNo && c.name === s.name)
  )
}

/** Keep demo roster and academic structure consistent after localStorage upgrades. */
export function repairAppData(data: AppData, seed: AppData): { data: AppData; changed: boolean } {
  let changed = false
  let next = data
  const preservedDirectors = next.directors ?? []

  const hasMaeDept = next.departments.some((d) => d.id === 'dept-mae')
  if (!hasMaeDept) {
    next = { ...next, departments: structuredClone(seed.departments ?? DEFAULT_DEPARTMENTS) }
    changed = true
  }

  const hasDemoClass = next.classes.some((c) => c.id === DEMO_CLASS_ID)
  if (!hasDemoClass) {
    const demoClasses = seed.classes.filter((c) => c.id === DEMO_CLASS_ID)
    next = { ...next, classes: [...next.classes, ...demoClasses] }
    changed = true
  }

  if (!demoRosterMatches(next, seed)) {
    const keep = next.students.filter((s) => s.classId !== DEMO_CLASS_ID)
    const seedDemo = structuredClone(seed.students.filter((s) => s.classId === DEMO_CLASS_ID))
    next = { ...next, students: [...keep, ...seedDemo] }
    changed = true
  }

  const hasDemoDirector = next.directors.some((d) => d.directorId === DEMO_DIRECTOR.directorId)
  if (!hasDemoDirector && (next.directors?.length ?? 0) === 0) {
    next = { ...next, directors: [structuredClone(DEMO_DIRECTOR)] }
    changed = true
  }

  const enriched = next.students.map((s) => enrichStudent(s, next))
  const needsEnrich = enriched.some((s, i) => {
    const prev = next.students[i]
    return (
      s.departmentId !== prev.departmentId ||
      s.courseId !== prev.courseId ||
      s.section !== prev.section
    )
  })
  if (needsEnrich) {
    next = { ...next, students: enriched }
    changed = true
  }

  if (!next.directors || next.directors.length < preservedDirectors.length) {
    next = { ...next, directors: preservedDirectors }
    changed = true
  }

  return { data: next, changed }
}
