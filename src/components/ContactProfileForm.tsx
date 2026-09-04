import { useState } from 'react'
import { validateContactProfile } from '../lib/profile'
import type { ContactProfile } from '../types'

interface ContactProfileFormProps {
  profile: ContactProfile
  onSave: (profile: ContactProfile) => void
  submitLabel?: string
}

export function ContactProfileForm({
  profile,
  onSave,
  submitLabel = 'Save Contact Info',
}: ContactProfileFormProps) {
  const [collegeEmail, setCollegeEmail] = useState(profile.collegeEmail ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: ContactProfile = {
      collegeEmail: collegeEmail.trim(),
      phone: phone.replace(/\D/g, ''),
      dateOfBirth,
    }
    const err = validateContactProfile(next)
    if (err) {
      setError(err)
      return
    }
    setError('')
    onSave(next)
  }

  return (
    <form onSubmit={handleSubmit} className="post-form profile-form">
      {error && <div className="alert alert--error">{error}</div>}
      <label>
        College Email
        <input
          type="email"
          value={collegeEmail}
          onChange={(e) => setCollegeEmail(e.target.value)}
          placeholder="name@college.edu"
          required
        />
      </label>
      <label>
        Phone Number
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit mobile number"
          inputMode="numeric"
          required
        />
      </label>
      <label>
        Date of Birth
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn btn--primary">{submitLabel}</button>
    </form>
  )
}
