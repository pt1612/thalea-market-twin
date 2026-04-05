'use client'

import { useEffect, useState } from 'react'
import type { DigitalTwin, ProjectInfo } from '@/lib/types'
import {
  getInitials,
  getTechLabel,
  getTechProgress,
  getAffinityDisplay,
  getBudgetDisplay,
  TWIN_SIDEBAR_COLORS,
  getTwinIndex,
} from '@/lib/types'

interface TwinProfilesProps {
  projectInfo: ProjectInfo
  initialTwins: DigitalTwin[] | null
  onContinue: (twins: DigitalTwin[]) => void
  onBack: () => void
}

function TwinCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="flex gap-1.5">
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-6 w-36 bg-gray-200 rounded mb-1" />
      <div className="h-4 w-24 bg-gray-100 rounded mb-5" />
      <div className="space-y-2 mb-5">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-2 w-full bg-gray-100 rounded-full" />
      </div>
      <div className="h-3 w-full bg-gray-100 rounded" />
    </div>
  )
}

function TwinCard({ twin }: { twin: DigitalTwin }) {
  const idx = getTwinIndex(twin.id)
  const avatarColor = TWIN_SIDEBAR_COLORS[idx] ?? TWIN_SIDEBAR_COLORS[0]
  const techLabel = getTechLabel(twin.techSavviness)
  const techPct = getTechProgress(twin.techSavviness)
  const { text: affinityText, className: affinityClass } = getAffinityDisplay(twin.affinityLabel)
  const budgetText = getBudgetDisplay(twin.budgetTier)

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-0 border border-forest/5 hover:border-forest/15 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-sm font-bold flex-shrink-0`}
        >
          {getInitials(twin.name)}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${affinityClass}`}
          >
            {affinityText}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-forest text-white">
            {budgetText}
          </span>
        </div>
      </div>

      {/* Name + occupation */}
      <h3 className="text-xl font-bold text-forest leading-tight">{twin.name}</h3>
      <p className="text-sm text-forest/40 mt-0.5 mb-5">
        Age {twin.age} • {twin.occupation}
      </p>

      {/* Background */}
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-2.5">
          Background
        </p>
        <p className="text-xs text-forest/60 leading-relaxed">{twin.background}</p>
      </div>

      {/* Pain points */}
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-2.5">
          Pain Points
        </p>
        <ul className="space-y-1.5">
          {twin.painPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-forest/70">
              <span className="text-forest/40 font-bold flex-shrink-0 mt-px">×</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>

      {/* Tech level */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30">
            Tech Level
          </p>
          <span className="text-xs font-semibold text-forest/60">{techLabel}</span>
        </div>
        <div className="h-1 w-full bg-forest/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all duration-700"
            style={{ width: `${techPct}%` }}
          />
        </div>
      </div>

      {/* Quote */}
      <p className="text-xs italic text-forest/40 leading-relaxed border-t border-forest/10 pt-4 mt-auto">
        &ldquo;{twin.personality}&rdquo;
      </p>
    </div>
  )
}

export default function TwinProfiles({ projectInfo, initialTwins, onContinue, onBack }: TwinProfilesProps) {
  const [twins, setTwins] = useState<DigitalTwin[]>(initialTwins ?? [])
  const [loading, setLoading] = useState(!initialTwins)
  const [progress, setProgress] = useState(initialTwins ? 100 : 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialTwins) return

    let tick = 0
    const interval = setInterval(() => {
      tick += Math.random() * 18 + 5
      setProgress(Math.min(tick, 85))
    }, 400)

    async function fetchTwins() {
      try {
        const res = await fetch('/api/generate-twins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectInfo }),
        })
        if (!res.ok) throw new Error('Failed to generate twins')
        const data = await res.json()
        clearInterval(interval)
        setProgress(100)
        setTwins(data.twins)
      } catch {
        clearInterval(interval)
        setError('Could not generate Digital Twins. Please check your API key and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTwins()
    return () => clearInterval(interval)
  }, [initialTwins, projectInfo])

  // Skeleton count always matches twinCount from the form; switch to actual length once loaded
  const count = twins.length > 0 ? twins.length : projectInfo.twinCount

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-forest/30 mb-2">Step 02</p>
          <h2 className="text-4xl sm:text-5xl font-black text-forest tracking-tight">Market Twins</h2>
          <p className="text-forest/40 text-sm mt-3 max-w-md">
            Meet your high-fidelity customer personas. These AI-driven archetypes represent segmented
            market behaviors identified through our digital atelier analysis.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="hidden sm:block text-right mt-1">
          <p className="text-xs font-bold text-forest/40 mb-2">
            {loading ? `${Math.round(progress)}% Generated` : '100% Generated'}
          </p>
          <div className="w-36 h-1 bg-forest/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Cards grid */}
      <div
        className={`grid grid-cols-1 gap-4 mb-10 ${
          count === 1
            ? 'sm:grid-cols-1 max-w-sm'
            : count === 2
            ? 'sm:grid-cols-2 max-w-2xl'
            : count <= 3
            ? 'sm:grid-cols-3'
            : count === 4
            ? 'sm:grid-cols-2 lg:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        }`}
      >
        {loading
          ? Array.from({ length: count }).map((_, i) => <TwinCardSkeleton key={i} />)
          : twins.map((twin) => <TwinCard key={twin.id} twin={twin} />)}
      </div>

      {/* Navigation */}
      {!loading && twins.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-forest/40 hover:text-forest transition-colors tracking-wider uppercase"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Previous Segment
          </button>
          <button
            onClick={() => onContinue(twins)}
            className="flex items-center gap-3 bg-forest text-white text-sm font-bold px-7 py-3 rounded-xl hover:bg-forest-light transition-colors tracking-wide"
          >
            REVIEW ANALYSIS
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
