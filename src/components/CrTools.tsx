import { useState } from 'react'
import { AddStudentForm } from './AddStudentForm'
import type { AppData, Student, UpdateType } from '../types'

const UPDATE_TYPES: { value: UpdateType; label: string }[] = [
  { value: 'cancellation', label: 'Lecture Cancelled' },
  { value: 'schedule', label: 'Schedule Change' },
  { value: 'exam', label: 'Exam Notice' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'general', label: 'General Notice' },
]

interface CrToolsProps {
  student: Student
  data: AppData
  setData: (data: AppData) => void
  onPost: (payload: { title: string; message: string; type: UpdateType }) => void
}

export function CrTools({ student, data, setData, onPost }: CrToolsProps) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<'post' | 'add' | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('general')
  const [addSuccess, setAddSuccess] = useState('')

  function closeAll() {
    setOpen(false)
    setPanel(null)
    setTitle('')
    setMessage('')
    setUpdateType('general')
    setAddSuccess('')
  }

  function openPanel(next: 'post' | 'add') {
    setOpen(true)
    setPanel(next)
    setAddSuccess('')
  }

  function handlePost(e: React.FormEvent) {
    e.preventDefault()
    onPost({ title, message, type: updateType })
    setTitle('')
    setMessage('')
    setUpdateType('general')
    setPanel(null)
    setOpen(false)
  }

  const academic = {
    departmentId: student.departmentId,
    department: student.department,
    branch: student.branch,
    courseId: student.courseId,
    course: student.course,
  }

  return (
    <>
      <button type="button" className="cr-tools-trigger" onClick={() => setOpen(true)} aria-label="CR actions">
        ⭐ CR Tools
      </button>

      {open && (
        <div className="cr-modal-backdrop" onClick={closeAll} role="presentation">
          <div
            className="cr-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Class Representative tools"
          >
            <header className="cr-modal__header">
              <h2>Class Rep Tools</h2>
              <button type="button" className="cr-modal__close" onClick={closeAll} aria-label="Close">×</button>
            </header>

            {!panel && (
              <div className="cr-modal__menu">
                <button type="button" className="cr-modal__option" onClick={() => openPanel('post')}>
                  <span>📢</span>
                  <div>
                    <strong>Post Official Update</strong>
                    <p>Share a verified notice with your class</p>
                  </div>
                </button>
                <button type="button" className="cr-modal__option" onClick={() => openPanel('add')}>
                  <span>👥</span>
                  <div>
                    <strong>Add Classmates</strong>
                    <p>Register students in your department &amp; course — choose section</p>
                  </div>
                </button>
              </div>
            )}

            {panel === 'post' && (
              <form onSubmit={handlePost} className="post-form cr-modal__form">
                <button type="button" className="cr-modal__back" onClick={() => setPanel(null)}>← Back</button>
                <h3>Post Official Update</h3>
                <label>
                  Update Type
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                  >
                    {UPDATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Title
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lecture Cancelled — DBMS"
                    required
                  />
                </label>
                <label>
                  Message
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Write the official update..."
                    required
                  />
                </label>
                <button type="submit" className="btn btn--primary">Post Update</button>
              </form>
            )}

            {panel === 'add' && (
              <div className="cr-modal__form">
                <button type="button" className="cr-modal__back" onClick={() => setPanel(null)}>← Back</button>
                <h3>Add Classmates</h3>
                {addSuccess && <div className="alert alert--success">{addSuccess}</div>}
                <AddStudentForm
                  academic={academic}
                  data={data}
                  setData={setData}
                  defaultSection={student.section}
                  submitLabel="Add Classmate"
                  onSuccess={(msg) => {
                    setAddSuccess(msg)
                    setTimeout(() => setAddSuccess(''), 4000)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
