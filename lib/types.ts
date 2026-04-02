export interface ProjectInfo {
  name: string
  problem: string
  target: string
  solution: string
  twinCount: number
}

export interface DigitalTwin {
  id: string
  name: string
  age: number
  occupation: string
  background: string
  painPoints: string[]
  motivations: string[]
  techSavviness: 'low' | 'medium' | 'high'
  budget: string
  personality: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  twinId?: string
  twinName?: string
  timestamp?: string
}

export interface Report {
  problemIntensity: number
  valueResonance: number
  recurringThemes: string[]
  mainObjections: string[]
  verdict: 'strong_fit' | 'weak_fit' | 'pivot_needed'
  nextSteps: string[]
  summary: string
}

// Avatar colors for sidebar (by index position)
export const TWIN_SIDEBAR_COLORS = [
  'bg-forest text-white',
  'bg-teal-700 text-white',
  'bg-slate-700 text-white',
  'bg-amber-700 text-white',
  'bg-rose-700 text-white',
]

export const TWIN_SIDEBAR_BORDERS = [
  'border-forest/30',
  'border-teal-700/30',
  'border-slate-700/30',
  'border-amber-700/30',
  'border-rose-700/30',
]

export function getTwinIndex(id: string): number {
  const match = id.match(/\d+/)
  return match ? parseInt(match[0]) - 1 : 0
}

export function getTechLabel(level: 'low' | 'medium' | 'high'): string {
  return { low: 'Novice', medium: 'Adept', high: 'Expert' }[level]
}

export function getTechProgress(level: 'low' | 'medium' | 'high'): number {
  return { low: 33, medium: 66, high: 100 }[level]
}

export function getAffinityBadge(level: 'low' | 'medium' | 'high'): string {
  return { low: 'EARLY ADOPTER', medium: 'MODERATE', high: 'HIGH AFFINITY' }[level]
}

export function getBudgetBadge(budget: string): string {
  const lower = budget.toLowerCase()
  const num = parseInt(budget.replace(/[^0-9]/g, '')) || 0
  if (num >= 100 || lower.includes('premium') || lower.includes('enterprise')) return '€€€ PREMIUM'
  if (num >= 50 || lower.includes('mid')) return '€€ MID-TIER'
  return '€ BUDGET'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatTime(date?: Date): string {
  const d = date || new Date()
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}
