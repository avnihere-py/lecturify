import type { AppData, DepartmentInfo, ProgramInfo } from '../types'

export function getDepartments(data: AppData): DepartmentInfo[] {
  return [...data.departments].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getDepartmentById(data: AppData, id: string): DepartmentInfo | undefined {
  return data.departments.find((d) => d.id === id)
}

export function getProgramById(
  data: AppData,
  departmentId: string,
  programId: string
): ProgramInfo | undefined {
  const dept = getDepartmentById(data, departmentId)
  return dept?.programs.find((p) => p.id === programId)
}

/** @deprecated use getProgramById */
export function getCourseById(data: AppData, departmentId: string, programId: string) {
  return getProgramById(data, departmentId, programId)
}

export function buildClassId(departmentId: string, programId: string, section: string): string {
  const slug = `${departmentId}-${programId}-${section}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `cls-${slug}`
}

export function formatClassLabel(parts: {
  branch?: string
  department: string
  course: string
  section: string
}): string {
  const branch = parts.branch ? `${parts.branch} · ` : ''
  return `${branch}${parts.department} — ${parts.course} — Section ${parts.section}`
}

export function formatSectionLabel(section: string): string {
  return section.startsWith('Section') ? section : `Section ${section}`
}

export function getFeaturedPrograms(data: AppData): { dept: DepartmentInfo; program: ProgramInfo }[] {
  const featured: { dept: DepartmentInfo; program: ProgramInfo }[] = []
  for (const dept of getDepartments(data)) {
    for (const program of dept.programs) {
      if (program.featured) featured.push({ dept, program })
    }
  }
  return featured
}
