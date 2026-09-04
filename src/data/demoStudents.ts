import { generateStudentPassword } from '../lib/passwords'
import type { Student } from '../types'

const CLASS_ID = 'cls-dept-mae-prog-rai-a'

/** Demo roster — 10 named students for B.Tech Robotics and AI. */
const NAMED_STUDENTS: { name: string; enrollNo: string; email: string; phone: string; dob: string }[] = [
  { name: 'Neha', enrollNo: '04801242026', email: 'neha@college.edu', phone: '9123456780', dob: '2005-01-15' },
  { name: 'Priya Sharma', enrollNo: '05801242026', email: 'priya.sharma@college.edu', phone: '9123456781', dob: '2005-04-20' },
  { name: 'Amit Patel', enrollNo: '06801242026', email: 'amit.patel@college.edu', phone: '9123456782', dob: '2005-08-10' },
  { name: 'Sneha Reddy', enrollNo: '07801242026', email: 'sneha.reddy@college.edu', phone: '9123456783', dob: '2005-11-05' },
  { name: 'Arjun Mehta', enrollNo: '08801242026', email: 'arjun.mehta@college.edu', phone: '9123456784', dob: '2005-02-14' },
  { name: 'Kavya Singh', enrollNo: '09801242026', email: 'kavya.singh@college.edu', phone: '9123456785', dob: '2005-06-22' },
  { name: 'Rohan Gupta', enrollNo: '01801242026', email: 'rohan.gupta@college.edu', phone: '9123456786', dob: '2005-09-30' },
  { name: 'Ananya Iyer', enrollNo: '02801242026', email: 'ananya.iyer@college.edu', phone: '9123456787', dob: '2005-03-08' },
  { name: 'Vikram Joshi', enrollNo: '03801242026', email: 'vikram.joshi@college.edu', phone: '9123456788', dob: '2005-07-17' },
  { name: 'Isha Nair', enrollNo: '12801242026', email: 'isha.nair@college.edu', phone: '9123456789', dob: '2005-12-01' },
]

function makeStudent(
  id: string,
  entry: { name: string; enrollNo: string; email: string; phone: string; dob: string }
): Student {
  const enrollNo = entry.enrollNo
  return {
    id,
    enrollNo,
    name: entry.name,
    password: generateStudentPassword(enrollNo),
    classId: CLASS_ID,
    branch: 'Engineering',
    department: 'Mechanical and Automation Engineering',
    departmentId: 'dept-mae',
    course: 'B.Tech Robotics and AI',
    courseId: 'prog-rai',
    section: 'A',
    profile: {
      collegeEmail: entry.email,
      phone: entry.phone,
      dateOfBirth: entry.dob,
    },
    profileComplete: true,
  }
}

export const DEMO_STUDENT_COUNT = NAMED_STUDENTS.length

export function buildDemoStudents(): Student[] {
  return NAMED_STUDENTS.map((entry, i) =>
    makeStudent(`stu-${String(i + 1).padStart(3, '0')}`, entry)
  )
}

export const DEMO_CLASS_ID = CLASS_ID
export const DEMO_CR_STUDENT_ID = 'stu-001'
