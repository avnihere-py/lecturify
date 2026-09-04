export type UpdateType = 'cancellation' | 'schedule' | 'exam' | 'general' | 'holiday'

export type FacultyRole = 'class_teacher' | 'subject_teacher'

export interface ContactProfile {
  collegeEmail?: string
  phone?: string
  dateOfBirth?: string
}

export interface SubjectInfo {
  code: string
  name: string
}

export interface ProgramInfo {
  id: string
  name: string
  sections: string[]
  featured?: boolean
}

export interface DepartmentInfo {
  id: string
  shortCode: string
  name: string
  branch: string
  programs: ProgramInfo[]
  sortOrder: number
}

export interface ClassInfo {
  id: string
  name: string
  courseId: string
  section: string
  department: string
  departmentId: string
  branch: string
  teacherId: string
  crStudentId?: string
}

export interface Student {
  id: string
  enrollNo: string
  name: string
  password: string
  classId: string
  branch: string
  department: string
  departmentId: string
  course: string
  courseId: string
  section: string
  profile: ContactProfile
  profileComplete: boolean
}

export interface TeachingAssignment {
  courseId: string
  course: string
  section: string
  subjects: SubjectInfo[]
  classId: string
}

export interface Teacher {
  id: string
  employeeId: string
  name: string
  password: string
  department: string
  departmentId: string
  branch: string
  facultyRole: FacultyRole
  addedByTeacherId?: string
  classIds: string[]
  teachingAssignments: TeachingAssignment[]
  profile: ContactProfile
  profileComplete: boolean
}

export interface Director {
  id: string
  directorId: string
  name: string
  password: string
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

export interface CampusAlert {
  id: string
  title: string
  message: string
  createdAt: string
  postedBy: string
}

export type ChatChannel = 'class' | 'direct'
export type ChatSenderRole = 'student' | 'cr' | 'teacher' | 'director'

export interface ChatMessage {
  id: string
  classId: string
  channel: ChatChannel
  senderId: string
  senderName: string
  senderRole: ChatSenderRole
  recipientId?: string
  recipientName?: string
  recipientRole?: ChatSenderRole | 'director'
  text: string
  createdAt: string
}

export type SessionType = 'theory' | 'lab'
export type AttendanceStatus = 'present' | 'absent'

export interface AttendanceEntry {
  studentId: string
  enrollNo: string
  name: string
  status: AttendanceStatus
}

export interface AttendanceSheet {
  id: string
  classId: string
  teacherId: string
  teacherName: string
  employeeId: string
  department: string
  branch: string
  course: string
  section: string
  subjectCode: string
  subjectName: string
  sessionType: SessionType
  date: string
  entries: AttendanceEntry[]
  locked: boolean
  createdAt: string
  updatedAt: string
}

export type User =
  | { role: 'student'; data: Student }
  | { role: 'teacher'; data: Teacher }
  | { role: 'director'; data: Director }

export interface AppData {
  departments: DepartmentInfo[]
  classes: ClassInfo[]
  students: Student[]
  teachers: Teacher[]
  directors: Director[]
  updates: OfficialUpdate[]
  campusAlerts: CampusAlert[]
  chatMessages: ChatMessage[]
  attendanceSheets: AttendanceSheet[]
}

export type EditableContactFields = ContactProfile
