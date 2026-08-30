import type { AppData } from '../types'

export const SEED_DATA: AppData = {
  classes: [
    {
      id: 'cls-cse-3a',
      name: 'B.Tech CSE',
      section: '3A',
      department: 'Computer Science',
      teacherId: 'tch-001',
      crStudentId: 'stu-002',
    },
    {
      id: 'cls-ece-2b',
      name: 'B.Tech ECE',
      section: '2B',
      department: 'Electronics',
      teacherId: 'tch-002',
    },
  ],
  teachers: [
    {
      id: 'tch-001',
      employeeId: 'T001',
      name: 'Dr. Meera Singh',
      password: 'teacher123',
      department: 'Computer Science',
      classIds: ['cls-cse-3a'],
    },
    {
      id: 'tch-002',
      employeeId: 'T002',
      name: 'Prof. Rajesh Kumar',
      password: 'teacher123',
      department: 'Electronics',
      classIds: ['cls-ece-2b'],
    },
  ],
  students: [
    {
      id: 'stu-001',
      enrollNo: 'EN2021001',
      name: 'Rahul Kumar',
      password: 'student123',
      classId: 'cls-cse-3a',
    },
    {
      id: 'stu-002',
      enrollNo: 'EN2021002',
      name: 'Priya Sharma',
      password: 'student123',
      classId: 'cls-cse-3a',
    },
    {
      id: 'stu-003',
      enrollNo: 'EN2021003',
      name: 'Amit Patel',
      password: 'student123',
      classId: 'cls-cse-3a',
    },
    {
      id: 'stu-004',
      enrollNo: 'EN2022001',
      name: 'Sneha Reddy',
      password: 'student123',
      classId: 'cls-ece-2b',
    },
  ],
  updates: [
    {
      id: 'upd-001',
      classId: 'cls-cse-3a',
      title: 'Lecture Cancelled — Data Structures',
      message:
        'Today\'s Data Structures lecture (10:00 AM) is cancelled due to faculty meeting. Lab session at 2:00 PM will continue as scheduled.',
      type: 'cancellation',
      postedBy: { id: 'tch-001', name: 'Dr. Meera Singh', role: 'teacher' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'upd-002',
      classId: 'cls-cse-3a',
      title: 'Mid-Sem Exam Schedule Released',
      message:
        'Mid-semester exams begin 15 Sep. DBMS on 16 Sep (9 AM), OS on 18 Sep (9 AM). Seating plan will be shared tomorrow.',
      type: 'exam',
      postedBy: { id: 'tch-001', name: 'Dr. Meera Singh', role: 'teacher' },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'upd-003',
      classId: 'cls-cse-3a',
      title: 'Class Rescheduled to Room 304',
      message:
        'Tomorrow\'s Operating Systems class is moved from Room 201 to Room 304. Please be on time.',
      type: 'schedule',
      postedBy: { id: 'stu-002', name: 'Priya Sharma', role: 'cr' },
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'upd-004',
      classId: 'cls-ece-2b',
      title: 'Holiday — Independence Day',
      message: 'College will remain closed on 15 August. Regular classes resume on 16 August.',
      type: 'holiday',
      postedBy: { id: 'tch-002', name: 'Prof. Rajesh Kumar', role: 'teacher' },
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ],
}
