import type { SubjectInfo } from '../types'

export function formatSubject(subject: SubjectInfo): string {
  return `${subject.code} — ${subject.name}`
}

export function normalizeSubjects(raw: unknown): SubjectInfo[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    if (typeof item === 'string') {
      const code = item.replace(/\s+/g, '').slice(0, 8).toUpperCase() || 'SUB'
      return { code, name: item }
    }
    const s = item as SubjectInfo
    return { code: (s.code ?? '').trim().toUpperCase(), name: (s.name ?? '').trim() }
  }).filter((s) => s.code && s.name)
}
