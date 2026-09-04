import { DEFAULT_DEPARTMENTS } from './academics'
import { DEMO_DIRECTOR } from './demoDirector'
import { buildDemoStudents, DEMO_CLASS_ID, DEMO_CR_STUDENT_ID } from './demoStudents'
import type { AppData } from '../types'

export const SEED_DATA: AppData = {
  departments: structuredClone(DEFAULT_DEPARTMENTS),
  directors: [structuredClone(DEMO_DIRECTOR)],
  campusAlerts: [
    {
      id: 'alert-001',
      title: 'Welcome to Lecturify',
      message: 'Official college updates — verified alerts only.',
      createdAt: new Date().toISOString(),
      postedBy: 'College Administration',
    },
  ],
  classes: [
    {
      id: DEMO_CLASS_ID,
      name: 'B.Tech Robotics and AI',
      courseId: 'prog-rai',
      section: 'A',
      department: 'Mechanical and Automation Engineering',
      departmentId: 'dept-mae',
      branch: 'Engineering',
      teacherId: 'tch-001',
      crStudentId: DEMO_CR_STUDENT_ID,
    },
  ],
  teachers: [
    {
      id: 'tch-001',
      employeeId: 'T001',
      name: 'Dr. Meera Singh',
      password: 'teacher123',
      department: 'Mechanical and Automation Engineering',
      departmentId: 'dept-mae',
      branch: 'Engineering',
      facultyRole: 'class_teacher',
      classIds: [DEMO_CLASS_ID],
      teachingAssignments: [
        {
          courseId: 'prog-rai',
          course: 'B.Tech Robotics and AI',
          section: 'A',
          subjects: [
            { code: 'RAI301', name: 'Robotics' },
            { code: 'RAI302', name: 'Artificial Intelligence' },
            { code: 'RAI303', name: 'Mechatronics' },
          ],
          classId: DEMO_CLASS_ID,
        },
      ],
      profile: {
        collegeEmail: 'meera.singh@college.edu',
        phone: '9876543210',
        dateOfBirth: '1985-03-12',
      },
      profileComplete: true,
    },
    {
      id: 'tch-003',
      employeeId: 'T003',
      name: 'Dr. Anil Verma',
      password: 'teacher123',
      department: 'Mechanical and Automation Engineering',
      departmentId: 'dept-mae',
      branch: 'Engineering',
      facultyRole: 'subject_teacher',
      addedByTeacherId: 'tch-001',
      classIds: [DEMO_CLASS_ID],
      teachingAssignments: [
        {
          courseId: 'prog-rai',
          course: 'B.Tech Robotics and AI',
          section: 'A',
          subjects: [{ code: 'RAI304', name: 'Control Systems' }],
          classId: DEMO_CLASS_ID,
        },
      ],
      profile: {
        collegeEmail: 'anil.verma@college.edu',
        phone: '9876543212',
        dateOfBirth: '1988-01-08',
      },
      profileComplete: true,
    },
  ],
  students: buildDemoStudents(),
  updates: [
    {
      id: 'upd-001',
      classId: DEMO_CLASS_ID,
      title: 'Robotics Lab — Session Confirmed',
      message: 'Tomorrow\'s Robotics lab (10:00 AM) is confirmed in Lab 2. Bring your lab manual.',
      type: 'schedule',
      postedBy: { id: 'tch-001', name: 'Dr. Meera Singh', role: 'teacher' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'upd-002',
      classId: DEMO_CLASS_ID,
      title: 'Mid-Sem Exam Schedule — Robotics & AI',
      message: 'Mid-sem exams: Robotics on 16 Sep, AI on 18 Sep. Seating plan will be shared soon.',
      type: 'exam',
      postedBy: { id: 'tch-001', name: 'Dr. Meera Singh', role: 'teacher' },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'upd-003',
      classId: DEMO_CLASS_ID,
      title: 'Lecture Cancelled — Control Systems',
      message: 'Today\'s Control Systems lecture is cancelled. Class will resume next week.',
      type: 'cancellation',
      postedBy: { id: 'tch-003', name: 'Dr. Anil Verma', role: 'teacher' },
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ],
  chatMessages: [
    {
      id: 'chat-001',
      classId: DEMO_CLASS_ID,
      channel: 'class',
      senderId: 'stu-003',
      senderName: 'Amit Patel',
      senderRole: 'student',
      text: 'Is tomorrow\'s Robotics lab still on?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'chat-002',
      classId: DEMO_CLASS_ID,
      channel: 'class',
      senderId: 'stu-001',
      senderName: 'Neha',
      senderRole: 'cr',
      text: 'Yes, lab is confirmed. See the official update!',
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    },
  ],
  attendanceSheets: [],
}
