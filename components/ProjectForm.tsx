'use client'

import { useState } from 'react'
import type { ProjectInfo } from '@/lib/types'

interface ProjectFormProps {
  initialValues: ProjectInfo | null
  onSubmit: (info: ProjectInfo) => void
}

const FIELDS = [
  {
    key: 'name' as const,
    label: '01. PROJECT NAME',
    placeholder: "e.g. Project 'Lumina' Smart Textiles",
    multiline: false,
  },
  {
    key: 'problem' as const,
    label: '02. THE PROBLEM STATEMENT',
    placeholder: 'Define the friction point your solution addresses...',
    multiline: true,
  },
  {
    key: 'target' as const,
    label: '03. TARGET AUDIENCE',
    placeholder: 'Who are we simulating?',
    multiline: true,
  },
  {
    key: 'solution' as const,
    label: '04. PROPOSED SOLUTION',
    placeholder: 'Detail your value proposition...',
    multiline: true,
  },
]

export default function ProjectForm({ initialValues, onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<Omit<ProjectInfo, 'twinCount' | 'marketSegments'>>({
    name: initialValues?.name ?? '',
    problem: initialValues?.problem ?? '',
    target: initialValues?.target ?? '',
    solution: initialValues?.solution ?? '',
  })
  const [marketSegments, setMarketSegments] = useState(initialValues?.marketSegments ?? '')
  const [twinCount, setTwinCount] = useState(initialValues?.twinCount ?? 3)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({})

  const filledFields = Object.values(values).filter((v) => v.trim().length > 0).length
  const progressPct = Math.round((filledFields / 4) * 100)

  const validate = () => {
    const e: Partial<Record<keyof typeof values, string>> = {}
    if (!values.name.trim()) e.name = 'Required'
    if (!values.problem.trim()) e.problem = 'Required'
    if (!values.target.trim()) e.target = 'Required'
    if (!values.solution.trim()) e.solution = 'Required'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({ ...values, twinCount, marketSegments: marketSegments.trim() || undefined })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between">
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-black text-forest leading-tight tracking-tight">
              Define the{' '}
              <em className="not-italic font-black text-forest-light font-serif italic">Essence</em>{' '}
              of<br />Your Market Twin.
            </h1>
            <p className="text-forest/50 mt-4 text-sm leading-relaxed max-w-sm">
              Every revolutionary project begins with a crystal-clear vision. Use our Atelier framework
              to define the parameters of your market simulation.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right mt-1">
            <div className="flex items-center gap-2 text-xs text-forest/40 uppercase tracking-widest font-medium">
              <span className="font-bold text-forest">PHASE 01</span>
              <span>—</span>
              <span>CONCEPTUALIZATION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-px bg-forest/10 mb-12 overflow-hidden rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-forest transition-all duration-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
          {/* Left: Precision Engine card */}
          <div className="bg-mint-light border border-forest/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <h3 className="text-sm font-bold text-forest">Precision Engine</h3>
            </div>
            <p className="text-xs text-forest/50 leading-relaxed mb-5">
              Our AI synthesizes these four pillars to generate hyper-realistic consumer personas. Be
              as descriptive as possible to increase simulation accuracy.
            </p>
            <ul className="space-y-2.5">
              {['Bespoke Personas', 'Semantic Mapping', 'Deep Validation'].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest/40 flex-shrink-0" />
                  <span className="text-xs text-forest/60 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            {/* Twin count stepper */}
            <div className="mt-7 pt-5 border-t border-forest/10">
              <p className="text-xs font-semibold text-forest/50 uppercase tracking-widest mb-3">
                Twin Count
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTwinCount((n) => Math.max(1, n - 1))}
                  className="w-8 h-8 rounded-lg border border-forest/20 flex items-center justify-center text-forest/60 hover:border-forest hover:text-forest transition-colors font-bold"
                >
                  −
                </button>
                <div className="flex-1 flex gap-1.5 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTwinCount(n)}
                      className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                        n === twinCount
                          ? 'bg-forest text-white'
                          : n <= twinCount
                          ? 'bg-forest/20 text-forest'
                          : 'bg-forest/5 text-forest/30'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTwinCount((n) => Math.min(5, n + 1))}
                  className="w-8 h-8 rounded-lg border border-forest/20 flex items-center justify-center text-forest/60 hover:border-forest hover:text-forest transition-colors font-bold"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-forest/35 text-center mt-2">
                {twinCount} {twinCount === 1 ? 'persona' : 'personas'} will be generated
              </p>
            </div>
          </div>

          {/* Right: form fields */}
          <div>
            <div className="space-y-10">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold tracking-widest text-forest/40 mb-3 uppercase">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      value={values[field.key]}
                      onChange={(e) => {
                        setValues((v) => ({ ...v, [field.key]: e.target.value }))
                        setErrors((er) => ({ ...er, [field.key]: undefined }))
                      }}
                      placeholder={field.placeholder}
                      rows={2}
                      className="input-underline resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field.key]}
                      onChange={(e) => {
                        setValues((v) => ({ ...v, [field.key]: e.target.value }))
                        setErrors((er) => ({ ...er, [field.key]: undefined }))
                      }}
                      placeholder={field.placeholder}
                      className="input-underline"
                    />
                  )}
                  {errors[field.key] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Market Segments (optional) */}
            <div className="mt-10">
              <label className="block text-xs font-semibold tracking-widest text-forest/40 mb-1 uppercase">
                05. Market Segments
                <span className="ml-2 normal-case font-normal text-forest/25 tracking-normal">— optional</span>
              </label>
              <p className="text-xs text-forest/30 mb-3">
                If you know your segments, list them comma-separated to get one Twin per segment (max 3).
              </p>
              <input
                type="text"
                value={marketSegments}
                onChange={(e) => setMarketSegments(e.target.value)}
                placeholder="E.g. manufacturing SMEs, tech startups, large corporates (leave empty if unsure)"
                className="input-underline"
              />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-14">
              <div className="flex items-center gap-2 text-xs text-forest/35">
                <span className="w-1.5 h-1.5 rounded-full bg-forest/30" />
                <em>Draft saved automatically</em>
              </div>
              <button
                type="submit"
                className="flex items-center gap-3 bg-forest text-white text-sm font-bold px-7 py-3 rounded-xl hover:bg-forest-light transition-colors tracking-wide"
              >
                GENERATE TWINS
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Bottom decorative section */}
      <div className="mt-20 rounded-2xl overflow-hidden bg-gradient-to-br from-forest to-forest-light relative h-52 sm:h-64">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />
        <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col justify-end">
          <h3 className="text-white font-bold text-xl sm:text-2xl leading-tight mb-2">
            Precision Engineering for Market Research
          </h3>
          <p className="text-white/60 text-sm max-w-md">
            Every Twin is built upon millions of data points, ensuring your feedback is rooted in
            reality, not just probability.
          </p>
        </div>
      </div>
    </div>
  )
}
