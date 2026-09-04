import { SEED_DATA } from '../data/seed'
import { buildClassId } from './academics'
import { findSheet } from './attendance'
import { migrateAppData } from './migrate'
import { repairAppData } from './repair'
import { generateStudentPassword, normalizeEnrollmentNo, validateEnrollmentNo } from './passwords'
import { isContactProfileComplete, isStudentProfileComplete, isTeacherProfileComplete } from './profile'
import type {
  AppData,
  AttendanceEntry,
  AttendanceSheet,
  CampusAlert,
  ChatMessage,
  ClassInfo,
  ContactProfile,
  DepartmentInfo,
  OfficialUpdate,
  ProgramInfo,
  SessionType,
  Student,
  Teacher,
  TeachingAssignment,
} from '../types'

const STORAGE_KEY = 'lecturify-data-v11'
const LEGACY_KEYS = [
  'lecturify-data-v10',
  'lecturify-data-v9',
  'lecturify-data-v8',
  'lecturify-data-v7',
  'lecturify-data-v6',
]

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Pull director accounts from older storage keys when the current store lost them. */
function mergeLegacyDirectors(parsed: Partial<AppData>): Partial<AppData> {
  if ((parsed.directors?.length ?? 0) > 0) return parsed

  for (const key of LEGACY_KEYS) {
    const legacy = localStorage.getItem(key)
    if (!legacy) continue
    const old = parseJson<Partial<AppData>>(legacy)
    if ((old?.directors?.length ?? 0) > 0) {
      return { ...parsed, directors: old!.directors }
    }
  }
  return parsed
}

function readRawStorage(): string | null {
  const current = localStorage.getItem(STORAGE_KEY)
  if (!current) {
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) return legacy
    }
    return null
  }

  const parsed = parseJson<Partial<AppData>>(current)
  if (!parsed) return current

  const merged = mergeLegacyDirectors(parsed)
  if (merged.directors !== parsed.directors) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }
  return JSON.stringify(merged)
}

export function loadData(): AppData {
  const raw = readRawStorage()
  if (!raw) {
    const fresh = structuredClone(SEED_DATA)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>
    let merged = migrateAppData(parsed, SEED_DATA)
    const needsStudentUpgrade = merged.students.length < SEED_DATA.students.length
    if (needsStudentUpgrade) {
      merged = migrateAppData({ ...parsed, students: SEED_DATA.students }, SEED_DATA)
    }
    merged.chatMessages = (merged.chatMessages ?? []).map((m) => {
      const rawMsg = m as unknown as { channel?: string; senderRole?: ChatMessage['senderRole'] }
      const ch = rawMsg.channel ?? 'class'
      const channel: ChatMessage['channel'] = ch === 'faculty' || ch === 'direct' ? 'direct' : 'class'
      return {
        ...(m as ChatMessage),
        channel,
        senderRole: rawMsg.senderRole ?? 'student',
      }
    })
    const repaired = repairAppData(merged, SEED_DATA)
    merged = repaired.data
    if (!merged.directors) merged.directors = []
    if (!merged.attendanceSheets) merged.attendanceSheets = []
    if (needsStudentUpgrade || repaired.changed) saveData(merged)
    return merged
  } catch {
    const fresh = structuredClone(SEED_DATA)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
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

export function addCampusAlert(data: AppData, alert: CampusAlert): AppData {
  const next = { ...data, campusAlerts: [alert, ...data.campusAlerts] }
  saveData(next)
  return next
}

export function saveAttendanceSheet(
  data: AppData,
  params: {
    teacherId: string
    teacherName: string
    employeeId: string
    department: string
    branch: string
    classId: string
    course: string
    section: string
    subjectCode: string
    subjectName: string
    sessionType: SessionType
    date: string
    entries: AttendanceEntry[]
    lock: boolean
  }
): { data: AppData; error?: string } {
  const existing = findSheet(
    data,
    params.teacherId,
    params.classId,
    params.subjectCode,
    params.date,
    params.sessionType
  )

  if (existing?.locked) {
    return { data, error: 'This attendance sheet is already locked and cannot be changed.' }
  }

  const now = new Date().toISOString()
  const sheet: AttendanceSheet = {
    id: existing?.id ?? `att-${Date.now()}`,
    classId: params.classId,
    teacherId: params.teacherId,
    teacherName: params.teacherName,
    employeeId: params.employeeId,
    department: params.department,
    branch: params.branch,
    course: params.course,
    section: params.section,
    subjectCode: params.subjectCode,
    subjectName: params.subjectName,
    sessionType: params.sessionType,
    date: params.date,
    entries: params.entries,
    locked: params.lock,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  const sheets = existing
    ? data.attendanceSheets.map((s) => (s.id === existing.id ? sheet : s))
    : [sheet, ...data.attendanceSheets]

  const next = { ...data, attendanceSheets: sheets }
  saveData(next)
  return { data: next }
}

export function registerDirector(
  data: AppData,
  director: { directorId: string; name: string; password: string }
): { data: AppData; error?: string } {
  const directorId = director.directorId.trim().toUpperCase()
  if (!directorId) return { data, error: 'Director ID is required.' }
  if (directorId.length < 3) return { data, error: 'Director ID must be at least 3 characters.' }
  if (!director.name.trim()) return { data, error: 'Full name is required.' }
  if (director.password.length < 6) return { data, error: 'Password must be at least 6 characters.' }

  const exists = data.directors.some((d) => d.directorId.toUpperCase() === directorId)
  if (exists) return { data, error: 'This Director ID is already taken. Sign in instead.' }

  const next = {
    ...data,
    directors: [
      ...data.directors,
      {
        id: `dir-${Date.now()}`,
        directorId,
        name: director.name.trim(),
        password: director.password,
      },
    ],
  }
  saveData(next)
  return { data: next }
}

export function findOrCreateClass(
  data: AppData,
  params: {
    departmentId: string
    department: string
    branch: string
    courseId: string
    course: string
    section: string
    teacherId?: string
  }
): { data: AppData; classInfo: ClassInfo } {
  const existing = data.classes.find(
    (c) =>
      c.departmentId === params.departmentId &&
      c.courseId === params.courseId &&
      c.section === params.section
  )
  if (existing) {
    if (params.teacherId && !existing.teacherId) {
      const next = {
        ...data,
        classes: data.classes.map((c) =>
          c.id === existing.id ? { ...c, teacherId: params.teacherId! } : c
        ),
      }
      saveData(next)
      return { data: next, classInfo: { ...existing, teacherId: params.teacherId } }
    }
    return { data, classInfo: existing }
  }

  const classInfo: ClassInfo = {
    id: buildClassId(params.departmentId, params.courseId, params.section),
    name: params.course,
    courseId: params.courseId,
    section: params.section,
    department: params.department,
    departmentId: params.departmentId,
    branch: params.branch,
    teacherId: params.teacherId ?? '',
  }
  const next = { ...data, classes: [...data.classes, classInfo] }
  saveData(next)
  return { data: next, classInfo }
}

export function addDepartment(
  data: AppData,
  dept: Omit<DepartmentInfo, 'id' | 'sortOrder' | 'programs'> & { programs?: ProgramInfo[] }
): { data: AppData; error?: string } {
  const exists = data.departments.some(
    (d) => d.shortCode.toUpperCase() === dept.shortCode.toUpperCase()
  )
  if (exists) return { data, error: 'Department code already exists.' }
  const maxOrder = data.departments.reduce((m, d) => Math.max(m, d.sortOrder), -1)
  const next: AppData = {
    ...data,
    departments: [
      ...data.departments,
      {
        ...dept,
        id: `dept-${Date.now()}`,
        sortOrder: maxOrder + 1,
        programs: dept.programs ?? [],
      },
    ],
  }
  saveData(next)
  return { data: next }
}

export function addProgram(
  data: AppData,
  departmentId: string,
  program: Omit<ProgramInfo, 'id'>
): { data: AppData; error?: string } {
  const dept = data.departments.find((d) => d.id === departmentId)
  if (!dept) return { data, error: 'Department not found.' }
  if (program.sections.length === 0) return { data, error: 'Add at least one section.' }
  const next: AppData = {
    ...data,
    departments: data.departments.map((d) =>
      d.id === departmentId
        ? {
            ...d,
            programs: [
              ...d.programs,
              { ...program, id: `prog-${Date.now()}` },
            ],
          }
        : d
    ),
  }
  saveData(next)
  return { data: next }
}

export function addSection(
  data: AppData,
  departmentId: string,
  programId: string,
  section: string
): { data: AppData; error?: string } {
  const trimmed = section.trim()
  if (!trimmed) return { data, error: 'Section name is required.' }
  const dept = data.departments.find((d) => d.id === departmentId)
  const program = dept?.programs.find((p) => p.id === programId)
  if (!program) return { data, error: 'Program not found.' }
  if (program.sections.includes(trimmed)) return { data, error: 'Section already exists.' }
  const next: AppData = {
    ...data,
    departments: data.departments.map((d) =>
      d.id === departmentId
        ? {
            ...d,
            programs: d.programs.map((p) =>
              p.id === programId ? { ...p, sections: [...p.sections, trimmed] } : p
            ),
          }
        : d
    ),
  }
  saveData(next)
  return { data: next }
}

export function addTeacher(
  data: AppData,
  teacher: Omit<Teacher, 'id' | 'classIds' | 'teachingAssignments' | 'profile' | 'profileComplete'>
): { data: AppData; error?: string } {
  const exists = data.teachers.some(
    (t) => t.employeeId.toUpperCase() === teacher.employeeId.toUpperCase()
  )
  if (exists) return { data, error: 'This employee ID is already issued.' }
  const next = {
    ...data,
    teachers: [
      ...data.teachers,
      {
        ...teacher,
        id: `tch-${Date.now()}`,
        classIds: [],
        teachingAssignments: [],
        profile: { collegeEmail: '', phone: '', dateOfBirth: '' },
        profileComplete: false,
      },
    ],
  }
  saveData(next)
  return { data: next }
}

export function issueFacultyId(
  data: AppData,
  params: {
    employeeId: string
    name: string
    password: string
    departmentId: string
    department: string
    branch: string
    facultyRole: Teacher['facultyRole']
    courseId: string
    course: string
    section: string
    addedByTeacherId?: string
  }
): { data: AppData; error?: string } {
  const exists = data.teachers.some(
    (t) => t.employeeId.toUpperCase() === params.employeeId.toUpperCase()
  )
  if (exists) return { data, error: 'This employee ID is already issued.' }
  if (!params.section) return { data, error: 'Select a section for this faculty member.' }

  const teacherId = `tch-${Date.now()}`
  const { data: withClass, classInfo } = findOrCreateClass(data, {
    departmentId: params.departmentId,
    department: params.department,
    branch: params.branch,
    courseId: params.courseId,
    course: params.course,
    section: params.section,
    teacherId: params.facultyRole === 'class_teacher' ? teacherId : undefined,
  })

  const assignment: TeachingAssignment = {
    courseId: params.courseId,
    course: params.course,
    section: params.section,
    subjects: [],
    classId: classInfo.id,
  }

  const next: AppData = {
    ...withClass,
    teachers: [
      ...withClass.teachers,
      {
        id: teacherId,
        employeeId: params.employeeId.toUpperCase(),
        name: params.name.trim(),
        password: params.password,
        department: params.department,
        departmentId: params.departmentId,
        branch: params.branch,
        facultyRole: params.facultyRole,
        addedByTeacherId: params.addedByTeacherId,
        classIds: [classInfo.id],
        teachingAssignments: [assignment],
        profile: { collegeEmail: '', phone: '', dateOfBirth: '' },
        profileComplete: false,
      },
    ],
  }
  saveData(next)
  return { data: next }
}

export function addSubjectTeacher(
  data: AppData,
  addedBy: Teacher,
  teacher: {
    employeeId: string
    name: string
    password: string
  }
): { data: AppData; error?: string } {
  if (addedBy.facultyRole !== 'class_teacher') {
    return { data, error: 'Only class teachers can add subject teachers.' }
  }
  const exists = data.teachers.some(
    (t) => t.employeeId.toUpperCase() === teacher.employeeId.toUpperCase()
  )
  if (exists) return { data, error: 'This employee ID is already issued.' }
  const next = {
    ...data,
    teachers: [
      ...data.teachers,
      {
        id: `tch-${Date.now()}`,
        employeeId: teacher.employeeId.toUpperCase(),
        name: teacher.name,
        password: teacher.password,
        department: addedBy.department,
        departmentId: addedBy.departmentId,
        branch: addedBy.branch,
        facultyRole: 'subject_teacher' as const,
        addedByTeacherId: addedBy.id,
        classIds: [],
        teachingAssignments: [],
        profile: { collegeEmail: '', phone: '', dateOfBirth: '' },
        profileComplete: false,
      },
    ],
  }
  saveData(next)
  return { data: next }
}

export function enrollStudent(
  data: AppData,
  student: {
    enrollNo: string
    name: string
    departmentId: string
    department: string
    branch: string
    courseId: string
    course: string
    section: string
    teacherId?: string
  }
): { data: AppData; error?: string; student?: Student } {
  const enrollErr = validateEnrollmentNo(student.enrollNo)
  if (enrollErr) return { data, error: enrollErr }

  const enrollNo = normalizeEnrollmentNo(student.enrollNo)
  const exists = data.students.some((s) => normalizeEnrollmentNo(s.enrollNo) === enrollNo)
  if (exists) return { data, error: 'This enrollment number is already registered.' }

  const { data: withClass, classInfo } = findOrCreateClass(data, {
    departmentId: student.departmentId,
    department: student.department,
    branch: student.branch,
    courseId: student.courseId,
    course: student.course,
    section: student.section,
    teacherId: student.teacherId,
  })

  const newStudent: Student = {
    id: `stu-${Date.now()}`,
    enrollNo,
    name: student.name,
    password: generateStudentPassword(enrollNo),
    classId: classInfo.id,
    branch: student.branch,
    department: student.department,
    departmentId: student.departmentId,
    course: student.course,
    courseId: student.courseId,
    section: student.section,
    profile: { collegeEmail: '', phone: '', dateOfBirth: '' },
    profileComplete: false,
  }
  const next = { ...withClass, students: [...withClass.students, newStudent] }
  saveData(next)
  return { data: next, student: newStudent }
}

export function updateStudentProfile(
  data: AppData,
  studentId: string,
  profile: ContactProfile
): { data: AppData; error?: string } {
  const student = data.students.find((s) => s.id === studentId)
  if (!student) return { data, error: 'Student not found.' }

  const next = {
    ...data,
    students: data.students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            profile: { ...s.profile, ...profile },
            profileComplete: isContactProfileComplete({ ...s.profile, ...profile }),
          }
        : s
    ),
  }
  saveData(next)
  return { data: next }
}

export function updateTeacherProfile(
  data: AppData,
  teacherId: string,
  profile: ContactProfile
): { data: AppData; error?: string } {
  const teacher = data.teachers.find((t) => t.id === teacherId)
  if (!teacher) return { data, error: 'Teacher not found.' }

  const mergedProfile = { ...teacher.profile, ...profile }
  const next = {
    ...data,
    teachers: data.teachers.map((t) =>
      t.id === teacherId
        ? {
            ...t,
            profile: mergedProfile,
            profileComplete: isTeacherProfileComplete({
              ...t,
              profile: mergedProfile,
            }),
          }
        : t
    ),
  }
  saveData(next)
  return { data: next }
}

export function saveTeacherTeachingSetup(
  data: AppData,
  teacherId: string,
  assignments: Omit<TeachingAssignment, 'classId'>[]
): { data: AppData; error?: string } {
  const teacher = data.teachers.find((t) => t.id === teacherId)
  if (!teacher) return { data, error: 'Teacher not found.' }
  if (assignments.length === 0) return { data, error: 'Add at least one class you teach.' }

  for (const assignment of assignments) {
    if (assignment.subjects.length === 0) {
      return { data, error: 'Add at least one subject (code and name) for each class.' }
    }
  }

  let working = data
  const teachingAssignments: TeachingAssignment[] = []

  for (const assignment of assignments) {
    const { data: nextData, classInfo } = findOrCreateClass(working, {
      departmentId: teacher.departmentId,
      department: teacher.department,
      branch: teacher.branch,
      courseId: assignment.courseId,
      course: assignment.course,
      section: assignment.section,
      teacherId: teacher.facultyRole === 'class_teacher' ? teacher.id : undefined,
    })
    working = {
      ...nextData,
      classes: nextData.classes.map((c) =>
        c.id === classInfo.id && teacher.facultyRole === 'class_teacher'
          ? { ...c, teacherId: teacher.id }
          : c
      ),
    }
    teachingAssignments.push({
      ...assignment,
      subjects: assignment.subjects.map((s) => ({
        code: s.code.trim().toUpperCase(),
        name: s.name.trim(),
      })),
      classId: classInfo.id,
    })
  }

  const classIds = teachingAssignments.map((a) => a.classId)
  const next = {
    ...working,
    teachers: working.teachers.map((t) =>
      t.id === teacherId
        ? {
            ...t,
            teachingAssignments,
            classIds,
            profileComplete: isTeacherProfileComplete({
              ...t,
              teachingAssignments,
              classIds,
            }),
          }
        : t
    ),
  }
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

export function addChatMessage(data: AppData, message: ChatMessage): AppData {
  const next = { ...data, chatMessages: [...data.chatMessages, message] }
  saveData(next)
  return next
}

export function isStudentProfileDone(student: Student): boolean {
  return isStudentProfileComplete(student)
}

export function isTeacherProfileDone(teacher: Teacher): boolean {
  return isTeacherProfileComplete(teacher)
}
