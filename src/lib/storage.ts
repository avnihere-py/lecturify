import { SEED_DATA } from '../data/seed'
import type { AppData, OfficialUpdate, Student } from '../types'

const STORAGE_KEY = 'lecturify-data'

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA))
    return structuredClone(SEED_DATA)
  }
  try {
    return JSON.parse(raw) as AppData
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA))
    return structuredClone(SEED_DATA)
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addUpdate(data: AppData, update: OfficialUpdate): AppData {
  const next = { ...data, updates: [update, ...data.updates] }
  saveData(next)
  return next
}

export function enrollStudent(
  data: AppData,
  student: Omit<Student, 'id'>
): { data: AppData; error?: string } {
  const exists = data.students.some(
    (s) => s.enrollNo.toUpperCase() === student.enrollNo.toUpperCase()
  )
  if (exists) return { data, error: 'This enrollment number is already registered.' }

  const newStudent: Student = {
    ...student,
    id: `stu-${Date.now()}`,
    enrollNo: student.enrollNo.toUpperCase(),
  }
  const next = { ...data, students: [...data.students, newStudent] }
  saveData(next)
  return { data: next }
}

export function assignCR(data: AppData, classId: string, studentId: string): AppData {
  const next = {
    ...data,
    classes: data.classes.map((c) =>
      c.id === classId ? { ...c, crStudentId: studentId } : c
    ),
  }
  saveData(next)
  return next
}

export function resetDemoData(): AppData {
  localStorage.removeItem(STORAGE_KEY)
  return loadData()
}
