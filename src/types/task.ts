export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string
  progress: number
  status: 'todo' | 'inProgress' | 'done'
  createdAt: string
}

export const TEAM_MEMBERS = [
  'Unassigned',
  'Zahra',
  'Azmi', 
  'Legian',
  'PaAdi',
  'BuTi'
] as const

export type TeamMember = typeof TEAM_MEMBERS[number]