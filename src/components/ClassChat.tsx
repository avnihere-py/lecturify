import { useEffect, useMemo, useRef, useState } from 'react'
import { addChatMessage } from '../lib/storage'
import {
  classReadKey,
  countUnreadMessages,
  directReadKey,
  getDirectMessages,
  getRecipients,
  markRead,
  roleIcon,
  type ChatRecipient,
} from '../lib/chat'
import type { AppData, ChatSenderRole, Student, Teacher, Director } from '../types'

type ViewerRole = 'student' | 'cr' | 'teacher' | 'director'
type ChatMode = 'class' | 'private'

interface ClassChatProps {
  classId: string
  viewerId: string
  viewerName: string
  viewerRole: ViewerRole
  data: AppData
  setData: (data: AppData) => void
  teacherClasses?: { id: string; label: string }[]
  showClassTab?: boolean
}

export function ClassChat({
  classId: initialClassId,
  viewerId,
  viewerName,
  viewerRole,
  data,
  setData,
  teacherClasses,
  showClassTab = true,
}: ClassChatProps) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>(showClassTab ? 'class' : 'private')
  const [activeClassId, setActiveClassId] = useState(initialClassId)
  const [recipientId, setRecipientId] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const classId = viewerRole === 'teacher' || viewerRole === 'director' ? activeClassId : initialClassId
  const recipients = useMemo(
    () => getRecipients(viewerRole, viewerId, classId, data),
    [viewerRole, viewerId, classId, data]
  )

  const selectedRecipient = recipients.find((r) => r.id === recipientId) ?? recipients[0]

  useEffect(() => {
    if (recipients.length > 0 && !recipientId) {
      setRecipientId(recipients[0].id)
    }
  }, [recipients, recipientId])

  const classMessages = useMemo(
    () =>
      data.chatMessages
        .filter((m) => m.classId === classId && m.channel === 'class')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [data.chatMessages, classId]
  )

  const privateMessages = useMemo(() => {
    if (!selectedRecipient) return []
    return getDirectMessages(data.chatMessages, viewerId, selectedRecipient.id)
  }, [data.chatMessages, viewerId, selectedRecipient])

  const visibleMessages = mode === 'class' ? classMessages : privateMessages

  const classUnread = showClassTab
    ? countUnreadMessages(classMessages, viewerId, classReadKey(viewerId, classId))
    : 0

  const privateUnread = useMemo(() => {
    let total = 0
    for (const r of recipients) {
      const thread = getDirectMessages(data.chatMessages, viewerId, r.id)
      total += countUnreadMessages(thread, viewerId, directReadKey(viewerId, r.id))
    }
    return total
  }, [data.chatMessages, recipients, viewerId])

  const totalUnread = classUnread + privateUnread

  useEffect(() => {
    if (!open) return
    if (mode === 'class') {
      markRead(classReadKey(viewerId, classId))
    } else if (selectedRecipient) {
      markRead(directReadKey(viewerId, selectedRecipient.id))
    }
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [open, mode, classId, viewerId, selectedRecipient?.id, visibleMessages.length])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    if (mode === 'private' && !selectedRecipient) return

    let senderRole: ChatSenderRole = 'student'
    if (viewerRole === 'teacher') senderRole = 'teacher'
    else if (viewerRole === 'cr') senderRole = 'cr'
    else if (viewerRole === 'director') senderRole = 'director'

    const next = addChatMessage(data, {
      id: `chat-${Date.now()}`,
      classId,
      channel: mode === 'class' ? 'class' : 'direct',
      senderId: viewerId,
      senderName: viewerName,
      senderRole,
      recipientId: mode === 'private' ? selectedRecipient!.id : undefined,
      recipientName: mode === 'private' ? selectedRecipient!.name : undefined,
      recipientRole: mode === 'private' ? selectedRecipient!.role : undefined,
      text: trimmed,
      createdAt: new Date().toISOString(),
    })
    setData(next)
    setText('')
    if (mode === 'class') markRead(classReadKey(viewerId, classId))
    else if (selectedRecipient) markRead(directReadKey(viewerId, selectedRecipient.id))
  }

  const fabLabel = viewerRole === 'teacher' ? 'Messages' : viewerRole === 'director' ? 'Messages' : 'Class Chat'

  const groupedRecipients = useMemo(() => {
    const groups = new Map<string, ChatRecipient[]>()
    recipients.forEach((r) => {
      const arr = groups.get(r.group) ?? []
      arr.push(r)
      groups.set(r.group, arr)
    })
    return groups
  }, [recipients])

  return (
    <div className={`cr-chat-widget ${open ? 'cr-chat-widget--open' : ''}`}>
      {open && (
        <section className="cr-chat-panel" aria-label="Chat">
          <header className="cr-chat-panel__header">
            <div>
              <strong>{mode === 'class' ? 'Public Class Chat' : 'Private Message'}</strong>
              <p>
                {mode === 'class'
                  ? 'Everyone in class can see this'
                  : selectedRecipient
                    ? `Only you & ${selectedRecipient.name}`
                    : 'Choose who to message'}
              </p>
            </div>
            <button type="button" className="cr-chat-panel__close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>

          {showClassTab && (
            <div className="chat-channel-tabs">
              <button
                type="button"
                className={`chat-channel-tab ${mode === 'class' ? 'chat-channel-tab--active' : ''}`}
                onClick={() => setMode('class')}
              >
                Class Chat
                {classUnread > 0 && <span className="chat-channel-tab__badge">{classUnread}</span>}
              </button>
              <button
                type="button"
                className={`chat-channel-tab ${mode === 'private' ? 'chat-channel-tab--active' : ''}`}
                onClick={() => setMode('private')}
              >
                Private
                {privateUnread > 0 && <span className="chat-channel-tab__badge">{privateUnread}</span>}
              </button>
            </div>
          )}

          {(viewerRole === 'teacher' || viewerRole === 'director') && teacherClasses && teacherClasses.length > 1 && (
            <div className="chat-class-picker">
              <select value={activeClassId} onChange={(e) => setActiveClassId(e.target.value)}>
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {(mode === 'private' || !showClassTab) && recipients.length > 0 && (
            <div className="chat-recipient-picker">
              <label>
                Message to
                <select value={selectedRecipient?.id ?? ''} onChange={(e) => setRecipientId(e.target.value)}>
                  {Array.from(groupedRecipients.entries()).map(([group, items]) => (
                    <optgroup key={group} label={group}>
                      {items.map((r) => (
                        <option key={r.id} value={r.id}>
                          {roleIcon(r.role)}{r.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="cr-chat-panel__messages" ref={listRef}>
            {visibleMessages.length === 0 ? (
              <p className="cr-chat-panel__empty">
                {mode === 'class' ? 'No messages yet. Say something to your class!' : 'No private messages yet.'}
              </p>
            ) : (
              visibleMessages.map((m) => {
                const mine = m.senderId === viewerId
                const directLabel =
                  m.channel === 'direct' && mine && m.recipientName
                    ? ` → ${m.recipientName}`
                    : m.channel === 'direct' && !mine && m.recipientId === viewerId
                      ? ' (to you)'
                      : ''
                return (
                  <div
                    key={m.id}
                    className={`cr-chat__bubble ${mine ? 'cr-chat__bubble--mine' : ''} ${m.senderRole === 'cr' ? 'cr-chat__bubble--cr' : ''} ${m.senderRole === 'teacher' ? 'cr-chat__bubble--teacher' : ''} ${m.senderRole === 'director' ? 'cr-chat__bubble--director' : ''}`}
                  >
                    <span className="cr-chat__sender">
                      {roleIcon(m.senderRole)}{m.senderName}{directLabel}
                    </span>
                    <p>{m.text}</p>
                    <time>{formatTime(m.createdAt)}</time>
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={handleSend} className="cr-chat-panel__form">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === 'class'
                  ? 'Message everyone in class...'
                  : selectedRecipient
                    ? `Private message to ${selectedRecipient.name}...`
                    : 'Select a recipient...'
              }
              maxLength={500}
              disabled={mode === 'private' && !selectedRecipient}
            />
            <button type="submit" className="btn btn--primary btn--sm" disabled={mode === 'private' && !selectedRecipient}>
              Send
            </button>
          </form>
        </section>
      )}

      <button type="button" className="cr-chat-fab" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="cr-chat-fab__icon">💬</span>
        <span className="cr-chat-fab__label">{fabLabel}</span>
        {!open && totalUnread > 0 && (
          <span className="cr-chat-fab__badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
        )}
      </button>
    </div>
  )
}

export function StudentClassChat({
  student,
  isCr,
  data,
  setData,
}: {
  student: Student
  isCr: boolean
  data: AppData
  setData: (data: AppData) => void
}) {
  return (
    <ClassChat
      classId={student.classId}
      viewerId={student.id}
      viewerName={student.name}
      viewerRole={isCr ? 'cr' : 'student'}
      data={data}
      setData={setData}
      showClassTab={true}
    />
  )
}

export function TeacherClassChat({
  teacher,
  data,
  setData,
  classes,
}: {
  teacher: Teacher
  data: AppData
  setData: (data: AppData) => void
  classes: { id: string; name: string; section: string }[]
}) {
  if (classes.length === 0) return null
  return (
    <ClassChat
      classId={classes[0].id}
      viewerId={teacher.id}
      viewerName={teacher.name}
      viewerRole="teacher"
      data={data}
      setData={setData}
      teacherClasses={classes.map((c) => ({ id: c.id, label: `${c.name} — ${c.section}` }))}
      showClassTab={false}
    />
  )
}

export function DirectorClassChat({
  director,
  data,
  setData,
}: {
  director: Director
  data: AppData
  setData: (data: AppData) => void
}) {
  const firstClass = data.classes[0]?.id ?? 'global'
  return (
    <ClassChat
      classId={firstClass}
      viewerId={director.id}
      viewerName={director.name}
      viewerRole="director"
      data={data}
      setData={setData}
      showClassTab={false}
    />
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
