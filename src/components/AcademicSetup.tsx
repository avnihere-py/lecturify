import { useState } from 'react'
import { getDepartments } from '../lib/academics'
import { addDepartment, addProgram, addSection } from '../lib/storage'
import type { AppData } from '../types'

interface AcademicSetupProps {
  data: AppData
  setData: (data: AppData) => void
}

export function AcademicSetup({ data, setData }: AcademicSetupProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedDept, setExpandedDept] = useState<string | null>(null)
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  const [newDeptCode, setNewDeptCode] = useState('')
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptBranch, setNewDeptBranch] = useState('Engineering')

  const [progDeptId, setProgDeptId] = useState('')
  const [progName, setProgName] = useState('')
  const [progSections, setProgSections] = useState('A')

  const [secDeptId, setSecDeptId] = useState('')
  const [secProgId, setSecProgId] = useState('')
  const [secName, setSecName] = useState('')

  const departments = getDepartments(data)

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = addDepartment(data, {
      shortCode: newDeptCode.toUpperCase(),
      name: newDeptName,
      branch: newDeptBranch,
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    setNewDeptCode('')
    setNewDeptName('')
    flash('Department added.')
  }

  function handleAddProgram(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const sections = progSections.split(',').map((s) => s.trim()).filter(Boolean)
    const result = addProgram(data, progDeptId, {
      name: progName,
      sections,
    })
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    setProgName('')
    setProgSections('A')
    flash('Program added.')
  }

  function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = addSection(data, secDeptId, secProgId, secName)
    if (result.error) {
      setError(result.error)
      return
    }
    setData(result.data)
    setSecName('')
    flash('Section added.')
  }

  const secDept = departments.find((d) => d.id === secDeptId)
  const secPrograms = secDept?.programs ?? []

  return (
    <div className="manage-panel academic-setup">
      <h2>Departments, Programs &amp; Sections</h2>
      <p className="post-panel__desc">
        Set up the college structure. <strong>Mechanical &amp; Robotics and AI</strong> is listed first.
        Faculty are assigned to a department; they then pick programs, sections, and subjects.
      </p>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="academic-tree">
        {departments.map((dept) => (
          <div key={dept.id} className="academic-dept">
            <button
              type="button"
              className="academic-dept__head"
              onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
            >
              <span>
                <strong>{dept.shortCode}</strong> — {dept.name}
                <span className="text-muted"> ({dept.branch})</span>
              </span>
              <span>{expandedDept === dept.id ? '▾' : '▸'}</span>
            </button>
            {expandedDept === dept.id && (
              <div className="academic-dept__body">
                {dept.programs.length === 0 ? (
                  <p className="text-muted">No programs yet.</p>
                ) : (
                  dept.programs.map((prog) => (
                    <div key={prog.id} className={`academic-prog ${prog.featured ? 'academic-prog--featured' : ''}`}>
                      <button
                        type="button"
                        className="academic-prog__head"
                        onClick={() =>
                          setExpandedProgram(expandedProgram === prog.id ? null : prog.id)
                        }
                      >
                        <span>
                          {prog.featured && <span className="featured-star">⭐ </span>}
                          {prog.name}
                        </span>
                        <span>{expandedProgram === prog.id ? '▾' : '▸'}</span>
                      </button>
                      {expandedProgram === prog.id && (
                        <div className="academic-prog__sections">
                          {prog.sections.map((sec) => (
                            <span key={sec} className="section-chip">Section {sec}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <details className="academic-form-block">
        <summary>Add Department</summary>
        <form onSubmit={handleAddDepartment} className="post-form">
          <label>
            Short Code
            <input value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} placeholder="CSE" required />
          </label>
          <label>
            Full Name
            <input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} required />
          </label>
          <label>
            Branch
            <input value={newDeptBranch} onChange={(e) => setNewDeptBranch(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn--primary">Add Department</button>
        </form>
      </details>

      <details className="academic-form-block">
        <summary>Add Program to Department</summary>
        <form onSubmit={handleAddProgram} className="post-form">
          <label>
            Department
            <select value={progDeptId} onChange={(e) => setProgDeptId(e.target.value)} required>
              <option value="">Select...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.shortCode} — {d.name}</option>
              ))}
            </select>
          </label>
          <label>
            Program Name
            <input value={progName} onChange={(e) => setProgName(e.target.value)} placeholder="B.Tech CSE" required />
          </label>
          <label>
            Sections (comma-separated)
            <input value={progSections} onChange={(e) => setProgSections(e.target.value)} placeholder="A, B, C" required />
          </label>
          <button type="submit" className="btn btn--primary">Add Program</button>
        </form>
      </details>

      <details className="academic-form-block">
        <summary>Add Section to Program</summary>
        <form onSubmit={handleAddSection} className="post-form">
          <label>
            Department
            <select
              value={secDeptId}
              onChange={(e) => {
                setSecDeptId(e.target.value)
                setSecProgId('')
              }}
              required
            >
              <option value="">Select...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.shortCode}</option>
              ))}
            </select>
          </label>
          <label>
            Program
            <select value={secProgId} onChange={(e) => setSecProgId(e.target.value)} required>
              <option value="">Select...</option>
              {secPrograms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Section Name
            <input value={secName} onChange={(e) => setSecName(e.target.value)} placeholder="D" required />
          </label>
          <button type="submit" className="btn btn--primary">Add Section</button>
        </form>
      </details>
    </div>
  )
}
