'use client'

import { useEffect, useState } from 'react'
import type { DigitalTwin, ProjectInfo } from '@/lib/types'
import { TWIN_COLORS } from '@/lib/types'

interface TwinProfilesProps {
  projectInfo: ProjectInfo
  onContinue: (twins: DigitalTwin[]) => void
}

function TwinSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
      </div>
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-4/5 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  )
}

function TwinCard({ twin }: { twin: DigitalTwin }) {
  const colors = TWIN_COLORS[twin.id] ?? TWIN_COLORS.twin1
  const initials = twin.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const techLabel = { low: 'Low', medium: 'Medium', high: 'High' }[twin.techSavviness]

  return (
    <div className={`bg-white border ${colors.border} rounded-xl p-5 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-semibold flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{twin.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {twin.age} · {twin.occupation}
          </p>
        </div>
      </div>

      {/* Background */}
      <p className="text-xs text-gray-600 leading-relaxed">{twin.background}</p>

      {/* Pain Points */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-1.5">Pain points</p>
        <ul className="space-y-1">
          {twin.painPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
              <span className={`mt-1.5 w-1 h-1 rounded-full ${colors.dot} flex-shrink-0`} />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Motivations */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-1.5">Motivations</p>
        <ul className="space-y-1">
          {twin.motivations.map((m, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer badges */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
          Tech: {techLabel}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
          {twin.budget}
        </span>
      </div>

      {/* Personality */}
      <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3">
        &ldquo;{twin.personality}&rdquo;
      </p>
    </div>
  )
}

export default function TwinProfiles({ projectInfo, onContinue }: TwinProfilesProps) {
  const [twins, setTwins] = useState<DigitalTwin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTwins() {
      try {
        const res = await fetch('/api/generate-twins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectInfo }),
        })
        if (!res.ok) throw new Error('Failed to generate twins')
        const data = await res.json()
        setTwins(data.twins)
      } catch {
        setError('Could not generate Digital Twins. Please check your API key and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTwins()
  }, [projectInfo])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Your Digital Twins</h2>
        <p className="text-gray-500 text-sm mt-1">
          {loading
            ? 'Generating realistic customer profiles based on your target audience...'
            : 'Meet your three simulated customers. Review their profiles before starting the interview.'}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <TwinSkeleton />
          <TwinSkeleton />
          <TwinSkeleton />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && twins.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {twins.map((twin) => (
              <TwinCard key={twin.id} twin={twin} />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onContinue(twins)}
              className="px-8 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Start Interview
            </button>
          </div>
        </>
      )}
    </div>
  )
}
