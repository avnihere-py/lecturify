import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { loadData, registerDirector as registerDirectorInStorage } from '../lib/storage'
import { normalizeEnrollmentNo } from '../lib/passwords'
import type { AppData, User } from '../types'

export type LoginPortal = 'student' | 'faculty' | 'director'

interface AuthContextValue {
  user: User | null
  data: AppData
  setData: (data: AppData) => void
  refreshUser: () => void
  loginStudent: (enrollNo: string, password: string) => string | null
  loginTeacher: (employeeId: string, password: string) => string | null
  loginDirector: (directorId: string, password: string) => string | null
  registerDirector: (
    directorId: string,
    name: string,
    password: string
  ) => { error: string | null }
  loginById: (id: string, password: string, portal: LoginPortal) => { error: string | null; role?: User['role'] }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [data, setDataState] = useState<AppData>(() => loadData())
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

  const refreshUser = useCallback(() => {
    const fresh = loadData()
    setDataState(fresh)
    if (!user) return
    if (user.role === 'student') {
      const student = fresh.students.find((s) => s.id === user.data.id)
      if (student) persistUser({ role: 'student', data: student })
    } else if (user.role === 'teacher') {
      const teacher = fresh.teachers.find((t) => t.id === user.data.id)
      if (teacher) persistUser({ role: 'teacher', data: teacher })
    } else if (user.role === 'director') {
      const director = fresh.directors.find((d) => d.id === user.data.id)
      if (director) persistUser({ role: 'director', data: director })
    }
  }, [user, persistUser])

  const setData = useCallback(
    (next: AppData) => {
      setDataState(next)
      if (!user) return
      if (user.role === 'student') {
        const student = next.students.find((s) => s.id === user.data.id)
        if (student) persistUser({ role: 'student', data: student })
      } else if (user.role === 'teacher') {
        const teacher = next.teachers.find((t) => t.id === user.data.id)
        if (teacher) persistUser({ role: 'teacher', data: teacher })
      } else if (user.role === 'director') {
        const director = next.directors.find((d) => d.id === user.data.id)
        if (director) persistUser({ role: 'director', data: director })
      }
    },
    [user, persistUser]
  )

  const loginStudent = useCallback(
    (enrollNo: string, password: string) => {
      const fresh = loadData()
      setDataState(fresh)
      const student = fresh.students.find(
        (s) => normalizeEnrollmentNo(s.enrollNo) === normalizeEnrollmentNo(enrollNo)
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
      setDataState(fresh)
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

  const loginDirector = useCallback(
    (directorId: string, password: string) => {
      const fresh = loadData()
      setDataState(fresh)
      const director = fresh.directors.find(
        (d) => d.directorId.toUpperCase() === directorId.toUpperCase()
      )
      if (!director) return 'Director ID not found. Create an account first.'
      if (director.password !== password) return 'Incorrect password.'
      persistUser({ role: 'director', data: director })
      return null
    },
    [persistUser]
  )

  const registerDirector = useCallback(
    (directorId: string, name: string, password: string) => {
      const fresh = loadData()
      const result = registerDirectorInStorage(fresh, { directorId, name, password })
      if (result.error) return { error: result.error }
      setDataState(result.data)
      const created = result.data.directors[result.data.directors.length - 1]
      persistUser({ role: 'director', data: created })
      return { error: null }
    },
    [persistUser]
  )

  const loginById = useCallback(
    (id: string, password: string, portal: LoginPortal) => {
      const fresh = loadData()
      setDataState(fresh)
      const trimmed = id.trim().toUpperCase()

      if (portal === 'director') {
        const director = fresh.directors.find((d) => d.directorId.toUpperCase() === trimmed)
        if (!director) return { error: 'Director ID not found. Create an account first.' }
        if (director.password !== password) return { error: 'Incorrect password.' }
        persistUser({ role: 'director', data: director })
        return { error: null, role: 'director' as const }
      }

      if (portal === 'faculty') {
        const teacher = fresh.teachers.find((t) => t.employeeId.toUpperCase() === trimmed)
        if (!teacher) return { error: 'Faculty ID not found.' }
        if (teacher.password !== password) return { error: 'Incorrect password.' }
        persistUser({ role: 'teacher', data: teacher })
        return { error: null, role: 'teacher' as const }
      }

      const student = fresh.students.find(
        (s) => normalizeEnrollmentNo(s.enrollNo) === normalizeEnrollmentNo(id)
      )
      if (!student) return { error: 'Enrollment number not found.' }
      if (student.password !== password) return { error: 'Incorrect password.' }

      persistUser({ role: 'student', data: student })
      return { error: null, role: 'student' as const }
    },
    [persistUser]
  )

  const logout = useCallback(() => {
    persistUser(null)
    navigate('/', { replace: true })
  }, [persistUser, navigate])

  const value = useMemo(
    () => ({
      user,
      data,
      setData,
      refreshUser,
      loginStudent,
      loginTeacher,
      loginDirector,
      registerDirector,
      loginById,
      logout,
    }),
    [user, data, setData, refreshUser, loginStudent, loginTeacher, loginDirector, registerDirector, loginById, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
