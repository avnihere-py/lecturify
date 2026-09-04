import { useState } from 'react'
import { addSubjectTeacher } from '../lib/storage'
import type { AppData, Teacher } from '../types'

interface AddSubjectTeacherFormProps {
  classTeacher: Teacher
  data: AppData
  setData: (data: AppData) => void
  onSuccess?: (message: string) => void
}

export function AddSubjectTeacherForm({
  classTeacher,
  data,
  setData,
  onSuccess,
}: AddSubjectTeacherFormProps) {
  const [empId, setEmpId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('teacher123')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = addSubjectTeacher(data, classTeacher, {
      employeeId: empId,
      name,
      password,
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    setEmpId('')
    setName('')
    onSuccess?.(`Subject teacher ${name} added. They can log in and set up their subjects.`)
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="alert alert--error">{error}</div>}
      <p className="post-panel__desc">
        As class teacher, you can add <strong>subject teachers</strong> in {classTeacher.department}.
        They will complete their own profile and pick subjects they teach.
      </p>
      <label>
        Employee ID
        <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="T004" required />
      </label>
      <label>
        Full Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Login Password
        <input value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <button type="submit" className="btn btn--primary btn--teacher">Add Subject Teacher</button>
    </form>
  )
}
