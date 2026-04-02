'use client'

import { useEffect, useState } from 'react'
import type { DigitalTwin, Message, ProjectInfo, Report } from '@/lib/types'

interface FinalReportProps {
  projectInfo: ProjectInfo
  twins: DigitalTwin[]
  messages: Message[]
  onStartOver: () => void
  onBack: () => void
}

const VERDICT_CONFIG = {
  strong_fit: {
    headline: 'Market viability confirmed with high resonance.',
    label: 'Strong Fit',
    tagline: 'Strong alignment between problem and proposed solution.',
  },
  weak_fit: {
    headline: 'Partial resonance detected — refinement required.',
    label: 'Weak Fit',
    tagline: 'Some alignment exists but the fit needs significant improvement.',
  },
  pivot_needed: {
    headline: 'Market mismatch identified — strategic pivot advised.',
    label: 'Pivot Needed',
    tagline: 'A fundamental rethink of the problem or solution is recommended.',
  },
}

function MetricCard({
  label,
  score,
  description,
}: {
  label: string
  score: number
  description: string
}) {
  const display = (score / 10).toFixed(1)
  const color =
    score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="bg-white rounded-2xl p-6 border border-forest/5 flex-1">
      <div className="flex items-end justify-between mb-3">
        <h4 className="text-base font-bold text-forest">{label}</h4>
        <span className={`text-3xl font-black ${color}`}>
          {display}
          <span className="text-sm font-semibold text-forest/30 ml-0.5">/10</span>
        </span>
      </div>
      <div className="h-px bg-forest/10 mb-4" />
      <p className="text-xs text-forest/50 leading-relaxed">{description}</p>
    </div>
  )
}

export default function FinalReport({
  projectInfo,
  twins,
  messages,
  onStartOver,
  onBack,
}: FinalReportProps) {
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
        if (!res.ok) throw new Error('Failed')
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
      <div className="max-w-7xl mx-auto px-6 py-14 animate-pulse">
        <div className="mb-10">
          <div className="h-4 w-20 bg-forest/10 rounded mb-3" />
          <div className="h-10 w-64 bg-forest/10 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-forest/10 rounded-2xl" />
          <div className="h-64 bg-forest/10 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-36 bg-forest/10 rounded-2xl" />
          <div className="h-36 bg-forest/10 rounded-2xl" />
        </div>
        <p className="text-center text-forest/30 text-sm mt-10">Synthesising interview data...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700 mb-6">
          {error}
        </div>
        <button onClick={onBack} className="text-sm text-forest/50 underline">
          ← Back to interview
        </button>
      </div>
    )
  }

  const verdictCfg = VERDICT_CONFIG[report.verdict] ?? VERDICT_CONFIG.weak_fit
  const problemDesc = report.recurringThemes[0]
    ? `${report.recurringThemes[0]} emerged as a dominant theme. Twins expressed ${report.problemIntensity >= 70 ? 'high' : report.problemIntensity >= 40 ? 'moderate' : 'low'} levels of frustration with the current status quo.`
    : report.summary
  const valueDesc = report.mainObjections[0]
    ? `${report.mainObjections[0]} was the primary objection. ${report.valueResonance >= 70 ? 'Overall, the concept resonated strongly.' : 'The value proposition needs further refinement.'}`
    : report.summary

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-forest/30 mb-2">Stage 04</p>
          <h2 className="text-4xl sm:text-5xl font-black text-forest tracking-tight leading-tight">
            Synthesis &<br />Report
          </h2>
        </div>

        {/* Sub-nav */}
        <div className="hidden sm:flex items-center gap-4 mt-2">
          {[
            { num: '01', label: 'Ideation', active: false },
            { num: '02', label: 'Analysis', active: true },
            { num: '03', label: 'Strategic Pivot', active: false },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  item.active
                    ? 'border-forest bg-forest text-white'
                    : 'border-forest/20 text-forest/30'
                }`}
              >
                {item.num}
              </div>
              <span
                className={`text-sm font-semibold ${
                  item.active ? 'text-forest' : 'text-forest/30'
                }`}
              >
                {item.label}
              </span>
              {item.num !== '03' && (
                <svg className="w-4 h-4 text-forest/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top section: Verdict + image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Verdict box */}
        <div className="lg:col-span-2 bg-forest rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">
              The Verdict
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
              {verdictCfg.headline}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg">
              {report.summary}
            </p>
          </div>
        </div>

        {/* Quote card */}
        <div className="bg-gradient-to-br from-sage/30 to-forest/20 rounded-2xl relative overflow-hidden min-h-[200px] flex items-end">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230d3b2e\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
          <div className="relative z-10 m-5 bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm font-semibold italic text-forest leading-relaxed">
              &ldquo;{verdictCfg.tagline}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <MetricCard
          label="Problem Intensity"
          score={report.problemIntensity}
          description={problemDesc}
        />
        <MetricCard
          label="Value Resonance"
          score={report.valueResonance}
          description={valueDesc}
        />
      </div>

      {/* Themes + Objections + Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Left: Themes + Objections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Themes */}
          <div className="bg-white rounded-2xl p-6 border border-forest/5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-4">
              Key Resonance Themes
            </p>
            <div className="flex flex-wrap gap-2">
              {report.recurringThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full border border-forest/20 text-xs font-semibold text-forest/70 bg-mint"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Objections */}
          <div className="bg-white rounded-2xl p-6 border border-forest/5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-4">
              Primary Objections
            </p>
            <div className="flex flex-wrap gap-2">
              {report.mainObjections.map((obj, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full border border-amber-200 text-xs font-semibold text-amber-700 bg-amber-50"
                >
                  {obj}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Strategic Roadmap */}
        <div className="bg-white rounded-2xl p-6 border border-forest/5 flex flex-col">
          <h3 className="text-base font-bold text-forest mb-5">Strategic Roadmap</h3>
          <ol className="space-y-5 flex-1">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="text-2xl font-black text-forest/15 leading-none flex-shrink-0 w-8">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-forest/70 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-forest/10 space-y-3">
            <button
              onClick={() => window.print()}
              className="w-full bg-forest text-white text-sm font-bold py-3 rounded-xl hover:bg-forest-light transition-colors tracking-wide"
            >
              Export Full Analysis
            </button>
            <button className="w-full text-sm font-semibold text-forest/50 hover:text-forest transition-colors py-1">
              Share with Stakeholders
            </button>
          </div>
        </div>
      </div>

      {/* Back / Start over */}
      <div className="flex items-center justify-between pt-4 border-t border-forest/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-forest/40 hover:text-forest transition-colors tracking-wider uppercase"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Interview
        </button>
        <button
          onClick={onStartOver}
          className="text-sm font-medium text-forest/30 hover:text-forest/60 transition-colors underline underline-offset-2"
        >
          Validate another idea
        </button>
      </div>
    </div>
  )
}
