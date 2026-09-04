import type { AppData, ChatMessage, ChatSenderRole } from '../types'

export interface ChatRecipient {
  id: string
  name: string
  role: ChatSenderRole | 'director'
  group: string
}

export function getRecipients(
  viewerRole: 'student' | 'cr' | 'teacher' | 'director',
  viewerId: string,
  classId: string,
  data: AppData
): ChatRecipient[] {
  const cls = data.classes.find((c) => c.id === classId)
  const classStudents = data.students.filter((s) => s.classId === classId && s.id !== viewerId)
  const cr = cls?.crStudentId ? data.students.find((s) => s.id === cls.crStudentId) : null
  const classTeacher = cls ? data.teachers.find((t) => t.id === cls.teacherId) : null

  if (viewerRole === 'student') {
    if (!cr) return []
    return [{ id: cr.id, name: cr.name, role: 'cr', group: 'Class Rep' }]
  }

  if (viewerRole === 'cr') {
    const list: ChatRecipient[] = []
    if (classTeacher) {
      list.push({ id: classTeacher.id, name: classTeacher.name, role: 'teacher', group: 'Faculty' })
    }
    classStudents.forEach((s) => {
      list.push({ id: s.id, name: s.name, role: 'student', group: 'Students' })
    })
    return list
  }

  if (viewerRole === 'teacher') {
    const list: ChatRecipient[] = []
    if (cr) list.push({ id: cr.id, name: cr.name, role: 'cr', group: 'Class Rep' })
    classStudents.forEach((s) => {
      list.push({ id: s.id, name: s.name, role: 'student', group: 'Students' })
    })
    data.teachers
      .filter((t) => t.id !== viewerId)
      .forEach((t) => list.push({ id: t.id, name: t.name, role: 'teacher', group: 'Faculty' }))
    data.directors.forEach((d) => {
      list.push({ id: d.id, name: d.name, role: 'director', group: 'Director' })
    })
    return list
  }

  const list: ChatRecipient[] = []
  data.teachers.forEach((t) => {
    list.push({ id: t.id, name: t.name, role: 'teacher', group: 'Faculty' })
  })
  return list
}

export function isDirectPair(
  m: ChatMessage,
  userA: string,
  userB: string
): boolean {
  if (m.channel !== 'direct' || !m.recipientId) return false
  return (
    (m.senderId === userA && m.recipientId === userB) ||
    (m.senderId === userB && m.recipientId === userA)
  )
}

export function getDirectMessages(
  messages: ChatMessage[],
  viewerId: string,
  recipientId: string
): ChatMessage[] {
  return messages
    .filter((m) => m.channel === 'direct' && isDirectPair(m, viewerId, recipientId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function directReadKey(viewerId: string, recipientId: string) {
  return `lecturify-read-direct-${viewerId}-${recipientId}`
}

export function classReadKey(viewerId: string, classId: string) {
  return `lecturify-read-class-${viewerId}-${classId}`
}

export function getLastRead(key: string) {
  const raw = localStorage.getItem(key)
  return raw ? new Date(raw).getTime() : 0
}

export function markRead(key: string) {
  localStorage.setItem(key, new Date().toISOString())
}

export function countUnreadMessages(
  messages: { senderId: string; createdAt: string }[],
  viewerId: string,
  readKey: string
) {
  const lastRead = getLastRead(readKey)
  return messages.filter(
    (m) => m.senderId !== viewerId && new Date(m.createdAt).getTime() > lastRead
  ).length
}

export function roleIcon(role: string) {
  if (role === 'cr') return '⭐ '
  if (role === 'teacher') return '👩‍🏫 '
  if (role === 'director') return '🎓 '
  return ''
}
