/** Demo college — MAE department (B.Tech Robotics and AI is the featured program). */
export interface ProgramCatalog {
  id: string
  name: string
  sections: string[]
  featured?: boolean
}

export interface DepartmentCatalog {
  id: string
  shortCode: string
  name: string
  branch: string
  programs: ProgramCatalog[]
  sortOrder: number
}

export const DEMO_PROGRAM_ID = 'prog-rai'

export const DEFAULT_DEPARTMENTS: DepartmentCatalog[] = [
  {
    id: 'dept-mae',
    shortCode: 'MAE',
    name: 'Mechanical and Automation Engineering',
    branch: 'Engineering',
    sortOrder: 0,
    programs: [
      {
        id: 'prog-rai',
        name: 'B.Tech Robotics and AI',
        sections: ['A'],
        featured: true,
      },
      {
        id: 'prog-mae',
        name: 'B.Tech MAE',
        sections: ['A', 'B'],
      },
      {
        id: 'prog-mae-dmm',
        name: 'B.Tech MAE DMM',
        sections: ['A'],
      },
    ],
  },
]
