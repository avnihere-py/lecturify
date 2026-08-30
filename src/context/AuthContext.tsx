import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadData } from '../lib/storage'
import type { AppData, Student, Teacher, User } from '../types'

interface AuthContextValue {
  user: User | null
  data: AppData
  setData: (data: AppData) => void
  loginStudent: (enrollNo: string, password: string) => string | null
  loginTeacher: (employeeId: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('lecturify-user')
    if (!saved) return null
    try {
      return JSON.parse(saved) as User
    } catch {
      return null
    }
  })

  const persistUser = useCallback((u: User | null) => {
    setUser(u)
    if (u) sessionStorage.setItem('lecturify-user', JSON.stringify(u))
    else sessionStorage.removeItem('lecturify-user')
  }, [])

  const loginStudent = useCallback(
    (enrollNo: string, password: string) => {
      const fresh = loadData()
      setData(fresh)
      const student = fresh.students.find(
        (s) => s.enrollNo.toUpperCase() === enrollNo.toUpperCase()
      )
      if (!student) return 'Enrollment number not found. Please enroll first.'
      if (student.password !== password) return 'Incorrect password.'
      persistUser({ role: 'student', data: student })
      return null
    },
    [persistUser]
  )

  const loginTeacher = useCallback(
    (employeeId: string, password: string) => {
      const fresh = loadData()
      setData(fresh)
      const teacher = fresh.teachers.find(
        (t) => t.employeeId.toUpperCase() === employeeId.toUpperCase()
      )
      if (!teacher) return 'Employee ID not found.'
      if (teacher.password !== password) return 'Incorrect password.'
      persistUser({ role: 'teacher', data: teacher })
      return null
    },
    [persistUser]
  )

  const logout = useCallback(() => persistUser(null), [persistUser])

  const value = useMemo(
    () => ({ user, data, setData, loginStudent, loginTeacher, logout }),
    [user, data, loginStudent, loginTeacher, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

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
