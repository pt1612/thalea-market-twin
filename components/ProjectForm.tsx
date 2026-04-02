'use client'

import { useState } from 'react'
import type { ProjectInfo } from '@/lib/types'

interface ProjectFormProps {
  onSubmit: (info: ProjectInfo) => void
}

const fields = [
  {
    key: 'name' as const,
    label: 'Project name',
    placeholder: 'e.g. SwiftInvoice',
    hint: 'The name of your startup or product',
    type: 'input',
  },
  {
    key: 'problem' as const,
    label: 'Problem',
    placeholder: 'e.g. Freelancers spend hours every month creating and tracking invoices manually, leading to late payments and lost revenue.',
    hint: 'What painful problem are you solving?',
    type: 'textarea',
  },
  {
    key: 'target' as const,
    label: 'Target audience',
    placeholder: 'e.g. Freelance designers and developers earning $50k–$150k/year who handle their own billing',
    hint: 'Who specifically are your customers?',
    type: 'textarea',
  },
  {
    key: 'solution' as const,
    label: 'Solution',
    placeholder: 'e.g. A mobile-first invoicing app that auto-generates invoices from time tracking data and sends automated payment reminders.',
    hint: 'How do you solve the problem?',
    type: 'textarea',
  },
]

export default function ProjectForm({ onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<ProjectInfo>({
    name: '',
    problem: '',
    target: '',
    solution: '',
  })
  const [errors, setErrors] = useState<Partial<ProjectInfo>>({})

  const validate = () => {
    const newErrors: Partial<ProjectInfo> = {}
    if (!values.name.trim()) newErrors.name = 'Required'
    if (!values.problem.trim()) newErrors.problem = 'Required'
    if (!values.target.trim()) newErrors.target = 'Required'
    if (!values.solution.trim()) newErrors.solution = 'Required'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit(values)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Describe your project</h2>
        <p className="text-gray-500 text-sm mt-1">
          We&apos;ll use this to generate realistic customer profiles that match your target market.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <p className="text-xs text-gray-400 mb-2">{field.hint}</p>
            {field.type === 'input' ? (
              <input
                type="text"
                value={values[field.key]}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  setErrors((er) => ({ ...er, [field.key]: undefined }))
                }}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                  errors[field.key]
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'
                }`}
              />
            ) : (
              <textarea
                value={values[field.key]}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  setErrors((er) => ({ ...er, [field.key]: undefined }))
                }}
                placeholder={field.placeholder}
                rows={3}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 resize-none ${
                  errors[field.key]
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'
                }`}
              />
            )}
            {errors[field.key] && (
              <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
            )}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Generate Digital Twins
          </button>
        </div>
      </form>
    </div>
  )
}
