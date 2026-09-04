/** Enrollment number must be exactly 11 digits. */
export function normalizeEnrollmentNo(enrollNo: string): string {
  return enrollNo.replace(/\D/g, '')
}

export function validateEnrollmentNo(enrollNo: string): string | null {
  const digits = normalizeEnrollmentNo(enrollNo)
  if (digits.length !== 11) {
    return 'Enrollment number must be exactly 11 digits.'
  }
  return null
}

/**
 * Password = "student" + digits 2, 3, 4 of enrollment no.
 * e.g. 04801242026 → digits at index 1,2,3 are 4,8,0 → student480
 */
export function generateStudentPassword(enrollNo: string): string {
  const digits = normalizeEnrollmentNo(enrollNo)
  const key = digits.slice(1, 4)
  return `student${key}`
}

export function enrollmentPasswordHint(enrollNo: string): string {
  const err = validateEnrollmentNo(enrollNo)
  if (err) return 'Enter 11-digit enrollment number to preview password.'
  return `Auto password: ${generateStudentPassword(enrollNo)}`
}
