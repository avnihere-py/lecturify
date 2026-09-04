import type { ContactProfile, Student, Teacher } from '../types'

export function isContactProfileComplete(profile: ContactProfile): boolean {
  return Boolean(
    profile.collegeEmail?.trim() &&
      profile.phone?.trim() &&
      profile.dateOfBirth?.trim()
  )
}

export function isStudentProfileComplete(student: Student): boolean {
  return isContactProfileComplete(student.profile)
}

export function isTeacherProfileComplete(teacher: Teacher): boolean {
  return (
    isContactProfileComplete(teacher.profile) &&
    teacher.teachingAssignments.length > 0 &&
    teacher.teachingAssignments.every((a) => a.subjects.length > 0)
  )
}

export function validateContactProfile(profile: ContactProfile): string | null {
  if (!profile.collegeEmail?.trim()) return 'College email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.collegeEmail.trim())) {
    return 'Enter a valid college email address.'
  }
  if (!profile.phone?.trim()) return 'Phone number is required.'
  if (!/^\d{10}$/.test(profile.phone.replace(/\D/g, ''))) {
    return 'Phone number must be 10 digits.'
  }
  if (!profile.dateOfBirth?.trim()) return 'Date of birth is required.'
  return null
}
