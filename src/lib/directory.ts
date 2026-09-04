import type { AppData } from '../types'
import { buildClassId } from './academics'

export function getClassIdForPlacement(
  data: AppData,
  departmentId: string,
  programId: string,
  section: string
): string | null {
  const dept = data.departments.find((d) => d.id === departmentId)
  const program = dept?.programs.find((p) => p.id === programId)
  if (!dept || !program) return null
  if (section && !program.sections.includes(section)) return null
  return buildClassId(departmentId, programId, section)
}

export function getTeachersForClass(data: AppData, classId: string) {
  return data.teachers.filter((t) =>
    t.teachingAssignments.some((a) => a.classId === classId)
  )
}

export function getStudentsForClass(data: AppData, classId: string) {
  return data.students.filter((s) => s.classId === classId)
}

function matchingClassIds(
  data: AppData,
  filters: { departmentId: string; programId: string; section: string }
): Set<string> {
  return new Set(
    data.classes
      .filter((c) => {
        if (c.departmentId !== filters.departmentId) return false
        if (filters.programId && c.courseId !== filters.programId) return false
        if (filters.section && c.section !== filters.section) return false
        return true
      })
      .map((c) => c.id)
  )
}

export function getTeachersForFilter(
  data: AppData,
  filters: { departmentId: string; programId: string; section: string }
) {
  if (!filters.departmentId) return []

  const classIds = matchingClassIds(data, filters)

  return data.teachers.filter((t) => {
    if (t.departmentId !== filters.departmentId) return false
    return t.teachingAssignments.some((a) => {
      if (classIds.size > 0 && classIds.has(a.classId)) return true
      if (filters.programId && a.courseId !== filters.programId) return false
      if (filters.section && a.section !== filters.section) return false
      return true
    })
  })
}

export function getStudentsForFilter(
  data: AppData,
  filters: { departmentId: string; programId: string; section: string }
) {
  if (!filters.departmentId) return []

  const classIds = matchingClassIds(data, filters)

  return data.students.filter((s) => {
    if (classIds.size > 0 && classIds.has(s.classId)) return true

    const cls = data.classes.find((c) => c.id === s.classId)
    const deptId = s.departmentId || cls?.departmentId
    const courseId = s.courseId || cls?.courseId
    const section = s.section || cls?.section

    if (deptId && deptId !== filters.departmentId) return false
    if (!deptId) return false

    if (filters.programId && courseId && courseId !== filters.programId) return false
    if (filters.section && section && section !== filters.section) return false

    return true
  })
}
