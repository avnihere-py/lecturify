import { getDepartmentById, getProgramById } from '../lib/academics'
import type { AppData } from '../types'

export interface AcademicSelection {
  departmentId: string
  programId: string
  section: string
}

interface AcademicFilterProps {
  data: AppData
  value: AcademicSelection
  onChange: (next: AcademicSelection) => void
  allowAllSections?: boolean
  requireSection?: boolean
}

export function AcademicFilter({
  data,
  value,
  onChange,
  allowAllSections = false,
  requireSection = true,
}: AcademicFilterProps) {
  const dept = value.departmentId ? getDepartmentById(data, value.departmentId) : undefined
  const program =
    value.departmentId && value.programId
      ? getProgramById(data, value.departmentId, value.programId)
      : undefined

  return (
    <div className="academic-filter">
      <label>
        Department
        <select
          value={value.departmentId}
          onChange={(e) =>
            onChange({ departmentId: e.target.value, programId: '', section: '' })
          }
          required
        >
          <option value="">Select department...</option>
          {data.departments
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortCode} — {d.name}
              </option>
            ))}
        </select>
      </label>

      {dept && (
        <label>
          Branch
          <input value={dept.branch} readOnly className="field-readonly" />
        </label>
      )}

      {dept && (
        <label>
          Course / Program
          <select
            value={value.programId}
            onChange={(e) =>
              onChange({ ...value, programId: e.target.value, section: '' })
            }
            required
          >
            <option value="">Select course...</option>
            {dept.programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.featured ? `⭐ ${p.name}` : p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {program && program.sections.length > 0 && (
        <label>
          Section
          <select
            value={value.section}
            onChange={(e) => onChange({ ...value, section: e.target.value })}
            required={requireSection && !allowAllSections}
          >
            {!requireSection || allowAllSections ? (
              <option value="">All sections</option>
            ) : (
              <option value="">Select section...</option>
            )}
            {program.sections.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
