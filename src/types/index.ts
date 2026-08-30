export type UpdateType = 'cancellation' | 'schedule' | 'exam' | 'general' | 'holiday'

export interface ClassInfo {
  id: string
  name: string
  section: string
  department: string
  teacherId: string
  crStudentId?: string
}

export interface Student {
  id: string
  enrollNo: string
  name: string
  password: string
  classId: string
}

export interface Teacher {
  id: string
  employeeId: string
  name: string
  password: string
  department: string
  classIds: string[]
}

export interface OfficialUpdate {
  id: string
  classId: string
  title: string
  message: string
  type: UpdateType
  postedBy: { id: string; name: string; role: 'teacher' | 'cr' }
  createdAt: string
}

export type User =
  | { role: 'student'; data: Student }
  | { role: 'teacher'; data: Teacher }

export interface AppData {
  classes: ClassInfo[]
  students: Student[]
  teachers: Teacher[]
  updates: OfficialUpdate[]
}
