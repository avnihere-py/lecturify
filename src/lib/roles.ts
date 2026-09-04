import type { AppData, Student, Teacher } from '../types'

export function isCR(student: Student, data: AppData): boolean {
  const cls = data.classes.find((c) => c.id === student.classId)
  return cls?.crStudentId === student.id
}

export function getClassForStudent(student: Student, data: AppData) {
  return data.classes.find((c) => c.id === student.classId)
}

export function getClassesForTeacher(teacher: Teacher, data: AppData) {
  return data.classes.filter((c) => teacher.classIds.includes(c.id))
}

export function getCRForClass(classId: string, data: AppData) {
  const cls = data.classes.find((c) => c.id === classId)
  if (!cls?.crStudentId) return null
  return data.students.find((s) => s.id === cls.crStudentId) ?? null
}
