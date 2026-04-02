'use client'

import { useEffect, useState } from 'react'
import type { DigitalTwin, Message, ProjectInfo, Report } from '@/lib/types'

interface FinalReportProps {
  projectInfo: ProjectInfo
  twins: DigitalTwin[]
  messages: Message[]
  onStartOver: () => void
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const clipped = Math.max(0, Math.min(100, score))
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-end justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <span className={`text-2xl font-bold ${color}`}>{clipped}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            clipped >= 70 ? 'bg-emerald-500' : clipped >= 40 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${clipped}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">0</span>
        <span className="text-xs text-gray-400">100</span>
      </div>
    </div>
  )
}

const VERDICT_CONFIG = {
  strong_fit: {
    label: 'Strong Fit',
    description: 'Your solution strongly resonates with your target market.',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  weak_fit: {
    label: 'Weak Fit',
    description: 'There is some alignment but the product-market fit needs improvement.',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  pivot_needed: {
    label: 'Pivot Needed',
    description: 'Significant rethinking of the problem or solution is recommended.',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
}

export default function FinalReport({ projectInfo, twins, messages, onStartOver }: FinalReportProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectInfo, twins, messages }),
        })
        if (!res.ok) throw new Error('Failed to generate report')
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setReport(data)
      } catch {
        setError('Could not generate the report. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [projectInfo, twins, messages])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Generating your report...</h2>
          <p className="text-gray-500 text-sm mt-1">Analysing the interview to produce your validation insights.</p>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-36 bg-gray-100 rounded-xl" />
          <div className="h-36 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">{error}</div>
        <button onClick={onStartOver} className="mt-4 text-sm text-gray-500 underline">
          Start over
        </button>
      </div>
    )
  }

  const verdictCfg = VERDICT_CONFIG[report.verdict] ?? VERDICT_CONFIG.weak_fit

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Validation Report</h2>
          <p className="text-gray-500 text-sm mt-1">{projectInfo.name}</p>
        </div>
        <button
          onClick={onStartOver}
          className="flex-shrink-0 text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Start Over
        </button>
      </div>

      <div className="space-y-4">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <ScoreGauge
            score={report.problemIntensity}
            label="Problem Intensity"
            color={
              report.problemIntensity >= 70
                ? 'text-emerald-600'
                : report.problemIntensity >= 40
                ? 'text-amber-600'
                : 'text-red-500'
            }
          />
          <ScoreGauge
            score={report.valueResonance}
            label="Value Resonance"
            color={
              report.valueResonance >= 70
                ? 'text-emerald-600'
                : report.valueResonance >= 40
                ? 'text-amber-600'
                : 'text-red-500'
            }
          />
        </div>

        {/* Verdict */}
        <div className={`${verdictCfg.bg} border ${verdictCfg.border} rounded-xl p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={verdictCfg.text}>{verdictCfg.icon}</span>
            <span className={`text-sm font-semibold ${verdictCfg.text}`}>Verdict: {verdictCfg.label}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{verdictCfg.description}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
        </div>

        {/* Recurring themes & Objections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Recurring Themes
            </h3>
            <ul className="space-y-2">
              {report.recurringThemes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {theme}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Main Objections
            </h3>
            <ul className="space-y-2">
              {report.mainObjections.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommended Next Steps
          </h3>
          <ol className="space-y-3">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
        <button
          onClick={onStartOver}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Validate another idea
        </button>
      </div>
    </div>
  )
}
